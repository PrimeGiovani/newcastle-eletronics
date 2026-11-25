import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, RotateCcw, ShieldCheck, Wrench } from "lucide-react";
import { getAllProductSlugs, getCategory, getFrequentlyBoughtTogether, getProductBySlug, getRelated, getReviews } from "@/lib/catalog";
import { buildMetadata, productJsonLd } from "@/lib/seo";
import { discountPct, formatNaira } from "@/lib/utils";
import { Breadcrumbs } from "@/components/page-breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProductGallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { DeliveryInfo } from "@/components/product/delivery-estimator";
import { Reviews } from "@/components/product/reviews";
import { Rating } from "@/components/product/rating";
import { ProductGrid } from "@/components/product/product-card";
import { BundleAdd } from "@/components/product/bundle-add";
import { toCartProduct } from "@/components/product/to-cart-product";
import { Badge } from "@/components/ui/misc";
import { Countdown } from "@/components/product/countdown";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 600;

export async function generateStaticParams() {
  return (await getAllProductSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Product not found" };
  return buildMetadata({
    title: `${p.name} – Price in Nigeria`,
    description: `Buy ${p.name} for ${formatNaira(p.price)}. ${p.shortDescription} ${p.warranty} warranty. Fast delivery across Nigeria.`.slice(0, 158),
    path: `/product/${p.slug}`, images: p.images.slice(0, 1),
  });
}

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const [reviews, related, fbt, cat] = await Promise.all([getReviews(p.id), getRelated(p, 4), getFrequentlyBoughtTogether(p, 2), getCategory(p.categorySlug)]);
  const parent = cat?.parentSlug ? await getCategory(cat.parentSlug) : null;
  const off = p.priceOnRequest ? 0 : discountPct(p.price, p.compareAtPrice);
  const stockLabel = p.comingSoon ? "Coming soon – contact us to enquire or book ahead" : p.stock === 0 ? "Out of stock" : p.stock <= p.lowStockThreshold ? `Only ${p.stock} left in stock – order soon` : `In stock (${p.stock} available)`;

  return (
    <>
      <JsonLd data={productJsonLd(p, reviews)} />
      <Breadcrumbs items={[...(parent ? [{ name: parent.name, path: `/category/${parent.slug}` }] : []), { name: p.category, path: `/category/${p.categorySlug}` }, { name: p.name, path: `/product/${p.slug}` }]} />

      <section className="container grid gap-10 pb-6 pt-4 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery images={p.images} name={p.name} />
        <div>
          <p className="text-sm font-semibold text-flame">{p.comingSoon ? "Coming soon" : p.isNew ? "New arrival" : p.isBestSeller ? "Best seller" : p.category}</p>
          <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tightest sm:text-4xl">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {p.reviewCount > 0
              ? <a href="#reviews" className="flex items-center gap-2 hover:underline"><Rating value={p.rating} /><span>{p.rating.toFixed(1)} · {p.reviewCount} reviews</span></a>
              : <a href="#reviews" className="text-muted-foreground hover:underline">No reviews yet</a>}
            <span className="text-muted-foreground">SKU: {p.sku}</span>
          </div>
          <p className="mt-4 text-muted-foreground sm:text-lg">{p.shortDescription}</p>

          <div className="mt-8 rounded-[24px] bg-cloud p-6 dark:bg-muted">
            {p.priceOnRequest ? (
              <div><span className="text-3xl font-semibold tracking-tight sm:text-4xl">Price on request</span><p className="mt-1 text-sm text-muted-foreground">Contact us on WhatsApp or call for pricing{p.comingSoon ? " and availability" : ""}.</p></div>
            ) : <>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight sm:text-4xl">{formatNaira(p.price)}</span>
              {off > 0 && <><s className="text-lg text-muted-foreground">{formatNaira(p.compareAtPrice!)}</s><Badge variant="sale">Save {formatNaira(p.compareAtPrice! - p.price)}</Badge></>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">VAT inclusive. Pay with card, bank transfer, USSD or QR.</p>
            </>}
            {p.flashDealEndsAt && new Date(p.flashDealEndsAt) > new Date() && (
              <div className="mt-5 flex flex-wrap items-center gap-3"><span className="text-sm font-semibold text-flame">Flash deal ends in</span><Countdown to={p.flashDealEndsAt} /></div>
            )}
            <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${p.comingSoon ? "text-ink-soft dark:text-white/80" : p.stock === 0 ? "text-destructive" : p.stock <= p.lowStockThreshold ? "text-flame" : "text-emerald-600"}`}>
              <span className="h-2 w-2 rounded-full bg-current" />{stockLabel}
            </p>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">{p.highlights.map((h) => <li key={h} className="flex gap-2 text-sm"><BadgeCheck className="h-5 w-5 shrink-0 text-electric" />{h}</li>)}</ul>
          <div className="mt-6"><PurchasePanel product={toCartProduct(p)} /></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DeliveryInfo />
            <ul className="space-y-3 rounded-[20px] bg-cloud p-5 dark:bg-muted text-sm">
              <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-electric" /><span><b>Newcastle warranty:</b> {p.warranty}</span></li>
              <li className="flex gap-3"><RotateCcw className="h-5 w-5 shrink-0 text-electric" /><span><b>7-day swap policy</b> – unused, undamaged and fully working items can be swapped. <a href="/about#policies" className="text-electric hover:underline">Details</a></span></li>
              {p.installable && <li className="flex gap-3"><Wrench className="h-5 w-5 shrink-0 text-electric" /><span><b>Installation by trusted Newcastle installers</b> – separate charge, arranged after purchase. <a href="/installation" className="text-electric hover:underline">Contact us to book</a></span></li>}
            </ul>
          </div>
        </div>
      </section>

      {fbt.length > 0 && !p.priceOnRequest && !p.comingSoon && (
        <section className="container mt-10">
          <h2 className="font-display text-2xl font-semibold">Frequently bought together</h2>
          <div className="mt-5 flex flex-col gap-5 rounded-[28px] bg-cloud p-6 dark:bg-muted lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {[p, ...fbt].map((x, i) => (
                <div key={x.id} className="flex items-center gap-3">
                  {i > 0 && <span className="text-2xl text-muted-foreground" aria-hidden>+</span>}
                  <Link href={`/product/${x.slug}`} className="flex w-44 items-center gap-3">
                    <Image src={x.images[0]} alt="" width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
                    <span className="text-sm"><span className="line-clamp-2 font-medium">{x.name}</span><b>{formatNaira(x.price)}</b></span>
                  </Link>
                </div>
              ))}
            </div>
            <BundleAdd products={[p, ...fbt].map(toCartProduct)} />
          </div>
        </section>
      )}

      <section className="container mt-14 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <h2 className="font-display text-2xl font-semibold">Overview</h2>
          <p className="mt-4 leading-relaxed text-foreground/90">{p.description}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">Technical specifications</h2>
          <table className="mt-4 w-full overflow-hidden rounded-2xl text-sm bg-cloud dark:bg-muted">
            <tbody>
              {Object.entries({ Brand: p.brand, Model: p.sku, ...p.specs, Warranty: p.warranty }).map(([k, v]) => (
                <tr key={k} className="even:bg-white/60 dark:even:bg-white/5"><th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-muted-foreground">{k}</th><td className="px-4 py-3">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="reviews" className="container mt-16 scroll-mt-28">
        <h2 className="mb-8 font-display text-2xl font-semibold">Customer reviews</h2>
        <Reviews productId={p.id} reviews={reviews} rating={p.rating} count={p.reviewCount} />
      </section>

      {related.length > 0 && (
        <section className="container mt-16 pb-16 lg:pb-0">
          <h2 className="mb-6 font-display text-2xl font-semibold">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
