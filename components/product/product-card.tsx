import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPct, formatNaira } from "@/lib/utils";
import { Rating } from "./rating";
import { CardActions } from "./card-actions";
import { toCartProduct } from "./to-cart-product";

/** Apple/Samsung-style product tile: large product shot on #F5F5F7, quiet typography, price-forward. */
export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const off = p.priceOnRequest ? 0 : discountPct(p.price, p.compareAtPrice);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white shadow-card transition-all duration-500 ease-apple hover:-translate-y-1 hover:shadow-lift dark:bg-card">
      <div className="relative aspect-square overflow-hidden bg-cloud dark:bg-muted">
        <Image src={p.images[0]} alt={p.name} fill priority={priority} sizes="(min-width:1280px) 24vw, (min-width:768px) 33vw, 50vw"
          className="object-cover transition duration-700 ease-apple group-hover:scale-[1.04]" />
        <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
          {p.comingSoon && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-ink">Coming soon</span>}
          {p.isNew && <span className="text-xs font-semibold text-flame">New</span>}
          {p.isBestSeller && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">Best seller</span>}
          {off > 0 && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-flame-600 backdrop-blur">Save {off}%</span>}
        </div>
        <CardActions product={toCartProduct(p)} />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-xs text-muted-foreground">{p.category}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight sm:text-base">
          <Link href={`/product/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">{p.name.replace(/^Newcastle /, "")}</Link>
        </h3>
        {p.reviewCount > 0 && <Rating value={p.rating} count={p.reviewCount} className="mt-2" />}
        <div className="mt-auto pt-4">
          {p.priceOnRequest ? (
            <span className="text-[15px] font-semibold">Price on request</span>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[17px] font-semibold">{formatNaira(p.price)}</span>
              {off > 0 && <s className="text-xs text-muted-foreground">{formatNaira(p.compareAtPrice!)}</s>}
            </div>
          )}
          <p className={p.comingSoon ? "mt-0.5 text-xs text-muted-foreground" : p.stock === 0 ? "mt-0.5 text-xs text-destructive" : p.stock <= p.lowStockThreshold ? "mt-0.5 text-xs text-flame-600" : "mt-0.5 text-xs text-muted-foreground"}>
            {p.comingSoon ? "Coming soon · Contact us to book ahead" : p.stock === 0 ? "Out of stock" : p.stock <= p.lowStockThreshold ? `Only ${p.stock} left` : "In stock"}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityFirst = 0 }: { products: Product[]; priorityFirst?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < priorityFirst} />)}
    </div>
  );
}
