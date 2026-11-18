import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { byCategory, categories } from "@/lib/products";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "All Products – ACs, Solar, Audio & Kitchen", description: "Browse inverter air conditioners, solar panels, inverters, lithium batteries, sound bars, gas cookers and range hoods at competitive prices.", path: "/products" });

export default function ProductsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Products", href: "/products" }]} />
      <div className="container pt-8">
        <SectionHeading as="h1" title="Our Products" sub="Genuine electronics, appliances and solar equipment with warranty and expert installation." />
        <nav aria-label="Categories" className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => <Link key={c.slug} href={`/products/${c.slug}`} className="btn-outline shrink-0">{c.name}</Link>)}
        </nav>
      </div>
      {categories.map((c) => (
        <section key={c.slug} className="container pt-14" aria-labelledby={`h-${c.slug}`}>
          <div className="flex items-end justify-between">
            <h2 id={`h-${c.slug}`} className="text-2xl font-bold">{c.name}</h2>
            <Link href={`/products/${c.slug}`} className="text-sm font-semibold text-brand-600">View all →</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{byCategory(c.slug).slice(0, 4).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </section>
      ))}
    </>
  );
}
