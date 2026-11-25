import { test } from "node:test";
import assert from "node:assert/strict";
import { sizeSolarSystem } from "../solar.ts";
import { normalizeNgPhone, shippingQuote, FREE_SHIPPING_THRESHOLD } from "../nigeria.ts";

test("sizes a typical home", () => {
  const r = sizeSolarSystem([{ name: "AC", watts: 800, qty: 1, hours: 6, nightHours: 4 }, { name: "Fridge", watts: 150, qty: 1, hours: 24, nightHours: 12 }]);
  assert.equal(r.peakW, 950);
  assert.equal(r.inverterKva, 1.5);
});
test("validates Nigerian phones", () => {
  assert.equal(normalizeNgPhone("0810 902 4035"), "+2348109024035");
  assert.equal(normalizeNgPhone("+2347068376168"), "+2347068376168");
  assert.equal(normalizeNgPhone("0603123456"), null);
});
test("shipping threshold is ₦2,000,000", () => {
  assert.equal(FREE_SHIPPING_THRESHOLD, 2_000_000);
  assert.equal(shippingQuote(1_999_999).arrangeLater, true);
  assert.equal(shippingQuote(2_000_000).free, true);
});
