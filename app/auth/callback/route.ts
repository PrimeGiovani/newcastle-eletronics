import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Google sign-in (OAuth) code exchange. Email links (reset password / confirm sign-up) should use
 * /auth/confirm (token-hash flow – see docs/AUTH-SETUP.md → A5 Email templates). This route still
 * handles older "code" links, and explains failures instead of a generic error.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";
  const isReset = next.startsWith("/auth/update-password");

  // Supabase sends ?error_description=… when a link is expired or already used
  const supaError = url.searchParams.get("error_description") ?? new URLSearchParams(url.hash.slice(1)).get("error_description");
  if (code && !supaError) {
    const sb = await createClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    console.error("[auth/callback]", error.message);
  }
  const msg = isReset
    ? "That reset link couldn't be used (it may have expired, or been opened in a different browser). Please request a new one."
    : supaError ?? "Could not sign you in. Please try again.";
  return NextResponse.redirect(new URL(`${isReset ? "/auth/reset" : "/auth/login"}?error=${encodeURIComponent(msg)}`, url.origin));
}
