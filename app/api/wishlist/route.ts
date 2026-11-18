import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/security";
import { createClient, getUser } from "@/lib/supabase/server";

/** Syncs wishlist toggles to the DB for signed-in users (guests keep a local wishlist). */
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: true, synced: false });
  const p = z.object({ productId: z.string().uuid(), on: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ ok: true, synced: false }); // demo ids aren't UUIDs
  const sb = await createClient();
  if (p.data.on) await sb.from("wishlists").upsert({ user_id: user.id, product_id: p.data.productId });
  else await sb.from("wishlists").delete().eq("user_id", user.id).eq("product_id", p.data.productId);
  return NextResponse.json({ ok: true, synced: true });
}
