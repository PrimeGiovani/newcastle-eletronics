import { NextResponse } from "next/server";
import { z } from "zod";
import { findCoupon } from "@/lib/coupons";
import { couponDiscount } from "@/lib/pricing";
import { assertSameOrigin, clientIp, rateLimit } from "@/lib/security";

export async function POST(req: Request) {
  if (!(await assertSameOrigin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`coupon:${clientIp(req)}`, 15)) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  const parsed = z.object({ code: z.string().trim().min(2).max(30), subtotal: z.number().nonnegative() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
  const coupon = await findCoupon(parsed.data.code);
  if (!coupon) return NextResponse.json({ error: "This coupon code is not valid" }, { status: 404 });
  const { discount, error } = couponDiscount(coupon, parsed.data.subtotal);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ code: coupon.code, discount });
}
