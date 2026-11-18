import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON, SUPABASE_URL, isSupabaseConfigured } from "./env";

/** Request-scoped client – respects RLS as the signed-in user. */
export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a Server Component */ } },
    },
  });
}

/** Service-role client – bypasses RLS. Server-only: webhooks, order creation, admin actions after role check. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured() || !key) throw new Error("Supabase service role is not configured");
  return createJsClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Anonymous, cookie-less client for public catalogue reads (safe inside cached/static rendering). */
export function createPublicClient() {
  return createJsClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });
}

export async function getUser() {
  if (!isSupabaseConfigured()) return null;
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  return data.user;
}

export type Role = "customer" | "staff" | "admin";
export async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  const sb = await createClient();
  const { data } = await sb.from("profiles").select("id, full_name, phone, role").eq("id", user.id).single();
  return { user, profile: data as { id: string; full_name: string | null; phone: string | null; role: Role } | null };
}

export async function requireRole(roles: Role[] = ["admin", "staff"]) {
  const res = await getProfile();
  if (!res?.profile || !roles.includes(res.profile.role)) return null;
  return res;
}
