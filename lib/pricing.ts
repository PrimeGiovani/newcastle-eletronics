import type { Coupon, Product } from "./types.ts";
import { shippingQuote, type DeliveryMethod } from "./nigeria.ts";

export function couponDiscount(c: Coupon | null, subtotal: number): { discount: number; error?: string } {
  if (!c) return { discount: 0 };
  if (!c.active || (c.expiresAt && new Date(c.expiresAt) < new Date())) return { discount: 0, error: "This coupon has expired" };
  if (subtotal < c.minSubtotal) return { discount: 0, error: `Minimum order for this coupon is ₦${c.minSubtotal.toLocaleString()}` };
  let d = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
  return { discount: Math.min(d, subtotal) };
}

/** A product can be bought online only if it's available and has a public price. */
export const isPurchasable = (p: Pick<Product, "comingSoon" | "priceOnRequest" | "price">) => !p.comingSoon && !p.priceOnRequest && p.price > 0;

/**
 * Authoritative server-side totals. Never trust client prices.
 * Installation is a separate paid service arranged with Newcastle after purchase – not charged here.
 */
export function computeTotals(args: { lines: { product: Product; quantity: number }[]; method: DeliveryMethod; coupon: Coupon | null }) {
  const subtotal = args.lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const { discount, error: couponError } = couponDiscount(args.coupon, subtotal);
  // Free-shipping threshold is checked on the goods value before any coupon discount
  const ship = shippingQuote(subtotal, args.method);
  const total = subtotal - discount + ship.fee;
  return { subtotal, discount, couponError, shippingFee: ship.fee, freeShipping: ship.free, shippingToBeArranged: ship.arrangeLater, total };
}
