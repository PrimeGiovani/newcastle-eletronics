/**
 * Demo catalogue. Used as a fallback when Supabase isn't configured (local dev / previews)
 * and mirrored in supabase/seed.sql for production databases.
 */
import type { Brand, Category, Coupon, Product, Review } from "./types";
import { sheetProducts } from "./products-data.ts";
import { sheetReviews } from "./reviews-data.ts";

const u = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
export const IMG = {
  solar1: u("photo-1509391366360-2e959784a276", 1600), solar2: u("photo-1508514177221-188b1cf16e9d", 1600),
  living: u("photo-1600210492486-724fe5c67fb0", 1600), install: u("photo-1581092160562-40aa08e78837", 1400),
};

/** Product illustrations in public/products – replace with product photography via Admin → Products. */
export const ART = (name: string) => [`/products/${name}.svg`, `/products/${name}-dark.svg`];

export const categories: Category[] = [
  // Order requested by Newcastle: Kitchen Appliances → Air Conditioners → Solar Solutions → Sound System
  { id: "c3", slug: "kitchen-appliances", name: "Kitchen Appliances", description: "Newcastle gas hobs, range hoods, ovens, microwaves and small kitchen appliances.", image: ART("hob-5-glass")[0], parentSlug: null, sortOrder: 1 },
  { id: "c3a", slug: "gas-hobs", name: "Gas Hobs", description: "2- to 5-burner gas hobs, flip-up glass and stainless finishes.", image: ART("hob-5-glass")[0], parentSlug: "kitchen-appliances", sortOrder: 1 },
  { id: "c3b", slug: "range-hoods", name: "Range Hoods", description: "60cm and 90cm range hoods – filter, hand-wave and plasma models.", image: ART("hood-90-black")[0], parentSlug: "kitchen-appliances", sortOrder: 2 },
  { id: "c3c", slug: "ovens", name: "Ovens", description: "Built-in electric and gas cabinet ovens.", image: ART("oven-builtin")[0], parentSlug: "kitchen-appliances", sortOrder: 3 },
  { id: "c3d", slug: "microwaves", name: "Microwaves", description: "Countertop and built-in microwaves.", image: ART("microwave-surface")[0], parentSlug: "kitchen-appliances", sortOrder: 4 },
  { id: "c3e", slug: "small-appliances", name: "Small Appliances", description: "Blenders, air fryers and charcoal stoves.", image: ART("air-fryer")[0], parentSlug: "kitchen-appliances", sortOrder: 5 },
  { id: "c1", slug: "air-conditioners", name: "Air Conditioners", description: "Newcastle inverter split units and floor-standing air conditioners.", image: ART("ac-split-white")[0], parentSlug: null, sortOrder: 2 },
  { id: "c1a", slug: "1hp-split-unit", name: "1HP Split Unit", description: "Wall-mounted 1HP split air conditioners.", image: ART("ac-split-white")[0], parentSlug: "air-conditioners", sortOrder: 1 },
  { id: "c1b", slug: "1-5hp-split-unit", name: "1.5HP Split Unit", description: "Wall-mounted 1.5HP split air conditioners.", image: ART("ac-split-black")[0], parentSlug: "air-conditioners", sortOrder: 2 },
  { id: "c1c", slug: "2hp-split-unit", name: "2HP Split Unit", description: "Wall-mounted 2HP split air conditioners.", image: ART("ac-split-white")[0], parentSlug: "air-conditioners", sortOrder: 3 },
  { id: "c1d", slug: "standing-units", name: "Standing Units", description: "2- and 3-ton floor-standing air conditioners – round and block designs.", image: ART("ac-round-rosegold")[0], parentSlug: "air-conditioners", sortOrder: 4 },
  { id: "c6", slug: "solar-solutions", name: "Solar Solutions", description: "Coming soon: Newcastle portable power stations, all-in-one ESS, lithium batteries, inverters, solar panels and street lights.", image: ART("ess")[0], parentSlug: null, sortOrder: 3 },
  { id: "c6a", slug: "portable-power-stations", name: "Portable Power Stations", description: "Portable battery power stations.", image: ART("portable-ess")[0], parentSlug: "solar-solutions", sortOrder: 1 },
  { id: "c6b", slug: "all-in-one-ess", name: "All-in-One ESS", description: "Inverter and lithium storage in one cabinet.", image: ART("ess")[0], parentSlug: "solar-solutions", sortOrder: 2 },
  { id: "c6c", slug: "lithium-batteries", name: "Lithium Batteries", description: "Lithium battery storage.", image: ART("battery")[0], parentSlug: "solar-solutions", sortOrder: 3 },
  { id: "c6d", slug: "inverters", name: "Inverters", description: "Solar inverters.", image: ART("inverter")[0], parentSlug: "solar-solutions", sortOrder: 4 },
  { id: "c6e", slug: "solar-panels", name: "Solar Panels", description: "Monocrystalline solar panels.", image: ART("solar-panel")[0], parentSlug: "solar-solutions", sortOrder: 5 },
  { id: "c6f", slug: "street-lights", name: "Street Lights", description: "Solar street lights.", image: ART("street-light")[0], parentSlug: "solar-solutions", sortOrder: 6 },
  { id: "c2", slug: "sound-system", name: "Sound System", description: "Newcastle soundbars, home theatre speakers and boom boxes.", image: ART("soundbar")[0], parentSlug: null, sortOrder: 4 },
  { id: "c2a", slug: "sound-bars", name: "Sound Bars", description: "Soundbars for your TV.", image: ART("soundbar")[0], parentSlug: "sound-system", sortOrder: 1 },
  { id: "c2b", slug: "home-theatre", name: "Home Theatre", description: "Home theatre multimedia speakers.", image: ART("home-theatre")[0], parentSlug: "sound-system", sortOrder: 2 },
  { id: "c2c", slug: "boom-box", name: "Boom Box", description: "Portable boom box MP players.", image: ART("boombox")[0], parentSlug: "sound-system", sortOrder: 3 },
];

/** Newcastle manufactures every product it sells – a single house brand. */
export const BRAND = "Newcastle";
export const brands: Brand[] = [{ id: "b1", name: BRAND, slug: "newcastle" }];

/** Products come from Newcastle's product sheet (data/product-list.csv → scripts/import-product-list.py). */
export const products: Product[] = sheetProducts.map((p, i): Product => {
  const cat = categories.find((c) => c.slug === p.categorySlug)!;
  return {
    id: `p${i + 1}`, slug: p.slug, sku: p.sku, name: p.name, brand: BRAND, brandSlug: "newcastle",
    category: cat.name, categorySlug: cat.slug, parentCategorySlug: cat.parentSlug,
    price: p.price, compareAtPrice: p.compareAtPrice, stock: p.comingSoon ? 0 : p.stock, lowStockThreshold: 3,
    rating: 0, reviewCount: 0, soldCount: 0, images: ART(p.art),
    shortDescription: p.shortDescription, description: p.description, highlights: p.highlights, specs: p.specs, warranty: p.warranty,
    isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNew: p.isNew, flashDealEndsAt: null,
    comingSoon: p.comingSoon, priceOnRequest: p.priceOnRequest, installable: p.installable,
    createdAt: new Date(Date.UTC(2026, 10, 1) + i * 60_000).toISOString(),
  };
});

/** Genuine customer reviews from data/reviews.csv (plus reviews written on the website once Supabase is connected). */
export const reviews: Review[] = sheetReviews.map((r, i) => ({
  id: `r${i + 1}`, productId: products.find((p) => p.sku === r.sku)!.id, author: r.author, rating: r.rating, title: r.title,
  body: r.body, photos: [], verified: r.verified, createdAt: new Date(r.date).toISOString(),
}));
// Product star ratings are calculated from the reviews above
for (const p of products) {
  const rs = reviews.filter((r) => r.productId === p.id);
  p.reviewCount = rs.length;
  p.rating = rs.length ? Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10 : 0;
}


export const coupons: Coupon[] = [
  { code: "WELCOME5", type: "percent", value: 5, minSubtotal: 100000, maxDiscount: 50000, expiresAt: null, active: true },
  { code: "COOL20K", type: "fixed", value: 20000, minSubtotal: 400000, maxDiscount: null, expiresAt: null, active: true },
];
