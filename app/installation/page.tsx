import { BadgeCheck, MessageCircle, Phone } from "lucide-react";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { LeadForm } from "@/components/forms/lead-forms";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/page-breadcrumbs";
import { site, waLink } from "@/lib/config";

export const metadata = buildMetadata({ title: "Installation Services – Trusted Newcastle Installers", description: "Newcastle works with trusted installers for air conditioners, gas hobs, range hoods, ovens and solar. Installation is a separate paid service – contact us after purchase to book.", path: "/installation" });
const services = ["Split and standing air conditioners", "Gas hob connection", "Range hood fitting", "Built-in ovens and microwaves", "Solar systems (when available)"];
const faqs = [
  { q: "Is installation included in the product price?", a: "No. Installation is a separate service carried out by trusted installers who work with Newcastle, charged separately after purchase." },
  { q: "How do I book installation?", a: `Contact Newcastle after your purchase – WhatsApp ${site.whatsappLocal}, call ${site.phoneLocal}, or use the form on this page. We'll connect you with an installer and confirm the charge before any work starts.` },
];

export default function InstallationPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={[{ name: "Installation", path: "/installation" }]} />
      <section className="container grid gap-10 pb-10 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tightest sm:text-5xl">Installation by trusted installers.</h1>
          <p className="mt-4 text-lg text-muted-foreground">Newcastle works with trusted installers. Installation is a separate service with its own charge, arranged after you buy. Contact us to enquire and book.</p>
          <ul className="mt-8 divide-y rounded-[28px] bg-cloud dark:bg-muted">{services.map((s) => <li key={s} className="flex gap-3 p-4"><BadgeCheck className="h-5 w-5 shrink-0 text-electric" />{s}</li>)}</ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={waLink("quote", "Installation enquiry:")} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-6 font-medium text-white"><MessageCircle className="h-4 w-4" />WhatsApp {site.whatsappLocal}</a>
            <a href={site.phoneHref} className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 px-6 font-medium dark:border-white/20"><Phone className="h-4 w-4" />Call {site.phoneLocal}</a>
          </div>
          <div className="mt-8 space-y-4">{faqs.map((f) => <div key={f.q}><p className="font-semibold">{f.q}</p><p className="text-muted-foreground">{f.a}</p></div>)}</div>
        </div>
        <div className="h-fit rounded-[28px] bg-white p-6 shadow-card dark:bg-card sm:p-8">
          <h2 className="mb-2 text-2xl font-semibold">Enquire about installation</h2>
          <p className="mb-6 text-sm text-muted-foreground">Tell us what you bought and where. We'll get back to you with the installer's charge and availability.</p>
          <LeadForm type="installation" showDate />
        </div>
      </section>
    </>
  );
}
