import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** Hourly (vercel.json): cancel unpaid orders older than 24h. Protected by CRON_SECRET (Vercel sends it automatically). */
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  const sb = createAdminClient();
  const cutoff = new Date(Date.now() - 24 * 36e5).toISOString();
  const { data } = await sb.from("orders").update({ status: "cancelled", admin_notes: "Auto-cancelled: unpaid after 24h" }).eq("status", "pending").lt("created_at", cutoff).select("id");
  if (data?.length) await sb.from("order_events").insert(data.map((o) => ({ order_id: o.id, status: "cancelled", note: "Payment not received within 24 hours" })));
  return NextResponse.json({ cancelled: data?.length ?? 0 });
}
