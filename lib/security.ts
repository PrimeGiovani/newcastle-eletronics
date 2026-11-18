import "server-only";
import { headers } from "next/headers";

/** CSRF defence for JSON API routes: reject cross-site requests by Origin/Referer.
 *  (Server Actions already get this check from Next.js; SameSite=Lax cookies add a second layer.) */
export async function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

/** Best-effort per-instance limiter. For multi-region production, replace with Upstash Ratelimit / Vercel KV. */
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now(), b = buckets.get(key);
  if (!b || b.reset < now) { buckets.set(key, { n: 1, reset: now + windowMs }); return true; }
  b.n++;
  return b.n <= limit;
}
export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
