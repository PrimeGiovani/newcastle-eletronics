import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

/** Signed-in user's profile + saved addresses (used for account checkout prefill). */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const sb = await createClient();
  const [{ data: profile }, { data: addresses }] = await Promise.all([
    sb.from("profiles").select("full_name, phone").eq("id", user.id).single(),
    sb.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  return NextResponse.json({
    email: user.email, fullName: profile?.full_name ?? "", phone: profile?.phone ?? "",
    addresses: (addresses ?? []).map((a) => ({ id: a.id, fullName: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", landmark: a.landmark ?? "", city: a.city, lga: a.lga, state: a.state })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
