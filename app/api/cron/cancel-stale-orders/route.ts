import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { inStoreExpiredHtml, sendEmail } from "@/lib/email";
import { verifyTransaction, type PaystackTransaction } from "@/lib/paystack";
import { confirmPayment } from "@/lib/orders";

/**
 * Daily housekeeping (03:00 UTC – see vercel.json; Vercel Hobby allows daily crons):
 *  1. Paystack orders still unpaid after 24h are checked with Paystack first: if the customer did pay
 *     (a missed confirmation), the order is confirmed and the emails go out; otherwise it's cancelled.
 *  2. Pay-at-store reservations past their 3-day hold → cancelled, items released, customer emailed.
 * Idempotent: missing a day or running twice is harmless.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ skipped: "database not configured" });
  const sb = createAdminClient();

  // 1. Unpaid Paystack orders (oldest first; anything left over is handled the next day)
  const cutoff = new Date(Date.now() - 24 * 36e5).toISOString();
  const { data: stale, error } = await sb.from("orders").select("id, reference, created_at")
    .eq("status", "pending").eq("payment_method", "paystack").lt("created_at", cutoff).order("created_at").limit(100);
  if (error) { console.error("cron paystack", error); return NextResponse.json({ error: error.message }, { status: 500 }); }
  let cancelled = 0, recovered = 0;
  const handle = async (o: { id: string; reference: string; created_at: string }) => {
    if (process.env.PAYSTACK_SECRET_KEY) {
      let tx: PaystackTransaction | null;
      try { tx = await verifyTransaction(o.reference); }
      catch (e) {
        if (!/not found/i.test((e as Error).message)) { console.error("cron verify", o.reference, e); return; } // Paystack unreachable: try again tomorrow
        tx = null; // Paystack has no such payment: the customer never paid
      }
      if (tx?.status === "success") {
        try { if ((await confirmPayment(o.reference, tx)).ok) recovered++; } catch (e) { console.error("cron confirm", o.reference, e); }
        return; // the customer paid: never auto-cancel
      }
      const settling = ["ongoing", "pending", "processing", "queued"].includes(tx?.status ?? "");
      if (settling && Date.parse(o.created_at) > Date.now() - 3 * 864e5) return; // transfer still settling: check again tomorrow
    }
    const { data: c } = await sb.from("orders").update({ status: "cancelled", admin_notes: "Auto-cancelled: unpaid after 24h" })
      .eq("id", o.id).eq("status", "pending").select("id");
    if (c?.length) { cancelled++; await sb.from("order_events").insert({ order_id: o.id, status: "cancelled", note: "Payment not received within 24 hours" }); }
  };
  for (let i = 0; i < (stale ?? []).length; i += 5) await Promise.all(stale!.slice(i, i + 5).map(handle));

  // 2. Expired pay-at-store holds
  const { data: expired } = await sb.from("orders").select("id, reference, email, customer_name")
    .eq("status", "pending").eq("payment_method", "in_store").lt("hold_until", new Date().toISOString());
  let released = 0;
  for (const o of expired ?? []) {
    const { data: ok } = await sb.rpc("release_in_store_hold", { p_order_id: o.id, p_note: "Reservation expired – not paid within 3 days" });
    if (ok) { released++; await sendEmail(o.email, `Reservation ${o.reference} has expired`, inStoreExpiredHtml(o)); }
  }
  return NextResponse.json({ cancelledPaystack: cancelled, confirmedLatePayments: recovered, releasedInStore: released });
}
