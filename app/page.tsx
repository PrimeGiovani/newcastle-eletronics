import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import QuoteForm from "@/components/QuoteForm";
import SectionHeading from "@/components/SectionHeading";
import { Arrow, Check, WhatsAppIcon } from "@/components/Icons";
import { categories, featured } from "@/lib/products";
import { img, waLink } from "@/lib/site";

const why = [
  { t: "Genuine Products", d: "100% authentic, manufacturer-backed stock with serial verification.", i: "🛡️" },
  { t: "Competitive Prices", d: "Direct sourcing means better prices — plus bulk and contractor rates.", i: "💰" },
  { t: "Expert Installation", d: "Certified technicians for AC and solar installs, done right first time.", i: "🔧" },
  { t: "Warranty Support", d: "Up to 5-year warranties with local after-sales service.", i: "✅" },
  { t: "Fast Delivery", d: "Same/next-day delivery in-city; nationwide shipping available.", i: "🚚" },
  { t: "Technical Consultation", d: "Free load audits and system design from our engineers.", i: "📐" },
];
const solar = ["Solar Panels", "Inverters", "Lithium Batteries", "Complete Solar Kits", "ESS Systems", "Street Lights"];
const stats = [["2,500+", "Installations"], ["10+", "Years experience"], ["4.9★", "Customer rating"], ["5 yr", "Warranty coverage"]];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-brand-900">
        <Image src={img("photo-1508514177221-188b1cf16e9d", 1920)} alt="Solar panels on a modern home rooftop" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900 via-brand-900/80 to-transparent" />
        <div className="container py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl text-white">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-eco-100 ring-1 ring-white/20">Free Solar Consultation available</p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Powering Homes and Businesses with Smart Energy Solutions</h1>
            <p className="mt-6 text-lg text-slate-200 sm:text-xl">Premium Air Conditioners, Solar Systems, Home Appliances and Electronics at Competitive Prices</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="btn-primary">Shop Products <Arrow /></Link>
              <Link href="/contact#quote" className="btn bg-white text-ink hover:bg-slate-100">Request Quote</Link>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-wa"><WhatsAppIcon /> WhatsApp Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section aria-label="Company statistics" className="border-b border-slate-100">
        <dl className="container grid grid-cols-2 gap-6 py-8 text-center lg:grid-cols-4">
          {stats.map(([n, l]) => <div key={l}><dt className="sr-only">{l}</dt><dd className="text-2xl font-bold text-brand-600">{n}</dd><dd className="text-sm text-ink-soft">{l}</dd></div>)}
        </dl>
      </section>

      {/* CATEGORIES */}
      <section className="section container">
        <SectionHeading eyebrow="Shop by category" title="Everything you need to power and cool your space" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/products/${c.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image src={c.image} alt={c.name} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-xl font-semibold">{c.short}</h3>
                <p className="mt-1 text-sm text-slate-200 line-clamp-2">{c.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">Explore <Arrow /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Featured" title="Best-selling products" />
            <Link href="/products" className="btn-outline">View all products</Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured().map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section container">
        <SectionHeading center eyebrow="Why choose us" title="A technology partner you can trust" sub="Homeowners, contractors, hotels and developers rely on us for quality products and professional service." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {why.map((w) => (
            <div key={w.t} className="rounded-2xl border border-slate-100 p-6 shadow-card">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl" aria-hidden>{w.i}</span>
              <h3 className="mt-4 text-lg font-semibold">{w.t}</h3>
              <p className="mt-2 text-ink-soft">{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLAR */}
      <section className="section bg-gradient-to-br from-eco-50 via-white to-brand-50">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Solar solutions" title="Cut your energy bills. Never lose power again." sub="From a single panel to megawatt commercial installations — designed, supplied and installed by our engineers." />
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {solar.map((s) => <li key={s} className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-eco-600" />{s}</li>)}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact?product=Free%20Solar%20Consultation#quote" className="btn-eco">Book Free Solar Consultation</Link>
              <Link href="/solar-solutions" className="btn-outline">Explore solar</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
            <Image src={img("photo-1509391366360-2e959784a276", 1200)} alt="Solar installation by our engineers" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section id="quote" className="section container">
        <div className="grid gap-12 rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-100 sm:p-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Get a quote" title="Request a free quotation" sub="Tell us what you need. We respond within 2 business hours with pricing and availability." />
            <a href={waLink("Hi, I'd like a quotation.")} target="_blank" rel="noopener noreferrer" className="btn-wa mt-8"><WhatsAppIcon /> Prefer WhatsApp?</a>
          </div>
          <div className="lg:col-span-3"><QuoteForm /></div>
        </div>
      </section>
    </>
  );
}
