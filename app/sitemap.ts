import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/catalog";
import { site } from "@/lib/config";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProductSlugs(), getCategories()]);
  const now = new Date();
  const stat = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({ url: site.url + path, lastModified: now, changeFrequency, priority });
  return [
    stat("/", 1, "daily"), stat("/shop", 0.9, "daily"), stat("/deals", 0.9, "daily"), stat("/solar-solutions", 0.7),
    stat("/installation", 0.6), stat("/about", 0.4, "monthly"), stat("/contact", 0.5, "monthly"), stat("/track", 0.3, "monthly"),
    ...categories.map((c) => stat(`/category/${c.slug}`, c.parentSlug ? 0.7 : 0.8, "daily")),
    ...products.map((p) => ({ url: `${site.url}/product/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
