"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/components/cart/store";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, add, ready } = useStore();
  return (
    <section className="container py-10">
      <h1 className="font-display text-3xl font-semibold">My wishlist</h1>
      {ready && !wishlist.length && <div className="mt-8 rounded-[28px] bg-cloud dark:bg-muted p-12 text-center"><Heart className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 font-semibold">Your wishlist is empty</p><Link href="/shop" className="mt-4 inline-block font-semibold text-electric">Discover products →</Link></div>}
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {wishlist.map((p) => (
          <li key={p.id} className="rounded-[28px] bg-white shadow-card dark:bg-card p-4">
            <Link href={`/product/${p.slug}`}><Image src={p.image} alt="" width={300} height={300} className="aspect-square w-full rounded-2xl object-cover" /><p className="mt-3 line-clamp-2 text-sm font-semibold">{p.name}</p></Link>
            <p className="font-semibold">{formatNaira(p.price)}</p>
            <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" disabled={!p.stock} onClick={() => add(p)}>Add to cart</Button><Button size="sm" variant="ghost" onClick={() => toggleWishlist(p)}>Remove</Button></div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">Signed-in customers' wishlists are also saved to their account.</p>
    </section>
  );
}
