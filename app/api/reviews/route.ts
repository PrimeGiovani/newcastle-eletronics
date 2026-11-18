import { NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validation";
import { assertSameOrigin, clientIp, rateLimit } from "@/lib/security";
import { createAdminClient, createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { revalidatePath } from "next/cache";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`review:${clientIp(req)}`, 5)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Reviews are not available yet" }, { status: 503 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to write a review" }, { status: 401 });

  const fd = await req.formData();
  const parsed = reviewSchema.safeParse({ productId: fd.get("productId"), rating: fd.get("rating"), title: fd.get("title") ?? "", body: fd.get("body") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);
  for (const f of files) {
    if (!TYPES.includes(f.type)) return NextResponse.json({ error: "Photos must be JPG, PNG or WebP" }, { status: 400 });
    if (f.size > MAX_BYTES) return NextResponse.json({ error: "Each photo must be under 3MB" }, { status: 400 });
  }

  const sb = await createClient();
  const admin = createAdminClient();
  // Upload photos into the user's own folder (storage policy enforces this)
  const photos: string[] = [];
  for (const f of files) {
    const path = `${user.id}/${crypto.randomUUID()}.${f.type.split("/")[1]}`;
    const { error } = await sb.storage.from("review-photos").upload(path, f, { contentType: f.type, upsert: false });
    if (!error) photos.push(sb.storage.from("review-photos").getPublicUrl(path).data.publicUrl);
  }

  // Verified purchase = user has a paid/delivered order containing this product
  const { data: bought } = await admin.from("order_items").select("id, orders!inner(user_id, status)")
    .eq("product_id", parsed.data.productId).eq("orders.user_id", user.id).in("orders.status", ["paid", "processing", "shipped", "delivered"]).limit(1);

  const author = (user.user_metadata?.full_name as string | undefined)?.split(" ").map((p, i) => (i ? p[0] + "." : p)).join(" ") ?? "Customer";
  const { error } = await admin.from("reviews").upsert({
    product_id: parsed.data.productId, user_id: user.id, author_name: author, rating: parsed.data.rating, title: parsed.data.title, body: parsed.data.body,
    photos, verified_purchase: Boolean(bought?.length), status: "approved",
  }, { onConflict: "product_id,user_id" });
  if (error) { console.error(error); return NextResponse.json({ error: "Could not save review" }, { status: 500 }); }
  const { data: p } = await admin.from("products").select("slug").eq("id", parsed.data.productId).single();
  if (p) revalidatePath(`/product/${p.slug}`);
  return NextResponse.json({ ok: true });
}
