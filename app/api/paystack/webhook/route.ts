import { NextResponse } from "next/server";
import { isValidWebhookSignature, type PaystackTransaction } from "@/lib/paystack";
import { confirmPayment } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Paystack → Dashboard → Settings → API Keys & Webhooks → Webhook URL:
 *   https://YOUR_DOMAIN/api/paystack/webhook
 * Signature is verified (HMAC-SHA512). We still re-verify the transaction via API before fulfilling.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!isValidWebhookSignature(raw, req.headers.get("x-paystack-signature"))) return new NextResponse("Invalid signature", { status: 401 });

  const event = JSON.parse(raw) as { event: string; data: PaystackTransaction & { transaction_reference?: string } };
  try {
    switch (event.event) {
      case "charge.success":
        await confirmPayment(event.data.reference); // re-verifies with Paystack API
        break;
      case "refund.processed": {
        const ref = event.data.transaction_reference ?? event.data.reference;
        const sb = createAdminClient();
        const { data: o } = await sb.from("orders").update({ status: "refunded" }).eq("reference", ref).select("id").single();
        if (o) await sb.from("order_events").insert({ order_id: o.id, status: "refunded", note: "Refund processed by Paystack" });
        break;
      }
    }
  } catch (e) {
    console.error("webhook error", e);
    return new NextResponse("Error", { status: 500 }); // Paystack will retry
  }
  return NextResponse.json({ received: true });
}
