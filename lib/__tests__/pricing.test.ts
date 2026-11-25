import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, couponDiscount, isPurchasable } from "../pricing.ts";
import { products, coupons } from "../seed-data.ts";

const bySku = (sku: string) => products.find((p) => p.sku === sku)!;
const ac3t = bySku("NC-24CF");     // on sale: ₦850,000 → ₦722,500
const soundbar = bySku("NC-2041"); // ₦96,000

test("sale items are 15% off the original price", () => {
  assert.equal(ac3t.compareAtPrice, 850_000);
  assert.equal(ac3t.price, 722_500);
  for (const sku of ["NC-18CFIN-TB", "NC-18CFIN-GT", "NC-1818", "NC-9001G", "NC-E017-B"]) {
    const p = bySku(sku); assert.equal(p.price, Math.round(p.compareAtPrice! * 0.85), sku);
  }
});
test("best sellers and new arrivals", () => {
  assert.deepEqual(products.filter((p) => p.isBestSeller).map((p) => p.sku).sort(), ["NC-2041", "NC-5001-NEW", "NC-E010"]);
  assert.ok(products.filter((p) => p.isNew).every((p) => p.categorySlug === "gas-hobs"));
});
test("solar is coming soon, price on request, not purchasable", () => {
  const solar = products.filter((p) => p.parentCategorySlug === "solar-solutions");
  assert.equal(solar.length, 12);
  assert.ok(solar.every((p) => p.comingSoon && p.priceOnRequest && !isPurchasable(p)));
  assert.ok(isPurchasable(soundbar));
});
test("percent coupon is capped by max discount", () => {
  assert.deepEqual(couponDiscount(coupons[0], 2_000_000), { discount: 50_000 });
});
test("delivery under ₦2M is arranged later; ₦2M+ is free; pickup always free", () => {
  const small = computeTotals({ lines: [{ product: soundbar, quantity: 1 }], method: "standard", coupon: null });
  assert.equal(small.shippingFee, 0); assert.equal(small.shippingToBeArranged, true); assert.equal(small.total, 96_000);
  const big = computeTotals({ lines: [{ product: ac3t, quantity: 3 }], method: "standard", coupon: null }); // ₦2,167,500
  assert.equal(big.freeShipping, true); assert.equal(big.shippingToBeArranged, false);
  const pickup = computeTotals({ lines: [{ product: soundbar, quantity: 1 }], method: "pickup", coupon: null });
  assert.equal(pickup.shippingToBeArranged, false); assert.equal(pickup.shippingFee, 0);
});
