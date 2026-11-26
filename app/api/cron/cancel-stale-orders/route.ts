import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { inStoreExpiredHtml, sendEmail } from "@/lib/email";

/**
 * Daily housekeeping (03:00 UTC – see vercel.json; Vercel Hobby allows daily crons):
 *  1. Paystack orders never paid after 24h → cancelled (they never reserved stock).
 *  2. Pay-at-store reservations past their 3-day hold → cancelled, items released, customer emailed.
 * Idempotent: missing a day or running twice is harmless.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ skipped: "database not configured" });
  const sb = createAdminClient();

  // 1. Unpaid Paystack orders
  const cutoff = new Date(Date.now() - 24 * 36e5).toISOString();
  const { data: stale, error } = await sb.from("orders")
    .update({ status: "cancelled", admin_notes: "Auto-cancelled: unpaid after 24h" })
    .eq("status", "pending").eq("payment_method", "paystack").lt("created_at", cutoff).select("id");
  if (error) { console.error("cron paystack", error); return NextResponse.json({ error: error.message }, { status: 500 }); }
  if (stale?.length) await sb.from("order_events").insert(stale.map((o) => ({ order_id: o.id, status: "cancelled", note: "Payment not received within 24 hours" })));

  // 2. Expired pay-at-store holds
  const { data: expired } = await sb.from("orders").select("id, reference, email, customer_name")
    .eq("status", "pending").eq("payment_method", "in_store").lt("hold_until", new Date().toISOString());
  let released = 0;
  for (const o of expired ?? []) {
    const { data: ok } = await sb.rpc("release_in_store_hold", { p_order_id: o.id, p_note: "Reservation expired – not paid within 3 days" });
    if (ok) { released++; await sendEmail(o.email, `Reservation ${o.reference} has expired`, inStoreExpiredHtml(o)); }
  }
  return NextResponse.json({ cancelledPaystack: stale?.length ?? 0, releasedInStore: released });
}
