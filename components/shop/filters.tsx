"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Brand, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Filters({ categories, brands, hideCategory }: { categories: Category[]; brands: Brand[]; hideCategory?: boolean }) {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const update = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString()); mut(p); p.delete("page");
    start(() => router.replace(`${path}?${p.toString()}`, { scroll: false }));
  };
  const toggle = (key: string, val: string) => update((p) => { p.get(key) === val ? p.delete(key) : p.set(key, val); });
  const selectedBrands = sp.get("brand")?.split(",").filter(Boolean) ?? [];
  const toggleBrand = (slug: string) => update((p) => {
    const next = selectedBrands.includes(slug) ? selectedBrands.filter((b) => b !== slug) : [...selectedBrands, slug];
    next.length ? p.set("brand", next.join(",")) : p.delete("brand");
  });
  const activeCount = ["category", "brand", "min", "max", "rating", "stock", "new", "best", "deals"].filter((k) => sp.has(k)).length;

  const panel = (
    <div className={cn("space-y-7", pending && "opacity-60")}>
      {!hideCategory && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Category</legend>
          <ul className="space-y-1">
            {categories.filter((c) => !c.parentSlug).map((c) => (
              <li key={c.slug}>
                <button onClick={() => toggle("category", c.slug)} className={cn("w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted", sp.get("category") === c.slug && "bg-electric-50 font-semibold text-electric dark:bg-electric/10")}>{c.name}</button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Price (₦)</legend>
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); update((p) => { for (const k of ["min", "max"]) { const v = String(f.get(k) ?? ""); v ? p.set(k, v) : p.delete(k); } }); }}>
          <Input name="min" type="number" min={0} placeholder="Min" defaultValue={sp.get("min") ?? ""} aria-label="Minimum price" className="h-10" />
          <span aria-hidden>–</span>
          <Input name="max" type="number" min={0} placeholder="Max" defaultValue={sp.get("max") ?? ""} aria-label="Maximum price" className="h-10" />
          <Button type="submit" size="sm" variant="secondary">Go</Button>
        </form>
      </fieldset>
      {brands.length > 1 && <fieldset>
        <legend className="mb-3 text-sm font-semibold">Brand</legend>
        <ul className="max-h-60 space-y-2 overflow-y-auto pr-1">
          {brands.map((b) => (
            <li key={b.slug}><label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" checked={selectedBrands.includes(b.slug)} onChange={() => toggleBrand(b.slug)} className="h-4 w-4 rounded accent-electric" />{b.name}
            </label></li>
          ))}
        </ul>
      </fieldset>}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Customer rating</legend>
        {[4, 3].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
            <input type="radio" name="rating" checked={sp.get("rating") === String(r)} onChange={() => toggle("rating", String(r))} className="h-4 w-4 accent-electric" />{r}★ & above
          </label>
        ))}
      </fieldset>
      <fieldset className="space-y-2.5">
        <legend className="mb-3 text-sm font-semibold">Availability & more</legend>
        {[["stock", "In stock only"], ["new", "New arrivals"], ["best", "Best sellers"], ["deals", "On sale"]].map(([k, l]) => (
          <label key={k} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={sp.get(k) === "1"} onChange={() => toggle(k, "1")} className="h-4 w-4 rounded accent-electric" />{l}
          </label>
        ))}
      </fieldset>
      {activeCount > 0 && <Button variant="ghost" size="sm" onClick={() => start(() => router.replace(sp.get("q") ? `${path}?q=${encodeURIComponent(sp.get("q")!)}` : path))}><X />Clear all filters</Button>}
    </div>
  );

  return (
    <>
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}><SlidersHorizontal />Filters{activeCount > 0 && ` (${activeCount})`}</Button>
      <aside className="hidden lg:block" aria-label="Product filters">{panel}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-6 animate-fade-up">
            <div className="mb-6 flex items-center justify-between"><p className="text-lg font-semibold">Filters</p><button onClick={() => setOpen(false)} aria-label="Close filters"><X className="h-5 w-5" /></button></div>
            {panel}
            <Button className="mt-8 w-full" onClick={() => setOpen(false)}>Show results</Button>
          </div>
        </div>
      )}
    </>
  );
}

export function SortSelect() {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted-foreground sm:inline">Sort by</span>
      <Select value={sp.get("sort") ?? "popular"} className="h-10 w-44"
        onChange={(e) => { const p = new URLSearchParams(sp.toString()); p.set("sort", e.target.value); p.delete("page"); router.replace(`${path}?${p}`, { scroll: false }); }}>
        <option value="popular">Most popular</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option><option value="rating">Top rated</option>
      </Select>
    </label>
  );
}
