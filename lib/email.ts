import "server-only";
import { escapeHtml } from "./security";
import { formatNaira } from "./utils";
import { site } from "./config";

/** `to` may be one address or several separated by commas (e.g. ADMIN_NOTIFY_EMAIL="admin@…, sales@…"). */
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.info(`[email skipped – no RESEND_API_KEY] ${subject} → ${to}`); return; }
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`, to: to.split(",").map((t) => t.trim()).filter(Boolean), subject, html }),
  }).catch((e) => console.error("email failed", e));
}

type ReceiptOrder = { reference: string; customer_name: string; total: number; subtotal: number; shipping_fee: number; discount: number; items: { name: string; quantity: number; unit_price: number }[] };
export function receiptHtml(o: ReceiptOrder) {
  const rows = o.items.map((i) => `<tr><td style="padding:8px 0">${escapeHtml(i.name)} × ${i.quantity}</td><td align="right">${formatNaira(i.unit_price * i.quantity)}</td></tr>`).join("");
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1C1F26">
  <h2 style="color:#0A1F44">Thank you for your order, ${escapeHtml(o.customer_name)}!</h2>
  <p>Order <b>${escapeHtml(o.reference)}</b> has been paid successfully.</p>
  <table width="100%" style="border-collapse:collapse;border-top:1px solid #eee">${rows}
  <tr><td style="padding-top:12px">Subtotal</td><td align="right">${formatNaira(o.subtotal)}</td></tr>
  <tr><td>Delivery</td><td align="right">${formatNaira(o.shipping_fee)}</td></tr>
  ${o.discount ? `<tr><td>Discount</td><td align="right">-${formatNaira(o.discount)}</td></tr>` : ""}
  <tr><td style="font-weight:bold;padding-top:8px">Total</td><td align="right" style="font-weight:bold">${formatNaira(o.total)}</td></tr></table>
  <p><a href="${site.url}/track?ref=${encodeURIComponent(o.reference)}" style="color:#1E6BFF">Track your order</a> · <a href="${site.url}/api/orders/${encodeURIComponent(o.reference)}/invoice" style="color:#1E6BFF">Download invoice</a></p>
  <p style="color:#666;font-size:12px">${site.name} · Call ${site.phone} · WhatsApp ${site.whatsappDisplay} · ${site.email}</p></div>`;
}

const wrap = (inner: string) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1D1D1F">${inner}
  <p style="color:#666;font-size:12px;margin-top:24px">${site.name} · ${site.addressLine}<br>Call ${site.phone} · WhatsApp ${site.whatsappDisplay} · ${site.email}</p></div>`;
const itemRows = (items: { name: string; quantity: number; unit_price: number }[]) =>
  items.map((i) => `<tr><td style="padding:6px 0">${escapeHtml(i.name)} × ${i.quantity}</td><td align="right">${formatNaira(i.unit_price * i.quantity)}</td></tr>`).join("");
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Pay-at-store: sent immediately when the reservation is made. */
export function inStoreReservedHtml(o: { reference: string; customer_name: string; total: number; hold_until: string; items: { name: string; quantity: number; unit_price: number }[] }) {
  return wrap(`<h2 style="color:#1D1D1F">Order received – please pay at our showroom</h2>
  <p>Hi ${escapeHtml(o.customer_name)}, thank you for your order. Your items are <b>reserved for you until ${fmtDate(o.hold_until)}</b>.</p>
  <p style="font-size:18px">Order number: <b>${escapeHtml(o.reference)}</b></p>
  <table width="100%" style="border-collapse:collapse;border-top:1px solid #eee">${itemRows(o.items)}
  <tr><td style="padding-top:10px;font-weight:bold">Amount to pay at the showroom</td><td align="right" style="font-weight:bold">${formatNaira(o.total)}</td></tr></table>
  <p><b>Where:</b> ${site.addressLine}<br><b>Opening hours:</b> ${site.hours}<br><b>Pay by:</b> cash, POS (card) or bank transfer</p>
  <p>Please bring this order number. If you can't make it before the date above, the reservation is cancelled automatically – just contact us.</p>
  <p><a href="${site.url}/track?ref=${encodeURIComponent(o.reference)}" style="color:#0071E3">Track your order</a></p>`);
}
/** Pay-at-store: reservation expired. */
export function inStoreExpiredHtml(o: { reference: string; customer_name: string }) {
  return wrap(`<h2>Your reservation has expired</h2><p>Hi ${escapeHtml(o.customer_name)}, we didn't receive payment for order <b>${escapeHtml(o.reference)}</b> within 3 days, so the reserved items have been released.</p>
  <p>Still interested? Place a new order at <a href="${site.url}" style="color:#0071E3">${site.url.replace("https://", "")}</a> or WhatsApp us on ${site.whatsappLocal}.</p>`);
}
/** Status update email (admin "Email customer" tick). */
export function statusUpdateHtml(o: { reference: string; customer_name: string }, status: string, extra: { tracking?: string; carrier?: string; pickup?: boolean }) {
  const msg: Record<string, string> = {
    processing: "We're preparing your order.",
    ready_for_pickup: `Good news – your order is <b>ready for pickup</b> at our showroom: ${site.addressLine} (${site.hours}). Please bring your order number.`,
    collected: "Thank you for collecting your order. We hope you enjoy your Newcastle Electronics product!",
    shipped: `Your order is on its way.${extra.tracking ? ` Tracking: ${escapeHtml(extra.carrier ?? "")} ${escapeHtml(extra.tracking)}` : ""}`,
    delivered: "Your order has been delivered. Thank you for shopping with Newcastle Electronics!",
    cancelled: "Your order has been cancelled. If you have questions, please contact us.",
    refunded: "Your refund has been processed.",
    returned: "Your swap has been completed.",
  };
  return wrap(`<p>Hi ${escapeHtml(o.customer_name)},</p><p>${msg[status] ?? `Your order status is now <b>${escapeHtml(status.replace(/_/g, " "))}</b>.`}</p>
  <p>Order <b>${escapeHtml(o.reference)}</b> · <a href="${site.url}/track?ref=${encodeURIComponent(o.reference)}" style="color:#0071E3">Track your order</a></p>
  ${status === "collected" || status === "delivered" ? `<p style="color:#666">Our <a href="${site.url}/about#policies" style="color:#0071E3">7-day swap policy</a> applies to unused items in good condition.</p>` : ""}`);
}
