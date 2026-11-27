"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, requireRole } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { receiptHtml, sendEmail, statusUpdateHtml } from "@/lib/email";
import { confirmPayment } from "@/lib/orders";
import { verifyTransaction } from "@/lib/paystack";

async function staff(roles: ("admin" | "staff")[] = ["admin", "staff"]) {
  const me = await requireRole(roles);
  if (!me) throw new Error("Forbidden");
  return { me, sb: await createClient() }; // user-scoped client → RLS enforced as a second layer
}

/* ───────── Products ───────── */
const productSchema = z.object({
  id: z.string().optional(), name: z.string().trim().min(3).max(200), slug: z.string().trim().max(200).optional(), sku: z.string().trim().min(2).max(60),
  brand_id: z.string().uuid().nullable(), category_id: z.string().uuid(),
  price: z.coerce.number().min(0), compare_at_price: z.coerce.number().min(0).nullable(), cost_price: z.coerce.number().min(0).nullable(),
  status: z.enum(["draft", "active", "archived"]), short_description: z.string().max(300), description: z.string().max(10000),
  warranty: z.string().max(200), highlights: z.array(z.string()), specs: z.record(z.string()),
  is_featured: z.boolean(), is_best_seller: z.boolean(), is_new: z.boolean(), installable: z.boolean(), coming_soon: z.boolean(), price_on_request: z.boolean(),
  flash_deal_ends_at: z.string().nullable(), meta_title: z.string().max(70).nullable(), meta_description: z.string().max(160).nullable(),
});

export async function saveProduct(fd: FormData) {
  const { sb } = await staff();
  const s = (k: string) => String(fd.get(k) ?? "").trim();
  const n = (k: string) => (s(k) === "" ? null : s(k));
  const parsed = productSchema.parse({
    id: n("id") ?? undefined, name: s("name"), slug: s("slug") || slugify(s("name")), sku: s("sku"),
    brand_id: n("brand_id"), category_id: s("category_id"), price: s("price"), compare_at_price: n("compare_at_price"), cost_price: n("cost_price"),
    status: s("status") || "draft", short_description: s("short_description"), description: s("description"), warranty: s("warranty"),
    highlights: s("highlights").split("\n").map((x) => x.trim()).filter(Boolean),
    specs: Object.fromEntries(s("specs").split("\n").map((l) => l.split(":")).filter((p) => p.length >= 2).map(([k, ...v]) => [k.trim(), v.join(":").trim()])),
    is_featured: fd.get("is_featured") === "on", is_best_seller: fd.get("is_best_seller") === "on", is_new: fd.get("is_new") === "on", installable: fd.get("installable") === "on", coming_soon: fd.get("coming_soon") === "on", price_on_request: fd.get("price_on_request") === "on",
    flash_deal_ends_at: n("flash_deal_ends_at") ? new Date(s("flash_deal_ends_at")).toISOString() : null, meta_title: n("meta_title"), meta_description: n("meta_description"),
  });
  const { id, ...row } = parsed;
  row.slug = slugify(row.slug!);
  const { data, error } = id
    ? await sb.from("products").update(row).eq("id", id).select("id, slug").single()
    : await sb.from("products").insert(row).select("id, slug").single();
  if (error || !data) throw new Error(error?.message ?? "Save failed");

  if (!id && s("initial_stock")) await sb.rpc("adjust_stock", { p_product_id: data.id, p_delta: Number(s("initial_stock")), p_reason: "restock", p_note: "Initial stock" });

  // Image uploads → Supabase Storage
  const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const { count } = await sb.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", data.id);
  let order = count ?? 0;
  for (const f of files) {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(f.type) || f.size > 5 * 1024 * 1024) continue;
    const path = `${data.id}/${crypto.randomUUID()}.${f.type.split("/")[1]}`;
    const { error: upErr } = await sb.storage.from("product-images").upload(path, f, { contentType: f.type, cacheControl: "31536000" });
    if (upErr) continue;
    const url = sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    await sb.from("product_images").insert({ product_id: data.id, url, alt: parsed.name, sort_order: order++ });
  }
  revalidatePath("/", "layout");
  redirect(`/admin/products/${data.id}?saved=1`);
}

export async function deleteProductImage(fd: FormData) {
  const { sb } = await staff();
  const id = String(fd.get("imageId")), productId = String(fd.get("productId"));
  const { data } = await sb.from("product_images").delete().eq("id", id).select("url").single();
  const path = data?.url.split("/product-images/")[1];
  if (path) await sb.storage.from("product-images").remove([path]);
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProduct(fd: FormData) {
  const { sb } = await staff(["admin"]);
  const id = String(fd.get("id"));
  // Products referenced by orders are archived rather than hard-deleted (order history keeps snapshots either way)
  const { count } = await sb.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", id);
  if (count) await sb.from("products").update({ status: "archived" }).eq("id", id);
  else await sb.from("products").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

/* ───────── Categories & brands ───────── */
export async function saveCategory(fd: FormData) {
  const { sb } = await staff();
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 2) return;
  await sb.from("categories").insert({ name, slug: slugify(String(fd.get("slug") || name)), description: String(fd.get("description") ?? ""), parent_id: fd.get("parent_id") || null, image_url: fd.get("image_url") || null, sort_order: Number(fd.get("sort_order") || 0) });
  revalidatePath("/", "layout");
}
export async function deleteCategory(fd: FormData) {
  const { sb } = await staff(["admin"]);
  await sb.from("categories").update({ is_active: false }).eq("id", String(fd.get("id")));
  revalidatePath("/", "layout");
}
export async function saveBrand(fd: FormData) {
  const { sb } = await staff();
  const name = String(fd.get("name") ?? "").trim();
  if (name.length >= 2) await sb.from("brands").insert({ name, slug: slugify(name) });
  revalidatePath("/admin/categories");
}

/* ───────── Inventory ───────── */
export async function adjustStock(fd: FormData) {
  const { sb } = await staff();
  const p = z.object({ productId: z.string().uuid(), delta: z.coerce.number().int().refine((n) => n !== 0), reason: z.enum(["restock", "return", "adjustment", "damage"]), note: z.string().max(200) }).parse(Object.fromEntries(fd));
  const { error } = await sb.rpc("adjust_stock", { p_product_id: p.productId, p_delta: p.delta, p_reason: p.reason, p_note: p.note });
  if (error) throw new Error(error.message);
  await sb.from("inventory").update({ low_stock_threshold: Number(fd.get("threshold") || 5) }).eq("product_id", p.productId);
  revalidatePath("/admin/inventory");
}

/* ───────── Orders ───────── */
const STATUS_SUBJECT: Record<string, string> = {
  processing: "is being prepared", ready_for_pickup: "is ready for pickup", collected: "has been collected – thank you!",
  shipped: "is on its way", delivered: "has been delivered", cancelled: "has been cancelled", refunded: "has been refunded", returned: "swap completed",
};
export async function updateOrderStatus(fd: FormData) {
  const { me, sb } = await staff();
  const p = z.object({ orderId: z.string().uuid(), status: z.enum(ORDER_STATUSES as [string, ...string[]]), note: z.string().max(500), tracking_number: z.string().max(100), carrier: z.string().max(100), notify: z.string().optional() }).parse(Object.fromEntries(fd));
  const { data: cur } = await sb.from("orders").select("status, payment_method, delivery_method").eq("id", p.orderId).single();
  // Cancelling an unpaid pay-at-store order must release the held stock
  if (cur?.payment_method === "in_store" && cur.status === "pending" && p.status === "cancelled") {
    const { error } = await sb.rpc("release_in_store_hold", { p_order_id: p.orderId, p_note: p.note || "Cancelled by staff – reservation released" });
    if (error) throw new Error(error.message);
  } else if (cur?.payment_method === "in_store" && cur.status === "pending" && p.status !== "pending") {
    throw new Error("Use “Mark as paid in store” first – this order hasn't been paid yet.");
  } else {
    const { error } = await sb.from("orders").update({ status: p.status, tracking_number: p.tracking_number || null, carrier: p.carrier || null }).eq("id", p.orderId);
    if (error) throw new Error(error.message);
    await sb.from("order_events").insert({ order_id: p.orderId, status: p.status, note: p.note || `Status changed to ${p.status.replace(/_/g, " ")}`, created_by: me.user.id });
  }
  const { data: o } = await sb.from("orders").select("reference, email, customer_name").eq("id", p.orderId).single();
  if (p.notify === "on" && o) {
    await sendEmail(o.email, `Your order ${o.reference} ${STATUS_SUBJECT[p.status] ?? `is now ${p.status.replace(/_/g, " ")}`}`,
      statusUpdateHtml(o, p.status, { tracking: p.tracking_number, carrier: p.carrier, pickup: cur?.delivery_method === "pickup" }));
  }
  revalidatePath(`/admin/orders/${p.orderId}`);
}

/** Pay at store: staff confirms the customer has paid at the showroom → stock is deducted, receipt emailed. */
export async function markPaidInStore(fd: FormData) {
  const { sb } = await staff();
  const p = z.object({ orderId: z.string().uuid(), method: z.enum(["cash", "pos", "transfer"]) }).parse(Object.fromEntries(fd));
  const { data: done, error } = await sb.rpc("confirm_in_store_payment", { p_order_id: p.orderId, p_method: p.method });
  if (error) throw new Error(error.message);
  if (done) {
    const { data: o } = await sb.from("orders").select("reference, email, customer_name, total, subtotal, shipping_fee, discount, order_items(name, quantity, unit_price)").eq("id", p.orderId).single();
    if (o) await sendEmail(o.email, `Receipt for order ${o.reference}`, receiptHtml({
      reference: o.reference, customer_name: o.customer_name, total: +o.total, subtotal: +o.subtotal, shipping_fee: +o.shipping_fee, discount: +o.discount,
      items: (o.order_items as { name: string; quantity: number; unit_price: number }[]).map((i) => ({ ...i, unit_price: +i.unit_price })),
    }));
  }
  revalidatePath(`/admin/orders/${p.orderId}`); revalidatePath("/admin/orders");
}

/** "Customer says they paid": ask Paystack directly. If the payment succeeded, the order is confirmed
 *  exactly as if the customer had returned to the site (stock deducted, receipt + staff emails). */
export async function recheckPaystackPayment(fd: FormData) {
  await staff();
  const p = z.object({ orderId: z.string().uuid(), reference: z.string().trim().min(4).max(64) }).parse(Object.fromEntries(fd));
  let result: string;
  try {
    const tx = await verifyTransaction(p.reference);
    if (tx.status !== "success") result = tx.status; // abandoned, failed, ongoing…
    else {
      const r = await confirmPayment(p.reference, tx);
      result = r.ok ? ("already" in r && r.already ? "already" : "confirmed") : r.reason;
    }
  } catch (e) {
    const msg = (e as Error).message ?? "";
    result = /not found/i.test(msg) ? "not_on_paystack" : /PAYSTACK_SECRET_KEY/.test(msg) ? "no_key" : "error";
    if (result === "error") console.error("recheck payment", p.reference, e);
  }
  revalidatePath(`/admin/orders/${p.orderId}`); revalidatePath("/admin/orders");
  redirect(`/admin/orders/${p.orderId}?recheck=${result}`);
}

export async function updateReturn(fd: FormData) {
  const { sb } = await staff();
  await sb.from("returns").update({ status: String(fd.get("status")), refund_amount: fd.get("refund_amount") ? Number(fd.get("refund_amount")) : null }).eq("id", String(fd.get("id")));
  revalidatePath(`/admin/orders/${fd.get("orderId")}`);
}

/* ───────── Support ───────── */
export async function replyTicket(fd: FormData) {
  const { me, sb } = await staff();
  const ticketId = String(fd.get("ticketId")), body = String(fd.get("body") ?? "").trim();
  if (body) await sb.from("ticket_messages").insert({ ticket_id: ticketId, author_id: me.user.id, is_staff: true, body });
  await sb.from("support_tickets").update({ status: String(fd.get("status") || "pending"), updated_at: new Date().toISOString() }).eq("id", ticketId);
  revalidatePath("/admin/tickets");
}

export async function updateLeadStatus(fd: FormData) {
  const { sb } = await staff();
  const table = fd.get("table") === "solar_consultations" ? "solar_consultations" : "leads";
  await sb.from(table).update({ status: String(fd.get("status")) }).eq("id", String(fd.get("id")));
  revalidatePath("/admin/marketing");
}

/* ───────── Marketing ───────── */
export async function saveCoupon(fd: FormData) {
  const { sb } = await staff();
  const p = z.object({ code: z.string().trim().toUpperCase().min(3).max(30), type: z.enum(["percent", "fixed"]), value: z.coerce.number().positive(), min_subtotal: z.coerce.number().min(0), max_discount: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)), usage_limit: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)), expires_at: z.string().optional() }).parse(Object.fromEntries(fd));
  await sb.from("coupons").insert({ ...p, expires_at: p.expires_at ? new Date(p.expires_at).toISOString() : null });
  revalidatePath("/admin/marketing");
}
export async function toggleCoupon(fd: FormData) {
  const { sb } = await staff();
  await sb.from("coupons").update({ active: fd.get("active") === "true" }).eq("id", String(fd.get("id")));
  revalidatePath("/admin/marketing");
}

/* ───────── Reviews ───────── */
export async function addReview(fd: FormData) {
  const { sb } = await staff();
  const p = z.object({
    productId: z.string().uuid(), author: z.string().trim().min(2).max(80), rating: z.coerce.number().int().min(1).max(5),
    title: z.string().trim().max(120).optional().default(""), body: z.string().trim().min(5).max(2000), date: z.string().optional(),
  }).parse(Object.fromEntries(fd));
  await sb.from("reviews").insert({
    product_id: p.productId, user_id: null, author_name: p.author, rating: p.rating, title: p.title, body: p.body,
    verified_purchase: fd.get("verified") === "on", status: "approved", source: "staff",
    ...(p.date ? { created_at: new Date(p.date).toISOString() } : {}),
  });
  revalidatePath("/", "layout");
}
export async function setReviewStatus(fd: FormData) {
  const { sb } = await staff();
  const status = z.enum(["approved", "pending", "rejected"]).parse(fd.get("status"));
  await sb.from("reviews").update({ status }).eq("id", String(fd.get("id")));
  revalidatePath("/", "layout");
}
export async function deleteReview(fd: FormData) {
  const { sb } = await staff(["admin"]);
  await sb.from("reviews").delete().eq("id", String(fd.get("id")));
  revalidatePath("/", "layout");
}
