import QuoteForm from "@/components/QuoteForm";
import SectionHeading from "@/components/SectionHeading";
import { WhatsAppIcon } from "@/components/Icons";
import { pageMeta } from "@/lib/seo";
import { site, waLink } from "@/lib/site";

export const metadata = pageMeta({ title: "Contact Us – Request a Quote", description: `Contact ${site.name} for quotes on air conditioners, solar systems and appliances. Call, WhatsApp or visit our showroom.`, path: "/contact" });

export default function Contact({ searchParams }: { searchParams: { product?: string } }) {
  const tel = site.phone.replace(/\s/g, "");
  const cards = [
    { t: "Call us", v: site.phone, href: `tel:${tel}` },
    { t: "Email", v: site.email, href: `mailto:${site.email}` },
    { t: "Showroom", v: `${site.address.street}, ${site.address.city}`, href: `https://maps.google.com/?q=${encodeURIComponent(site.address.street + " " + site.address.city)}` },
  ];
  return (
    <section className="section container">
      <SectionHeading as="h1" eyebrow="Contact" title="Let's power your next project" sub={`We reply within 2 business hours. ${site.hours}.`} />
      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-wa w-full py-4 text-base"><WhatsAppIcon /> Chat on WhatsApp</a>
          {cards.map((c) => (
            <a key={c.t} href={c.href} className="block rounded-2xl p-5 ring-1 ring-slate-100 shadow-card hover:ring-brand-500" {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <p className="text-sm text-ink-soft">{c.t}</p><p className="mt-1 font-semibold">{c.v}</p>
            </a>
          ))}
          <iframe title="Showroom location map" loading="lazy" className="aspect-[4/3] w-full rounded-2xl border-0" referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(site.address.street + " " + site.address.city)}&output=embed`} />
        </div>
        <div id="quote" className="rounded-3xl p-6 ring-1 ring-slate-100 shadow-card sm:p-8 lg:col-span-3">
          <h2 className="text-2xl font-bold">Request a quotation</h2>
          <div className="mt-6"><QuoteForm defaultProduct={searchParams.product ?? ""} /></div>
        </div>
      </div>
    </section>
  );
}
