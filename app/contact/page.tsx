import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { site, waLink } from "@/lib/config";
import { LeadForm } from "@/components/forms/lead-forms";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({ title: "Contact Us – Sales, Quotes & Support", description: "Contact Newcastle Electronics: call or WhatsApp +234 706 837 6168, email info@newcastleelectronics.com, or visit our showroom at 18 Oba Daudu St, Iyana Iba, Ojo, Lagos.", path: "/contact" });

const TABS = [["contact", "General enquiry"], ["quote", "Request a quote"], ["support", "Customer support"]] as const;

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; product?: string }> }) {
  const sp = await searchParams;
  const type = (TABS.find(([t]) => t === sp.type)?.[0] ?? "contact") as (typeof TABS)[number][0];
  const tel = site.phone.replace(/\s/g, "");
  const map = encodeURIComponent(site.addressLine);
  return (
    <section className="container py-12">
      <h1 className="text-5xl font-semibold tracking-tightest">Contact Newcastle.</h1>
      <p className="mt-2 text-lg text-muted-foreground">We reply within 2 business hours. {site.hours}.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <a href={waLink("sales")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-[24px] bg-[#25D366] p-5 font-semibold text-white"><MessageCircle className="h-6 w-6" /><span>Chat on WhatsApp<span className="block text-sm font-normal text-white/85">{site.phone}</span></span></a>
          {[[Phone, "Call us", site.phone, `tel:${tel}`], [Mail, "Email", site.email, `mailto:${site.email}`], [MapPin, "Showroom & office", site.addressLine, `https://maps.google.com/?q=${map}`], [Clock, "Opening hours", site.hours, ""]].map(([Icon, l, v, h]) => {
            const I = Icon as typeof Phone;
            const inner = <><I className="h-5 w-5 text-electric" /><span><span className="block text-sm text-muted-foreground">{l as string}</span><b>{v as string}</b></span></>;
            return h ? <a key={l as string} href={h as string} className="flex items-center gap-4 rounded-[28px] bg-white shadow-card dark:bg-card p-5 hover:border-electric">{inner}</a> : <div key={l as string} className="flex items-center gap-4 rounded-[28px] bg-white shadow-card dark:bg-card p-5">{inner}</div>;
          })}
          <iframe title="Showroom map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-3xl border-0" src={`https://maps.google.com/maps?q=${map}&output=embed`} />
        </div>
        <div className="rounded-[28px] bg-white shadow-card dark:bg-card p-6 sm:p-8">
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Enquiry type">
            {TABS.map(([t, l]) => <a key={t} href={`/contact?type=${t}`} aria-current={t === type ? "page" : undefined} className={cn("rounded-full border px-4 py-2 text-sm font-medium", t === type && "border-primary bg-primary text-primary-foreground")}>{l}</a>)}
          </nav>
          <LeadForm key={type} type={type} defaultProduct={sp.product ?? ""} />
        </div>
      </div>
    </section>
  );
}
