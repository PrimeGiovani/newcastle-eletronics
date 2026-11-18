import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { pageMeta } from "@/lib/seo";
import { img } from "@/lib/site";

export const metadata = pageMeta({ title: "Projects – Solar & AC Installations", description: "Case studies of our solar, ESS and air conditioning installations for homes, hotels, offices and estates.", path: "/projects" });
const projects = [
  { t: "20KW Hybrid Solar – Boutique Hotel", s: "Hotel", d: "40 panels, 2×10KW inverters, 30KWh lithium storage. 70% diesel savings.", i: "photo-1508514177221-188b1cf16e9d" },
  { t: "45 AC Units – Corporate Office", s: "Office", d: "Supply & install of 1.5HP and 3HP inverter units across 5 floors.", i: "photo-1497366216548-37526070297c" },
  { t: "120 Solar Street Lights – Residential Estate", s: "Developer", d: "All-in-one 100W lights with motion sensing across 3km of roads.", i: "photo-1513828583688-c52646db42da" },
  { t: "5KW ESS – Family Home", s: "Residential", d: "All-in-one ESS delivering 24/7 power with app monitoring.", i: "photo-1509391366360-2e959784a276" },
];
export default function Projects() {
  return (
    <section className="section container">
      <SectionHeading as="h1" eyebrow="Our work" title="Featured projects" sub="Real installations, real savings." />
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {projects.map((p) => (
          <article key={p.t} className="overflow-hidden rounded-3xl shadow-card ring-1 ring-slate-100">
            <div className="relative aspect-[16/9]"><Image src={img(p.i, 1000)} alt={p.t} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" /></div>
            <div className="p-6"><span className="text-xs font-semibold uppercase tracking-wider text-eco-600">{p.s}</span><h2 className="mt-2 text-xl font-bold">{p.t}</h2><p className="mt-2 text-ink-soft">{p.d}</p></div>
          </article>
        ))}
      </div>
      <div className="mt-14 text-center"><Link href="/contact#quote" className="btn-primary">Start your project</Link></div>
    </section>
  );
}
