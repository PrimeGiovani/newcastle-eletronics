import { test } from "node:test";
import assert from "node:assert/strict";
import { sizeSolarSystem } from "../solar.ts";
import { normalizeNgPhone, shippingQuote } from "../nigeria.ts";

test("sizes a typical home", () => {
  const r = sizeSolarSystem([{ name: "AC", watts: 800, qty: 1, hours: 6, nightHours: 4 }, { name: "Fridge", watts: 150, qty: 1, hours: 24, nightHours: 12 }]);
  assert.equal(r.peakW, 950);
  assert.equal(r.inverterKva, 1.5);
  assert.ok(r.panels >= 3);
  assert.ok(r.batteryModules >= 1);
});

test("validates Nigerian phones", () => {
  assert.equal(normalizeNgPhone("0803 123 4567"), "+2348031234567");
  assert.equal(normalizeNgPhone("+2349061234567"), "+2349061234567");
  assert.equal(normalizeNgPhone("0603123456"), null);
});

test("shipping by state", () => {
  assert.equal(shippingQuote("Lagos", 10000).fee, 5000);
  assert.equal(shippingQuote("Kano", 10000).fee, 15000);
  assert.equal(shippingQuote("Lagos", 2_000_000).fee, 0);
  assert.equal(shippingQuote("Kano", 10000, "pickup").fee, 0);
});
