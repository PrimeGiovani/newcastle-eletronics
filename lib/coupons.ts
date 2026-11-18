import "server-only";
import { isSupabaseConfigured } from "./supabase/env";
import { createAdminClient } from "./supabase/server";
import { coupons as seedCoupons } from "./seed-data";
import type { Coupon } from "./types";

export async function findCoupon(code?: string | null): Promise<Coupon | null> {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return seedCoupons.find((x) => x.code === c) ?? null;
  const { data } = await createAdminClient().from("coupons").select("*").eq("code", c).maybeSingle();
  if (!data) return null;
  if (data.usage_limit && data.used_count >= data.usage_limit) return { ...mapC(data), active: false };
  return mapC(data);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapC = (d: any): Coupon => ({ code: d.code, type: d.type, value: Number(d.value), minSubtotal: Number(d.min_subtotal), maxDiscount: d.max_discount ? Number(d.max_discount) : null, expiresAt: d.expires_at, active: d.active });
