-- ════════════════════════════════════════════════════════════════════
--  Pay at store (showroom pickup only) + pickup statuses
--  • Customer reserves items online, pays at the showroom (cash / POS / transfer)
--  • Items are HELD (inventory.reserved) for 3 days, then released automatically
--  • New statuses: ready_for_pickup, collected
--  Safe to run more than once. Run after 0001–0004.
-- ════════════════════════════════════════════════════════════════════
alter type public.order_status add value if not exists 'ready_for_pickup';
alter type public.order_status add value if not exists 'collected';

alter table public.orders add column if not exists payment_method text not null default 'paystack';
alter table public.orders add column if not exists hold_until timestamptz;           -- pay-at-store reservation expiry
alter table public.orders add column if not exists paid_in_store_by text;            -- cash | pos | transfer
do $$ begin
  alter table public.orders add constraint orders_payment_method_check check (payment_method in ('paystack', 'in_store'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.orders add constraint orders_in_store_pickup_check check (payment_method <> 'in_store' or delivery_method = 'pickup');
exception when duplicate_object then null; end $$;
create index if not exists orders_in_store_hold_idx on public.orders (payment_method, status, hold_until);

/** Reserve stock for a pay-at-store order (atomic; fails if any item is short). Server only. */
create or replace function public.hold_in_store_order(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare it record; n int;
begin
  for it in select product_id, quantity, name from order_items where order_id = p_order_id and product_id is not null loop
    update inventory set reserved = reserved + it.quantity, updated_at = now()
      where product_id = it.product_id and quantity - reserved >= it.quantity;
    get diagnostics n = row_count;
    if n = 0 then raise exception 'insufficient_stock: %', it.name using errcode = 'P0001'; end if;
  end loop;
end $$;

/** Release a pay-at-store hold (expired or cancelled). Idempotent: only acts on unpaid in-store orders. */
create or replace function public.release_in_store_hold(p_order_id uuid, p_note text default 'Reservation released')
returns boolean language plpgsql security definer set search_path = public as $$
declare o record; it record;
begin
  select id, status, payment_method into o from orders where id = p_order_id for update;
  if o.payment_method <> 'in_store' or o.status <> 'pending' then return false; end if;
  if auth.uid() is not null and not public.is_staff() then raise exception 'forbidden'; end if;
  for it in select product_id, quantity from order_items where order_id = p_order_id and product_id is not null loop
    update inventory set reserved = greatest(reserved - it.quantity, 0), updated_at = now() where product_id = it.product_id;
  end loop;
  update orders set status = 'cancelled', admin_notes = coalesce(admin_notes || ' · ', '') || p_note where id = p_order_id;
  insert into order_events(order_id, status, note, created_by) values (p_order_id, 'cancelled', p_note, auth.uid());
  return true;
end $$;

/** Staff confirms payment received at the showroom: converts the hold into a sale. Idempotent. */
create or replace function public.confirm_in_store_payment(p_order_id uuid, p_method text)
returns boolean language plpgsql security definer set search_path = public as $$
declare o record; it record;
begin
  if auth.uid() is not null and not public.is_staff() then raise exception 'forbidden'; end if;
  if p_method not in ('cash', 'pos', 'transfer') then raise exception 'invalid payment method'; end if;
  select id, reference, status, payment_method, total, coupon_code, email into o from orders where id = p_order_id for update;
  if o.payment_method <> 'in_store' or o.status <> 'pending' then return false; end if;
  for it in select product_id, quantity from order_items where order_id = p_order_id and product_id is not null loop
    update inventory set quantity = greatest(quantity - it.quantity, 0), reserved = greatest(reserved - it.quantity, 0), updated_at = now() where product_id = it.product_id;
    insert into inventory_movements(product_id, delta, reason, reference, created_by) values (it.product_id, -it.quantity, 'sale', o.reference, auth.uid());
    update products set sold_count = sold_count + it.quantity where id = it.product_id;
  end loop;
  update orders set status = 'paid', paid_at = now(), paid_in_store_by = p_method, hold_until = null where id = p_order_id;
  insert into payments(order_id, provider, reference, status, amount, channel, paid_at)
    values (p_order_id, 'in_store', 'STORE-' || o.reference, 'success', o.total, p_method, now()) on conflict (reference) do nothing;
  insert into order_events(order_id, status, note, created_by) values (p_order_id, 'paid', 'Paid at showroom (' || upper(p_method) || ')', auth.uid());
  update coupons set used_count = used_count + 1 where code = o.coupon_code;
  update carts set status = 'converted' where email = o.email and status = 'open';
  return true;
end $$;

revoke execute on function public.hold_in_store_order(uuid) from public, anon, authenticated;
revoke execute on function public.release_in_store_hold(uuid, text) from public, anon;
revoke execute on function public.confirm_in_store_payment(uuid, text) from public, anon;
grant execute on function public.hold_in_store_order(uuid) to service_role;
grant execute on function public.release_in_store_hold(uuid, text) to authenticated, service_role;
grant execute on function public.confirm_in_store_payment(uuid, text) to authenticated, service_role;

-- Public order tracking: include payment method + hold expiry
create or replace function public.track_order(p_reference text, p_contact text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'reference', o.reference, 'status', o.status, 'created_at', o.created_at, 'total', o.total,
    'delivery_method', o.delivery_method, 'payment_method', o.payment_method, 'hold_until', o.hold_until,
    'tracking_number', o.tracking_number, 'carrier', o.carrier,
    'eta_from', o.estimated_delivery_from, 'eta_to', o.estimated_delivery_to, 'state', o.shipping_address->>'state',
    'items', (select jsonb_agg(jsonb_build_object('name', name, 'quantity', quantity, 'image', image_url)) from order_items where order_id = o.id),
    'events', (select jsonb_agg(jsonb_build_object('status', status, 'note', note, 'at', created_at) order by created_at) from order_events where order_id = o.id))
  from orders o
  where o.reference = upper(trim(p_reference))
    and (
      lower(o.email) = lower(trim(p_contact))
      or (length(regexp_replace(p_contact, '\D', '', 'g')) >= 10
          and right(regexp_replace(o.phone, '\D', '', 'g'), 10) = right(regexp_replace(p_contact, '\D', '', 'g'), 10))
    )
  limit 1;
$$;
grant execute on function public.track_order(text, text) to anon, authenticated, service_role;

-- 7-day swap requests are allowed once an order is delivered OR collected from the showroom
drop policy if exists "request return" on public.returns;
create policy "request return" on public.returns for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status::text in ('delivered', 'collected')));
