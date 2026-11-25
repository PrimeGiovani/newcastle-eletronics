import "server-only";
import { escapeHtml } from "./security";
import { formatNaira } from "./utils";
import { site } from "./config";

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.info(`[email skipped – no RESEND_API_KEY] ${subject} → ${to}`); return; }
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`, to, subject, html }),
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
