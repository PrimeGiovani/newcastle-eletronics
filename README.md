# Newcastle Electronics: E-commerce Platform

A premium, mobile-first e-commerce platform for **Newcastle Electronics**, a Nigerian manufacturer of inverter air conditioners, sound systems, kitchen appliances and solar solutions. Only Newcastle-made products are sold.

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS (shadcn/ui style), Supabase (Postgres, Auth, Storage), Paystack, Vercel and Cloudflare.

## Quick start
```bash
npm install
cp .env.example .env.local      # works with no keys (built-in catalogue)
npm run dev                     # http://localhost:3000
```
Without any keys, the full storefront works on the built-in catalogue (your 76 products): browsing, search, filters, product pages, cart, compare, wishlist, solar calculator and the checkout UI. Add Supabase and Paystack keys to turn on accounts, admin, orders and payments.

| Command | Purpose |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build && npm start` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (pricing, shipping, phone validation, solar sizing) |
| `node --experimental-strip-types scripts/generate-seed.ts` | Regenerate `supabase/seed.sql` from `lib/seed-data.ts` |
| `python3 scripts/generate-product-art.py` | Regenerate the placeholder product renders |

## Production setup
See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for step-by-step instructions covering Supabase (migrations, Google login, storage, first admin), Paystack (keys, webhook, test cards), Resend, Vercel and Cloudflare.

## Architecture
See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the folder structure, database schema, security model, SEO, performance, tests and known limitations.

## Where to edit things
| What | File |
|---|---|
| Company name, phone, WhatsApp, address, navigation | `lib/config.ts` |
| Design tokens (white `#FFFFFF`, light gray `#F5F5F7`, text `#1D1D1F`, action blue `#0071E3`), dark mode | `app/globals.css`, `tailwind.config.ts` |
| Products, prices, stock, sale, coming soon | **Admin → Products** (live site), or the product sheet (`data/product-list.csv` → `scripts/import-product-list.py`) – see `data/README.md` |
| Importing the database | `docs/SUPABASE-IMPORT.md` |
| Sign-in (email + Google) & data security | `docs/AUTH-SETUP.md` |
| Turn customer accounts on/off | `NEXT_PUBLIC_CUSTOMER_ACCOUNTS=on/off` (Vercel env var) – default set in `lib/config.ts` |
| Customer reviews | **Admin → Reviews**, or `data/reviews.csv` |
| Free-shipping threshold (₦2M), pickup, LGAs | `lib/nigeria.ts` |
| Homepage sections | `app/page.tsx` |
| Database | `supabase/migrations/*.sql` |

## Design system
The look combines Apple's minimalist luxury style with Samsung's product-focused e-commerce layout.

| Token | Value | Tailwind | Use |
|---|---|---|---|
| Background | `#FFFFFF` | `bg-white` / `bg-background` | Page background |
| Light gray | `#F5F5F7` | `bg-cloud` | Section bands, product tiles, footer |
| Text | `#1D1D1F` | `text-ink` | Headlines, body text, primary pills |
| Secondary text | `#6E6E73` | `text-ink-muted` | Sub-headlines, captions |
| Action blue | `#0071E3` | `bg-electric` / `link-arrow` | Shop Now, Buy, links |
| Accent | `#E8590C` | `text-flame` | "New" labels and savings only |

- **Typography:** Inter (the closest open alternative to SF Pro) at semibold weight, with tight tracking on headlines (`tracking-tightest`) and 17px links.
- **Shape and depth:** 28px rounded tiles, borderless cards with subtle shadows (`shadow-card`), and a deeper shadow on hover (`shadow-lift`).
- **Motion:**
  - Entrance animations use the Apple-style easing curve `cubic-bezier(.16,1,.3,1)` (`ease-apple`).
  - Sections fade in as you scroll (`.reveal`, CSS scroll-driven; static in unsupported browsers).
  - All motion is disabled when the user has `prefers-reduced-motion` set.
- **Product imagery:**
  - Placeholder renders sit on a flat `#F5F5F7` background (or `#1D1D1F` for the dark variant), so they blend into the tiles.
  - Replace them with studio photos shot on the same light-gray background for the best result.
