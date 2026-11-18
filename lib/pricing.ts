import type { Coupon, Product } from "./types.ts";
import { shippingQuote, type DeliveryMethod } from "./nigeria.ts";

export const INSTALLATION_FEE = 25000; // per installable unit

export function couponDiscount(c: Coupon | null, subtotal: number): { discount: number; error?: string } {
  if (!c) return { discount: 0 };
  if (!c.active || (c.expiresAt && new Date(c.expiresAt) < new Date())) return { discount: 0, error: "This coupon has expired" };
  if (subtotal < c.minSubtotal) return { discount: 0, error: `Minimum order for this coupon is ₦${c.minSubtotal.toLocaleString()}` };
  let d = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
  return { discount: Math.min(d, subtotal) };
}

/** Authoritative server-side totals. Never trust client prices. */
export function computeTotals(args: {
  lines: { product: Product; quantity: number }[]; state: string; method: DeliveryMethod; installation: boolean; coupon: Coupon | null;
}) {
  const subtotal = args.lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const { discount, error: couponError } = couponDiscount(args.coupon, subtotal);
  const ship = shippingQuote(args.state, subtotal - discount, args.method);
  const installUnits = args.installation ? args.lines.filter((l) => l.product.installable).reduce((s, l) => s + l.quantity, 0) : 0;
  const installationFee = installUnits * INSTALLATION_FEE;
  const total = subtotal - discount + ship.fee + installationFee;
  return { subtotal, discount, couponError, shippingFee: ship.fee, deliveryDays: ship.days, installationFee, total };
}
