"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/components/cart/store";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/product/rating";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import { toCartProduct } from "@/components/product/to-cart-product";

export default function ComparePage() {
  const { compare, toggleCompare, clearCompare, add, ready } = useStore();
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    if (!ready) return;
    if (!compare.length) { setItems([]); return; }
    fetch(`/api/products?ids=${compare.map((c) => c.id).join(",")}`).then((r) => r.json()).then((d) => setItems(d.items));
  }, [ready, compare]);

  const specKeys = Array.from(new Set(items.flatMap((p) => Object.keys(p.specs))));
  return (
    <section className="container py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Compare products</h1>
        {compare.length > 0 && <Button variant="ghost" onClick={clearCompare}>Clear all</Button>}
      </div>
      {ready && !compare.length && (
        <div className="mt-8 rounded-[28px] bg-cloud dark:bg-muted p-12 text-center"><p className="text-lg font-semibold">Nothing to compare yet</p><p className="mt-2 text-muted-foreground">Tap the compare icon on up to 4 products to see them side by side.</p><Link href="/shop" className="mt-6 inline-block font-semibold text-electric">Browse products →</Link></div>
      )}
      {items.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-[28px] bg-white shadow-card dark:bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th className="w-40 p-4 text-left align-bottom text-muted-foreground" scope="col"><span className="sr-only">Attribute</span></th>
                {items.map((p) => (
                  <th key={p.id} scope="col" className="p-4 text-left align-top font-normal">
                    <div className="relative">
                      <button onClick={() => toggleCompare(toCartProduct(p))} className="absolute right-0 top-0 rounded-full bg-background p-1 shadow" aria-label={`Remove ${p.name}`}><X className="h-4 w-4" /></button>
                      <Image src={p.images[0]} alt="" width={160} height={160} className="aspect-square w-full max-w-[160px] rounded-2xl object-cover" />
                      <Link href={`/product/${p.slug}`} className="mt-3 block font-semibold hover:text-electric">{p.name}</Link>
                      <p className="mt-1 text-lg font-semibold">{formatNaira(p.price)}</p>
                      <Button size="sm" className="mt-3" disabled={!p.stock} onClick={() => add(toCartProduct(p))}>Add to cart</Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <Row label="Brand" vals={items.map((p) => p.brand)} />
              <tr><th scope="row" className="p-4 text-left font-medium text-muted-foreground">Rating</th>{items.map((p) => <td key={p.id} className="p-4"><Rating value={p.rating} count={p.reviewCount} /></td>)}</tr>
              <Row label="Availability" vals={items.map((p) => (p.stock ? `In stock (${p.stock})` : "Out of stock"))} />
              <Row label="Warranty" vals={items.map((p) => p.warranty)} />
              {specKeys.map((k) => <Row key={k} label={k} vals={items.map((p) => p.specs[k] ?? "—")} />)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
const Row = ({ label, vals }: { label: string; vals: string[] }) => (
  <tr className="even:bg-muted/40"><th scope="row" className="p-4 text-left font-medium text-muted-foreground">{label}</th>{vals.map((v, i) => <td key={i} className="p-4">{v}</td>)}</tr>
);
