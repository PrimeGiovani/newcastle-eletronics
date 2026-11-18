import type { ProductFilters } from "./types";
export type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
export function parseFilters(sp: SP): ProductFilters {
  const sort = one(sp.sort) as ProductFilters["sort"];
  return {
    q: one(sp.q)?.slice(0, 100), category: one(sp.category), brands: one(sp.brand)?.split(",").filter(Boolean),
    min: num(one(sp.min)), max: num(one(sp.max)), rating: num(one(sp.rating)),
    inStock: one(sp.stock) === "1", isNew: one(sp.new) === "1", bestSeller: one(sp.best) === "1", deals: one(sp.deals) === "1",
    sort: ["popular", "newest", "price-asc", "price-desc", "rating"].includes(sort ?? "") ? sort : "popular",
    page: num(one(sp.page)) ?? 1,
  };
}
