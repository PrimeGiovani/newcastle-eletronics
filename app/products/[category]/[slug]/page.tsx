import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import ProductCard from "@/components/ProductCard";
import QuoteForm from "@/components/QuoteForm";
import { Check, WhatsAppIcon } from "@/components/Icons";
import { byCategory, formatPrice, getCategory, getProduct, products, productUrl } from "@/lib/products";
import { pageMeta, productSchema } from "@/lib/seo";
import { site, waLink } from "@/lib/site";

type Props = { params: { category: string; slug: string } };
export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ category: p.category, slug: p.slug }));
export function generateMetadata({ params }: Props) {
  const p = getProduct(params.category, params.slug);
  if (!p) return {};
  return pageMeta({ title: `${p.name} – Price & Specs`, description: `${p.name}: ${p.tagline}. ${formatPrice(p.price)}. ${p.warranty} warranty. Order or request a quote today.`.slice(0, 160), path: productUrl(p), image: p.image });
}

export default function ProductPage({ params }: Props) {
  const p = getProduct(params.category, params.slug);
  const c = getCategory(params.category);
  if (!p || !c) notFound();
  const related = byCategory(c.slug).filter((x) => x.slug !== p.slug).slice(0, 4);
  const wa = waLink(`Hello ${site.shortName}, I'm interested in the ${p.name} (${p.sku}). ${site.url}${productUrl(p)}`);

  return (
    <>
      <JsonLd data={productSchema(p)} />
      <Breadcrumbs items={[{ name: "Products", href: "/products" }, { name: c.name, href: `/products/${c.slug}` }, { name: p.name, href: productUrl(p) }]} />
      <section className="container mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-50">
          <Image src={p.image} alt={p.name} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="lg:py-4">
          <p className="text-sm font-semibold text-eco-600">{c.name}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{p.name}</h1>
          <p className="mt-3 text-lg text-ink-soft">{p.tagline}</p>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-600">{formatPrice(p.price)}</span>
            {p.oldPrice && <><s className="text-lg text-slate-400">{formatPrice(p.oldPrice)}</s><span className="rounded-full bg-eco-50 px-2 py-0.5 text-sm font-semibold text-eco-700">Save {formatPrice(p.oldPrice - p.price)}</span></>}
          </div>
          <p className={`mt-2 text-sm font-medium ${p.inStock ? "text-eco-600" : "text-red-600"}`}>{p.inStock ? "● In stock — ready for delivery" : "Out of stock — request availability"}</p>
          <ul className="mt-6 space-y-2">{p.highlights.map((h) => <li key={h} className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-eco-600" />{h}</li>)}</ul>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-wa"><WhatsAppIcon /> Order on WhatsApp</a>
            <a href="#quote" className="btn-primary">Request Quote</a>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-3 text-center text-xs">
            {[["Warranty", p.warranty.split(",")[0]], ["Delivery", "Fast & insured"], ["Install", "Certified techs"]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3"><dt className="text-ink-soft">{k}</dt><dd className="mt-1 font-semibold text-ink">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container mt-16 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{p.description}</p>
          <h2 className="mt-10 text-2xl font-bold">Specifications</h2>
          <table className="mt-4 w-full overflow-hidden rounded-2xl text-left text-sm ring-1 ring-slate-100">
            <tbody>
              {Object.entries({ Brand: p.brand, SKU: p.sku, ...p.specs, Warranty: p.warranty }).map(([k, v]) => (
                <tr key={k} className="even:bg-slate-50"><th scope="row" className="w-1/3 px-4 py-3 font-medium text-ink-soft">{k}</th><td className="px-4 py-3">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside id="quote" className="h-fit rounded-3xl p-6 ring-1 ring-slate-100 shadow-card lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Get a quote for this product</h2>
          <div className="mt-4"><QuoteForm defaultProduct={p.name} /></div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="container mt-20">
          <div className="flex items-end justify-between"><h2 className="text-2xl font-bold">Related products</h2><Link href={`/products/${c.slug}`} className="text-sm font-semibold text-brand-600">View all →</Link></div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-100 bg-white p-3 pr-24 lg:hidden">
        <a href="#quote" className="btn-primary flex-1">Request Quote</a>
      </div>
    </>
  );
}
