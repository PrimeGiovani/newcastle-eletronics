import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, couponDiscount, INSTALLATION_FEE } from "../pricing.ts";
import { products, coupons } from "../seed-data.ts";

const ac = products.find((p) => p.sku === "NC-AC-15HP")!;     // ₦465,000, installable
const bar = products.find((p) => p.sku === "NC-SB-312")!;     // ₦345,000, not installable

test("percent coupon is capped by max discount", () => {
  assert.deepEqual(couponDiscount(coupons[0], 2_000_000), { discount: 50_000 });
});
test("coupon below minimum is rejected", () => {
  assert.ok(couponDiscount(coupons[1], 100_000).error);
});
test("server totals: subtotal, shipping, installation only for installable items", () => {
  const t = computeTotals({ lines: [{ product: ac, quantity: 2 }, { product: bar, quantity: 1 }], state: "Kano", method: "standard", installation: true, coupon: null });
  assert.equal(t.subtotal, 1_275_000);
  assert.equal(t.shippingFee, 0); // free over ₦1M
  assert.equal(t.installationFee, 2 * INSTALLATION_FEE);
  assert.equal(t.total, 1_275_000 + 2 * INSTALLATION_FEE);
});
test("express delivery costs more and is never free", () => {
  const t = computeTotals({ lines: [{ product: ac, quantity: 3 }], state: "Lagos", method: "express", installation: false, coupon: null });
  assert.ok(t.shippingFee > 5000);
});
