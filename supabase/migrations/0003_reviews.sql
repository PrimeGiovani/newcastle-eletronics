-- ════════════════════════════════════════════════════════════════════
--  Reviews: allow staff-entered and imported reviews (e.g. collected via
--  WhatsApp or in the showroom) alongside reviews written on the website.
--  Safe to run more than once. Run AFTER 0001 and 0002, BEFORE seed.sql.
-- ════════════════════════════════════════════════════════════════════
alter table public.reviews alter column user_id drop not null;          -- imported/staff reviews have no website account

alter table public.reviews add column if not exists source text not null default 'website';
do $$ begin
  alter table public.reviews add constraint reviews_source_check check (source in ('website', 'imported', 'staff'));
exception when duplicate_object then null; end $$;

-- Staff/admins can add and manage any review
drop policy if exists "staff add reviews" on public.reviews;
create policy "staff add reviews" on public.reviews for insert with check (public.is_staff());

create index if not exists reviews_rating_idx on public.reviews (status, rating desc, created_at desc);
