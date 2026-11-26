import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { reviewSchema } from "@/lib/validation";
import { assertSameOrigin, clientIp, escapeHtml, rateLimit } from "@/lib/security";
import { createAdminClient, createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { features } from "@/lib/config";
import { sendEmail } from "@/lib/email";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const guestSchema = z.object({ name: z.string().trim().min(2, "Please enter your name").max(80), email: z.string().trim().toLowerCase().email("Please enter a valid email") });

/**
 * Two modes:
 *  • Customer accounts ON  – signed-in customers only; published immediately.
 *  • Customer accounts OFF – guests submit name + email; review is PENDING until staff publish it in Admin → Reviews.
 * In both modes "Verified purchase" is set automatically when the reviewer has a paid order containing the product.
 */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`review:${clientIp(req)}`, 5)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Reviews are not available yet" }, { status: 503 });

  const user = features.customerAccounts ? await getUser() : null;
  if (features.customerAccounts && !user) return NextResponse.json({ error: "Please sign in to write a review" }, { status: 401 });

  const fd = await req.formData();
  if (String(fd.get("website") ?? "")) return NextResponse.json({ ok: true, pending: true }); // honeypot
  const parsed = reviewSchema.safeParse({ productId: fd.get("productId"), rating: fd.get("rating"), title: fd.get("title") ?? "", body: fd.get("body") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  let guest: z.infer<typeof guestSchema> | null = null;
  if (!user) {
    const g = guestSchema.safeParse({ name: fd.get("name"), email: fd.get("email") });
    if (!g.success) return NextResponse.json({ error: g.error.issues[0]?.message }, { status: 400 });
    guest = g.data;
  }
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);
  for (const f of files) {
    if (!TYPES.includes(f.type)) return NextResponse.json({ error: "Photos must be JPG, PNG or WebP" }, { status: 400 });
    if (f.size > MAX_BYTES) return NextResponse.json({ error: "Each photo must be under 3MB" }, { status: 400 });
  }

  const admin = createAdminClient();
  // Photos: signed-in users upload into their own folder (storage policy); guests via the server into guest/
  const storage = user ? (await createClient()).storage : admin.storage;
  const photos: string[] = [];
  for (const f of files) {
    const path = `${user ? user.id : "guest"}/${crypto.randomUUID()}.${f.type.split("/")[1]}`;
    const { error } = await storage.from("review-photos").upload(path, f, { contentType: f.type, upsert: false });
    if (!error) photos.push(storage.from("review-photos").getPublicUrl(path).data.publicUrl);
  }

  // Verified purchase = a paid/delivered order containing this product (matched by account, or by email for guests)
  let q = admin.from("order_items").select("id, orders!inner(user_id, email, status)").eq("product_id", parsed.data.productId)
    .in("orders.status", ["paid", "processing", "ready_for_pickup", "collected", "shipped", "delivered"]).limit(1);
  q = user ? q.eq("orders.user_id", user.id) : q.ilike("orders.email", guest!.email);
  const { data: bought } = await q;

  const author = user
    ? ((user.user_metadata?.full_name as string | undefined)?.split(" ").map((p, i) => (i ? p[0] + "." : p)).join(" ") ?? "Customer")
    : guest!.name.split(" ").map((p, i) => (i ? p[0] + "." : p)).join(" ");
  const row = {
    product_id: parsed.data.productId, user_id: user?.id ?? null, author_name: author, rating: parsed.data.rating, title: parsed.data.title, body: parsed.data.body,
    photos, verified_purchase: Boolean(bought?.length), status: user ? "approved" : "pending", source: "website",
  };
  const { error } = user
    ? await admin.from("reviews").upsert(row, { onConflict: "product_id,user_id" })
    : await admin.from("reviews").insert(row);
  if (error) { console.error(error); return NextResponse.json({ error: "Could not save review" }, { status: 500 }); }

  const { data: p } = await admin.from("products").select("slug, name").eq("id", parsed.data.productId).single();
  if (user && p) revalidatePath(`/product/${p.slug}`);
  if (!user && process.env.ADMIN_NOTIFY_EMAIL) {
    await sendEmail(process.env.ADMIN_NOTIFY_EMAIL, `New review to approve – ${p?.name ?? "product"}`,
      `<p><b>${escapeHtml(author)}</b> (${escapeHtml(guest!.email)}) rated <b>${parsed.data.rating}/5</b>${row.verified_purchase ? " · verified purchase" : ""}</p><p><b>${escapeHtml(parsed.data.title)}</b><br>${escapeHtml(parsed.data.body)}</p><p>Publish or hide it in Admin → Reviews.</p>`);
  }
  return NextResponse.json({ ok: true, pending: !user });
}
