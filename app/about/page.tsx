import Image from "next/image";
import { Factory, Heart, ShieldCheck, Users } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { site, waLink } from "@/lib/config";

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
        <div className="relative mx-auto mt-12 aspect-[3/2] max-w-5xl overflow-hidden rounded-[28px] bg-cloud shadow-soft"><Image src="/about-lagos.jpg" alt="Lagos skyline and highway with a Newcastle Electronics speaker – serving Nigerian homes for over 30 years" fill priority sizes="(min-width:1024px) 1024px, 100vw" className="object-cover" /></div>
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
            <div><dt className="text-sm text-muted-foreground">Call</dt><dd><a className="text-electric hover:underline" href={site.phoneHref}>{site.phone}</a> <span className="text-muted-foreground">({site.phoneLocal})</span></dd></div>
            <div><dt className="text-sm text-muted-foreground">WhatsApp only</dt><dd><a className="text-electric hover:underline" href={waLink("sales")} target="_blank" rel="noopener noreferrer">{site.whatsappDisplay}</a> <span className="text-muted-foreground">({site.whatsappLocal})</span></dd></div>
            <div><dt className="text-sm text-muted-foreground">Email</dt><dd><a className="text-electric hover:underline" href={`mailto:${site.email}`}>{site.email}</a></dd></div>
            <div><dt className="text-sm text-muted-foreground">Opening hours</dt><dd>{site.hours}</dd></div>
          </dl>
        </div>
        <iframe title="Newcastle Electronics showroom map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-[28px] border-0 bg-cloud"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(site.addressLine)}&output=embed`} />
      </section>
      <section id="policies" className="section container max-w-3xl space-y-8 pt-0">
        <h2 className="text-4xl font-semibold tracking-tightest">Delivery, installation & swaps.</h2>
        <div><h3 className="text-lg font-semibold">Delivery</h3><p className="mt-1 text-ink-muted dark:text-white/70">Free delivery anywhere in Nigeria on orders of ₦2,000,000 and above. For orders under ₦2,000,000, Newcastle will contact you after purchase to arrange shipping. You can also pick up your order free of charge at our showroom: {site.addressLine}.</p></div>
        <div><h3 className="text-lg font-semibold">Installation</h3><p className="mt-1 text-ink-muted dark:text-white/70">Newcastle works with trusted installers. Installation is a separate paid service, arranged after purchase – contact us to enquire about installation for your product.</p></div>
        <div><h3 className="text-lg font-semibold">7-day swap policy</h3><p className="mt-1 text-ink-muted dark:text-white/70">You can swap a product within 7 days of delivery or pickup. The product must be unused and in good condition – no scratches, no dents, and still fully functioning. We offer swaps (exchanges), not cash refunds. Faulty products are handled under the Newcastle manufacturer warranty.</p></div>
        <div><h3 className="text-lg font-semibold">Payments</h3><p className="mt-1 text-ink-muted dark:text-white/70">All online payments are processed securely by Paystack (PCI-DSS Level 1). We never store your card details.</p></div>
      </section>
    </>
  );
}
