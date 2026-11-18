"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FileText, GitCompareArrows, Heart, Minus, Plus, Share2, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type CartProduct } from "@/components/cart/store";
import { waLink } from "@/lib/config";
import { cn } from "@/lib/utils";

export function PurchasePanel({ product }: { product: CartProduct }) {
  const router = useRouter();
  const { add, toggleWishlist, inWishlist, toggleCompare, inCompare, notify } = useStore();
  const [qty, setQty] = useState(1);
  const out = product.stock === 0;
  const max = Math.min(product.stock, 50);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: product.name, url }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(url); notify("Link copied to clipboard"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center rounded-full border">
          <button className="grid h-10 w-10 place-items-center disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1 || out} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
          <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
          <button className="grid h-10 w-10 place-items-center disabled:opacity-40" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max || out} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="lg" disabled={out} onClick={() => add(product, qty)}><ShoppingBag />Add to Cart</Button>
        <Button size="lg" variant="electric" disabled={out} onClick={() => { add(product, qty); router.push("/checkout"); }}><Zap />Buy Now</Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="outline" size="sm" onClick={() => toggleWishlist(product)} aria-pressed={inWishlist(product.id)}>
          <Heart className={cn(inWishlist(product.id) && "fill-flame text-flame")} />Wishlist
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleCompare(product)} aria-pressed={inCompare(product.id)}>
          <GitCompareArrows className={cn(inCompare(product.id) && "text-electric")} />Compare
        </Button>
        <Link href={`/contact?type=quote&product=${encodeURIComponent(product.name)}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-ink/15 text-[13px] font-medium transition hover:bg-ink/5 dark:border-white/20"><FileText className="h-4 w-4" />Request Quote</Link>
        <Button variant="outline" size="sm" onClick={share}><Share2 />Share</Button>
      </div>
      <a href={waLink("product", `${product.name} – ${typeof window !== "undefined" ? window.location.href : ""}`)} target="_blank" rel="noopener noreferrer"
        className="flex h-11 items-center justify-center gap-2 rounded-full text-[15px] text-electric hover:underline">
        Ask about this product on WhatsApp ›
      </a>

      {/* Sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 p-3 pr-20 backdrop-blur lg:hidden">
        <Button className="flex-1" disabled={out} onClick={() => add(product, qty)}>Add to Cart</Button>
        <Button className="flex-1" variant="accent" disabled={out} onClick={() => { add(product, qty); router.push("/checkout"); }}>Buy Now</Button>
      </div>
    </div>
  );
}
