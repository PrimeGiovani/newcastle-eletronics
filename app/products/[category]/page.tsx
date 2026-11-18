import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import QuoteForm from "@/components/QuoteForm";
import JsonLd from "@/components/JsonLd";
import { byCategory, categories, getCategory, productUrl } from "@/lib/products";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: { category: string } };
export const dynamicParams = false;
export const generateStaticParams = () => categories.map((c) => ({ category: c.slug }));
export function generateMetadata({ params }: Props) {
  const c = getCategory(params.category);
  return c ? pageMeta({ title: c.metaTitle, description: c.metaDescription, path: `/products/${c.slug}`, image: c.image }) : {};
}

export default function CategoryPage({ params }: Props) {
  const c = getCategory(params.category);
  if (!c) notFound();
  const items = byCategory(c.slug);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: c.name,
        itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: site.url + productUrl(p), name: p.name })) }} />
      <Breadcrumbs items={[{ name: "Products", href: "/products" }, { name: c.name, href: `/products/${c.slug}` }]} />
      <header className="container pt-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">{c.description}</p>
        <p className="mt-2 text-sm text-ink-soft">{items.length} products</p>
      </header>
      <section className="container mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 2} />)}
      </section>
      <section className="container mt-20 grid gap-10 rounded-3xl bg-slate-50 p-6 sm:p-10 lg:grid-cols-2">
        <div><h2 className="text-2xl font-bold">Need help choosing {c.name.toLowerCase()}?</h2><p className="mt-3 text-ink-soft">Our specialists will recommend the right model for your space and budget. Bulk & contractor pricing available.</p></div>
        <QuoteForm />
      </section>
    </>
  );
}
