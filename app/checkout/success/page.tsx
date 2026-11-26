import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock, Download, MapPin, Package, Store, XCircle } from "lucide-react";
import { confirmPayment } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { ClearCart } from "./clear-cart";
import { site, waLink } from "@/lib/config";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ reference?: string; trxref?: string }> }) {
  const sp = await searchParams;
  const ref = (sp.reference ?? sp.trxref ?? "").slice(0, 64);

  // Pay-at-store reservation?
  let inStore: { total: number; hold_until: string; status: string } | null = null;
  if (ref && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data } = await createAdminClient().from("orders").select("payment_method, total, hold_until, status").eq("reference", ref).maybeSingle();
    if (data?.payment_method === "in_store") inStore = { total: Number(data.total), hold_until: data.hold_until, status: data.status };
  }
  if (inStore) {
    const until = inStore.hold_until ? new Date(inStore.hold_until).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" }) : "";
    return (
      <section className="container max-w-2xl py-16 text-center">
        <ClearCart />
        <Store className="mx-auto h-16 w-16 text-electric" strokeWidth={1.5} />
        <h1 className="mt-5 text-3xl font-semibold tracking-tightest">Your order is reserved.</h1>
        <p className="mt-3 text-muted-foreground">Order number <b className="text-foreground">{ref}</b>. We've emailed you the details.</p>
        <div className="mx-auto mt-8 max-w-md space-y-3 rounded-[28px] bg-cloud p-6 text-left text-sm dark:bg-muted">
          <p className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-electric" /><span>Items held until <b>{until}</b>.</span></p>
          <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-electric" /><span>Pay <b>{formatNaira(inStore.total)}</b> at {site.addressLine} · {site.hours}</span></p>
          <p className="flex gap-3"><Store className="h-5 w-5 shrink-0 text-electric" /><span>Pay by cash, POS (card) or bank transfer. Please bring your order number.</span></p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/track?ref=${ref}`} className={buttonVariants({ size: "lg" })}><Package />Track order</Link>
          <a href={waLink("support", ref)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>Questions? WhatsApp us</a>
        </div>
      </section>
    );
  }

  let ok = false, reason = "missing_reference";
  if (ref) {
    try { const r = await confirmPayment(ref); ok = r.ok; reason = r.ok ? "" : r.reason; }
    catch (e) { console.error(e); reason = "verification_error"; }
  }
  return (
    <section className="container max-w-2xl py-16 text-center">
      {ok ? (
        <>
          <ClearCart />
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tightest">Thank you! Your order is confirmed.</h1>
          <p className="mt-3 text-muted-foreground">Order <b className="text-foreground">{ref}</b> has been paid. A receipt has been emailed to you, and we'll let you know when it's on its way or ready for pickup.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/track?ref=${ref}`} className={buttonVariants({ size: "lg" })}><Package />Track order</Link>
            <a href={`/api/orders/${ref}/invoice`} className={buttonVariants({ variant: "outline", size: "lg" })}><Download />Download invoice</a>
          </div>
          <Link href="/shop" className="mt-6 inline-block text-sm font-semibold text-electric">Continue shopping →</Link>
        </>
      ) : (
        <>
          <XCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tightest">We couldn't confirm your payment</h1>
          <p className="mt-3 text-muted-foreground">{reason === "abandoned" ? "The payment was not completed." : "If you were debited, don't worry — we'll confirm automatically within minutes."} Reference: {ref || "—"}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/checkout" className={buttonVariants({ size: "lg" })}>Try again</Link>
            <a href={waLink("support", ref)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "whatsapp", size: "lg" })}>Contact support</a>
          </div>
        </>
      )}
    </section>
  );
}
