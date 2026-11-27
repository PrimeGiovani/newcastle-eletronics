import type { Metadata } from "next";
import { Suspense } from "react";
import { getBrands, getCategories, searchProducts } from "@/lib/catalog";
import { parseFilters, type SP } from "@/lib/search-params";
import { Filters, SortSelect } from "@/components/shop/filters";
import { ProductGrid } from "@/components/product/product-card";
import { Pagination } from "@/components/shop/pagination";
import { Breadcrumbs } from "@/components/page-breadcrumbs";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  return {
    title: q ? `Search results for “${q}”` : "Shop Newcastle ACs, Sound Systems, Appliances & Solar",
    description: "Shop Newcastle inverter air conditioners, sound systems, gas cookers, home appliances and solar products at factory-direct prices in Nigeria.",
    alternates: { canonical: "/shop" },
    robots: Object.keys(sp).length ? { index: false, follow: true } : undefined, // avoid indexing infinite filter combos
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const [res, categories, brands] = await Promise.all([searchProducts(f), getCategories(), getBrands()]);
  return (
    <>
      <Breadcrumbs items={[{ name: "Shop", path: "/shop" }]} />
      <div className="container">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{f.q ? <>Results for “{f.q}”</> : "Shop all products"}</h1>
        <div className="mt-6 grid gap-8 lg:grid-cols-[250px_1fr]">
          <Suspense><Filters categories={categories} brands={brands} /></Suspense>
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground" aria-live="polite">{res.total} product{res.total === 1 ? "" : "s"}</p>
              <Suspense><SortSelect /></Suspense>
            </div>
            {res.items.length ? <ProductGrid products={res.items} priorityFirst={4} /> : (
              <div className="rounded-[28px] bg-cloud dark:bg-muted p-12 text-center"><p className="text-lg font-semibold">No products match your search</p><p className="mt-2 text-muted-foreground">Try fewer filters, a different brand, or ask us on WhatsApp, we can source it for you.</p></div>
            )}
            <Pagination page={res.page} pages={res.pages} basePath="/shop" sp={sp} />
          </div>
        </div>
      </div>
    </>
  );
}
