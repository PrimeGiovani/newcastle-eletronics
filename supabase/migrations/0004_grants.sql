-- ════════════════════════════════════════════════════════════════════
--  Data API permissions (GRANTs)
--
--  Supabase no longer automatically exposes new tables to the website's
--  API ("Automatically expose new tables" is off on new projects). Without
--  these grants the site can't read your products and the shop looks empty.
--
--  Two layers work together:
--    • GRANT  – which kind of user may touch a table at all   (this file)
--    • RLS    – which ROWS they may see / change              (0002_rls.sql)
--  Least privilege: visitors (anon) can only READ public catalogue data.
--  Safe to run more than once. Run after 0001–0003 (before or after seed.sql).
-- ════════════════════════════════════════════════════════════════════
grant usage on schema public to anon, authenticated, service_role;

-- ── Visitors (publishable / anon key): read-only public catalogue ──
grant select on public.categories, public.brands, public.products, public.product_images,
                public.inventory, public.promotions, public.reviews,
                public.category_tree, public.product_listing
  to anon;

-- ── Signed-in users & staff (authenticated): RLS decides which rows ──
grant select on public.categories, public.brands, public.products, public.product_images,
                public.inventory, public.promotions, public.reviews,
                public.category_tree, public.product_listing, public.low_stock,
                public.orders, public.order_items, public.order_events, public.payments,
                public.inventory_movements, public.carts, public.newsletter_subscribers
  to authenticated;
grant select, update                 on public.profiles                                  to authenticated;
grant select, insert, update, delete on public.addresses, public.wishlists, public.reviews to authenticated;
grant select, delete                 on public.payment_methods                           to authenticated;
grant select, insert, update         on public.returns, public.support_tickets            to authenticated;
grant select, insert                 on public.ticket_messages                           to authenticated;
grant update                         on public.orders                                    to authenticated;   -- staff only (RLS)
grant insert                         on public.order_events                              to authenticated;   -- staff only (RLS)
-- Staff catalogue & marketing management (RLS limits these to staff/admin)
grant insert, update, delete on public.categories, public.brands, public.products, public.product_images,
                                public.inventory, public.coupons, public.promotions,
                                public.leads, public.solar_consultations
  to authenticated;
grant select on public.coupons, public.leads, public.solar_consultations to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ── Server (secret / service_role key): checkout, webhooks, admin tasks ──
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- ── Functions ──
grant execute on function public.is_staff(), public.is_admin()            to anon, authenticated, service_role;
grant execute on function public.track_order(text, text)                  to anon, authenticated, service_role;
grant execute on function public.adjust_stock(uuid, int, public.inventory_reason, text) to authenticated, service_role;
grant execute on function public.confirm_order_payment(uuid, text, numeric, text, timestamptz, jsonb) to service_role;

-- Tables created by future migrations automatically get server access
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;
