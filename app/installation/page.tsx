import { BadgeCheck } from "lucide-react";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { LeadForm } from "@/components/forms/lead-forms";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatNaira } from "@/lib/utils";
import { INSTALLATION_FEE } from "@/lib/pricing";

export const metadata = buildMetadata({ title: "Book AC & Appliance Installation", description: "Book certified technicians for air conditioner installation, gas cooker connection, TV mounting and solar setup in Lagos, Abuja, Port Harcourt, Ibadan and Kano.", path: "/installation" });
const services = [["Split AC installation (1–2HP)", `From ${formatNaira(INSTALLATION_FEE)}`], ["Standing AC installation (3HP+)", "From ₦45,000"], ["Gas cooker & range hood fitting", "From ₦15,000"], ["TV wall mounting", "From ₦15,000"], ["Solar system installation", "Quoted after survey"], ["AC servicing & gas refill", "From ₦12,000"]];
const faqs = [{ q: "How soon can you install?", a: "Same or next day in Lagos and Abuja; 2–4 days in other cities." }, { q: "Is installation guaranteed?", a: "Yes — all installations carry a 90-day workmanship warranty in addition to the manufacturer warranty." }];

export default function InstallationPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={[{ name: "Installation", path: "/installation" }]} />
      <section className="container grid gap-10 pb-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-semibold">Professional installation services</h1>
          <p className="mt-4 text-lg text-muted-foreground">Certified technicians. Quality materials. 90-day workmanship warranty.</p>
          <ul className="mt-8 divide-y rounded-[28px] bg-white shadow-card dark:bg-card">{services.map(([s, p]) => <li key={s} className="flex justify-between gap-4 p-4"><span className="flex gap-2"><BadgeCheck className="h-5 w-5 text-electric" />{s}</span><b className="shrink-0">{p}</b></li>)}</ul>
          <div className="mt-8 space-y-4">{faqs.map((f) => <div key={f.q}><p className="font-semibold">{f.q}</p><p className="text-muted-foreground">{f.a}</p></div>)}</div>
        </div>
        <div className="h-fit rounded-[28px] bg-white shadow-card dark:bg-card p-6 sm:p-8">
          <h2 className="mb-6 font-display text-2xl font-semibold">Book an installation</h2>
          <LeadForm type="installation" showDate />
        </div>
      </section>
    </>
  );
}
