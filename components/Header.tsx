"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, site, waLink } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-ink" aria-label={`${site.name} home`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-eco-500 text-white">⚡</span>
          <span className="text-lg">{site.shortName}</span>
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${active(n.href) ? "bg-brand-50 text-brand-600" : "text-ink-soft hover:text-ink"}`}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact#quote" className="btn-primary hidden sm:inline-flex">Request Quote</Link>
          <button className="rounded-lg p-2 lg:hidden" aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-slate-100 bg-white lg:hidden">
          <ul className="container space-y-1 py-4">
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-3 font-medium ${active(n.href) ? "bg-brand-50 text-brand-600" : "text-ink"}`}>{n.label}</Link></li>
            ))}
            <li className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/contact#quote" onClick={() => setOpen(false)} className="btn-primary">Request Quote</Link>
              <a href={waLink()} className="btn-wa" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
