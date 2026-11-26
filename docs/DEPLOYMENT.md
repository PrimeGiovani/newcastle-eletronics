# Deployment Guide — Supabase · Paystack · Vercel · Cloudflare

Follow the steps in order. The site runs without any keys (built-in catalogue from your product sheet, no checkout). Each section below switches on more of the platform.

---

## 1. Supabase (database, auth, storage)

1. Create a project at <https://supabase.com>. Choose a region close to Nigeria (**eu-west-2 London** or **eu-central-1 Frankfurt**).
2. **Run the migrations** (in order):
   - Follow **[SUPABASE-IMPORT.md](SUPABASE-IMPORT.md)**: run `0001`–`0004` in `supabase/migrations/`, then `seed.sql` (your 76 products), in the SQL Editor.
   - Or use the CLI: `npx supabase link --project-ref <ref> && npx supabase db push`, then run `seed.sql` in the editor.
3. **Copy your keys** from Project Settings → API into `.env.local` and Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (**server only**; never prefix it with `NEXT_PUBLIC_`)
4. **Set up email login:** Authentication → Providers → Email (enabled by default). Authentication → URL Configuration:
   - Site URL: `https://www.newcastleelectronics.com`
   - Redirect URLs: `https://www.newcastleelectronics.com/auth/callback`, `http://localhost:3000/auth/callback`, `https://*-yourteam.vercel.app/auth/callback`
5. **Set up Google login:**
   1. In Google Cloud Console, go to APIs & Services → Credentials → Create OAuth Client ID (Web).
   2. Authorised redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   3. Paste the Client ID and Secret into Supabase → Authentication → Providers → Google.
6. **Use custom SMTP** for auth emails (recommended): Authentication → SMTP. You can use Resend, Zoho or Google Workspace. Supabase's built-in mailer is rate-limited.
7. **Storage:** the buckets `product-images` and `review-photos` are created by `0002_rls.sql`, together with their policies.
8. **Create your first admin.** Register on the site, then run this in the SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'info@newcastleelectronics.com');
   ```
   Use `'staff'` for team members who manage products and orders but can't delete products.

## 2. Paystack

1. Create and verify your business at <https://dashboard.paystack.com>. Live payments require business verification (CAC documents).
2. Go to Settings → API Keys & Webhooks:
   - Copy the secret key into `PAYSTACK_SECRET_KEY` and the public key into `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
   - **Webhook URL:** `https://www.newcastleelectronics.com/api/paystack/webhook`
   - Callback URL: leave it blank. The app sends the callback URL with each transaction.
3. Go to Settings → Preferences → Payment channels and enable Card, Bank Transfer, USSD, QR, Bank and Mobile Money.
4. **Test mode:** use `sk_test_…` keys and Paystack's test card `4084 0840 8408 4081` (CVV 408, any future expiry, PIN 0000, OTP 123456).
5. **How a payment flows:**
   1. The checkout calls `POST /api/checkout`. It reloads prices and stock from the database, computes totals on the server, inserts a `pending` order and initialises the Paystack transaction.
   2. The customer pays on Paystack's hosted page, using any of the enabled channels.
   3. Paystack calls the webhook (HMAC-SHA512 signature verified) **and** redirects the customer to `/checkout/success`. Both call `confirmPayment()`. That function re-verifies with the Paystack API, checks the amount and currency, and runs the `confirm_order_payment` SQL function. That function is atomic and idempotent: it decrements stock, records the payment, logs an order event and counts the coupon use. Finally, the email receipt is sent.
   4. Refunds are issued in the Paystack dashboard. The `refund.processed` webhook then marks the order as refunded.

## 3. Email receipts and notifications (optional)

1. Create an account at <https://resend.com> and verify your domain (add the DNS records in Cloudflare).
2. Set `RESEND_API_KEY`, `EMAIL_FROM` and `ADMIN_NOTIFY_EMAIL`.

Without these, emails are skipped and logged to the server console.

## 4. Vercel

1. Push the repository to GitHub and import it at <https://vercel.com/new>. The framework (Next.js) is detected automatically.
2. Add every variable from `.env.example` under Project → Settings → Environment Variables, for both Production and Preview. Generate a random `CRON_SECRET`:
   ```bash
   openssl rand -hex 32
   ```
3. Deploy.
   - `vercel.json` pins the region to `cdg1` (Paris, the lowest latency to Lagos) and runs a **daily** cron (03:00 UTC) that cancels Paystack orders still unpaid after 24 hours, and releases pay-at-store reservations not paid within 3 days. Vercel Hobby only allows daily crons; this job does not need to run more often.
   - Optionally, under Settings → Functions, set the default region to match.
4. Under Settings → Domains, add `newcastleelectronics.com` and `www.newcastleelectronics.com`. Choose `www` as primary and redirect the apex to it.

## 5. Cloudflare (DNS, CDN, security)

1. Add the domain to Cloudflare and change the nameservers at your `.ng` registrar.
2. Add the DNS records Vercel shows you:
   - `CNAME www → cname.vercel-dns.com`
   - `A @ → 76.76.21.21`
3. **Proxy mode:** grey cloud (DNS only) is the simplest and lets Vercel's edge network serve traffic. If you turn on the orange-cloud proxy instead:
   - SSL/TLS → **Full (strict)**
   - Turn **off** Rocket Loader and Auto Minify, which break React hydration
   - Caching → "Respect existing headers"
   - Add a Cache Rule to **bypass cache** for `/api/*`, `/admin*`, `/account*` and `/checkout*`
4. Security:
   - WAF managed rules on
   - Bot Fight Mode on
   - Rate limiting rule: `/api/checkout` and `/api/leads` ≤ 20 requests per minute per IP
5. Email DNS: add the Resend SPF/DKIM records, plus `_dmarc TXT "v=DMARC1; p=quarantine"`.

## Checking your setup
Open `https://YOUR-DOMAIN/api/health?token=YOUR_CRON_SECRET`. It reports, for every integration:
- whether the variable is set
- whether the key actually works (Paystack and Supabase are contacted live)
- test or live mode
- exactly how to fix anything that's wrong

Key values are never shown. `"paymentsReady": true` means checkout will work.

> Paystack has **no separate webhook secret**. Webhooks are signed with your `PAYSTACK_SECRET_KEY`, so you don't need a `PAYSTACK_WEBHOOK_SECRET` variable.

## 6. Go-live checklist

- [ ] Switch to live Paystack keys and make a real ₦100 test purchase, then refund it.
- [ ] Confirm the webhook delivers (Paystack → Webhooks → logs show 200).
- [ ] Replace placeholder products, prices and renders with real data and photos in **Admin → Products**.
- [ ] Update `lib/config.ts`: phone, WhatsApp number, address and social links.
- [ ] Google Search Console: verify the domain and submit `/sitemap.xml`.
- [ ] Google Business Profile: use the same name, address and phone as the website.
- [ ] Merchant Center: product structured data is already on every product page.
- [ ] Run Lighthouse on the homepage and a product page in mobile mode and fix anything under 95.
- [ ] Turn on Vercel Analytics and Speed Insights, and an uptime monitor such as Better Stack.
- [ ] Turn on Supabase backups (Pro plan: daily backups plus point-in-time recovery).

## 7. Environment variables

| Variable | Where | Required for |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URLs, sitemap, Paystack callback |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | public | WhatsApp buttons (digits only, e.g. `2348031234567`) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Catalogue from the database, auth |
| `SUPABASE_SERVICE_ROLE_KEY` | **server** | Checkout, webhooks, leads, invoices |
| `PAYSTACK_SECRET_KEY` | **server** | Payments |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | public | Reserved for inline/popup checkout |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` | server | Receipts and admin alerts |
| `CRON_SECRET` | server | Protects the cron endpoint |
