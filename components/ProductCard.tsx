import Image from "next/image";
import Link from "next/link";
import { formatPrice, productUrl, type Product } from "@/lib/products";

export default function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <Image src={p.image} alt={p.name} fill priority={priority} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        {p.badges?.[0] && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-eco-700">{p.badges[0]}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-ink"><Link href={productUrl(p)} className="after:absolute after:inset-0">{p.name}</Link></h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{p.tagline}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-4">
          <span className="text-lg font-bold text-brand-600">{formatPrice(p.price)}</span>
          {p.oldPrice && <s className="text-sm text-slate-400">{formatPrice(p.oldPrice)}</s>}
        </div>
      </div>
    </article>
  );
}
