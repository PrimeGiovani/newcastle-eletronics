import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Calculator, ShieldCheck, Sun, Zap } from "lucide-react";
import { searchProducts } from "@/lib/catalog";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { ART, IMG } from "@/lib/seed-data";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid } from "@/components/product/product-card";
import { SolarCalculator } from "@/components/solar/calculator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";

export const revalidate = 600;
export const metadata = buildMetadata({ title: "Solar Solutions – Panels, Lithium Batteries, Inverters & ESS", description: "Newcastle solar panels, lithium batteries, hybrid inverters and energy storage systems. Free solar calculator and consultation across Nigeria.", path: "/solar-solutions", images: [IMG.solar1] });

const faqs = [
  { q: "What size inverter do I need to run an AC in Nigeria?", a: "A 1HP inverter AC typically needs at least a 3.5kVA hybrid inverter with 5kWh+ of lithium storage for night use. Use our solar calculator for a personalised estimate." },
  { q: "How long do lithium solar batteries last?", a: "Quality LiFePO4 batteries are rated for 6,000+ cycles — roughly 10–15 years of daily use, far longer than lead-acid batteries." },
  { q: "Do you install solar systems outside Lagos?", a: "Yes. We supply and install across Nigeria including Abuja, Port Harcourt, Ibadan and Kano." },
  { q: "Can I pay for a solar system in instalments?", a: "Speak with our team about staged payment options for larger installations." },
];

export default async function SolarPage() {
  const { items } = await searchProducts({ category: "solar-solutions", perPage: 8 });
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={[{ name: "Solar Solutions", path: "/solar-solutions" }]} />
      <section className="container">
        <div className="tile flex flex-col items-center px-6 pt-14 text-center sm:pt-20">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-flame"><Sun className="h-4 w-4" />New · Newcastle Solar</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tightest sm:text-7xl">Power that never takes a break.</h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted sm:text-xl dark:text-white/70">Newcastle solar panels, lithium batteries, hybrid inverters and all-in-one ESS — sized and installed by our engineers.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#calculator" className={buttonVariants({ variant: "electric", size: "lg" })}><Calculator />Size your system</a>
            <a href="#consultation" className={buttonVariants({ variant: "outline", size: "lg" })}>Free consultation</a>
          </div>
          <div className="relative mt-10 aspect-[2/1] w-full max-w-4xl"><Image src={ART("solar-panel")[0]} alt="Newcastle 550W mono solar panel" fill priority sizes="(min-width:1024px) 896px, 100vw" className="object-contain" /></div>
        </div>
      </section>

      <section className="section container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[Sun, "Solar Panels", "solar-panels", "High-efficiency mono modules"], [BatteryCharging, "Lithium Batteries", "lithium-batteries", "LiFePO4, 6,000+ cycles"], [Zap, "Hybrid Inverters", "hybrid-inverters", "Solar + grid + battery"], [ShieldCheck, "Energy Storage Systems", "ess-systems", "All-in-one plug & play"]].map(([Icon, t, s, d]) => {
            const I = Icon as typeof Sun;
            return <Link key={s as string} href={`/category/${s}`} className="reveal rounded-[28px] bg-cloud p-8 transition duration-500 ease-apple hover:-translate-y-1 hover:shadow-lift dark:bg-muted"><I className="h-8 w-8 text-electric" strokeWidth={1.5} /><h2 className="mt-4 text-lg font-semibold">{t as string}</h2><p className="mt-1 text-sm text-muted-foreground">{d as string}</p></Link>;
          })}
        </div>
        <h2 className="mb-6 mt-14 font-display text-2xl font-semibold">Popular solar products</h2>
        <ProductGrid products={items} />
      </section>

      <section id="calculator" className="container scroll-mt-32">
        <h2 className="font-display text-3xl font-semibold">Solar calculator</h2>
        <p className="mb-8 mt-2 text-muted-foreground">Adjust your appliances to estimate daily power usage, inverter size, battery storage and number of panels.</p>
        <SolarCalculator />
      </section>

      <section className="section container max-w-3xl">
        <h2 className="font-display text-2xl font-semibold">Solar FAQs</h2>
        <div className="mt-6 divide-y rounded-[28px] bg-cloud dark:bg-muted">
          {faqs.map((f) => <details key={f.q} className="group p-5"><summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}<span className="float-right transition group-open:rotate-45">+</span></summary><p className="mt-3 text-muted-foreground">{f.a}</p></details>)}
        </div>
      </section>
    </>
  );
}
