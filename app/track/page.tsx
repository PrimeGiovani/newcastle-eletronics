import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, Circle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";
import { formatNaira, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Track Your Order", description: "Track your Newcastle Electronics order with your order number and email or phone.", alternates: { canonical: "/track" } };
export const dynamic = "force-dynamic";

const FLOW_DELIVERY = ["pending", "paid", "processing", "shipped", "delivered"];
const FLOW_PICKUP = ["pending", "paid", "ready_for_pickup", "collected"];
const LABEL: Record<string, string> = { pending: "Order placed", paid: "Payment confirmed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded", return_requested: "Swap requested", returned: "Swapped", ready_for_pickup: "Ready for pickup", collected: "Collected" };

type Tracked = { reference: string; status: string; payment_method?: string; hold_until?: string | null; delivery_method?: string; created_at: string; total: number; tracking_number: string | null; carrier: string | null; eta_from: string | null; eta_to: string | null; state: string; items: { name: string; quantity: number; image: string }[]; events: { status: string; note: string; at: string }[] };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ ref?: string; contact?: string }> }) {
  const { ref = "", contact = "" } = await searchParams;
  let order: Tracked | null = null; let searched = false;
  if (ref && contact && isSupabaseConfigured()) {
    searched = true;
    const { data } = await createPublicClient().rpc("track_order", { p_reference: ref.slice(0, 64), p_contact: contact.slice(0, 100) });
    order = data as Tracked | null;
  }
  const FLOW = order?.delivery_method === "pickup" ? FLOW_PICKUP : FLOW_DELIVERY;
  const idx = order ? FLOW.indexOf(order.status) : -1;

  return (
    <section className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-semibold">Track your order</h1>
      <form className="mt-6 grid gap-4 rounded-[28px] bg-white shadow-card dark:bg-card p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><Label htmlFor="ref">Order number</Label><Input id="ref" name="ref" defaultValue={ref} placeholder="NCE-XXXXXX-XXXX" required /></div>
        <div><Label htmlFor="contact">Email or phone</Label><Input id="contact" name="contact" defaultValue={contact} required /></div>
        <Button type="submit">Track</Button>
      </form>
      {searched && !order && <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-destructive dark:bg-red-950/30">We couldn't find an order with those details. Please check and try again.</p>}
      {order && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-muted/50 p-6">
            <div><p className="text-sm text-muted-foreground">Order</p><p className="text-lg font-semibold">{order.reference}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><p className="text-lg font-semibold text-electric">{order.payment_method === "in_store" && order.status === "pending" ? "Awaiting payment at store" : LABEL[order.status]}</p></div>
            {order.eta_from && <div><p className="text-sm text-muted-foreground">Estimated delivery</p><p className="font-semibold">{new Date(order.eta_from).toLocaleDateString("en-NG", { dateStyle: "medium" })} – {new Date(order.eta_to!).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div>}
            {order.tracking_number && <div><p className="text-sm text-muted-foreground">{order.carrier ?? "Carrier"}</p><p className="font-semibold">{order.tracking_number}</p></div>}
          </div>
          {order.payment_method === "in_store" && order.status === "pending" && (
            <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Reserved – please pay at our showroom{order.hold_until ? ` by ${new Date(order.hold_until).toLocaleDateString("en-NG", { dateStyle: "full" })}` : ""}. Cash, POS or transfer. Bring your order number.</p>
          )}
          {idx >= 0 && (
            <ol className={cn("grid gap-2", FLOW.length === 4 ? "grid-cols-4" : "grid-cols-5")} aria-label="Order progress">
              {FLOW.map((s, i) => (
                <li key={s} className="text-center text-xs">
                  {i <= idx ? <CheckCircle2 className="mx-auto h-7 w-7 text-electric" /> : <Circle className="mx-auto h-7 w-7 text-muted-foreground" />}
                  <span className={cn("mt-2 block", i <= idx ? "font-semibold" : "text-muted-foreground")}>{LABEL[s]}</span>
                </li>
              ))}
            </ol>
          )}
          <ul className="divide-y rounded-[28px] bg-white shadow-card dark:bg-card">
            {order.items?.map((it, i) => <li key={i} className="flex items-center gap-4 p-4">{it.image ? <Image src={it.image} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-cover" /> : <Package />}<span className="flex-1">{it.name}</span><span>× {it.quantity}</span></li>)}
            <li className="flex justify-between p-4 font-semibold"><span>Total</span><span>{formatNaira(Number(order.total))}</span></li>
          </ul>
          <ol className="space-y-3 border-l-2 pl-5">
            {order.events?.map((e, i) => <li key={i}><p className="font-semibold">{LABEL[e.status]}</p><p className="text-sm text-muted-foreground">{e.note} · {new Date(e.at).toLocaleString("en-NG")}</p></li>)}
          </ol>
        </div>
      )}
    </section>
  );
}
