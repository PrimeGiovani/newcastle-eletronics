import Link from "next/link";
import { categories } from "@/lib/products";
import { nav, site, waLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 bg-brand-900 text-slate-300">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-white">{site.name}</p>
          <p className="mt-3 text-sm leading-relaxed">Your trusted technology partner for air conditioning, appliances and solar energy.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Products</p>
          <ul className="mt-3 space-y-2 text-sm">{categories.map((c) => <li key={c.slug}><Link className="hover:text-white" href={`/products/${c.slug}`}>{c.name}</Link></li>)}</ul>
        </div>
        <div>
          <p className="font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm">{nav.slice(2).map((n) => <li key={n.href}><Link className="hover:text-white" href={n.href}>{n.label}</Link></li>)}</ul>
        </div>
        <address className="not-italic">
          <p className="font-semibold text-white">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{site.address.street}, {site.address.city}</li>
            <li><a className="hover:text-white" href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a></li>
            <li><a className="hover:text-white" href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><a className="hover:text-white" href={waLink()} target="_blank" rel="noopener noreferrer">WhatsApp chat</a></li>
            <li>{site.hours}</li>
          </ul>
        </address>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs">© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
    </footer>
  );
}
