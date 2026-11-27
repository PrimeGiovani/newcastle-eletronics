import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronRight, CreditCard, Factory, Headphones, ShieldCheck, Truck, Wrench, Zap, Calculator, Sun } from "lucide-react";
import { getBestSellers, getFeatured, getTopCategories, getTopReviews, searchProducts } from "@/lib/catalog";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/forms/lead-forms";
import { Rating } from "@/components/product/rating";
import { SectionHeader } from "@/components/ui/misc";
import { buttonVariants } from "@/components/ui/button";
import { ART, IMG } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export const revalidate = 300;

// Order set by Newcastle: Kitchen Appliances → Air Conditioners → Solar Solutions → Sound System
const CAT_COPY: Record<string, { title: string; line: string; href: string; art: string; cta: string }> = {
  "kitchen-appliances": { title: "Kitchen Appliances", line: "Gas hobs, range hoods, ovens and more.", href: "/category/kitchen-appliances", art: "hob-5-glass", cta: "Shop" },
  "air-conditioners": { title: "Air Conditioners", line: "Split and standing units for every room.", href: "/category/air-conditioners", art: "ac-split-white", cta: "Shop" },
  "solar-solutions": { title: "Solar Solutions", line: "Coming soon. Enquire or book ahead.", href: "/solar-solutions", art: "ess", cta: "Learn more" },
  "sound-system": { title: "Sound System", line: "Soundbars, home theatre and boom boxes.", href: "/category/sound-system", art: "soundbar", cta: "Shop" },
};

export default async function HomePage() {
  const [categories, featured, best, newRes, saleRes, topReviews] = await Promise.all([
    getTopCategories(), getFeatured(8), getBestSellers(3), searchProducts({ isNew: true, perPage: 8 }), searchProducts({ deals: true, perPage: 8 }), getTopReviews(3),
  ]);
  const newArrivals = newRes.items;
  const onSale = saleRes.items;
  const spotlight = best.find((p) => p.categorySlug === "gas-hobs") ?? best[0];

  return (
    <>
      {/* 1 ─ HERO */}
      <section className="overflow-hidden bg-cloud dark:bg-[#1D1D1F]">
        <div className="container pt-16 text-center sm:pt-24">
          <p className="animate-fade-up text-sm font-semibold text-flame sm:text-base">New arrivals · Newcastle Gas Hobs</p>
          <h1 className="mx-auto mt-3 max-w-4xl animate-fade-up text-5xl font-semibold tracking-tightest [animation-delay:80ms] sm:text-7xl lg:text-[88px] lg:leading-[1.02]">Smart Living Made Easy.</h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-lg text-ink-muted [animation-delay:160ms] sm:text-2xl sm:leading-snug dark:text-white/70">
            Kitchen appliances, air conditioners and sound systems, designed and manufactured by Newcastle. Solar coming soon. Free delivery on orders over ₦2M.
          </p>
          <div className="mt-9 flex animate-fade-up flex-col justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <Link href="/shop" className={buttonVariants({ variant: "electric", size: "lg" })}>Shop Now</Link>
            <Link href="/deals" className={buttonVariants({ variant: "outline", size: "lg", className: "border-electric text-electric hover:bg-electric/5 dark:border-electric dark:text-electric" })}>View Deals</Link>
          </div>
        </div>
        {/* 30+ years heritage */}
        <div className="container mt-16 sm:mt-20">
          <div className="mx-auto flex max-w-4xl animate-scale-in flex-col items-center gap-6 rounded-[28px] bg-white px-8 py-12 text-center shadow-card [animation-delay:200ms] sm:flex-row sm:gap-10 sm:px-14 sm:text-left dark:bg-card">
            <Image src="/emblem.png" alt="" width={256} height={256} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 dark:invert" />
            <p className="shrink-0 text-7xl font-semibold leading-none tracking-tightest sm:text-8xl">30<span className="text-electric">+</span></p>
            <div>
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">Years in business.</p>
              <p className="mt-2 text-lg text-ink-muted dark:text-white/70">For over three decades, Newcastle has been designing and manufacturing reliable electronics for Nigerian homes and businesses.</p>
            </div>
          </div>
        </div>
        {/* Samsung-style quick category rail */}
        <nav aria-label="Quick categories" className="container pb-12 pt-12">
          <ul className="no-scrollbar mx-auto flex max-w-4xl justify-start gap-3 overflow-x-auto sm:justify-center">
            {Object.entries(CAT_COPY).map(([slug, c]) => (
              <li key={slug} className="shrink-0">
                <Link href={c.href} className="group flex flex-col items-center gap-2 rounded-3xl px-4 py-3 transition hover:bg-white dark:hover:bg-white/5">
                  <span className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-card dark:bg-card"><Image src={ART(c.art)[0]} alt="" fill sizes="64px" className="object-cover transition duration-500 group-hover:scale-110" /></span>
                  <span className="text-xs font-medium">{c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {/* 14 ─ TRUST BADGES */}
      <section aria-label="Why shop with Newcastle" className="border-b">
        <ul className="container grid grid-cols-2 gap-6 py-8 text-sm lg:grid-cols-4">
          {([[Factory, "30+ years in business", "Designed & made by Newcastle"], [Truck, "Free delivery over ₦2M", "Free showroom pickup in Ojo"], [ShieldCheck, "7-day swap policy", "Unused items in good condition"], [CreditCard, "Secure payments", "Card · Transfer · USSD"]] as const).map(([I, t, s]) => (
            <li key={t} className="flex items-center gap-3"><I className="h-6 w-6 shrink-0 text-ink-soft dark:text-white/70" strokeWidth={1.5} /><span><b className="block font-semibold">{t}</b><span className="text-muted-foreground">{s}</span></span></li>
          ))}
        </ul>
      </section>

      {/* 2 ─ SHOP BY CATEGORY (Apple tiles) */}
      <section className="section container">
        <SectionHeader center eyebrow="Shop by category" title="Everything for the modern home." />
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((c) => {
            const copy = CAT_COPY[c.slug]; if (!copy) return null;
            return (
              <Link key={c.slug} href={copy.href} className="tile reveal group flex min-h-[460px] flex-col items-center px-6 pt-12 text-center sm:min-h-[540px]">
                <h3 className="text-3xl font-semibold tracking-tightest sm:text-4xl">{copy.title}</h3>
                <p className="mt-2 text-lg text-ink-muted dark:text-white/70">{copy.line}</p>
                <span className="link-arrow mt-3">{copy.cta} <ChevronRight className="h-4 w-4" /></span>
                <div className="relative mt-auto aspect-square w-full max-w-[420px]">
                  <Image src={ART(copy.art)[0]} alt="" fill sizes="(min-width:768px) 40vw, 90vw" className="object-cover transition duration-700 ease-apple group-hover:scale-[1.04]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5 ─ NEW ARRIVALS: Gas Hobs */}
      <section className="section bg-cloud dark:bg-[#1D1D1F]">
        <div className="container">
          <SectionHeader center eyebrow="New arrivals" title="Newcastle Gas Hobs." subtitle="2- to 5-burner hobs in flip-up glass and stainless steel, including gas + electric models with timers and flame-safety devices." />
          <div className="grid gap-5 lg:grid-cols-2">
            <Link href="/category/gas-hobs" className="reveal group relative flex min-h-[500px] flex-col items-center overflow-hidden rounded-[28px] bg-white px-6 pt-12 text-center dark:bg-card">
              <p className="text-sm font-semibold text-flame">New</p>
              <h3 className="mt-1 text-4xl font-semibold tracking-tightest sm:text-5xl">Flip-up glass hobs</h3>
              <p className="mt-2 text-lg text-ink-muted dark:text-white/70">Tempered glass. Flip-up lid. 2 to 5 burners.</p>
              <span className="link-arrow mt-4">Shop gas hobs <ChevronRight className="h-4 w-4" /></span>
              <div className="relative mt-auto aspect-square w-full max-w-[420px]"><Image src={ART("hob-5-glass")[0]} alt="Newcastle 5-burner flip-up glass gas hob" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover transition duration-700 ease-apple group-hover:scale-[1.04]" /></div>
            </Link>
            <Link href="/shop?category=gas-hobs&q=electric" className="reveal group relative flex min-h-[500px] flex-col items-center overflow-hidden rounded-[28px] bg-ink px-6 pt-12 text-center text-white">
              <p className="text-sm font-semibold text-flame">New</p>
              <h3 className="mt-1 text-4xl font-semibold tracking-tightest sm:text-5xl">Gas + electric</h3>
              <p className="mt-2 text-lg text-white/70">Cook through power cuts and gas shortages.</p>
              <span className="link-arrow mt-4 text-[#2997FF]">Shop gas + electric hobs <ChevronRight className="h-4 w-4" /></span>
              <div className="relative mt-auto aspect-square w-full max-w-[420px]"><Image src={ART("hob-5-glass-e1")[1]} alt="Newcastle gas and electric hob" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover transition duration-700 ease-apple group-hover:scale-[1.04]" /></div>
            </Link>
          </div>
          <div className="mt-12"><ProductGrid products={newArrivals} /></div>
          <div className="mt-10 text-center"><Link href="/category/gas-hobs" className="link-arrow">See all gas hobs <ChevronRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      {/* 3 ─ FEATURED */}
      <section className="section container">
        <SectionHeader eyebrow="Featured" title="The Newcastle line‑up." action={<Link href="/shop" className="link-arrow">View all products <ChevronRight className="h-4 w-4" /></Link>} />
        <ProductGrid products={featured} />
      </section>

      {/* 6 ─ ON SALE */}
      {onSale.length > 0 && (
        <section className="section bg-cloud dark:bg-[#1D1D1F]">
          <div className="container">
            <SectionHeader center eyebrow="On sale" title="15% off selected models." subtitle="Standing air conditioners, home theatre, gas hob and range hood, while stocks last." />
            <ProductGrid products={onSale} />
            <div className="mt-10 text-center"><Link href="/deals" className="link-arrow">See all deals <ChevronRight className="h-4 w-4" /></Link></div>
          </div>
        </section>
      )}

      {/* 4 ─ BEST SELLERS */}
      <section className="section container">
        <SectionHeader eyebrow="Best sellers" title="Our top 3 best sellers." action={<Link href="/shop?best=1" className="link-arrow">Shop best sellers <ChevronRight className="h-4 w-4" /></Link>} />
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">{best.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {/* 7 ─ PRODUCT SHOWCASE */}
      {spotlight && (
        <section className="container">
          <div className="tile reveal grid items-center lg:grid-cols-2">
            <div className="p-10 text-center sm:p-16 lg:text-left">
              <p className="eyebrow">Best seller</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tightest sm:text-5xl">{spotlight.name.replace(/^Newcastle /, "").replace(/ \(.*$/, "")}</h2>
              <p className="mt-4 text-xl text-ink-muted dark:text-white/70">{spotlight.shortDescription}</p>
              <ul className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-3 text-left text-[15px] sm:grid-cols-2 lg:mx-0">{spotlight.highlights.slice(0, 4).map((f) => <li key={f} className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 shrink-0 text-electric" strokeWidth={1.75} />{f}</li>)}</ul>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
                <Link href={`/product/${spotlight.slug}`} className={buttonVariants({ variant: "electric", size: "lg" })}>Buy</Link>
                <Link href={`/category/${spotlight.categorySlug}`} className="link-arrow">Compare models <ChevronRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="relative aspect-square"><Image src={spotlight.images[0]} alt={spotlight.name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>
          </div>
        </section>
      )}

      {/* 9 ─ WHY NEWCASTLE */}
      <section className="section container">
        <SectionHeader center eyebrow="Why Newcastle" title="We make it. We stand behind it." subtitle="Every Newcastle product is designed and manufactured by us, so you get better quality control, fairer prices and real accountability." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {([[Factory, "30+ years of manufacturing", "Over three decades designing and building electronics. One brand, one standard, from design to delivery."], [CreditCard, "Factory-direct pricing", "No middlemen. Pay by card, transfer, USSD or QR via Paystack."], [Zap, "Built for Nigerian homes", "Products designed for Nigerian kitchens, homes and power conditions."], [ShieldCheck, "7-day swap policy", "Swap unused products in good condition within 7 days. Backed by the Newcastle manufacturer warranty."], [Truck, "Free delivery over ₦2M", "Free delivery on orders of ₦2,000,000+, and free pickup at our Iyana Iba, Ojo showroom."], [Headphones, "Real human support", "Call 0810 902 4035 or WhatsApp 0706 837 6168 to talk to our team directly."]] as const).map(([I, t, d]) => (
            <div key={t} className="reveal rounded-[28px] bg-cloud p-8 dark:bg-muted">
              <I className="h-8 w-8 text-electric" strokeWidth={1.5} />
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{t}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted dark:text-white/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10 ─ INSTALLATION */}
      <section className="container">
        <div className="tile reveal grid items-center lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[480px]"><Image src={IMG.install} alt="Newcastle technician installing equipment" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>
          <div className="p-10 sm:p-16">
            <p className="eyebrow">Installation services</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tightest sm:text-5xl">Trusted installers, on request.</h2>
            <p className="mt-4 text-lg text-ink-muted dark:text-white/70">Newcastle works with trusted installers for air conditioners, gas hobs, range hoods and ovens. Installation is a separate service with its own charge, contact us after purchase to arrange it.</p>
            <ul className="mt-6 space-y-3 text-[15px]">{["Installers vetted by Newcastle", "Charge confirmed before any work starts", "Book by WhatsApp, phone or online form"].map((t) => <li key={t} className="flex gap-3"><Wrench className="h-5 w-5 shrink-0 text-electric" strokeWidth={1.5} />{t}</li>)}</ul>
            <Link href="/installation" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>Enquire about installation</Link>
          </div>
        </div>
      </section>

      {/* 11 ─ SOLAR */}
      <section className="section container">
        <div className="reveal relative overflow-hidden rounded-[28px] bg-ink text-white">
          <Image src={IMG.solar2} alt="" fill sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
          <div className="relative flex min-h-[520px] flex-col items-center justify-end p-10 text-center sm:p-16">
            <Sun className="h-10 w-10 text-flame" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-semibold text-flame">Coming soon</p>
            <h2 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tightest sm:text-6xl">Newcastle Solar.</h2>
            <p className="mt-4 max-w-xl text-lg text-white/75">Portable power stations, all-in-one ESS, lithium batteries, inverters, solar panels and street lights. Enquire now or book ahead, and size your system with our solar calculator.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/solar-solutions#calculator" className={buttonVariants({ variant: "electric", size: "lg" })}><Calculator />Solar calculator</Link>
              <Link href="/solar-solutions" className={cn(buttonVariants({ size: "lg" }), "bg-white text-ink hover:bg-white/90")}>Enquire / book ahead</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8 ─ CUSTOMER REVIEWS (genuine reviews only – written on the site, or added by staff / data/reviews.csv) */}
      <section className="section bg-cloud dark:bg-[#1D1D1F]">
        <div className="container">
          <SectionHeader center eyebrow="Customer reviews" title="What our customers say." />
          {topReviews.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {topReviews.map((r) => (
                <figure key={r.id} className="reveal flex flex-col rounded-[28px] bg-white p-8 shadow-card dark:bg-card">
                  <Rating value={r.rating} />
                  {r.title && <p className="mt-4 font-semibold">{r.title}</p>}
                  <blockquote className="mt-2 text-lg leading-relaxed tracking-tight">“{r.body}”</blockquote>
                  <figcaption className="mt-auto pt-6 text-sm">
                    <b className="font-semibold">{r.author}</b>{r.verified && <span className="ml-2 text-emerald-600">✓ Verified purchase</span>}
                    <Link href={`/product/${r.productSlug}#reviews`} className="block text-muted-foreground hover:text-electric">{r.productName.replace(/^Newcastle /, "")}</Link>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="reveal mx-auto max-w-xl rounded-[28px] bg-white p-10 text-center shadow-card dark:bg-card">
              <p className="text-lg">Bought a Newcastle product? We'd love to hear from you.</p>
              <p className="mt-2 text-muted-foreground">Open your product's page and choose “Write a review”.</p>
              <Link href="/shop" className="link-arrow mt-4">Find your product <ChevronRight className="h-4 w-4" /></Link>
            </div>
          )}
        </div>
      </section>

      {/* 13 ─ BRAND: Made by Newcastle */}
      <section className="section container" aria-labelledby="brand-h">
        <div className="reveal text-center">
          <p className="eyebrow">One brand</p>
          <h2 id="brand-h" className="mt-2 text-4xl font-semibold tracking-tightest sm:text-5xl">Newcastle. Made for Nigerian homes.</h2>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-y-10 text-center lg:grid-cols-4">
          {[["30+", "Years in business"], ["70+", "Newcastle products"], ["₦2M+", "Orders ship free"], ["7 days", "Swap policy"]].map(([v, l]) => (
            <div key={l} className="reveal"><dt className="sr-only">{l}</dt><dd className="text-5xl font-semibold tracking-tightest sm:text-6xl">{v}</dd><dd className="mt-2 text-muted-foreground">{l}</dd></div>
          ))}
        </dl>
      </section>

      {/* 12 ─ NEWSLETTER */}
      <section className="container">
        <div className="tile reveal flex flex-col items-center px-6 py-16 text-center sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tightest sm:text-5xl">Be the first to know.</h2>
          <p className="mt-3 max-w-lg text-lg text-ink-muted dark:text-white/70">New Newcastle products, flash deals and energy-saving tips. No spam, unsubscribe anytime.</p>
          <div className="mt-8 w-full max-w-md"><NewsletterForm /></div>
        </div>
      </section>
    </>
  );
}
