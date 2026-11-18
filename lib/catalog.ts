import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/env";
import { createPublicClient } from "./supabase/server";
import * as seed from "./seed-data";
import type { Brand, Category, Product, ProductFilters, Review } from "./types";

/* ───────────── Mapping (DB row → domain) ───────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
export const mapProduct = (r: Row): Product => ({
  id: r.id, slug: r.slug, sku: r.sku, name: r.name,
  brand: r.brand_name ?? "", brandSlug: r.brand_slug ?? "", category: r.category_name ?? "", categorySlug: r.category_slug ?? "",
  parentCategorySlug: r.parent_category_slug ?? null,
  price: Number(r.price), compareAtPrice: r.compare_at_price ? Number(r.compare_at_price) : null,
  stock: r.stock ?? 0, lowStockThreshold: r.low_stock_threshold ?? 5,
  rating: Number(r.rating_avg ?? 0), reviewCount: r.rating_count ?? 0, soldCount: r.sold_count ?? 0,
  images: r.images ?? [], shortDescription: r.short_description ?? "", description: r.description ?? "",
  highlights: r.highlights ?? [], specs: r.specs ?? {}, warranty: r.warranty ?? "",
  isFeatured: r.is_featured, isBestSeller: r.is_best_seller, isNew: r.is_new, flashDealEndsAt: r.flash_deal_ends_at,
  installable: r.installable, createdAt: r.created_at,
});
const mapCategory = (r: Row): Category => ({ id: r.id, slug: r.slug, name: r.name, description: r.description ?? "", image: r.image_url ?? "", parentSlug: r.parent_slug ?? null, sortOrder: r.sort_order ?? 0 });

const useDb = isSupabaseConfigured;

/* ───────────── Categories & brands ───────────── */
export const getCategories = cache(async (): Promise<Category[]> => {
  if (!useDb()) return seed.categories;
  const { data } = await createPublicClient().from("category_tree").select("*").order("sort_order");
  return (data ?? []).map(mapCategory);
});
export const getTopCategories = async () => (await getCategories()).filter((c) => !c.parentSlug);
export const getCategory = async (slug: string) => (await getCategories()).find((c) => c.slug === slug) ?? null;
export const getSubcategories = async (slug: string) => (await getCategories()).filter((c) => c.parentSlug === slug);

export const getBrands = cache(async (): Promise<Brand[]> => {
  if (!useDb()) return seed.brands;
  const { data } = await createPublicClient().from("brands").select("id, slug, name").order("name");
  return (data ?? []) as Brand[];
});

/* ───────────── Products ───────────── */
const isDeal = (p: Product) => Boolean(p.compareAtPrice && p.compareAtPrice > p.price);

function filterInMemory(all: Product[], f: ProductFilters) {
  let list = all;
  if (f.q) {
    const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter((p) => { const hay = `${p.name} ${p.brand} ${p.category} ${p.shortDescription} ${p.sku} ${p.highlights.join(" ")}`.toLowerCase(); return terms.every((t) => hay.includes(t)); });
  }
  if (f.category) list = list.filter((p) => p.categorySlug === f.category || p.parentCategorySlug === f.category);
  if (f.brands?.length) list = list.filter((p) => f.brands!.includes(p.brandSlug));
  if (f.min != null) list = list.filter((p) => p.price >= f.min!);
  if (f.max != null) list = list.filter((p) => p.price <= f.max!);
  if (f.rating) list = list.filter((p) => p.rating >= f.rating!);
  if (f.inStock) list = list.filter((p) => p.stock > 0);
  if (f.isNew) list = list.filter((p) => p.isNew);
  if (f.bestSeller) list = list.filter((p) => p.isBestSeller);
  if (f.deals) list = list.filter(isDeal);
  const sorters: Record<string, (a: Product, b: Product) => number> = {
    popular: (a, b) => b.soldCount - a.soldCount, newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating,
  };
  return [...list].sort(sorters[f.sort ?? "popular"]);
}

export async function searchProducts(f: ProductFilters): Promise<{ items: Product[]; total: number; page: number; pages: number }> {
  const perPage = f.perPage ?? 24, page = Math.max(1, f.page ?? 1);
  if (!useDb()) {
    const all = filterInMemory(seed.products, f);
    return { items: all.slice((page - 1) * perPage, page * perPage), total: all.length, page, pages: Math.max(1, Math.ceil(all.length / perPage)) };
  }
  let q = createPublicClient().from("product_listing").select("*", { count: "exact" }).eq("status", "active");
  if (f.q) q = q.textSearch("search", f.q, { type: "websearch", config: "english" });
  if (f.category) q = q.or(`category_slug.eq.${f.category},parent_category_slug.eq.${f.category}`);
  if (f.brands?.length) q = q.in("brand_slug", f.brands);
  if (f.min != null) q = q.gte("price", f.min);
  if (f.max != null) q = q.lte("price", f.max);
  if (f.rating) q = q.gte("rating_avg", f.rating);
  if (f.inStock) q = q.gt("stock", 0);
  if (f.isNew) q = q.eq("is_new", true);
  if (f.bestSeller) q = q.eq("is_best_seller", true);
  if (f.deals) q = q.eq("on_sale", true);
  const order: Record<string, [string, boolean]> = { popular: ["sold_count", false], newest: ["created_at", false], "price-asc": ["price", true], "price-desc": ["price", false], rating: ["rating_avg", false] };
  const [col, asc] = order[f.sort ?? "popular"];
  const { data, count } = await q.order(col, { ascending: asc }).range((page - 1) * perPage, page * perPage - 1);
  const total = count ?? 0;
  return { items: (data ?? []).map(mapProduct), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!useDb()) return seed.products.find((p) => p.slug === slug) ?? null;
  const { data } = await createPublicClient().from("product_listing").select("*").eq("slug", slug).eq("status", "active").maybeSingle();
  return data ? mapProduct(data) : null;
});

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  if (!useDb()) return seed.products.filter((p) => ids.includes(p.id));
  const { data } = await createPublicClient().from("product_listing").select("*").in("id", ids);
  return (data ?? []).map(mapProduct);
}

export async function getAllProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  if (!useDb()) return seed.products.map((p) => ({ slug: p.slug, updatedAt: p.createdAt }));
  const { data } = await createPublicClient().from("products").select("slug, updated_at").eq("status", "active");
  return (data ?? []).map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
}

export const getFeatured = async (n = 8) => (await searchProducts({ perPage: 100 })).items.filter((p) => p.isFeatured).slice(0, n);
export const getBestSellers = async (n = 8) => (await searchProducts({ bestSeller: true, sort: "popular", perPage: n })).items;
export const getNewArrivals = async (n = 8) => (await searchProducts({ sort: "newest", perPage: n })).items;
export const getFlashDeals = async (n = 8) =>
  (await searchProducts({ deals: true, perPage: 50 })).items.filter((p) => p.flashDealEndsAt && new Date(p.flashDealEndsAt) > new Date()).slice(0, n);

export async function getRelated(p: Product, n = 4) {
  const { items } = await searchProducts({ category: p.parentCategorySlug ?? p.categorySlug, perPage: n + 1 });
  return items.filter((x) => x.id !== p.id).slice(0, n);
}

/** "Frequently bought together" – curated complementary categories; swap for co-purchase SQL once order volume exists. */
const COMPLEMENTS: Record<string, string[]> = {
  "air-conditioners": ["solar-solutions"], "sound-system": ["sound-system"],
  "kitchen-appliances": ["kitchen-appliances"], "solar-solutions": ["solar-solutions"],
};
export async function getFrequentlyBoughtTogether(p: Product, n = 2) {
  const cats = COMPLEMENTS[p.parentCategorySlug ?? p.categorySlug] ?? [];
  const lists = await Promise.all(cats.map((c) => searchProducts({ category: c, perPage: 6, inStock: true })));
  return lists.flatMap((l) => l.items).filter((x) => x.id !== p.id && x.categorySlug !== p.categorySlug).slice(0, n);
}

export async function getReviews(productId: string): Promise<Review[]> {
  if (!useDb()) return seed.reviews.filter((r) => r.productId === productId);
  const { data } = await createPublicClient().from("reviews")
    .select("id, product_id, author_name, rating, title, body, photos, verified_purchase, created_at")
    .eq("product_id", productId).eq("status", "approved").order("created_at", { ascending: false }).limit(50);
  return (data ?? []).map((r) => ({ id: r.id, productId: r.product_id, author: r.author_name, rating: r.rating, title: r.title ?? "", body: r.body, photos: r.photos ?? [], verified: r.verified_purchase, createdAt: r.created_at }));
}
