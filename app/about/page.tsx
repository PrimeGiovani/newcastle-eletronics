import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import { pageMeta } from "@/lib/seo";
import { img, site } from "@/lib/site";

export const metadata = pageMeta({ title: "About Us – Your Trusted Technology Partner", description: `Learn about ${site.name}: a decade of supplying genuine electronics, appliances and solar energy systems to homes and businesses.`, path: "/about" });
const values = [["Reliable", "Products and service you can depend on."], ["Affordable", "Premium technology at fair prices."], ["Energy-efficient", "Solutions that cut bills and emissions."], ["Professional", "Certified engineers and transparent advice."]];
const audiences = ["Homeowners", "Businesses & Offices", "Contractors", "Hotels", "Property Developers"];

export default function About() {
  return (
    <>
      <section className="section container grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading as="h1" eyebrow="About us" title="Technology that powers everyday life" sub={`${site.name} supplies and installs genuine air conditioners, home appliances, electronics and solar energy systems for homes and businesses.`} />
          <p className="mt-4 text-ink-soft">Founded over a decade ago, we've completed 2,500+ installations — from family homes to hotels and commercial estates. Our mission: make reliable, energy-efficient technology affordable for everyone.</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl"><Image src={img("photo-1581092160562-40aa08e78837", 1200)} alt="Our engineering team at work" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /></div>
      </section>
      <section className="section bg-slate-50"><div className="container">
        <SectionHeading center title="Our values" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{values.map(([t, d]) => <div key={t} className="rounded-2xl bg-white p-6 shadow-card"><h3 className="font-semibold text-brand-600">{t}</h3><p className="mt-2 text-ink-soft">{d}</p></div>)}</div>
      </div></section>
      <section className="section container">
        <SectionHeading title="Who we serve" />
        <ul className="mt-6 flex flex-wrap gap-3">{audiences.map((a) => <li key={a} className="rounded-full bg-brand-50 px-5 py-2 font-medium text-brand-700">{a}</li>)}</ul>
        <h2 className="mt-14 text-2xl font-bold">Certifications & partners</h2>
        <p className="mt-2 text-ink-soft">Authorized distributor for leading AC and solar brands. Add partner logos and certificates here for credibility.</p>
      </section>
    </>
  );
}
