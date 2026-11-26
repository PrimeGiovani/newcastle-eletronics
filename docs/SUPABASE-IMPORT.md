# Importing the database into Supabase (step by step)

Your Supabase project starts with **no tables**. You'll run six SQL files **once, in this order**. It takes about 5 minutes.

## Where the files are
In your project folder (GitHub repository / zip):
```
newcastle-electronics/
└── supabase/
    ├── migrations/
    │   ├── 0001_schema.sql   ← STEP 1: creates all 24 tables, views and functions
    │   ├── 0002_rls.sql      ← STEP 2: security rules + image storage buckets
    │   ├── 0003_reviews.sql  ← STEP 2b: lets staff add customer reviews
    │   ├── 0004_grants.sql   ← STEP 2c: lets the website read the data (REQUIRED on new Supabase projects)
    │   └── 0005_pay_in_store.sql ← STEP 2d: "Pay at our showroom" + Ready for pickup / Collected statuses
    ├── seed.sql              ← STEP 3: your 76 products, 22 categories, stock, images, reviews, coupons
    └── updates/              ← one-off fixes, ONLY if you imported an older seed.sql
```
On GitHub you can also open each file, click **Raw**, then select all and copy.

> ⚠️ **Don't add the Supabase keys to Vercel until all the steps below are done.** Once the keys are set, the website reads products **only** from the database. An empty database means an empty shop.

---

## Step 0: Open the SQL Editor
1. Go to <https://supabase.com/dashboard> and open your project.
2. In the left sidebar, click **SQL Editor** (the `>_` icon).
3. Click **+ New query**.

## Step 1: Create the tables (`0001_schema.sql`)
1. Open `supabase/migrations/0001_schema.sql` in a text editor (VS Code, Notepad, TextEdit) or on GitHub (Raw).
2. Select everything (**Ctrl+A** / **Cmd+A**), copy, and paste it into the SQL Editor.
3. Click **Run** (bottom right) or press **Ctrl+Enter** / **Cmd+Enter**.
4. ✅ You should see **"Success. No rows returned"**.

## Step 2: Security rules and storage (`0002_rls.sql`)
1. Click **+ New query** (or clear the editor).
2. Paste the whole of `supabase/migrations/0002_rls.sql` and click **Run**.
3. ✅ **"Success. No rows returned"**.

## Step 2b: Reviews (`0003_reviews.sql`)
1. Click **+ New query**, paste the whole of `supabase/migrations/0003_reviews.sql` and click **Run**.
2. ✅ **"Success. No rows returned"**.

## Step 2c: Permissions (`0004_grants.sql`), required
New Supabase projects no longer let the website read tables automatically. Without this file the shop shows **no products**.
1. Click **+ New query**, paste the whole of `supabase/migrations/0004_grants.sql` and click **Run**.
2. ✅ **"Success. No rows returned"**. It's safe to run again.

## Step 2d: Pay at store (`0005_pay_in_store.sql`)
1. Click **+ New query**, paste the whole of `supabase/migrations/0005_pay_in_store.sql` and click **Run**.
2. ✅ **"Success. No rows returned"**. It's safe to run again.

## Step 3: Load your products (`seed.sql`)
1. Click **+ New query**.
2. Paste the whole of `supabase/seed.sql` (about 165 KB, which the SQL Editor handles fine) and click **Run**.
3. ✅ **"Success. No rows returned"**. It's safe to run again: it won't create duplicates.

## Step 4: Check it worked
In a new query, run:
```sql
select
  (select count(*) from products)                          as products,       -- expect 76
  (select count(*) from categories)                        as categories,     -- expect 22
  (select count(*) from products where coming_soon)        as coming_soon,    -- expect 12 (solar)
  (select count(*) from products where is_best_seller)     as best_sellers,   -- expect 3
  (select count(*) from product_listing where on_sale)     as on_sale,        -- expect 6
  (select count(*) from products where is_new)             as new_arrivals;   -- expect 23 (gas hobs)
```
You can also open **Table Editor** (left sidebar) and browse `products`, `categories` and so on.

## Step 5: Connect the website
1. In Supabase, go to **Project Settings → API Keys** and copy. Either the new keys or the legacy keys work; just don't mix them up:

   | Vercel variable | New keys (recommended) | Legacy keys |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) | same |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable** key `sb_publishable_…` | `anon` `public` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Secret** key `sb_secret_…` (never share) | `service_role` key |

   ⚠️ Never put the Secret / service_role key in a `NEXT_PUBLIC_` variable.
2. In Vercel, go to **Project → Settings → Environment Variables**, add all three, and tick **Production**.
3. Go to **Deployments**, open the latest deployment, click **⋯** and choose **Redeploy**.
4. Open `https://YOUR-DOMAIN/api/health?token=YOUR_CRON_SECRET`. You should see `"connected · 76 active products in database"` and `"paymentsReady": true`.

## Step 6: Make yourself admin
1. Register on your website with your email.
2. In the SQL Editor, run:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'info@newcastleelectronics.com');
```
3. Sign in and open `/admin`.

---

## Already set up? Adding pay at store
Run `supabase/migrations/0005_pay_in_store.sql` (Step 2d) once, then redeploy. Nothing else needs re-running.

## Already imported, but no products showing?
Run `supabase/migrations/0004_grants.sql` (Step 2c), then redeploy in Vercel. Nothing else needs re-running.

## Already imported before 25 Nov 2026?
- Run `supabase/migrations/0003_reviews.sql` (Step 2b) and `0004_grants.sql` (Step 2c).
- Then run `supabase/updates/001_rose_gold.sql`, which renames NC 18CFIN/GT to **Rose Gold**. Re-running `seed.sql` won't change products that already exist.

## Updating products later
- **Day-to-day:** use **/admin → Products** to change prices, stock, sale prices, "coming soon", "price on request" and photos. Changes appear on the site within about 10 minutes.
- **Re-importing the whole sheet:**
  1. Save the sheet as CSV to `data/product-list.csv`.
  2. Run:
     ```bash
     python3 scripts/import-product-list.py
     node --experimental-strip-types scripts/generate-seed.ts
     ```
  3. Run the new `supabase/seed.sql` (Step 3).

  The seed only **adds** new products (matched by URL). It won't overwrite prices you've edited in the admin.

## Troubleshooting
| Message | Fix |
|---|---|
| **Shop shows no products** even though the check query says 76 | Run `0004_grants.sql` (Step 2c), wait 1 minute, then redeploy in Vercel. `/api/health` → `STOREFRONT_CATALOGUE` shows the exact reason. |
| `permission denied for table/view …` (code 42501) | Run `0004_grants.sql`. |
| `relation "…" already exists` when running 0001 | Step 1 was already done. Go on to Step 2. |
| `relation "products" does not exist` when running seed | Run Step 1 and Step 2 first. |
| `policy "…" already exists` | Step 2 was already done. Go on to Step 3. |
| Shop is empty after adding the keys | The seed hasn't been run (Step 3), or you didn't redeploy. |
| Supabase asks "This query has destructive operations…" | Click **Run this query**. The files only create things; they never delete your data. |
