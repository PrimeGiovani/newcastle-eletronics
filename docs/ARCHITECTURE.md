# Architecture

## Stack
- **Framework:** Next.js 15 (App Router, React Server Components, Server Actions), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 3 with shadcn/ui conventions: `components.json`, CSS-variable theme, `cva` variants in `components/ui`. Apple/Samsung-inspired design system (see README → Design system). Light and dark mode via `next-themes`.
- **Backend:** Supabase (Postgres, Auth, Storage), Paystack and Resend
- **Hosting:** Vercel (Paris region + cron), with Cloudflare in front for DNS and WAF

## Folder structure
```
app/
  page.tsx                     Homepage (15 sections)
  shop/                        Search + filters + sort + pagination (URL-driven, server-rendered)
  category/[slug]/             Category and subcategory pages (SSG + filters)
  product/[slug]/              Product detail page (SSG/ISR, gallery zoom, reviews, related products, bought-together, delivery estimate)
  deals/  compare/  wishlist/  cart/
  checkout/                    5-step checkout (client) → /checkout/success (server-side payment verification)
  track/                       Public order tracking (reference + email/phone)
  solar-solutions/             Solar landing page + calculator + consultation form
  installation/  about/  contact/
  auth/                        login/register, Google OAuth callback, password reset, sign out
  account/                     Orders, order detail (invoice, reorder, returns), addresses, payment methods
  admin/                       Dashboard, orders, products, categories, inventory, customers, support, marketing
    actions.ts                 All admin mutations (Server Actions, role-checked + RLS)
  api/
    checkout/                  Creates the order, initialises Paystack
    paystack/webhook/          Signed webhook → confirmPayment()
    leads/                     Quotes, contact, installation, solar consultation, support, newsletter
    reviews/                   Review + photo upload, verified-purchase detection
    coupons/validate/  products/  wishlist/  cart/sync/  account/addresses/
    orders/[ref]/invoice/      Printable HTML invoice
    cron/cancel-stale-orders/      Daily cleanup of unpaid orders (Vercel Hobby-compatible)
  sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx  icon.svg
components/
  ui/            shadcn-style primitives (Button, Input, Select, Badge, Card, Skeleton…)
  layout/        Header (search, mega nav, mobile drawer), Footer, WhatsApp widget
  product/       ProductCard, Gallery (zoom), PurchasePanel, Reviews, DeliveryEstimator, Countdown, BundleAdd
  shop/          Filters (desktop sidebar / mobile sheet), Sort, Pagination
  cart/store.tsx Cart, save-for-later, wishlist, compare and toast (React context + localStorage)
  forms/         LeadForm (one form, five lead types), NewsletterForm
  solar/         SolarCalculator
lib/
  catalog.ts     Data access. Uses Supabase when configured, otherwise the seed catalogue.
  pricing.ts     Server-authoritative totals, coupons, purchasability rules (unit tested)
  nigeria.ts     36 states + FCT, LGAs, shipping rules (free ≥ ₦2M, otherwise arranged; free pickup), phone normalisation (unit tested)
  solar.ts       Solar sizing maths (unit tested)
  paystack.ts    Initialise / verify / webhook signature (HMAC-SHA512, timing-safe)
  orders.ts      confirmPayment(): idempotent fulfilment + receipt email
  supabase/      Browser, server, admin (service role) and middleware clients
  seo.ts         Metadata builder + JSON-LD (Organization, WebSite+SearchAction, Product, Breadcrumb, FAQ)
  validation.ts  Zod schemas (checkout, Nigerian address/phone, leads, reviews)
  security.ts    Same-origin (CSRF) check, rate limiter, HTML escaping
supabase/
  migrations/0001_schema.sql   Tables, enums, views, triggers, transactional functions
  migrations/0002_rls.sql      Row Level Security policies + storage buckets/policies
  seed.sql                     Generated from lib/seed-data.ts (scripts/generate-seed.ts)
middleware.ts                  Session refresh + /account and /admin gate
```

## Database schema
| Domain | Tables |
|---|---|
| Users and roles | `auth.users` (Supabase), `profiles` (role: customer / staff / admin), `addresses`, `payment_methods` (Paystack authorisation tokens only) |
| Catalogue | `categories` (self-referencing tree), `brands`, `products` (generated `tsvector` search column), `product_images` |
| Inventory | `inventory` (quantity, reserved, low-stock threshold), `inventory_movements` (audit log); views `low_stock`, `product_listing` |
| Orders | `orders` (address snapshot, totals, ETA, tracking), `order_items` (price snapshot), `order_events` (timeline), `payments`, `returns` |
| Shipping | Rules in code (`lib/nigeria.ts`); `orders.shipping_to_be_arranged` flags orders under ₦2M |
| Marketing | `coupons`, `promotions`, `carts` (abandoned-cart tracking), `newsletter_subscribers` |
| Engagement | `reviews` (photos, verified purchase; a trigger keeps product ratings up to date), `wishlists` |
| Service | `support_tickets`, `ticket_messages`, `leads` (quote / contact / installation), `solar_consultations` |

Key functions:
- `confirm_order_payment()`: atomic and idempotent payment fulfilment. Service role only.
- `adjust_stock()`: staff only, writes an audit row.
- `track_order()`: public lookup that requires a matching email or phone number.
- `is_staff()` / `is_admin()`: role checks used throughout RLS.

## Security model
- **Authentication:** Supabase Auth (email/password and Google OAuth, PKCE). Sessions are stored in HTTP-only cookies and refreshed in middleware.
- **Authorisation:** three layers.
  1. Middleware gate on `/account` and `/admin`.
  2. Server-side role check (`requireRole`) in the admin layout and in every Server Action.
  3. **Postgres RLS** on every table. Customers see only their own rows, and a trigger stops customers promoting themselves.
- **Payments:** prices, stock, coupons and shipping are always recomputed on the server. Webhooks are HMAC-verified and then re-verified through the Paystack API, and the amount and currency are checked. No card data touches our servers.
- **CSRF:** JSON APIs reject cross-origin requests (Origin check). Server Actions have Next.js's built-in origin check. Cookies are SameSite=Lax.
- **XSS:** React escaping everywhere, JSON-LD is `<`-escaped, emails and invoices are HTML-escaped, and a strict CSP is set in `next.config.ts`. SVG images are sandboxed.
- **Abuse:** per-IP rate limits on checkout, coupons, leads and reviews, plus honeypot fields on lead forms. For multi-region deployments, swap in Upstash.
- **Uploads:** MIME and size checks. Review photos go into each user's own storage folder (storage policy).
- **Headers:** HSTS preload, nosniff, frame-options, referrer-policy, permissions-policy.

## SEO
- Dynamic `generateMetadata` on category, product and search pages, with canonical URLs and Open Graph/Twitter cards. A generated OG image is included.
- JSON-LD: Organization + ElectronicsStore, WebSite with SearchAction, Product (Offer, AggregateRating, Reviews, shipping, return policy), BreadcrumbList, CollectionPage/ItemList, FAQPage.
- `sitemap.xml` covers every product and category. `robots.txt` blocks private and duplicate URLs, and filtered `/shop` URLs are `noindex`.
- Clean URLs: `/category/1-5hp-split-unit`, `/product/lg-1-5hp-dualcool-inverter-split-ac`.

## Performance
- Product and category pages are statically generated with ISR (10 minutes). The homepage revalidates every 5 minutes.
- `next/image` serves AVIF/WebP with responsive `sizes`. Only the LCP image gets `priority`.
- Fonts are self-hosted with `next/font`. Lucide icons are tree-shaken (`optimizePackageImports`).
- About 103 kB of shared JS. Most components are Server Components, and client components are limited to interactive parts.

## Testing
- `npm test` runs the Node test runner: solar sizing, phone validation, shipping, coupons and server totals.
- The SQL migrations were applied to PostgreSQL 16 with a Supabase auth/storage shim. That run covered payment idempotency, stock decrement, RLS isolation, role-escalation protection and order-tracking access control.
- An end-to-end browser flow (Playwright) was run: add to cart, coupon, save for later, state shipping, all checkout steps, compare, wishlist, filters, mobile menu and the WhatsApp widget.

## Known limitations and next steps
- **Rate limiter:** in-memory, per instance. Move to Upstash Redis for strict global limits.
- **LGAs:** full lists for the 6 highest-volume states. Other states use free-text entry. Extend `LGAS` in `lib/nigeria.ts`.
- **Newsletter:** sign-ups are collected. Campaigns are sent through an ESP (Resend Broadcasts, Mailchimp, Brevo) from the exported list.
- **Abandoned carts:** listed in Admin → Marketing with one-click email. Automated reminders need a scheduled job.
- **Saved cards:** stored as Paystack authorisations and shown in the account. One-click repeat charges (`/transaction/charge_authorization`) are not yet built.
- **Frequently bought together:** uses curated category pairings. Switch to a co-purchase SQL query once order volume exists.
- **Product images:** placeholder SVG renders. Upload real photography (ideally shot on #F5F5F7) through Admin → Products.
- **Catalogue:** single house brand (Newcastle), so the brand filter hides itself automatically. Old category URLs (`/category/audio-entertainment`, `/electronics`, `/accessories`) redirect permanently (308).
- **Invoices:** printable HTML. Add PDF generation (e.g. `@react-pdf/renderer`) if you need attachments.
