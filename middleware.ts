import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { features } from "@/lib/config";

const PROTECTED = features.customerAccounts ? ["/account", "/admin"] : ["/admin"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;
  if (PROTECTED.some((p) => path.startsWith(p)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  // Admin role is enforced again server-side in app/admin/layout.tsx and by RLS.
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|api/paystack/webhook|.*\\.(?:png|jpg|jpeg|svg|webp|avif)$).*)"],
};
