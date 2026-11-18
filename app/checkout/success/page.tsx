import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Download, Package, XCircle } from "lucide-react";
import { confirmPayment } from "@/lib/orders";
import { buttonVariants } from "@/components/ui/button";
import { ClearCart } from "./clear-cart";
import { waLink } from "@/lib/config";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ reference?: string; trxref?: string }> }) {
  const sp = await searchParams;
  const ref = (sp.reference ?? sp.trxref ?? "").slice(0, 64);
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
          <h1 className="mt-5 font-display text-3xl font-semibold">Thank you! Your order is confirmed.</h1>
          <p className="mt-3 text-muted-foreground">Order <b className="text-foreground">{ref}</b> has been paid. A receipt has been emailed to you, and we'll notify you when it ships.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/track?ref=${ref}`} className={buttonVariants({ size: "lg" })}><Package />Track order</Link>
            <a href={`/api/orders/${ref}/invoice`} className={buttonVariants({ variant: "outline", size: "lg" })}><Download />Download invoice</a>
          </div>
          <Link href="/shop" className="mt-6 inline-block text-sm font-semibold text-electric">Continue shopping →</Link>
        </>
      ) : (
        <>
          <XCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-5 font-display text-3xl font-semibold">We couldn't confirm your payment</h1>
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
