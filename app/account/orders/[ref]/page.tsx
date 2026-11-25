import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, MapPin, Package } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "../../status-badge";
import { Reorder } from "./reorder";
import { requestReturn } from "../../actions";

export default async function OrderDetail({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const user = await getUser();
  const sb = await createClient();
  const { data: o } = await sb.from("orders").select("*, order_items(*), order_events(*)").eq("reference", ref).eq("user_id", user!.id).single();
  if (!o) notFound();
  const a = o.shipping_address as Record<string, string>;
  type Item = { id: string; product_id: string; name: string; quantity: number; unit_price: number; image_url: string };
  const items = o.order_items as Item[];
  const paid = !["pending", "cancelled"].includes(o.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl font-semibold">Order {o.reference}</h1><p className="text-sm text-muted-foreground">Placed {new Date(o.created_at).toLocaleString("en-NG")}</p></div>
        <StatusBadge status={o.status} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={`/track?ref=${o.reference}&contact=${encodeURIComponent(o.email)}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Package />Track</Link>
        {paid && <a href={`/api/orders/${o.reference}/invoice`} className={buttonVariants({ variant: "outline", size: "sm" })}><Download />Invoice</a>}
        <Reorder ids={items.map((i) => i.product_id).filter(Boolean)} />
      </div>
      <ul className="divide-y rounded-[28px] bg-white shadow-card dark:bg-card">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 p-4">
            {i.image_url && <Image src={i.image_url} alt="" width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />}
            <span className="flex-1">{i.name}<span className="block text-sm text-muted-foreground">{i.quantity} × {formatNaira(Number(i.unit_price))}</span></span>
            <b>{formatNaira(i.quantity * Number(i.unit_price))}</b>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[28px] bg-white shadow-card dark:bg-card p-5 text-sm">{a.pickup
          ? <><p className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" />Showroom pickup</p>{a.location}<br /><span className="text-muted-foreground">We'll call you when your order is ready.</span></>
          : <><p className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" />Delivery address</p>{a.fullName}<br />{a.line1} {a.line2}<br />{a.city}, {a.lga}, {a.state}<br />{a.phone}</>}
          {o.shipping_to_be_arranged && <p className="mt-3 text-muted-foreground">Newcastle will contact you to arrange delivery for this order.</p>}
        </div>
        <dl className="space-y-1.5 rounded-[28px] bg-white shadow-card dark:bg-card p-5 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(+o.subtotal)}</dd></div>
          {+o.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>-{formatNaira(+o.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{a.pickup ? "Free pickup" : o.shipping_to_be_arranged ? "To be arranged" : "Free"}</dd></div>
          <div className="flex justify-between border-t pt-2 font-semibold"><dt>Total</dt><dd>{formatNaira(+o.total)}</dd></div>
        </dl>
      </div>
      {o.status === "delivered" && (
        <form action={requestReturn} className="space-y-3 rounded-[28px] bg-white shadow-card dark:bg-card p-5">
          <input type="hidden" name="orderId" value={o.id} />
          <label className="block text-sm font-semibold" htmlFor="reason">Request a swap (within 7 days of delivery)</label>
          <p className="text-sm text-muted-foreground">Swaps only – no cash refunds. The product must be unused and in good condition: no scratches, no dents, and fully functioning.</p>
          <textarea id="reason" name="reason" required minLength={10} className="w-full rounded-xl border bg-background p-3 text-sm" placeholder="Which item would you like to swap, and what would you like instead?" />
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" required className="mt-1 accent-electric" />I confirm the product is unused, has no scratches or dents and is fully functioning.</label>
          <button className={buttonVariants({ variant: "outline", size: "sm" })}>Submit swap request</button>
        </form>
      )}
    </div>
  );
}
