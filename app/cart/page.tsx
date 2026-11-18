"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useStore } from "@/components/cart/store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { STATES, shippingQuote, estimateDateRange, FREE_SHIPPING_THRESHOLD } from "@/lib/nigeria";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const s = useStore();
  const [state, setState] = useState("Lagos");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const ship = shippingQuote(state, s.subtotal - (coupon?.discount ?? 0));
  const total = s.subtotal - (coupon?.discount ?? 0) + ship.fee;

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault(); setCouponErr("");
    const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, subtotal: s.subtotal }) });
    const j = await res.json();
    if (!res.ok) { setCoupon(null); setCouponErr(j.error); return; }
    setCoupon({ code: j.code, discount: j.discount }); sessionStorage.setItem("nce:coupon", j.code);
  }

  if (!s.ready) return <div className="container py-20" aria-busy="true" />;
  return (
    <section className="container py-10">
      <h1 className="font-display text-3xl font-semibold">Your cart</h1>
      {!s.cart.length ? (
        <div className="mt-8 rounded-[28px] bg-cloud dark:bg-muted p-14 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
          <Link href="/shop" className={buttonVariants({ className: "mt-6" })}>Start shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <ul className="divide-y rounded-[28px] bg-white shadow-card dark:bg-card">
            {s.cart.map((l) => (
              <li key={l.id} className="flex gap-4 p-4 sm:p-5">
                <Image src={l.image} alt="" width={112} height={112} className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" />
                <div className="flex flex-1 flex-col">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{l.brand}</p>
                  <Link href={`/product/${l.slug}`} className="font-semibold hover:text-electric">{l.name}</Link>
                  <p className="mt-1 font-semibold">{formatNaira(l.price)}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                    <div className="flex items-center rounded-full border">
                      <button className="grid h-9 w-9 place-items-center disabled:opacity-40" onClick={() => s.setQty(l.id, l.quantity - 1)} disabled={l.quantity <= 1} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                      <button className="grid h-9 w-9 place-items-center disabled:opacity-40" onClick={() => s.setQty(l.id, l.quantity + 1)} disabled={l.quantity >= l.stock} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button onClick={() => s.saveForLater(l.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Bookmark className="h-4 w-4" />Save for later</button>
                    <button onClick={() => s.remove(l.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" />Remove</button>
                  </div>
                </div>
                <p className="hidden font-semibold sm:block">{formatNaira(l.price * l.quantity)}</p>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-5 rounded-[28px] bg-white shadow-card dark:bg-card p-6 lg:sticky lg:top-36">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <form onSubmit={applyCoupon} className="flex gap-2">
              <label htmlFor="coupon" className="sr-only">Coupon code</label>
              <Input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="h-10" />
              <Button type="submit" variant="secondary" size="sm" className="h-10"><Tag />Apply</Button>
            </form>
            {couponErr && <p role="alert" className="text-sm text-destructive">{couponErr}</p>}
            <div>
              <label htmlFor="ship-state" className="mb-1.5 block text-sm font-medium">Estimate delivery to</label>
              <Select id="ship-state" value={state} onChange={(e) => setState(e.target.value)} className="h-10">{STATES.map((x) => <option key={x.name}>{x.name}</option>)}</Select>
              <p className="mt-1.5 text-xs text-muted-foreground">Arrives {estimateDateRange(ship.days)}</p>
            </div>
            <dl className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal ({s.count} items)</dt><dd>{formatNaira(s.subtotal)}</dd></div>
              {coupon && <div className="flex justify-between text-emerald-600"><dt>Discount ({coupon.code})</dt><dd>-{formatNaira(coupon.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery (standard)</dt><dd>{ship.fee ? formatNaira(ship.fee) : "FREE"}</dd></div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Estimated total</dt><dd>{formatNaira(total)}</dd></div>
            </dl>
            {s.subtotal < FREE_SHIPPING_THRESHOLD && <p className="rounded-xl bg-electric-50 p-3 text-xs text-electric dark:bg-electric/10">Add {formatNaira(FREE_SHIPPING_THRESHOLD - s.subtotal)} more for free standard delivery.</p>}
            <Link href="/checkout" className={buttonVariants({ variant: "accent", size: "lg", className: "w-full" })}>Proceed to checkout</Link>
            <p className="text-center text-xs text-muted-foreground">🔒 Secure payment by Paystack</p>
          </aside>
        </div>
      )}

      {s.saved.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-semibold">Saved for later ({s.saved.length})</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.saved.map((l) => (
              <li key={l.id} className="rounded-2xl border p-4">
                <Image src={l.image} alt="" width={240} height={240} className="aspect-square w-full rounded-xl object-cover" />
                <p className="mt-3 line-clamp-2 text-sm font-semibold">{l.name}</p><p className="font-semibold">{formatNaira(l.price)}</p>
                <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => s.moveToCart(l.id)}>Move to cart</Button><Button size="sm" variant="ghost" onClick={() => s.removeSaved(l.id)}>Remove</Button></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
