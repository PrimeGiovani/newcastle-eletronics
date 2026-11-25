import { searchProducts, getFlashDeals } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { ProductGrid } from "@/components/product/product-card";
import { Countdown } from "@/components/product/countdown";
import { Breadcrumbs } from "@/components/page-breadcrumbs";

export const revalidate = 300;
export const metadata = buildMetadata({ title: "Newcastle Deals & Flash Sales", description: "Today's best deals on Newcastle air conditioners, sound systems, refrigerators and kitchen appliances. Limited-time flash sales across Nigeria.", path: "/deals" });

export default async function DealsPage() {
  const [flash, { items }] = await Promise.all([getFlashDeals(8), searchProducts({ deals: true, sort: "popular", perPage: 48 })]);
  const ends = flash[0]?.flashDealEndsAt;
  return (
    <>
      <Breadcrumbs items={[{ name: "Deals", path: "/deals" }]} />
      <section className="container">
        <div className="tile flex flex-col items-center px-6 py-16 text-center">
          <p className="eyebrow">Deals</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tightest sm:text-6xl">15% off selected models.</h1>
          <p className="mt-4 max-w-xl text-lg text-ink-muted sm:text-xl dark:text-white/70">Standing air conditioners NC 24CF and NC 18CFIN (black & rose gold), home theatre NC 1818, gas hob NC 9001G and range hood NC E017[B]. While stocks last.</p>
          {ends && <div className="mt-8"><p className="mb-3 text-sm text-muted-foreground">Flash sale ends in</p><Countdown to={ends} /></div>}
        </div>
        {flash.length > 0 && <><h2 className="mb-6 mt-12 font-display text-2xl font-semibold">⚡ Flash deals</h2><ProductGrid products={flash} priorityFirst={4} /></>}
        <h2 className="mb-6 mt-14 font-display text-2xl font-semibold">All discounted products</h2>
        <ProductGrid products={items} />
      </section>
    </>
  );
}
