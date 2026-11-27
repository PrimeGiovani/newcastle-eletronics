import { test } from "node:test";
import assert from "node:assert/strict";
import { sizeSolarSystem } from "../solar.ts";
import { normalizePhone, PHONE_PATTERN, shippingQuote, FREE_SHIPPING_THRESHOLD } from "../nigeria.ts";

test("sizes a typical home", () => {
  const r = sizeSolarSystem([{ name: "AC", watts: 800, qty: 1, hours: 6, nightHours: 4 }, { name: "Fridge", watts: 150, qty: 1, hours: 24, nightHours: 12 }]);
  assert.equal(r.peakW, 950);
  assert.equal(r.inverterKva, 1.5);
});
test("validates Nigerian and international phones", () => {
  assert.equal(normalizePhone("0810 902 4035"), "+2348109024035");
  assert.equal(normalizePhone("+2347068376168"), "+2347068376168");
  assert.equal(normalizePhone("2347068376168"), "+2347068376168");
  assert.equal(normalizePhone("+44 7700 900123"), "+447700900123");
  assert.equal(normalizePhone("0044 7700 900123"), "+447700900123");
  assert.equal(normalizePhone("+1 (202) 555-0123"), "+12025550123");
  assert.equal(normalizePhone("+233 24 123 4567"), "+233241234567");
  assert.equal(normalizePhone("12345"), null);
  assert.equal(normalizePhone("+234 123"), null);
  assert.equal(normalizePhone("hello"), null);
});
test("phone pattern is valid with the v flag browsers use", () => {
  const re = new RegExp(PHONE_PATTERN, "v");
  for (const ok of ["+44 7700 900123", "0803 123 4567", "+1 (202) 555-0123", "+234.803.123.4567"]) assert.ok(re.test(ok), ok);
  assert.ok(!re.test("abc"));
});
test("shipping threshold is ₦2,000,000", () => {
  assert.equal(FREE_SHIPPING_THRESHOLD, 2_000_000);
  assert.equal(shippingQuote(1_999_999).arrangeLater, true);
  assert.equal(shippingQuote(2_000_000).free, true);
});
