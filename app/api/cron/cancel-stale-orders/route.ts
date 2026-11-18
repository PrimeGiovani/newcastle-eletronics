import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Housekeeping: cancels orders that were created but never paid (customer abandoned Paystack).
 *
 * Schedule: once a day at 03:00 UTC (04:00 Lagos) – see vercel.json. Vercel Hobby only allows
 * daily crons and may fire any time within that hour. Daily is sufficient because pending
 * orders never reserve stock (stock is only deducted when payment is confirmed).
 *
 * Idempotent: running it twice, or missing a day, is harmless.
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` automatically.
 */
export const dynamic = "force-dynamic";
const MAX_AGE_HOURS = 24;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Refuse if the secret isn't configured – otherwise "Bearer undefined" would be accepted.
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ skipped: "database not configured" });

  const sb = createAdminClient();
  const cutoff = new Date(Date.now() - MAX_AGE_HOURS * 36e5).toISOString();
  const { data, error } = await sb.from("orders")
    .update({ status: "cancelled", admin_notes: `Auto-cancelled: unpaid after ${MAX_AGE_HOURS}h` })
    .eq("status", "pending").lt("created_at", cutoff).select("id");
  if (error) { console.error("cron cancel-stale-orders", error); return NextResponse.json({ error: error.message }, { status: 500 }); }

  if (data?.length) {
    await sb.from("order_events").insert(data.map((o) => ({ order_id: o.id, status: "cancelled", note: `Payment not received within ${MAX_AGE_HOURS} hours` })));
  }
  return NextResponse.json({ cancelled: data?.length ?? 0, cutoff });
}
