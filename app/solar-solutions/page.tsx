import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ProductCard from "@/components/ProductCard";
import QuoteForm from "@/components/QuoteForm";
import SectionHeading from "@/components/SectionHeading";
import { byCategory, solarSubcats } from "@/lib/products";
import { faqSchema, pageMeta } from "@/lib/seo";
import { img } from "@/lib/site";

export const metadata = pageMeta({ title: "Solar Solutions – Panels, Inverters, Batteries & ESS", description: "Complete solar systems for homes and businesses: panels, hybrid & off-grid inverters, lithium batteries, ESS and street lights. Book a free solar consultation.", path: "/solar-solutions" });

const steps = [["Free consultation", "We audit your load and goals."], ["System design", "Engineers size panels, inverter and storage."], ["Installation", "Certified, safe, clean install."], ["Monitoring & support", "App monitoring and warranty service."]];
const faqs = [
  { q: "How much does a home solar system cost?", a: "Typical home systems range from 3KVA starter kits to 10KVA+ whole-home systems. Book a free consultation for an exact quote based on your load." },
  { q: "How long do lithium batteries last?", a: "Our LiFePO4 batteries are rated for 6,000+ cycles — over 10 years of daily use." },
  { q: "Can solar run my air conditioner?", a: "Yes. Inverter ACs paired with a correctly sized hybrid system run efficiently on solar." },
];

export default function SolarPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <section className="relative isolate overflow-hidden bg-eco-700 text-white">
        <Image src={img("photo-1509391366360-2e959784a276", 1920)} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-30" />
        <div className="container py-24">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Solar Energy Solutions for Homes & Businesses</h1>
          <p className="mt-5 max-w-2xl text-lg text-eco-50">Reliable 24/7 power, lower bills and energy independence — designed and installed by our engineers.</p>
          <Link href="#consult" className="btn mt-8 bg-white text-eco-700 hover:bg-eco-50">Get Free Solar Consultation</Link>
        </div>
      </section>
      <section className="section container">
        <SectionHeading title="What we offer" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{solarSubcats.map((s) => <li key={s} className="rounded-2xl p-6 font-semibold shadow-card ring-1 ring-slate-100">{s}</li>)}</ul>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{byCategory("solar-solutions").map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
      <section className="section bg-slate-50"><div className="container">
        <SectionHeading center title="How it works" />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([t, d], i) => <li key={t} className="rounded-2xl bg-white p-6 shadow-card"><span className="text-3xl font-bold text-eco-600">0{i + 1}</span><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-ink-soft">{d}</p></li>)}</ol>
      </div></section>
      <section className="section container max-w-3xl">
        <SectionHeading title="Frequently asked questions" />
        <div className="mt-8 divide-y divide-slate-100">{faqs.map((f) => <details key={f.q} className="py-4"><summary className="cursor-pointer font-semibold">{f.q}</summary><p className="mt-2 text-ink-soft">{f.a}</p></details>)}</div>
      </section>
      <section id="consult" className="container grid gap-10 rounded-3xl bg-eco-50 p-6 sm:p-10 lg:grid-cols-2">
        <div><h2 className="text-3xl font-bold">Free Solar Consultation</h2><p className="mt-3 text-ink-soft">No obligation. Our engineer will assess your needs and send a tailored proposal.</p></div>
        <QuoteForm defaultProduct="Free Solar Consultation" />
      </section>
    </>
  );
}
