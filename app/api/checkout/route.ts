import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { getProductsByIds } from "@/lib/catalog";
import { findCoupon } from "@/lib/coupons";
import { computeTotals, isPurchasable } from "@/lib/pricing";
import { initializeTransaction } from "@/lib/paystack";
import { createAdminClient, getUser } from "@/lib/supabase/server";
import { assertSameOrigin, clientIp, rateLimit } from "@/lib/security";
import { site } from "@/lib/config";
import { orderRef } from "@/lib/utils";

export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`checkout:${clientIp(req)}`, 8)) return NextResponse.json({ error: "Too many attempts, please wait a minute." }, { status: 429 });
  const missingEnv = ["PAYSTACK_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter((k) => !process.env[k]?.trim());
  if (missingEnv.length) {
    // Visible in Vercel → Project → Logs. Open /api/health?token=<CRON_SECRET> for a full diagnosis.
    console.error(`[checkout] Payments disabled – missing environment variables: ${missingEnv.join(", ")}`);
    return NextResponse.json({ error: "Online payment is not configured yet. Please order via WhatsApp." }, { status: 503 });
  }

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid checkout details" }, { status: 400 });
  const input = parsed.data;

  // 1. Re-load products from DB – never trust client prices or stock
  const products = await getProductsByIds(input.items.map((i) => i.productId));
  const lines = input.items.map((i) => ({ product: products.find((p) => p.id === i.productId)!, quantity: i.quantity }));
  const missing = lines.find((l) => !l.product);
  if (missing) return NextResponse.json({ error: "An item in your cart is no longer available. Please refresh your cart." }, { status: 409 });
  const enquiryOnly = lines.find((l) => !isPurchasable(l.product));
  if (enquiryOnly) return NextResponse.json({ error: `${enquiryOnly.product.name} is ${enquiryOnly.product.comingSoon ? "coming soon" : "price on request"} – please contact us to enquire. Remove it from your cart to continue.` }, { status: 409 });
  const short = lines.find((l) => l.product.stock < l.quantity);
  if (short) return NextResponse.json({ error: `Only ${short.product.stock} × ${short.product.name} left in stock.` }, { status: 409 });

  // 2. Authoritative totals
  const coupon = await findCoupon(input.couponCode);
  const t = computeTotals({ lines, method: input.deliveryMethod, coupon });
  const user = await getUser();
  const sb = createAdminClient();
  const reference = orderRef();

  // 3. Persist pending order
  const { data: order, error } = await sb.from("orders").insert({
    reference, user_id: user?.id ?? null, email: input.customer.email, customer_name: input.customer.fullName, phone: input.customer.phone,
    shipping_address: input.deliveryMethod === "pickup" ? { pickup: true, location: site.addressLine, fullName: input.customer.fullName, phone: input.customer.phone } : input.shipping,
    delivery_method: input.deliveryMethod, shipping_to_be_arranged: t.shippingToBeArranged,
    subtotal: t.subtotal, discount: t.discount, shipping_fee: t.shippingFee, total: t.total,
    coupon_code: t.discount > 0 ? coupon?.code : null, notes: input.notes,
  }).select("id").single();
  if (error || !order) { console.error(error); return NextResponse.json({ error: "Could not create order. Please try again." }, { status: 500 }); }

  await sb.from("order_items").insert(lines.map((l) => ({ order_id: order.id, product_id: l.product.id, name: l.product.name, sku: l.product.sku, image_url: l.product.images[0], unit_price: l.product.price, quantity: l.quantity })));
  await sb.from("order_events").insert({ order_id: order.id, status: "pending", note: "Order placed – awaiting payment" });

  if (user && input.saveAddress && input.shipping && input.deliveryMethod === "standard") {
    const a = input.shipping;
    await sb.from("addresses").insert({ user_id: user.id, full_name: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2, landmark: a.landmark, city: a.city, lga: a.lga, state: a.state });
  }

  // 4. Initialise Paystack
  try {
    const trx = await initializeTransaction({
      email: input.customer.email, amount: t.total, reference,
      callbackUrl: `${site.url}/checkout/success?reference=${reference}`,
      metadata: { order_id: order.id, customer_name: input.customer.fullName, phone: input.customer.phone, custom_fields: [{ display_name: "Order", variable_name: "order_ref", value: reference }] },
    });
    return NextResponse.json({ reference, authorizationUrl: trx.authorization_url });
  } catch (e) {
    console.error("paystack init", e);
    await sb.from("orders").update({ status: "cancelled", admin_notes: "Paystack initialisation failed" }).eq("id", order.id);
    return NextResponse.json({ error: "Payment gateway unavailable. Please try again." }, { status: 502 });
  }
}
