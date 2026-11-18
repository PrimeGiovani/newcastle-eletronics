import "server-only";
import { createAdminClient } from "./supabase/server";
import { verifyTransaction, type PaystackTransaction } from "./paystack";
import { receiptHtml, sendEmail } from "./email";

/**
 * Idempotently confirms a payment. Called by BOTH the webhook and the browser callback;
 * whichever arrives first wins, the other is a no-op. Stock is decremented atomically
 * inside the `confirm_order_payment` Postgres function.
 */
export async function confirmPayment(reference: string, trx?: PaystackTransaction) {
  const sb = createAdminClient();
  const tx = trx ?? (await verifyTransaction(reference));
  const { data: order } = await sb.from("orders").select("id, reference, total, status, admin_notes, user_id, email, customer_name, subtotal, shipping_fee, discount").eq("reference", reference).single();
  if (!order) return { ok: false as const, reason: "order_not_found" };

  // A late payment (e.g. a delayed bank transfer) can arrive after the daily cleanup cron
  // auto-cancelled the order. The customer has paid, so re-open the order and fulfil it.
  if (order.status === "cancelled" && order.admin_notes?.startsWith("Auto-cancelled") && tx.status === "success") {
    await sb.from("orders").update({ status: "pending", admin_notes: "Re-opened: payment received after auto-cancel" }).eq("id", order.id).eq("status", "cancelled");
    await sb.from("order_events").insert({ order_id: order.id, status: "pending", note: "Late payment received – order re-opened" });
    order.status = "pending";
  }
  if (order.status !== "pending") return { ok: true as const, order, already: true };

  if (tx.status !== "success") {
    await sb.from("payments").upsert({ order_id: order.id, reference, provider: "paystack", status: tx.status, amount: tx.amount / 100, channel: tx.channel, raw: tx }, { onConflict: "reference" });
    return { ok: false as const, reason: tx.status };
  }
  if (tx.currency !== "NGN" || tx.amount !== Math.round(Number(order.total) * 100)) {
    await sb.from("orders").update({ status: "cancelled", admin_notes: `Amount mismatch: paid ${tx.amount / 100}` }).eq("id", order.id);
    return { ok: false as const, reason: "amount_mismatch" };
  }

  const { error } = await sb.rpc("confirm_order_payment", {
    p_order_id: order.id, p_reference: reference, p_amount: tx.amount / 100, p_channel: tx.channel, p_paid_at: tx.paid_at, p_raw: tx,
  });
  if (error) throw error;

  if (order.user_id && tx.authorization?.reusable) {
    const a = tx.authorization;
    await sb.from("payment_methods").upsert({
      user_id: order.user_id, provider: "paystack", authorization_code: a.authorization_code, signature: a.signature,
      brand: a.card_type, last4: a.last4, exp_month: a.exp_month, exp_year: a.exp_year, bank: a.bank, channel: a.channel, email: tx.customer.email,
    }, { onConflict: "user_id,signature" });
  }

  const { data: items } = await sb.from("order_items").select("name, quantity, unit_price").eq("order_id", order.id);
  const html = receiptHtml({ ...order, total: Number(order.total), subtotal: Number(order.subtotal), shipping_fee: Number(order.shipping_fee), discount: Number(order.discount), items: (items ?? []).map((i) => ({ ...i, unit_price: Number(i.unit_price) })) });
  await sendEmail(order.email, `Receipt for order ${order.reference}`, html);
  if (process.env.ADMIN_NOTIFY_EMAIL) await sendEmail(process.env.ADMIN_NOTIFY_EMAIL, `New paid order ${order.reference} – ₦${Number(order.total).toLocaleString()}`, html);
  return { ok: true as const, order };
}
