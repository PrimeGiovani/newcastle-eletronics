-- ════════════════════════════════════════════════════════════════════
--  Row Level Security – deny by default, open only what is needed.
--  The service-role key (server only) bypasses RLS for checkout & webhooks.
-- ════════════════════════════════════════════════════════════════════
do $$ declare t text; begin
  foreach t in array array['profiles','addresses','categories','brands','products','product_images','inventory','inventory_movements',
    'shipping_zones','shipping_states','coupons','promotions','orders','order_items','order_events','payments','payment_methods','returns',
    'reviews','wishlists','carts','support_tickets','ticket_messages','leads','solar_consultations','newsletter_subscribers']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

-- Profiles
create policy "own profile read"   on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "own profile update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- Addresses
create policy "own addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Public catalogue (read), staff write
create policy "public categories" on public.categories for select using (true);
create policy "public brands"     on public.brands     for select using (true);
create policy "public products"   on public.products   for select using (status = 'active' or public.is_staff());
create policy "public images"     on public.product_images for select using (true);
create policy "public inventory"  on public.inventory  for select using (true);
create policy "public zones"      on public.shipping_zones  for select using (true);
create policy "public states"     on public.shipping_states for select using (true);
create policy "public promos"     on public.promotions for select using (active and (ends_at is null or ends_at > now()));
create policy "public reviews"    on public.reviews for select using (status = 'approved' or user_id = auth.uid() or public.is_staff());

create policy "staff categories" on public.categories     for all using (public.is_staff()) with check (public.is_staff());
create policy "staff brands"     on public.brands         for all using (public.is_staff()) with check (public.is_staff());
create policy "staff products"   on public.products       for all using (public.is_staff()) with check (public.is_staff());
create policy "staff images"     on public.product_images for all using (public.is_staff()) with check (public.is_staff());
create policy "staff inventory"  on public.inventory      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff movements"  on public.inventory_movements for select using (public.is_staff());
create policy "staff coupons"    on public.coupons        for all using (public.is_staff()) with check (public.is_staff());
create policy "staff promos"     on public.promotions     for all using (public.is_staff()) with check (public.is_staff());
create policy "staff zones"      on public.shipping_zones for all using (public.is_admin()) with check (public.is_admin());

-- Orders: customers read their own; all writes go through the server (service role) or staff
create policy "own orders"        on public.orders       for select using (user_id = auth.uid() or public.is_staff());
create policy "staff orders"      on public.orders       for update using (public.is_staff());
create policy "own order items"   on public.order_items  for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy "own order events"  on public.order_events for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy "staff order events" on public.order_events for insert with check (public.is_staff());
create policy "staff payments"    on public.payments     for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own payment methods" on public.payment_methods for select using (user_id = auth.uid());
create policy "delete own payment methods" on public.payment_methods for delete using (user_id = auth.uid());
create policy "own returns"       on public.returns for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "request return"    on public.returns for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'delivered'));
create policy "staff returns"     on public.returns for update using (public.is_staff());

-- Reviews: signed-in users write their own (verified flag is set server-side)
create policy "write own review"  on public.reviews for insert with check (user_id = auth.uid() and verified_purchase = false);
create policy "edit own review"   on public.reviews for update using (user_id = auth.uid() or public.is_staff());
create policy "delete review"     on public.reviews for delete using (user_id = auth.uid() or public.is_staff());

-- Wishlists
create policy "own wishlist" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Staff-only operational tables (inserts happen via server routes with service role)
create policy "staff carts"     on public.carts for select using (public.is_staff());
create policy "staff leads"     on public.leads for all using (public.is_staff()) with check (public.is_staff());
create policy "staff solar"     on public.solar_consultations for all using (public.is_staff()) with check (public.is_staff());
create policy "staff newsletter" on public.newsletter_subscribers for select using (public.is_staff());
create policy "tickets read"    on public.support_tickets for select using (user_id = auth.uid() or public.is_staff());
create policy "tickets staff"   on public.support_tickets for update using (public.is_staff());
create policy "ticket msgs read" on public.ticket_messages for select using (public.is_staff() or exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
create policy "ticket msgs write" on public.ticket_messages for insert with check (public.is_staff() or exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));

-- ───────────── Storage buckets ─────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('review-photos', 'review-photos', true) on conflict do nothing;

create policy "public read product images" on storage.objects for select using (bucket_id in ('product-images','review-photos'));
create policy "staff upload product images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_staff());
create policy "staff delete product images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_staff());
create policy "users upload review photos" on storage.objects for insert
  with check (bucket_id = 'review-photos' and auth.uid()::text = (storage.foldername(name))[1]);
