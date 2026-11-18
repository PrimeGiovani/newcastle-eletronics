import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronRight, CreditCard, Factory, Headphones, ShieldCheck, Truck, Wrench, Zap, Calculator, Sun } from "lucide-react";
import { getBestSellers, getFeatured, getFlashDeals, getNewArrivals, getTopCategories } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/product-card";
import { Countdown } from "@/components/product/countdown";
import { NewsletterForm } from "@/components/forms/lead-forms";
import { Rating } from "@/components/product/rating";
import { SectionHeader } from "@/components/ui/misc";
import { buttonVariants } from "@/components/ui/button";
import { ART, IMG, testimonials } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const CAT_COPY: Record<string, { title: string; line: string; href: string; art: string }> = {
  "air-conditioners": { title: "Air Conditioners", line: "Inverter cooling. Lower bills.", href: "/category/air-conditioners", art: "ac-split" },
  "sound-system": { title: "Sound System", line: "Cinema-grade sound at home.", href: "/category/sound-system", art: "soundbar" },
  "kitchen-appliances": { title: "Kitchen Appliances", line: "Cook, chill and clean in style.", href: "/category/kitchen-appliances", art: "cooker" },
  "solar-solutions": { title: "Solar Solutions", line: "Power that never takes a break.", href: "/solar-solutions", art: "ess" },
};

export default async function HomePage() {
  const [categories, featured, best, fresh, deals] = await Promise.all([getTopCategories(), getFeatured(8), getBestSellers(4), getNewArrivals(8), getFlashDeals(4)]);
  const newArrivals = fresh.filter((p) => p.isNew);
  const dealEnds = deals[0]?.flashDealEndsAt;

  return (
    <>
      {/* 1 ─ HERO */}
      <section className="overflow-hidden bg-cloud dark:bg-[#1D1D1F]">
        <div className="container pt-16 text-center sm:pt-24">
          <p className="animate-fade-up text-sm font-semibold text-flame sm:text-base">New · Newcastle Solar & Gas Cookers</p>
          <h1 className="mx-auto mt-3 max-w-4xl animate-fade-up text-5xl font-semibold tracking-tightest [animation-delay:80ms] sm:text-7xl lg:text-[88px] lg:leading-[1.02]">Smart Living Made Easy.</h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-lg text-ink-muted [animation-delay:160ms] sm:text-2xl sm:leading-snug dark:text-white/70">
            Inverter air conditioners, home appliances, sound systems and solar — designed and manufactured by Newcastle. Today's best deals, delivered nationwide.
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
          {([[Factory, "30+ years in business", "Designed & made by Newcastle"], [ShieldCheck, "Manufacturer warranty", "Up to 5 years"], [Truck, "Nationwide delivery", "36 states + FCT"], [CreditCard, "Secure payments", "Card · Transfer · USSD"]] as const).map(([I, t, s]) => (
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
                <span className="link-arrow mt-3">Shop <ChevronRight className="h-4 w-4" /></span>
                <div className="relative mt-auto aspect-square w-full max-w-[420px]">
                  <Image src={ART(copy.art)[0]} alt="" fill sizes="(min-width:768px) 40vw, 90vw" className="object-cover transition duration-700 ease-apple group-hover:scale-[1.04]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5 ─ NEW ARRIVALS: Solar & Gas Cookers */}
      <section className="section bg-cloud dark:bg-[#1D1D1F]">
        <div className="container">
          <SectionHeader center eyebrow="New arrivals" title="Newcastle Solar & Gas Cookers." subtitle="Our newest product lines — engineered in-house, ready for Nigerian homes and businesses." />
          <div className="grid gap-5 lg:grid-cols-2">
            <Link href="/solar-solutions" className="reveal group relative flex min-h-[520px] flex-col items-center overflow-hidden rounded-[28px] bg-ink px-6 pt-12 text-center text-white">
              <p className="text-sm font-semibold text-flame">New</p>
              <h3 className="mt-1 text-4xl font-semibold tracking-tightest sm:text-5xl">Newcastle Solar</h3>
              <p className="mt-2 text-lg text-white/70">Panels, lithium batteries, hybrid inverters & ESS.</p>
              <div className="mt-4 flex gap-5"><span className="link-arrow text-[#2997FF]">Learn more <ChevronRight className="h-4 w-4" /></span><span className="link-arrow text-[#2997FF]">Size your system <ChevronRight className="h-4 w-4" /></span></div>
              <div className="relative mt-auto aspect-square w-full max-w-[440px]"><Image src={ART("ess")[1]} alt="Newcastle all-in-one solar energy storage system" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover transition duration-700 ease-apple group-hover:scale-[1.04]" /></div>
            </Link>
            <Link href="/category/gas-cookers" className="reveal group relative flex min-h-[520px] flex-col items-center overflow-hidden rounded-[28px] bg-white px-6 pt-12 text-center dark:bg-card">
              <p className="text-sm font-semibold text-flame">New</p>
              <h3 className="mt-1 text-4xl font-semibold tracking-tightest sm:text-5xl">Newcastle Gas Cookers</h3>
              <p className="mt-2 text-lg text-ink-muted dark:text-white/70">Auto-ignition. Flame-failure safety. Big ovens.</p>
              <span className="link-arrow mt-4">Shop gas cookers <ChevronRight className="h-4 w-4" /></span>
              <div className="relative mt-auto aspect-square w-full max-w-[440px]"><Image src={ART("cooker")[0]} alt="Newcastle 4-burner gas cooker with oven" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover transition duration-700 ease-apple group-hover:scale-[1.04]" /></div>
            </Link>
          </div>
          <div className="mt-12"><ProductGrid products={newArrivals} /></div>
        </div>
      </section>

      {/* 3 ─ FEATURED */}
      <section className="section container">
        <SectionHeader eyebrow="Featured" title="The Newcastle line‑up." action={<Link href="/shop" className="link-arrow">View all products <ChevronRight className="h-4 w-4" /></Link>} />
        <ProductGrid products={featured} />
      </section>

      {/* 6 ─ FLASH DEALS */}
      {deals.length > 0 && (
        <section className="section bg-cloud dark:bg-[#1D1D1F]">
          <div className="container">
            <div className="reveal mb-12 flex flex-col items-center gap-6 text-center">
              <p className="eyebrow">Flash deals</p>
              <h2 className="-mt-4 text-4xl font-semibold tracking-tightest sm:text-5xl">Limited-time prices.</h2>
              {dealEnds && <Countdown to={dealEnds} />}
            </div>
            <ProductGrid products={deals} />
            <div className="mt-10 text-center"><Link href="/deals" className="link-arrow">See all deals <ChevronRight className="h-4 w-4" /></Link></div>
          </div>
        </section>
      )}

      {/* 4 ─ BEST SELLERS */}
      <section className="section container">
        <SectionHeader eyebrow="Best sellers" title="Loved in homes across Nigeria." action={<Link href="/shop?best=1" className="link-arrow">Shop best sellers <ChevronRight className="h-4 w-4" /></Link>} />
        <ProductGrid products={best} />
      </section>

      {/* 7 ─ PRODUCT SHOWCASE */}
      <section className="container">
        <div className="tile reveal grid items-center lg:grid-cols-2">
          <div className="p-10 text-center sm:p-16 lg:text-left">
            <p className="eyebrow">Best seller</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tightest sm:text-6xl">1.5HP Inverter Split AC</h2>
            <p className="mt-4 text-xl text-ink-muted dark:text-white/70">Up to 60% energy saving. Starts at just 150V. Whisper-quiet.</p>
            <ul className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 text-left text-[15px] lg:mx-0">{["Inverter compressor", "Anti-corrosion coil", "4-way swing", "5-yr compressor warranty"].map((f) => <li key={f} className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-electric" strokeWidth={1.75} />{f}</li>)}</ul>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              <Link href="/product/newcastle-1-5hp-inverter-split-ac" className={buttonVariants({ variant: "electric", size: "lg" })}>Buy</Link>
              <Link href="/category/air-conditioners" className="link-arrow">Compare all ACs <ChevronRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="relative aspect-square"><Image src={ART("ac-split")[0]} alt="Newcastle 1.5HP inverter split air conditioner" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>
        </div>
      </section>

      {/* 9 ─ WHY NEWCASTLE */}
      <section className="section container">
        <SectionHeader center eyebrow="Why Newcastle" title="We make it. We stand behind it." subtitle="Every Newcastle product is designed and manufactured by us — so you get better quality control, fairer prices and real accountability." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {([[Factory, "30+ years of manufacturing", "Over three decades designing and building electronics — one brand, one standard, from design to delivery."], [CreditCard, "Factory-direct pricing", "No middlemen. Pay by card, transfer, USSD or QR via Paystack."], [Zap, "Built for Nigerian power", "Wide-voltage operation and low start-up current — generator and solar friendly."], [ShieldCheck, "Manufacturer warranty", "Up to 5 years on compressors and batteries, serviced by our own team."], [Truck, "Fast nationwide delivery", "1–2 days in Lagos, 2–7 days across Nigeria, with live tracking."], [Headphones, "Real human support", "Call or WhatsApp our team directly on +234 706 837 6168."]] as const).map(([I, t, d]) => (
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
            <h2 className="mt-2 text-4xl font-semibold tracking-tightest sm:text-5xl">Installed right, the first time.</h2>
            <p className="mt-4 text-lg text-ink-muted dark:text-white/70">Book Newcastle-certified technicians for AC installation, gas cooker connection and solar setup — in Lagos, Abuja, Port Harcourt, Ibadan and Kano.</p>
            <ul className="mt-6 space-y-3 text-[15px]">{["Same or next-day slots in Lagos", "Quality copper piping and brackets", "90-day workmanship warranty"].map((t) => <li key={t} className="flex gap-3"><Wrench className="h-5 w-5 shrink-0 text-electric" strokeWidth={1.5} />{t}</li>)}</ul>
            <Link href="/installation" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>Book installation</Link>
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
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tightest sm:text-6xl">Beat power cuts with Newcastle Solar.</h2>
            <p className="mt-4 max-w-xl text-lg text-white/75">Tell us your appliances and our calculator sizes your inverter, batteries and panels in seconds. Then book a free consultation with an engineer.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/solar-solutions#calculator" className={buttonVariants({ variant: "electric", size: "lg" })}><Calculator />Solar calculator</Link>
              <Link href="/solar-solutions" className={cn(buttonVariants({ size: "lg" }), "bg-white text-ink hover:bg-white/90")}>Explore solar</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8 ─ TESTIMONIALS */}
      <section className="section bg-cloud dark:bg-[#1D1D1F]">
        <div className="container">
          <SectionHeader center eyebrow="Customer stories" title="Rated 4.8 out of 5." subtitle="From 2,000+ verified reviews across Nigeria." />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="reveal rounded-[28px] bg-white p-8 shadow-card dark:bg-card">
                <Rating value={t.rating} />
                <blockquote className="mt-5 text-lg leading-relaxed tracking-tight">“{t.quote}”</blockquote>
                <figcaption className="mt-6 text-sm"><b className="font-semibold">{t.name}</b><span className="block text-muted-foreground">{t.role}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 13 ─ BRAND: Made by Newcastle */}
      <section className="section container" aria-labelledby="brand-h">
        <div className="reveal text-center">
          <p className="eyebrow">One brand</p>
          <h2 id="brand-h" className="mt-2 text-4xl font-semibold tracking-tightest sm:text-5xl">Newcastle. Made for Nigerian homes.</h2>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-y-10 text-center lg:grid-cols-4">
          {[["30+", "Years in business"], ["36 + FCT", "States we deliver to"], ["5 yrs", "Max. warranty"], ["4.8★", "Average rating"]].map(([v, l]) => (
            <div key={l} className="reveal"><dt className="sr-only">{l}</dt><dd className="text-5xl font-semibold tracking-tightest sm:text-6xl">{v}</dd><dd className="mt-2 text-muted-foreground">{l}</dd></div>
          ))}
        </dl>
      </section>

      {/* 12 ─ NEWSLETTER */}
      <section className="container">
        <div className="tile reveal flex flex-col items-center px-6 py-16 text-center sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tightest sm:text-5xl">Be the first to know.</h2>
          <p className="mt-3 max-w-lg text-lg text-ink-muted dark:text-white/70">New Newcastle products, flash deals and energy-saving tips. No spam — unsubscribe anytime.</p>
          <div className="mt-8 w-full max-w-md"><NewsletterForm /></div>
        </div>
      </section>
    </>
  );
}
