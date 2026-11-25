import { createAdminClient, getProfile } from "@/lib/supabase/server";
import { escapeHtml } from "@/lib/security";
import { formatNaira } from "@/lib/utils";
import { site } from "@/lib/config";

/**
 * Printable HTML invoice (browser "Save as PDF"). Access: order owner, staff,
 * or anyone holding the unguessable order reference for guest orders.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return new Response("Not configured", { status: 503 });
  const sb = createAdminClient();
  const { data: o } = await sb.from("orders").select("*, order_items(*)").eq("reference", ref).single();
  if (!o || o.status === "pending" || o.status === "cancelled") return new Response("Invoice not found", { status: 404 });
  if (o.user_id) {
    const me = await getProfile();
    if (!me || (me.user.id !== o.user_id && !["staff", "admin"].includes(me.profile?.role ?? ""))) return new Response("Please sign in to view this invoice", { status: 403 });
  }
  const a = o.shipping_address as Record<string, string>;
  const e = (s: unknown) => escapeHtml(String(s ?? ""));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = o.order_items.map((i: any) => `<tr><td>${e(i.name)}<br><small>${e(i.sku)}</small></td><td>${i.quantity}</td><td>${formatNaira(+i.unit_price)}</td><td>${formatNaira(i.unit_price * i.quantity)}</td></tr>`).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice ${e(o.reference)}</title><meta name="robots" content="noindex">
<style>body{font:14px/1.5 system-ui,sans-serif;color:#1C1F26;max-width:800px;margin:40px auto;padding:0 24px}h1{color:#0A1F44;margin:0}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:10px;border-bottom:1px solid #e5e7eb}th{background:#f4f6fb}.r{text-align:right}.tot td{border:0;padding:4px 10px}.grid{display:flex;justify-content:space-between;gap:24px;margin-top:24px}.badge{display:inline-block;background:#dcfce7;color:#166534;padding:2px 10px;border-radius:99px;font-weight:600}@media print{button{display:none}}</style></head><body>
<div class="grid"><div><h1>${e(site.name)}</h1><p>${e(site.address.street)}, ${e(site.address.city)}, ${e(site.address.state)}<br>Call ${e(site.phone)} · WhatsApp ${e(site.whatsappDisplay)} · ${e(site.email)}</p></div>
<div class="r"><h2 style="margin:0">INVOICE</h2><p>No: <b>${e(o.reference)}</b><br>Date: ${new Date(o.paid_at ?? o.created_at).toLocaleDateString("en-NG", { dateStyle: "long" })}<br><span class="badge">PAID</span></p></div></div>
<div class="grid"><div><b>Bill to</b><br>${e(o.customer_name)}<br>${e(o.email)}<br>${e(o.phone)}</div><div>${a.pickup ? `<b>Showroom pickup</b><br>${e(a.location)}` : `<b>Ship to</b><br>${e(a.fullName)}<br>${e(a.line1)} ${e(a.line2)}<br>${e(a.city)}, ${e(a.lga)}, ${e(a.state)}`}</div></div>
<table><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
<table class="tot"><tr><td class="r">Subtotal</td><td class="r" width="160">${formatNaira(+o.subtotal)}</td></tr>
${+o.discount ? `<tr><td class="r">Discount (${e(o.coupon_code)})</td><td class="r">-${formatNaira(+o.discount)}</td></tr>` : ""}
<tr><td class="r">Delivery</td><td class="r">${a.pickup ? "Free pickup" : o.shipping_to_be_arranged ? "To be arranged" : "Free"}</td></tr>
<tr><td class="r"><b>Total paid (VAT inclusive)</b></td><td class="r"><b>${formatNaira(+o.total)}</b></td></tr></table>
<p style="margin-top:32px;color:#666">Thank you for shopping with ${e(site.name)}. Goods sold are covered by the Newcastle manufacturer warranty. 7-day swap policy: unused items in good condition (no scratches or dents, fully functioning) may be swapped within 7 days.</p>
<button onclick="window.print()" style="padding:10px 20px;border-radius:99px;border:0;background:#0A1F44;color:#fff;cursor:pointer">Print / Save as PDF</button>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'" } });
}
