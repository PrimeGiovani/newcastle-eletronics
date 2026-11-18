# 10. Deployment Plan

## Recommended: Vercel + Neon/Supabase Postgres + Cloudflare DNS
| Layer | Choice | Why |
|---|---|---|
| Hosting | Vercel | Native Next.js, edge CDN, automatic image optimization, preview deploys |
| DB | Neon or Supabase (Postgres) | Serverless, free tier, Prisma-compatible |
| Images | Vercel Image Optimization → later Cloudinary | AVIF/WebP, resizing |
| Leads | `QUOTE_WEBHOOK_URL` → Zapier/Make → email + Google Sheet/CRM | Zero-code routing |
| Email | Resend / Google Workspace | Transactional & sales inbox |
| Analytics | GA4 + Google Search Console + Vercel Speed Insights | SEO & CWV monitoring |

Alternative (lower cost / data residency): a VPS (DigitalOcean/Hetzner) with `next build && next start` behind Nginx + PM2, Let's Encrypt SSL, Cloudflare in front.

## Steps
1. **Configure brand** – edit `lib/site.ts` (name, phone, WhatsApp number, address, socials). Replace Unsplash images with real product photos (WebP, ≥1200px, descriptive filenames like `1-5hp-inverter-split-ac-front.webp`) in `/public`.
2. **Repo** – push to GitHub; protect `main`; PRs get Vercel preview URLs.
3. **Vercel** – import repo → framework auto-detected. Env vars: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `QUOTE_WEBHOOK_URL`.
4. **Database (when moving off static data)** – `npx prisma db push`, seed from `lib/products.ts`, then swap the helpers in `lib/products.ts` for Prisma queries and add `export const revalidate = 3600` (ISR) to product pages.
5. **Domain** – add domain in Vercel, point DNS (A/CNAME) from Cloudflare, force `www` or apex (one canonical), HTTPS auto.
6. **Lead routing** – create Zapier/Make webhook → email to sales + row in Google Sheet + WhatsApp Business notification. Test form end-to-end.
7. **SEO launch checklist**
   - Verify domain in Google Search Console; submit `/sitemap.xml`.
   - Create/claim Google Business Profile with the same NAP as `lib/site.ts`.
   - Validate schema with Rich Results Test (Product, Breadcrumb, FAQ, Organization, BlogPosting).
   - Lighthouse ≥ 90 on mobile for Performance, SEO, Accessibility, Best Practices.
   - Set up GA4 events: `generate_lead` (form success), `whatsapp_click`, `phone_click`.
8. **Monitoring** – Vercel Speed Insights (Core Web Vitals), uptime monitor (Better Stack/UptimeRobot), weekly Search Console review.
9. **Content cadence** – 2 blog posts/month targeting buying-intent keywords (e.g. "best inverter for 1.5HP AC", "5KVA solar price"), one project case study per completed install.

## Phase 2 roadmap
- Headless CMS (Sanity / Payload) so staff edit products & posts without code.
- Admin lead dashboard on `Lead` table.
- Product filters (HP, capacity, price), comparison, search.
- Solar savings calculator (strong lead magnet + linkable asset).
- Online payments (Paystack/Flutterwave) if moving from enquiry to checkout.
- Reviews with `AggregateRating` schema once genuine reviews exist.
