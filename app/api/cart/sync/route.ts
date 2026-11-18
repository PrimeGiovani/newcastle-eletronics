import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { assertSameOrigin, clientIp, rateLimit } from "@/lib/security";
import { createAdminClient, getUser } from "@/lib/supabase/server";

/** Records cart snapshots for abandoned-cart recovery (admin → Marketing). */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`cart:${clientIp(req)}`, 20) || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true });
  const p = z.object({ email: z.string().email(), subtotal: z.number().nonnegative(), items: z.array(z.object({ id: z.string(), name: z.string().max(200), quantity: z.number().int(), price: z.number() })).max(50) })
    .safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ ok: false }, { status: 400 });
  const jar = await cookies();
  let sid = jar.get("nce_sid")?.value;
  if (!sid) { sid = crypto.randomUUID(); jar.set("nce_sid", sid, { httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30, path: "/" }); }
  const user = await getUser();
  await createAdminClient().from("carts").upsert({ session_id: sid, user_id: user?.id ?? null, email: p.data.email, items: p.data.items, subtotal: p.data.subtotal, status: "open", updated_at: new Date().toISOString() }, { onConflict: "session_id" });
  return NextResponse.json({ ok: true });
}
