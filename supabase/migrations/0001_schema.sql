-- ════════════════════════════════════════════════════════════════════
--  Newcastle Electronics – core schema
--  Money: numeric(12,2) Naira. Timestamps: timestamptz (UTC).
-- ════════════════════════════════════════════════════════════════════
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ───────────── Roles & users ─────────────
create type public.user_role as enum ('customer', 'staff', 'admin');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        public.user_role not null default 'customer',
  marketing_opt_in boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','admin'));
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Prevent customers from promoting themselves
create or replace function public.protect_role() returns trigger language plpgsql as $$
begin
  -- End-user sessions (JWT with a user id) may not change roles unless they are admins.
  -- Trusted contexts (SQL editor, service role) have no auth.uid() and are allowed – used to bootstrap the first admin.
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles for each row execute function public.protect_role();

create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text default 'Home',
  full_name   text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  landmark    text,
  city        text not null,
  lga         text not null,
  state       text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on public.addresses(user_id);

-- ───────────── Catalogue ─────────────
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.categories(id) on delete set null,
  slug        text not null unique,
  name        text not null,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  meta_title  text,
  meta_description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.brands (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  name      text not null,
  logo_url  text,
  created_at timestamptz not null default now()
);

create type public.product_status as enum ('draft', 'active', 'archived');

create table public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  sku               text not null unique,
  name              text not null,
  brand_id          uuid references public.brands(id) on delete set null,
  category_id       uuid not null references public.categories(id),
  short_description text,
  description       text,
  highlights        text[] not null default '{}',
  specs             jsonb not null default '{}'::jsonb,
  warranty          text,
  price             numeric(12,2) not null check (price >= 0),
  compare_at_price  numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price        numeric(12,2),
  status            public.product_status not null default 'draft',
  is_featured       boolean not null default false,
  is_best_seller    boolean not null default false,
  is_new            boolean not null default false,
  installable       boolean not null default false,   -- shows "installation available – contact us" (separate paid service)
  coming_soon       boolean not null default false,   -- not yet available: "Contact us" instead of Add to cart
  price_on_request  boolean not null default false,   -- price hidden on the site; cannot be bought online
  sort_order        int not null default 0,           -- display order (follows the product sheet)
  flash_deal_ends_at timestamptz,
  rating_avg        numeric(3,2) not null default 0,
  rating_count      int not null default 0,
  sold_count        int not null default 0,
  weight_kg         numeric(8,2),
  meta_title        text,
  meta_description  text,
  search            tsvector generated always as (
                      setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
                      setweight(to_tsvector('english', coalesce(sku,'')), 'A') ||
                      setweight(to_tsvector('english', coalesce(short_description,'')), 'B') ||
                      setweight(to_tsvector('english', coalesce(description,'')), 'C')) stored,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index products_search_idx on public.products using gin(search);
create index products_name_trgm on public.products using gin(name gin_trgm_ops);
create index on public.products(category_id, status);
create index on public.products(brand_id);
create index on public.products(price);

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  sort_order  int not null default 0
);
create index on public.product_images(product_id, sort_order);

-- ───────────── Inventory ─────────────
create table public.inventory (
  product_id          uuid primary key references public.products(id) on delete cascade,
  quantity            int not null default 0 check (quantity >= 0),
  reserved            int not null default 0 check (reserved >= 0),
  low_stock_threshold int not null default 5,
  warehouse           text not null default 'Lagos-VI',
  updated_at          timestamptz not null default now()
);

create type public.inventory_reason as enum ('restock', 'sale', 'return', 'adjustment', 'damage');
create table public.inventory_movements (
  id          bigserial primary key,
  product_id  uuid not null references public.products(id) on delete cascade,
  delta       int not null,
  reason      public.inventory_reason not null,
  reference   text,
  note        text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index on public.inventory_movements(product_id, created_at desc);

create or replace function public.ensure_inventory_row() returns trigger language plpgsql as $$
begin insert into public.inventory(product_id) values (new.id) on conflict do nothing; return new; end $$;
create trigger products_inventory after insert on public.products for each row execute function public.ensure_inventory_row();

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- ───────────── Coupons & promotions ─────────────
create type public.coupon_type as enum ('percent', 'fixed');
create table public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique check (code = upper(code)),
  type          public.coupon_type not null,
  value         numeric(12,2) not null check (value > 0),
  min_subtotal  numeric(12,2) not null default 0,
  max_discount  numeric(12,2),
  usage_limit   int,
  used_count    int not null default 0,
  per_customer_limit int default 1,
  starts_at     timestamptz,
  expires_at    timestamptz,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.promotions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text,
  image_url   text,
  link        text,
  placement   text not null default 'home_hero',  -- home_hero | home_banner | category
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  sort_order  int not null default 0,
  active      boolean not null default true
);

-- ───────────── Orders ─────────────
create type public.order_status as enum ('pending','paid','processing','shipped','delivered','cancelled','refunded','return_requested','returned');
create type public.delivery_method as enum ('standard','express','pickup');

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,
  user_id           uuid references auth.users(id) on delete set null,     -- null = guest checkout
  email             text not null,
  customer_name     text not null,
  phone             text not null,
  shipping_address  jsonb not null,           -- snapshot {fullName, phone, line1, line2, landmark, city, lga, state}
  delivery_method   public.delivery_method not null default 'standard',   -- standard = delivery, pickup = showroom pickup
  shipping_to_be_arranged boolean not null default false,  -- delivery under ₦2M: Newcastle contacts the customer to arrange shipping
  installation      boolean not null default false,
  status            public.order_status not null default 'pending',
  subtotal          numeric(12,2) not null,
  discount          numeric(12,2) not null default 0,
  shipping_fee      numeric(12,2) not null default 0,
  installation_fee  numeric(12,2) not null default 0,
  total             numeric(12,2) not null,
  coupon_code       text,
  tracking_number   text,
  carrier           text,
  estimated_delivery_from date,
  estimated_delivery_to   date,
  notes             text,
  admin_notes       text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.orders(user_id, created_at desc);
create index on public.orders(status, created_at desc);
create index on public.orders(lower(email));
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,          -- snapshot
  sku         text not null,
  image_url   text,
  unit_price  numeric(12,2) not null,
  quantity    int not null check (quantity > 0)
);
create index on public.order_items(order_id);
create index on public.order_items(product_id);

create table public.order_events (
  id          bigserial primary key,
  order_id    uuid not null references public.orders(id) on delete cascade,
  status      public.order_status not null,
  note        text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index on public.order_events(order_id, created_at);

create table public.payments (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  provider    text not null default 'paystack',
  reference   text not null unique,
  status      text not null,
  amount      numeric(12,2) not null,
  channel     text,
  paid_at     timestamptz,
  raw         jsonb,
  created_at  timestamptz not null default now()
);

create table public.payment_methods (           -- Paystack reusable authorizations (no card data stored)
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  provider           text not null default 'paystack',
  authorization_code text not null,
  signature          text not null,
  brand text, last4 text, exp_month text, exp_year text, bank text, channel text, email text,
  created_at         timestamptz not null default now(),
  unique (user_id, signature)
);

create table public.returns (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  reason      text not null,
  status      text not null default 'requested',  -- requested | approved | rejected | received | refunded
  refund_amount numeric(12,2),
  created_at  timestamptz not null default now()
);

-- ───────────── Reviews & wishlists ─────────────
create table public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references public.products(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  author_name        text not null,
  rating             int not null check (rating between 1 and 5),
  title              text,
  body               text not null,
  photos             text[] not null default '{}',
  verified_purchase  boolean not null default false,
  status             text not null default 'approved' check (status in ('pending','approved','rejected')),
  created_at         timestamptz not null default now(),
  unique (product_id, user_id)
);
create index on public.reviews(product_id, status, created_at desc);

create or replace function public.refresh_product_rating() returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.product_id, old.product_id);
begin
  update products p set
    rating_avg = coalesce((select round(avg(rating)::numeric, 2) from reviews where product_id = pid and status = 'approved'), 0),
    rating_count = (select count(*) from reviews where product_id = pid and status = 'approved')
  where p.id = pid;
  return null;
end $$;
create trigger reviews_rating after insert or update or delete on public.reviews for each row execute function public.refresh_product_rating();

create table public.wishlists (
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ───────────── Carts (abandoned-cart tracking) ─────────────
create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null unique,
  user_id     uuid references auth.users(id) on delete set null,
  email       text,
  items       jsonb not null default '[]',
  subtotal    numeric(12,2) not null default 0,
  status      text not null default 'open' check (status in ('open','converted','recovered')),
  reminder_sent_at timestamptz,
  updated_at  timestamptz not null default now()
);
create index on public.carts(status, updated_at);

-- ───────────── Support, leads & solar ─────────────
create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  order_id    uuid references public.orders(id) on delete set null,
  name        text not null,
  email       text,
  phone       text,
  subject     text not null,
  status      text not null default 'open' check (status in ('open','pending','resolved','closed')),
  priority    text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create table public.ticket_messages (
  id          bigserial primary key,
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  author_id   uuid references auth.users(id),
  is_staff    boolean not null default false,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table public.leads (                     -- quotes, installation bookings, contact messages
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('quote','contact','installation','support')),
  name        text not null,
  email       text,
  phone       text not null,
  state       text,
  product     text,
  preferred_date date,
  message     text,
  meta        jsonb,
  status      text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
  created_at  timestamptz not null default now()
);
create index on public.leads(type, status, created_at desc);

create table public.solar_consultations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text,
  phone           text not null,
  state           text,
  property_type   text,
  message         text,
  calculator      jsonb,          -- {dailyKwh, inverterKva, batteryKwh, panels, appliances[]}
  status          text not null default 'new' check (status in ('new','site_visit','proposal_sent','won','lost')),
  created_at      timestamptz not null default now()
);

create table public.newsletter_subscribers (
  email       text primary key,
  source      text default 'website',
  confirmed   boolean not null default false,
  unsubscribed_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ───────────── Read models (views) ─────────────
create or replace view public.category_tree with (security_invoker = true) as
  select c.*, p.slug as parent_slug from public.categories c left join public.categories p on p.id = c.parent_id where c.is_active;

create or replace view public.product_listing with (security_invoker = true) as
  select pr.*,
         b.name as brand_name, b.slug as brand_slug,
         c.name as category_name, c.slug as category_slug, pc.slug as parent_category_slug,
         coalesce(i.quantity - i.reserved, 0) as stock, coalesce(i.low_stock_threshold, 5) as low_stock_threshold,
         (pr.compare_at_price is not null and pr.compare_at_price > pr.price) as on_sale,
         coalesce((select array_agg(pi.url order by pi.sort_order) from public.product_images pi where pi.product_id = pr.id), '{}') as images
  from public.products pr
  join public.categories c on c.id = pr.category_id
  left join public.categories pc on pc.id = c.parent_id
  left join public.brands b on b.id = pr.brand_id
  left join public.inventory i on i.product_id = pr.id;

create or replace view public.low_stock with (security_invoker = true) as
  select p.id, p.name, p.sku, i.quantity, i.reserved, i.low_stock_threshold
  from public.inventory i join public.products p on p.id = i.product_id
  where i.quantity - i.reserved <= i.low_stock_threshold and p.status = 'active';

-- ───────────── Transactional functions ─────────────
/** Called ONLY by the server (service role) after Paystack verification. Idempotent. */
create or replace function public.confirm_order_payment(
  p_order_id uuid, p_reference text, p_amount numeric, p_channel text, p_paid_at timestamptz, p_raw jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare it record; v_status order_status;
begin
  select status into v_status from orders where id = p_order_id for update;
  if v_status <> 'pending' then return; end if;

  for it in select product_id, quantity, sku from order_items where order_id = p_order_id and product_id is not null loop
    update inventory set quantity = greatest(quantity - it.quantity, 0), updated_at = now() where product_id = it.product_id;
    insert into inventory_movements(product_id, delta, reason, reference) values (it.product_id, -it.quantity, 'sale', p_reference);
    update products set sold_count = sold_count + it.quantity where id = it.product_id;
  end loop;

  update orders set status = 'paid', paid_at = coalesce(p_paid_at, now()) where id = p_order_id;
  insert into order_events(order_id, status, note) values (p_order_id, 'paid', 'Payment confirmed via ' || coalesce(p_channel, 'paystack'));
  insert into payments(order_id, reference, status, amount, channel, paid_at, raw)
    values (p_order_id, p_reference, 'success', p_amount, p_channel, p_paid_at, p_raw)
    on conflict (reference) do update set status = 'success', amount = excluded.amount, channel = excluded.channel, paid_at = excluded.paid_at, raw = excluded.raw;
  update coupons set used_count = used_count + 1 where code = (select coupon_code from orders where id = p_order_id);
  update carts set status = 'converted' where email = (select email from orders where id = p_order_id) and status = 'open';
end $$;
revoke execute on function public.confirm_order_payment from public, anon, authenticated;

/** Staff-only stock adjustment with audit trail. */
create or replace function public.adjust_stock(p_product_id uuid, p_delta int, p_reason inventory_reason, p_note text default null)
returns int language plpgsql security definer set search_path = public as $$
declare q int;
begin
  if not public.is_staff() then raise exception 'forbidden'; end if;
  update inventory set quantity = greatest(quantity + p_delta, 0), updated_at = now() where product_id = p_product_id returning quantity into q;
  insert into inventory_movements(product_id, delta, reason, note, created_by) values (p_product_id, p_delta, p_reason, p_note, auth.uid());
  return q;
end $$;

/** Public order tracking: requires reference + matching email/phone. */
create or replace function public.track_order(p_reference text, p_contact text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'reference', o.reference, 'status', o.status, 'created_at', o.created_at, 'total', o.total,
    'delivery_method', o.delivery_method, 'tracking_number', o.tracking_number, 'carrier', o.carrier,
    'eta_from', o.estimated_delivery_from, 'eta_to', o.estimated_delivery_to, 'state', o.shipping_address->>'state',
    'items', (select jsonb_agg(jsonb_build_object('name', name, 'quantity', quantity, 'image', image_url)) from order_items where order_id = o.id),
    'events', (select jsonb_agg(jsonb_build_object('status', status, 'note', note, 'at', created_at) order by created_at) from order_events where order_id = o.id))
  from orders o
  where o.reference = upper(trim(p_reference))
    and (
      lower(o.email) = lower(trim(p_contact))
      or (length(regexp_replace(p_contact, '\D', '', 'g')) >= 10   -- require a real phone number, never an empty pattern
          and right(regexp_replace(o.phone, '\D', '', 'g'), 10) = right(regexp_replace(p_contact, '\D', '', 'g'), 10))
    )
  limit 1;
$$;
grant execute on function public.track_order to anon, authenticated;
