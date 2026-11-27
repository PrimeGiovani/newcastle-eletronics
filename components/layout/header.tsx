"use client";
import { Logo } from "@/components/brand/logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GitCompareArrows, Heart, Menu, MessageCircle, Search, ShoppingBag, User, X, Phone, Truck } from "lucide-react";
import { features, mainNav, site, waLink } from "@/lib/config";
import { useStore } from "@/components/cart/store";
import { ThemeToggle } from "@/components/theme";
import { cn } from "@/lib/utils";

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const { count, compare, wishlist, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => setOpen(false), [path]);

  const submit = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`); };
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      <div className="bg-cloud text-[12px] text-ink-soft dark:bg-[#161617] dark:text-white/70">
        <div className="container flex h-9 items-center justify-center gap-4 sm:justify-between">
          <p className="flex items-center gap-2"><Truck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Designed & manufactured by Newcastle · </span>Delivery across Nigeria</p>
          <p className="hidden items-center gap-4 sm:flex">
            <a href={site.phoneHref} className="flex items-center gap-1.5 hover:text-ink dark:hover:text-white"><Phone className="h-3.5 w-3.5" />Call {site.phoneLocal}</a>
            <a href={waLink("sales")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-ink dark:hover:text-white"><MessageCircle className="h-3.5 w-3.5" />WhatsApp {site.whatsappLocal}</a>
          </p>
        </div>
      </div>
      <header className={cn("sticky top-0 z-40 bg-white/80 backdrop-blur-2xl backdrop-saturate-150 transition-[border-color,box-shadow] duration-300 dark:bg-black/75", scrolled ? "border-b border-black/5 dark:border-white/10" : "border-b border-transparent")}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-electric focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
        <div className="container flex h-16 items-center gap-3 lg:h-[72px]">
          <button className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-muted lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <Link href="/" className="flex shrink-0 items-center" aria-label="Newcastle Electronics – home">
            <Logo priority />
          </Link>
          <form onSubmit={submit} role="search" className="relative mx-auto hidden w-full max-w-xl md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search ACs, sound systems, gas cookers, solar…" aria-label="Search products"
              className="h-10 w-full rounded-full border-0 bg-cloud pl-11 pr-4 text-base lg:text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-electric/40 dark:bg-muted" />
          </form>
          <nav className="ml-auto flex items-center gap-0.5 md:ml-0" aria-label="Account">
            <ThemeToggle />
            <Link href="/compare" className="relative hidden h-10 w-10 place-items-center rounded-full hover:bg-muted sm:grid" aria-label={`Compare (${compare.length})`}>
              <GitCompareArrows className="h-5 w-5" />{ready && compare.length > 0 && <Dot n={compare.length} />}
            </Link>
            <Link href="/wishlist" className="relative hidden h-10 w-10 place-items-center rounded-full hover:bg-muted sm:grid" aria-label={`Wishlist (${wishlist.length})`}>
              <Heart className="h-5 w-5" />{ready && wishlist.length > 0 && <Dot n={wishlist.length} />}
            </Link>
            {features.customerAccounts && <Link href="/account" className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted" aria-label="My account"><User className="h-5 w-5" /></Link>}
            <Link href="/cart" className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-muted" aria-label={`Cart (${count} items)`}>
              <ShoppingBag className="h-5 w-5" />{ready && count > 0 && <Dot n={count} />}
            </Link>
          </nav>
        </div>
        <form onSubmit={submit} role="search" className="container pb-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search Newcastle products" aria-label="Search products" className="h-10 w-full rounded-full border-0 bg-cloud pl-11 pr-4 text-base lg:text-sm outline-none focus:ring-2 focus:ring-electric/40 dark:bg-muted" />
          </div>
        </form>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="container flex h-11 items-center justify-center gap-1 text-[13px]">
            {mainNav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                  className={cn("rounded-full px-3.5 py-2 transition-colors duration-300 hover:text-foreground", active(n.href) ? "text-foreground font-medium" : "text-foreground/65", n.label === "Deals" && "text-flame hover:text-flame-600")}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "visible" : "invisible")} aria-hidden={!open}>
        <div className={cn("absolute inset-0 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <aside role="dialog" aria-modal="true" aria-label="Menu" className={cn("absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-16 items-center justify-between border-b px-4">
            <span className="font-display text-lg font-semibold">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
          </div>
          <ul className="flex-1 overflow-y-auto p-3">
            {mainNav.map((n) => (
              <li key={n.href}><Link href={n.href} className={cn("block rounded-xl px-4 py-3.5 text-base font-medium", active(n.href) ? "bg-electric-50 text-electric dark:bg-electric/10" : "hover:bg-muted")}>{n.label}</Link></li>
            ))}
            <li className="my-2 border-t" />
            {[["Track order", "/track"], ["Compare", "/compare"], ["Wishlist", "/wishlist"], ["Book installation", "/installation"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="block rounded-xl px-4 py-3 text-muted-foreground hover:bg-muted">{l}</Link></li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}

const Dot = ({ n, accent }: { n: number; accent?: boolean }) => (
  <span className={cn("absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold text-white", accent ? "bg-flame" : "bg-electric")}>{n > 99 ? "99+" : n}</span>
);
