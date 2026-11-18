# VoltEdge — Electronics & Solar Energy Website

A mobile-first website for showcasing products and collecting enquiries, built with **Next.js 14 (App Router), React 18, TypeScript and Tailwind CSS**. Ready to deploy on **Vercel**.

---

## 1. Requirements
- Node.js **18.18+** (20 LTS recommended, see `.nvmrc`)
- npm 9+

## 2. Installation
```bash
unzip voltedge-website.zip && cd site
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_SITE_URL
npm run dev                     # http://localhost:3000
```
Production check:
```bash
npm run build && npm start
npm run typecheck
```

## 3. Rebrand (do this first)
| What | File |
|---|---|
| Company name, phone, WhatsApp, email, address, hours, socials | `lib/site.ts` |
| Products, prices, specs, images, categories | `lib/products.ts` |
| Blog posts | `lib/blog.ts` |
| Colours / fonts | `tailwind.config.ts`, `app/layout.tsx` |
| Logo / favicon | `public/logo.svg`, `app/icon.svg` |

Images currently come from Unsplash. To use your own, put WebP files in `/public/images/` and reference them as `/images/your-file.webp`.

## 4. Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repository. Next.js is detected automatically, so no build settings are needed.
3. Add these environment variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://www.yourdomain.com` (required for canonical URLs, sitemap and schema)
   - `QUOTE_WEBHOOK_URL` = Zapier/Make/CRM webhook (optional; receives every quote request as JSON)
4. Click Deploy, then go to **Settings → Domains** and add your domain.
5. In Google Search Console, submit `https://yourdomain.com/sitemap.xml`.

You can also deploy from the CLI: `npx vercel` for a preview, then `npx vercel --prod`.
`vercel.json` sets the region to `cdg1` (Paris, close to West Africa). Change it if your customers are elsewhere.

## 5. Folder structure
```
site/
├── app/
│   ├── layout.tsx                  Root layout: font, header, footer, floating WhatsApp, Organization schema
│   ├── page.tsx                    Homepage
│   ├── globals.css                 Tailwind + design tokens (buttons, sections)
│   ├── loading.tsx / error.tsx / not-found.tsx
│   ├── icon.svg                    Favicon
│   ├── sitemap.ts / robots.ts      Auto /sitemap.xml and /robots.txt
│   ├── products/
│   │   ├── page.tsx                All products hub
│   │   └── [category]/
│   │       ├── page.tsx            Category template
│   │       └── [slug]/page.tsx     Product detail template
│   ├── solar-solutions/page.tsx    Solar landing + FAQ + free consultation
│   ├── about/page.tsx
│   ├── projects/page.tsx
│   ├── blog/page.tsx
│   ├── blog/[slug]/page.tsx
│   ├── contact/page.tsx            Quote form (?product= prefill), map, contact cards
│   └── api/quote/route.ts          Lead endpoint: zod validation, rate limit, honeypot, webhook
├── components/
│   ├── Header.tsx  Footer.tsx  WhatsAppButton.tsx
│   ├── ProductCard.tsx  QuoteForm.tsx  Breadcrumbs.tsx
│   └── SectionHeading.tsx  JsonLd.tsx  Icons.tsx
├── lib/
│   ├── site.ts                     Brand config + WhatsApp link builder
│   ├── products.ts                 Categories & products data + helpers
│   ├── blog.ts                     Blog data
│   └── seo.ts                      Metadata + JSON-LD helpers
├── prisma/schema.prisma            Postgres schema (optional upgrade)
├── docs/                           Sitemap, wireframe, deployment plan
├── public/logo.svg
├── next.config.mjs                 Image formats, security headers
├── tailwind.config.ts  postcss.config.mjs  tsconfig.json
├── vercel.json  .env.example  .nvmrc  .gitignore
└── package.json  package-lock.json
```

## 6. Enable the database (optional)
By default the site runs without a database: products are read from TypeScript files and quote requests go to the webhook or the server logs. To store leads and products in Postgres (e.g. Neon or Supabase):
```bash
npm i @prisma/client && npm i -D prisma
# set DATABASE_URL in .env.local and in Vercel
npx prisma db push
```
Then create `lib/db.ts`:
```ts
import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
```
In `app/api/quote/route.ts`, add `await prisma.lead.create({ data: { name: lead.name, phone: lead.phone, email: lead.email || null, message: lead.message, productRaw: lead.product } })`.
Add `"postinstall": "prisma generate"` to the package.json scripts.

## 7. What's built in
- **SEO:** static pages; a unique title, description, canonical URL and OpenGraph tags per page; JSON-LD for Organization, Product/Offer, BreadcrumbList, ItemList, FAQPage and BlogPosting; sitemap; robots.txt
- **Performance:** about 87 kB of shared JS; AVIF/WebP images via `next/image`; self-hosted font with no layout shift; only 2 client components
- **Lead capture:** 3 buttons in the hero, quote forms on 5 page types, product-specific WhatsApp messages, a sticky mobile quote bar, and a floating WhatsApp button on every page
- **Security:** HSTS, nosniff, frame and referrer headers; server-side validation; rate limiting; spam honeypot
- **Accessibility:** skip link, landmarks, labelled fields, focus rings, `aria-current`, reduced-motion support

See `docs/03-DEPLOYMENT.md` for the full launch checklist and phase-2 roadmap.
