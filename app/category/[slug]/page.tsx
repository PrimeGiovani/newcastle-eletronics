import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBrands, getCategories, getCategory, getSubcategories, searchProducts } from "@/lib/catalog";
import { parseFilters, type SP } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Filters, SortSelect } from "@/components/shop/filters";
import { ProductGrid } from "@/components/product/product-card";
import { Pagination } from "@/components/shop/pagination";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/config";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SP> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategory((await params).slug);
  if (!c) return {};
  return buildMetadata({ title: `${c.name} – Best Prices in Nigeria`, description: `Buy ${c.name.toLowerCase()} online in Nigeria. ${c.description} Genuine brands, nationwide delivery & installation.`, path: `/category/${c.slug}`, images: [c.image] });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await getCategory(slug);
  if (!c) notFound();
  const parent = c.parentSlug ? await getCategory(c.parentSlug) : null;
  const f = { ...parseFilters(sp), category: slug };
  const [res, subs, siblings, categories, brands] = await Promise.all([
    searchProducts(f), getSubcategories(slug), parent ? getSubcategories(parent.slug) : Promise.resolve([]), getCategories(), getBrands(),
  ]);
  const chips = subs.length ? subs : siblings;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: c.name, url: `${site.url}/category/${c.slug}`,
        mainEntity: { "@type": "ItemList", itemListElement: res.items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/product/${p.slug}` })) } }} />
      <Breadcrumbs items={[...(parent ? [{ name: parent.name, path: `/category/${parent.slug}` }] : []), { name: c.name, path: `/category/${c.slug}` }]} />
      <section className="container">
        <div className="tile grid items-center sm:grid-cols-[1.2fr_1fr]">
          <div className="px-8 py-12 sm:px-14 sm:py-16">
            <h1 className="text-4xl font-semibold tracking-tightest sm:text-6xl">{c.name}</h1>
            <p className="mt-4 max-w-lg text-lg text-ink-muted sm:text-xl dark:text-white/70">{c.description}</p>
          </div>
          <div className="relative hidden aspect-[4/3] sm:block"><Image src={c.image} alt="" fill priority sizes="40vw" className="object-cover" /></div>
        </div>
        {chips.length > 0 && (
          <nav aria-label="Subcategories" className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
            {parent && <Link href={`/category/${parent.slug}`} className="shrink-0 rounded-full bg-cloud px-5 py-2.5 text-sm transition hover:bg-cloud-200 dark:bg-muted">All {parent.name}</Link>}
            {chips.map((s) => <Link key={s.slug} href={`/category/${s.slug}`} aria-current={s.slug === slug ? "page" : undefined} className={cn("shrink-0 rounded-full bg-cloud px-5 py-2.5 text-sm transition hover:bg-cloud-200 dark:bg-muted", s.slug === slug && "bg-ink text-white hover:bg-ink dark:bg-white dark:text-ink")}>{s.name}</Link>)}
          </nav>
        )}
        <div className="mt-12 grid gap-10 lg:grid-cols-[240px_1fr]">
          <Suspense><Filters categories={categories} brands={brands} hideCategory /></Suspense>
          <div>
            <div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">{res.total} products</p><Suspense><SortSelect /></Suspense></div>
            {res.items.length ? <ProductGrid products={res.items} priorityFirst={4} /> : <p className="rounded-[28px] bg-cloud dark:bg-muted p-12 text-center text-muted-foreground">No products found. Try removing a filter.</p>}
            <Pagination page={res.page} pages={res.pages} basePath={`/category/${slug}`} sp={sp} />
          </div>
        </div>
      </section>
    </>
  );
}
