import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter } from "lucide-react";
import { site, waLink } from "@/lib/config";
import { NewsletterForm } from "@/components/forms/lead-forms";

const cols = [
  { title: "Shop", links: [["Air Conditioners", "/category/air-conditioners"], ["Sound System", "/category/sound-system"], ["Kitchen Appliances", "/category/kitchen-appliances"], ["Solar Solutions", "/solar-solutions"], ["New Arrivals", "/shop?new=1"], ["Deals", "/deals"]] },
  { title: "Support", links: [["Track Order", "/track"], ["My Account", "/account"], ["Book Installation", "/installation"], ["Request a Quote", "/contact?type=quote"], ["Delivery & Returns", "/about#policies"], ["Contact Support", "/contact?type=support"]] },
  { title: "Newcastle", links: [["About Us", "/about"], ["Showroom", "/contact"], ["Solar Calculator", "/solar-solutions#calculator"], ["Compare Products", "/compare"]] },
];

/** Apple-style footer: light gray, small type, quiet hierarchy. */
export function Footer() {
  const tel = site.phone.replace(/\s/g, "");
  return (
    <footer className="mt-28 bg-cloud text-[13px] text-ink-muted dark:bg-[#161617] dark:text-white/60">
      <div className="container grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Image src="/logo.png" alt="Newcastle Electronics" width={877} height={160} className="h-7 w-auto dark:hidden" />
          <Image src="/logo-white.png" alt="Newcastle Electronics" width={877} height={160} className="hidden h-7 w-auto dark:block" />
          <p className="mt-4 max-w-sm leading-relaxed">{site.tagline}. For over 30 years, Newcastle has designed and manufactured air conditioners, sound systems, kitchen appliances and, now, solar solutions.</p>
          <div className="mt-8 max-w-sm">
            <p className="font-semibold text-ink dark:text-white">Be first to know about new products and offers.</p>
            <div className="mt-3"><NewsletterForm /></div>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="font-semibold text-ink dark:text-white">{c.title}</p>
              <ul className="mt-4 space-y-3">{c.links.map(([l, h]) => <li key={h}><Link href={h} className="transition-colors hover:text-ink hover:underline dark:hover:text-white">{l}</Link></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container"><div className="grid gap-4 border-t border-black/10 py-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
        <a href="https://maps.google.com/?q=18+Oba+Daudu+St+Iyana+Iba+Ojo+Lagos" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-ink dark:hover:text-white"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />Showroom & office: {site.addressLine}</a>
        <a href={`tel:${tel}`} className="flex items-center gap-2 hover:text-ink dark:hover:text-white"><Phone className="h-4 w-4" />{site.phone}</a>
        <a href={waLink("sales")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ink dark:hover:text-white"><MessageCircle className="h-4 w-4" />WhatsApp {site.phone}</a>
        <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-ink dark:hover:text-white"><Mail className="h-4 w-4" />{site.email}</a>
      </div></div>
      <div className="container"><div className="flex flex-col gap-3 border-t border-black/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <p>Copyright © {new Date().getFullYear()} Newcastle Electronics Ltd. All rights reserved. Prices in Naira (₦), VAT inclusive. Payments secured by Paystack.</p>
        <div className="flex gap-4">
          <a href={site.social.instagram} aria-label="Instagram" className="hover:text-ink dark:hover:text-white"><Instagram className="h-4 w-4" /></a>
          <a href={site.social.facebook} aria-label="Facebook" className="hover:text-ink dark:hover:text-white"><Facebook className="h-4 w-4" /></a>
          <a href={site.social.x} aria-label="X (Twitter)" className="hover:text-ink dark:hover:text-white"><Twitter className="h-4 w-4" /></a>
        </div>
      </div></div>
    </footer>
  );
}
