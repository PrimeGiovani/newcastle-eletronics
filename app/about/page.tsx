import Image from "next/image";
import { Factory, Heart, ShieldCheck, Users } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { ART } from "@/lib/seed-data";
import { site } from "@/lib/config";

export const metadata = buildMetadata({ title: "About Newcastle Electronics – Designed & Manufactured by Newcastle", description: "Newcastle Electronics designs and manufactures inverter air conditioners, sound systems, kitchen appliances and solar solutions for Nigerian homes and businesses.", path: "/about" });

export default function AboutPage() {
  return (
    <>
      <section className="container py-16 text-center sm:py-24">
        <p className="eyebrow">About Newcastle</p>
        <h1 className="mx-auto mt-3 max-w-4xl text-5xl font-semibold tracking-tightest sm:text-7xl">{site.tagline}.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted sm:text-xl dark:text-white/70">
          For over 30 years, Newcastle Electronics has designed and manufactured every product we sell — inverter air conditioners, sound systems, gas cookers, home appliances and, now, solar solutions. One brand, one standard, built for Nigerian homes and power conditions.
        </p>
        <div className="relative mx-auto mt-12 aspect-[2/1] max-w-5xl overflow-hidden rounded-[28px] bg-cloud"><Image src={ART("ac-split")[0]} alt="Newcastle inverter air conditioner" fill priority sizes="(min-width:1024px) 1024px, 100vw" className="object-cover" /></div>
      </section>
      <section className="section bg-cloud dark:bg-[#1D1D1F]">
        <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {([[Factory, "30+ years of making it", "Three decades designing and manufacturing — we control quality from design to delivery."], [ShieldCheck, "We stand behind it", "Manufacturer warranty serviced by our own technicians."], [Users, "Customer-first", "Talk to real people by phone, email or WhatsApp."], [Heart, "Built for Nigeria", "Wide-voltage, generator- and solar-friendly engineering."]] as const).map(([I, t, d]) => (
            <div key={t} className="reveal rounded-[28px] bg-white p-8 shadow-card dark:bg-card"><I className="h-8 w-8 text-electric" strokeWidth={1.5} /><h2 className="mt-6 text-xl font-semibold tracking-tight">{t}</h2><p className="mt-2 text-ink-muted dark:text-white/70">{d}</p></div>
          ))}
        </div>
      </section>
      <section className="section container grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold tracking-tightest">Visit our showroom.</h2>
          <p className="mt-4 text-lg text-ink-muted dark:text-white/70">See and hear Newcastle products in person at our showroom and head office.</p>
          <dl className="mt-8 space-y-4 text-[17px]">
            <div><dt className="text-sm text-muted-foreground">Showroom & office</dt><dd>{site.addressLine}</dd></div>
            <div><dt className="text-sm text-muted-foreground">Call & WhatsApp</dt><dd><a className="text-electric hover:underline" href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a></dd></div>
            <div><dt className="text-sm text-muted-foreground">Email</dt><dd><a className="text-electric hover:underline" href={`mailto:${site.email}`}>{site.email}</a></dd></div>
            <div><dt className="text-sm text-muted-foreground">Opening hours</dt><dd>{site.hours}</dd></div>
          </dl>
        </div>
        <iframe title="Newcastle Electronics showroom map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-[28px] border-0 bg-cloud"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(site.addressLine)}&output=embed`} />
      </section>
      <section id="policies" className="section container max-w-3xl space-y-8 pt-0">
        <h2 className="text-4xl font-semibold tracking-tightest">Delivery, returns & warranty.</h2>
        <div><h3 className="text-lg font-semibold">Delivery</h3><p className="mt-1 text-ink-muted dark:text-white/70">Lagos 1–2 business days; South-West 2–3; Abuja 2–4; South-South/South-East 3–5; North 4–7. Free standard delivery on orders above ₦1,000,000. Showroom pickup available at Iyana Iba, Ojo.</p></div>
        <div><h3 className="text-lg font-semibold">Installation</h3><p className="mt-1 text-ink-muted dark:text-white/70">Professional installation by Newcastle-certified technicians is available at checkout or via our booking page, with a 90-day workmanship warranty.</p></div>
        <div><h3 className="text-lg font-semibold">Returns</h3><p className="mt-1 text-ink-muted dark:text-white/70">Unopened items may be returned within 7 days of delivery. Faulty items are repaired or replaced under the Newcastle manufacturer warranty.</p></div>
        <div><h3 className="text-lg font-semibold">Payments</h3><p className="mt-1 text-ink-muted dark:text-white/70">All online payments are processed securely by Paystack (PCI-DSS Level 1). We never store your card details.</p></div>
      </section>
    </>
  );
}
