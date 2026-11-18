import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { categories, products, productUrl } from "@/lib/products";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string, priority = 0.7) => ({ url: site.url + p, lastModified: new Date(), priority });
  return [
    u("/", 1), u("/products", 0.9), u("/solar-solutions", 0.9), u("/about", 0.5), u("/projects", 0.6), u("/blog", 0.6), u("/contact", 0.8),
    ...categories.map((c) => u(`/products/${c.slug}`, 0.8)),
    ...products.map((p) => u(productUrl(p), 0.7)),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.5 })),
  ];
}
