import { NextResponse } from "next/server";
import { createClient as createJsClient } from "@supabase/supabase-js";
import { features } from "@/lib/config";

/**
 * Setup diagnostics: GET /api/health?token=<CRON_SECRET>
 * Reports which integrations are configured and whether the keys actually work.
 * Never returns key values – only yes/no, the key mode (test/live) and fix hints.
 */
export const dynamic = "force-dynamic";

type Check = { ok: boolean; detail: string; fix?: string };

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Add ?token=<your CRON_SECRET> to view diagnostics" }, { status: 401 });
  }
  const env = process.env;
  const checks: Record<string, Check> = {};
  const has = (k: string) => Boolean(env[k]?.trim());

  // ── Site ──
  checks.NEXT_PUBLIC_SITE_URL = has("NEXT_PUBLIC_SITE_URL")
    ? { ok: !env.NEXT_PUBLIC_SITE_URL!.endsWith("/"), detail: env.NEXT_PUBLIC_SITE_URL!, fix: env.NEXT_PUBLIC_SITE_URL!.endsWith("/") ? "Remove the trailing slash" : undefined }
    : { ok: false, detail: "missing", fix: "Set to your live URL, e.g. https://www.newcastleelectronics.com (Paystack redirects customers back here)" };
  try { // After paying, Paystack sends customers to NEXT_PUBLIC_SITE_URL/checkout/success, so it must be this site
    const siteHost = new URL(env.NEXT_PUBLIC_SITE_URL ?? "").host.replace(/^www\./, "");
    const reqHost = new URL(req.url).host;
    if (siteHost && siteHost !== reqHost.replace(/^www\./, "") && !reqHost.endsWith(".vercel.app") && !reqHost.startsWith("localhost"))
      checks.NEXT_PUBLIC_SITE_URL = { ok: false, detail: `${env.NEXT_PUBLIC_SITE_URL} but this site is ${reqHost}`, fix: `Paystack returns customers to this address after paying. Set it to https://${reqHost}, then redeploy` };
  } catch { /* invalid URL is reported above */ }

  // ── Paystack ──
  const sk = env.PAYSTACK_SECRET_KEY?.trim() ?? "";
  const pk = env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() ?? "";
  if (!sk) checks.PAYSTACK_SECRET_KEY = { ok: false, detail: "missing", fix: "Paystack Dashboard → Settings → API Keys & Webhooks → copy the Secret Key" };
  else if (sk.startsWith("pk_")) checks.PAYSTACK_SECRET_KEY = { ok: false, detail: "this is a PUBLIC key (pk_…)", fix: "Swap them: the secret key starts with sk_test_ or sk_live_" };
  else if (!/^sk_(test|live)_/.test(sk)) checks.PAYSTACK_SECRET_KEY = { ok: false, detail: "doesn't start with sk_test_ / sk_live_", fix: "Re-copy the Secret Key without spaces or quotes" };
  else {
    try {
      const r = await fetch("https://api.paystack.co/transaction?perPage=1", { headers: { Authorization: `Bearer ${sk}` }, cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      checks.PAYSTACK_SECRET_KEY = r.ok
        ? { ok: true, detail: `valid (${sk.startsWith("sk_live_") ? "LIVE – real money" : "TEST mode"})` }
        : { ok: false, detail: `Paystack rejected the key: ${j.message ?? r.status}`, fix: "Re-copy the Secret Key from the Paystack dashboard" };
    } catch { checks.PAYSTACK_SECRET_KEY = { ok: false, detail: "could not reach api.paystack.co" }; }
  }
  checks.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = !pk ? { ok: true, detail: "not set (optional – checkout uses Paystack's hosted page)" }
    : pk.startsWith("sk_") ? { ok: false, detail: "this is a SECRET key – never put it in a NEXT_PUBLIC_ variable!", fix: "Replace with the pk_… key and ROTATE your secret key in Paystack" }
    : (pk.startsWith("pk_live_") !== sk.startsWith("sk_live_")) && sk ? { ok: false, detail: "public and secret keys are from different modes (test vs live)", fix: "Use both test keys or both live keys" }
    : { ok: true, detail: "set" };
  if (has("PAYSTACK_WEBHOOK_SECRET")) checks.PAYSTACK_WEBHOOK_SECRET = { ok: true, detail: "set but NOT used – Paystack signs webhooks with your Secret Key, so this variable can be deleted" };

  // ── Supabase (orders are saved here before redirecting to Paystack) ──
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim(), anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(), service = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  checks.NEXT_PUBLIC_SUPABASE_URL = url ? { ok: /^https:\/\/.+\.supabase\.co\/?$/.test(url), detail: url, fix: /^https:\/\/.+\.supabase\.co\/?$/.test(url) ? undefined : "Should look like https://abcdxyz.supabase.co" } : { ok: false, detail: "missing", fix: "Supabase → Project Settings → API → Project URL" };
  checks.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon ? { ok: true, detail: "set" } : { ok: false, detail: "missing", fix: "Supabase → Project Settings → API → anon public key" };
  if (!service) checks.SUPABASE_SERVICE_ROLE_KEY = { ok: false, detail: "missing", fix: "Supabase → Project Settings → API → service_role key (keep secret)" };
  else if (url) {
    try {
      const sb = createJsClient(url, service, { auth: { persistSession: false } });
      const { error } = await sb.from("orders").select("id, payment_method", { head: true, count: "exact" });
      const { count } = await sb.from("products").select("id", { head: true, count: "exact" }).eq("status", "active");
      checks.SUPABASE_SERVICE_ROLE_KEY = error
        ? { ok: false, detail: `database error: ${error.message}`, fix: error.code === "42703" || /payment_method/.test(error.message) ? "Pay-at-store not set up: run supabase/migrations/0005_pay_in_store.sql in the Supabase SQL Editor" : error.code === "42501" ? "Permissions missing: run supabase/migrations/0004_grants.sql in the Supabase SQL Editor" : error.message.includes("does not exist") || error.code === "42P01" || error.code === "PGRST205" ? "Run the migrations (0001–0004) and supabase/seed.sql in the Supabase SQL Editor" : "Re-copy the secret / service_role key" }
        : { ok: true, detail: `connected · ${count ?? 0} active products in database` };
      if (!error && !count) checks.SUPABASE_SEED = { ok: false, detail: "database has no active products – checkout can't find the items in the cart", fix: "Run supabase/seed.sql in the Supabase SQL Editor (or add products in /admin)" };
    } catch (e) { checks.SUPABASE_SERVICE_ROLE_KEY = { ok: false, detail: `could not connect: ${(e as Error).message}` }; }
  }

  // ── Sign-in (Supabase Auth) ──
  if (url && anon) {
    try {
      const r = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, { headers: { apikey: anon }, cache: "no-store" });
      const st = await r.json() as { external?: Record<string, boolean>; disable_signup?: boolean; mailer_autoconfirm?: boolean };
      if (!features.customerAccounts) {
        checks.CUSTOMER_ACCOUNTS = { ok: true, detail: "OFF – guest checkout only; /auth/login is the staff login for /admin" };
        checks.AUTH_STAFF_LOGIN = st.external?.email
          ? { ok: true, detail: `email login enabled${st.disable_signup ? " · public sign-up disabled (recommended)" : " · tip: turn OFF 'Allow new users to sign up' and add staff in Supabase → Authentication → Users"}` }
          : { ok: false, detail: "email provider disabled – staff can't log in to /admin", fix: "Supabase → Authentication → Sign In / Providers → Email → enable" };
      } else {
      checks.AUTH_EMAIL_PASSWORD = st.external?.email
        ? { ok: !st.disable_signup, detail: `enabled${st.mailer_autoconfirm ? " (email confirmation OFF – accounts activate instantly)" : " (customers confirm by email)"}${st.disable_signup ? " – but new sign-ups are DISABLED" : ""}`, fix: st.disable_signup ? "Supabase → Authentication → Sign In / Providers → allow new users to sign up" : undefined }
        : { ok: false, detail: "email provider disabled", fix: "Supabase → Authentication → Sign In / Providers → Email → enable" };
      checks.AUTH_GOOGLE = st.external?.google
        ? { ok: true, detail: "enabled" }
        : { ok: false, detail: "Google sign-in not enabled", fix: "See docs/AUTH-SETUP.md → Google: create an OAuth client in Google Cloud, then paste Client ID & Secret in Supabase → Authentication → Sign In / Providers → Google" };
      }
    } catch { checks.AUTH = { ok: false, detail: "could not read Supabase auth settings" }; }
  }

  // What VISITORS see: the storefront reads the catalogue with the publishable / anon key
  if (url && anon) {
    try {
      const pub = createJsClient(url, anon, { auth: { persistSession: false } });
      const { count, error } = await pub.from("product_listing").select("id", { head: true, count: "exact" }).eq("status", "active");
      checks.STOREFRONT_CATALOGUE = error
        ? { ok: false, detail: `visitors can't read products: ${error.message}`, fix: error.code === "42501" ? "Run supabase/migrations/0004_grants.sql in the Supabase SQL Editor, then wait ~1 minute" : "Check NEXT_PUBLIC_SUPABASE_ANON_KEY is the publishable (sb_publishable_…) or legacy anon key" }
        : count ? { ok: true, detail: `${count} products visible to visitors` } : { ok: false, detail: "0 products visible to visitors", fix: "Run supabase/seed.sql, then redeploy" };
    } catch (e) { checks.STOREFRONT_CATALOGUE = { ok: false, detail: (e as Error).message }; }
  }
  if ((anon ?? "").startsWith("sb_secret_")) checks.NEXT_PUBLIC_SUPABASE_ANON_KEY = { ok: false, detail: "this is a SECRET key – never put it in a NEXT_PUBLIC_ variable!", fix: "Use the Publishable key here, put the Secret key in SUPABASE_SERVICE_ROLE_KEY, then rotate the secret key in Supabase" };

  checks.CRON_SECRET = { ok: true, detail: "set" };
  checks.RESEND_API_KEY = has("RESEND_API_KEY") ? { ok: true, detail: "set – receipts will be emailed" } : { ok: false, detail: "not set – NO emails are sent (receipts, staff alerts)", fix: "Add RESEND_API_KEY in Vercel, then redeploy" };
  checks.EMAIL_FROM = has("EMAIL_FROM") ? { ok: /@newcastleelectronics\.com>?$/i.test(env.EMAIL_FROM!.trim()), detail: env.EMAIL_FROM!.trim(), fix: /@newcastleelectronics\.com>?$/i.test(env.EMAIL_FROM!.trim()) ? undefined : "Use an address on your verified domain, e.g. Newcastle Electronics <info@newcastleelectronics.com>" } : { ok: false, detail: "not set", fix: 'Set EMAIL_FROM to "Newcastle Electronics <info@newcastleelectronics.com>"' };
  const admins = (env.ADMIN_NOTIFY_EMAIL ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const mask = (e: string) => e.replace(/^(.)(.*)(@.*)$/, (_m, a, b, c) => a + "*".repeat(Math.max(1, b.length)) + c);
  const bad = admins.filter((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  checks.ADMIN_NOTIFY_EMAIL = !admins.length
    ? { ok: false, detail: "not set – staff get NO new-order alerts", fix: "Set ADMIN_NOTIFY_EMAIL in Vercel (several addresses separated by commas), then redeploy" }
    : bad.length ? { ok: false, detail: `invalid address: ${bad.join(", ")}`, fix: "Separate addresses with commas only, e.g. admin@newcastleelectronics.com, onlineorder@newcastleelectronics.com" }
    : { ok: true, detail: `${admins.length} recipient(s): ${admins.map(mask).join(", ")} – add &testEmail=1 to this URL to send a test` };
  if (new URL(req.url).searchParams.get("testEmail") === "1" && admins.length) {
    const { sendEmail } = await import("@/lib/email");
    const r = await sendEmail(admins.join(","), "Test: Newcastle Electronics staff alerts are working", "<p>This is a test of new-order alerts from your website. If you received it, staff notifications are set up correctly.</p>");
    checks.TEST_EMAIL = r.ok ? { ok: true, detail: `sent to ${admins.length} address(es) – check each inbox (and spam folder)` } : { ok: false, detail: r.error ?? "failed", fix: r.error?.includes("domain") ? "Verify newcastleelectronics.com in Resend (DNS records) and use that domain in EMAIL_FROM" : "See the error above; check RESEND_API_KEY and EMAIL_FROM" };
  }

  const paymentsReady = ["PAYSTACK_SECRET_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SITE_URL", "STOREFRONT_CATALOGUE"].every((k) => checks[k]?.ok) && checks.SUPABASE_SEED?.ok !== false;
  return NextResponse.json({
    paymentsReady,
    webhookUrl: `${(env.NEXT_PUBLIC_SITE_URL ?? "https://YOUR-DOMAIN").replace(/\/$/, "")}/api/paystack/webhook`,
    webhookHint: "Paste webhookUrl into Paystack → Settings → API Keys & Webhooks → Webhook URL (for the same Test/Live mode as your keys). It confirms orders even if the customer closes the browser after paying.",
    reminder: "After changing environment variables in Vercel you must REDEPLOY for them to take effect.",
    checks,
  }, { headers: { "Cache-Control": "no-store" } });
}
