import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** OAuth (Google) + email-confirmation + password-recovery code exchange. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";
  if (code) {
    const sb = await createClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/auth/login?error=Could+not+sign+you+in.+Please+try+again.", url.origin));
}
