# Sign-in & Register: email + password, and Google

The website code is already built. The **Sign in / Register** page (`/auth/login`) offers both email + password and "Continue with Google", plus password reset. You only need to switch things on in Supabase and Google. Do the database import first (`docs/SUPABASE-IMPORT.md`).

> **Version without customer sign-in?** If `NEXT_PUBLIC_CUSTOMER_ACCOUNTS=off` (the default in the "no sign-in" zip), skip Parts A and B and follow **Part D** instead.

---

## Part A: Email + password (about 20 minutes)

### A1. URLs (required)
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://www.newcastleelectronics.com`
- **Redirect URLs:** add all of these:
  ```
  https://www.newcastleelectronics.com/auth/callback
  https://newcastleelectronics.com/auth/callback
  https://*.vercel.app/auth/callback
  http://localhost:3000/auth/callback
  ```
  Without these, confirmation and password-reset links won't work, or they'll send people to the wrong site.

### A2. Email provider settings
Supabase → **Authentication → Sign In / Providers → Email**:
- **Enable Email provider:** ON (the default).
- **Confirm email:** ON (recommended). New customers click a link in their email before their account is active. This stops people signing up with someone else's email address.
- **Minimum password length:** 8, with **letters and digits** required.

Also make sure **"Allow new users to sign up"** is ON (Sign In / Providers, user signups).

### A3. Custom email sender (required for real customers)
Supabase's built-in email sender is for testing only. **Unless you configure a custom SMTP server for your project, Supabase Auth will refuse to deliver messages to addresses that are not part of the project's team.** Customers wouldn't get confirmation or password-reset emails.

1. Create a free account at **Resend** (<https://resend.com>, 3,000 emails/month free) or **Brevo** (300/day free).
2. Add your domain `newcastleelectronics.com`, and add the DNS records it shows (SPF, DKIM, DMARC) in Cloudflare or wherever your DNS is managed.
3. Supabase → **Authentication → Emails → SMTP Settings**. Turn on **Enable custom SMTP**:
   - Sender email `no-reply@newcastleelectronics.com`, sender name `Newcastle Electronics`
   - Resend: host `smtp.resend.com`, port `587`, username `resend`, password = your Resend API key
4. Supabase → **Authentication → Rate Limits**. Raise the email limit (30/hour by default) to suit your traffic.
5. Supabase → **Authentication → Emails → Templates**. Edit "Confirm signup" and "Reset password" so they say Newcastle Electronics. Keep them short, with no promotions.

> You can reuse the same Resend API key as `RESEND_API_KEY` in Vercel. The website then also emails order receipts.

### A4. Test it
1. Open `/auth/login`, choose **Register**, and use an email that isn't in your Supabase team.
2. Click the confirmation link in the email. You should land on `/account`.
3. Sign out. Then test **Forgot password?**.

---

## Part B: Continue with Google (about 20 minutes)

### B1. Google Cloud
1. Go to <https://console.cloud.google.com>, then **New project** ("Newcastle Electronics").
2. **Google Auth Platform → Branding** (the OAuth consent screen):
   - App name `Newcastle Electronics`, support email `info@newcastleelectronics.com`, logo (`public/emblem.png`)
   - App home page `https://www.newcastleelectronics.com`, privacy policy `https://www.newcastleelectronics.com/privacy`
   - **Authorised domains:** `newcastleelectronics.com` **and** `<your-project-ref>.supabase.co`
3. **Audience:** User type **External**. When you're happy, click **Publish app**. While it's in "Testing", only test users you list can sign in.
4. **Data access (scopes):** `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`. Nothing else.
5. **Clients → Create client → Web application**:
   - **Authorised JavaScript origins:** `https://www.newcastleelectronics.com`
   - **Authorised redirect URIs:** copy the **Callback URL** shown in Supabase under Sign In / Providers → Google. It looks like `https://<project-ref>.supabase.co/auth/v1/callback`.
   - Click **Create**, then copy the **Client ID** and **Client secret**.

### B2. Supabase
Supabase → **Authentication → Sign In / Providers → Google**. Turn it **ON**, paste the Client ID and Client secret, and click **Save**.

### B3. Test it
Open `/auth/login` and click **Continue with Google**. Pick an account and you should land on `/account`. A Google sign-in creates the account automatically; no confirmation email is needed.

> Tip: Google's sign-in screen will say "continue to <project-ref>.supabase.co". If you'd like it to say your own domain, Supabase offers a paid **Custom Domain** add-on (for example `auth.newcastleelectronics.com`).

---

## Part C: Check everything
Open `https://www.newcastleelectronics.com/api/health?token=YOUR_CRON_SECRET`:
- `AUTH_EMAIL_PASSWORD` should say **enabled (customers confirm by email)**
- `AUTH_GOOGLE` should say **enabled**

Then make yourself admin: register first, then run in the SQL Editor:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'info@newcastleelectronics.com');
```

---

## Part D: Version WITHOUT customer sign-in (staff login only)
In this version customers never create accounts. They check out as guests and track orders by order number + email or phone. Reviews are submitted with a name + email and appear after you approve them in **Admin → Reviews**. Only your staff log in, to manage the shop at `/admin`.

1. **Supabase → Authentication → Sign In / Providers:** keep **Email** enabled. Turn **OFF** "Allow new users to sign up", so nobody can create a login from outside. Google isn't needed.
2. **Supabase → Authentication → URL Configuration:** set the Site URL to `https://www.newcastleelectronics.com`. This is needed for staff password-reset emails.
3. **Create each staff login:** Supabase → **Authentication → Users → Add user → Create new user**. Enter the email and a strong password, and tick **Auto Confirm User**.
4. **Give them access** in the SQL Editor (use `'admin'` for yourself and `'staff'` for team members):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'info@newcastleelectronics.com');
   ```
5. Staff sign in at `https://www.newcastleelectronics.com/auth/login`. The page isn't linked anywhere on the site and is hidden from Google.
6. **Custom SMTP (Part A3)** is only needed if staff will use "Forgot password". Otherwise you can reset passwords from Supabase → Authentication → Users.
7. **Switching later:** you can turn customer accounts on at any time. Set `NEXT_PUBLIC_CUSTOMER_ACCOUNTS=on` in Vercel, redeploy, and complete Parts A and B.

---

## Where customer data is stored, and how to keep it secure

**Store it in Supabase, the database the site is already built on. Not in spreadsheets, WhatsApp exports or email.**

| Data | Where it lives | Protection |
|---|---|---|
| Login, email, password | Supabase **Auth** (`auth.users`) | Managed by Supabase. Passwords are stored as **one-way hashes**; no one, not even you, can read them. Google users have no password stored. |
| Name, phone, role | `profiles` table | Row-Level Security: a customer can read and edit **only their own** record. |
| Addresses, orders, swap requests | `addresses`, `orders`, `order_items`, `returns` | Row-Level Security: customers see only their own. Staff and admin see all. |
| Saved cards | `payment_methods` | **Only Paystack tokens and the last 4 digits.** Card numbers never touch your servers (Paystack is PCI-DSS Level 1). |
| Product photos, review photos | Supabase **Storage** | Upload rules: staff only for products; each customer only to their own folder. |

Built-in protections: HTTPS everywhere, encryption at rest, Row-Level Security on every table (tested), server-side role checks for admin pages, and the `service_role` key kept only on the server.

**What you need to do:**
1. **Supabase plan.** Use the **Pro plan ($25/month) for the live shop.** **Free projects are paused after 1 week of inactivity**, and automated daily backups start on Pro (kept for 7 days). Free projects have no automatic backups.
2. **Region.** When you create the project, choose **London (eu-west-2)** or **Frankfurt (eu-central-1)**, the closest to Nigeria. It can't be changed later.
3. **Lock down accounts.** Turn on **two-factor authentication (2FA)** for Supabase, Vercel, Paystack, Google Cloud, GitHub and your domain registrar. Give team members their own logins, not shared passwords.
4. **Keep secrets secret.** `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY` and `RESEND_API_KEY` go only in Vercel's environment variables. Never put them in code, WhatsApp or email. If one leaks, rotate it immediately (Supabase → Settings → API, Paystack → Settings).
5. **Staff access.** Make staff `staff`, not `admin` (staff can't delete products or change roles). Remove access when someone leaves.
6. **Nigeria Data Protection Act (NDPA) 2023:**
   - The site now has a **Privacy Policy** page (`/privacy`, linked in the footer and on the Register form). It's a **draft**, so have a lawyer or Data Protection Officer review it.
   - Respond to customer requests to see, correct or delete their data, and keep customer data only as long as needed.
   - If there's a data breach, the NDPA requires notifying the Nigeria Data Protection Commission (NDPC) within 72 hours. Check with your adviser whether Newcastle must also register with the NDPC as a data controller.
