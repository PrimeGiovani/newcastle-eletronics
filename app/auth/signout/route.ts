import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin } from "@/lib/security";
export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return new NextResponse("Forbidden", { status: 403 });
  await (await createClient()).auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
