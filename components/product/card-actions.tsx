"use client";
import { GitCompareArrows, Heart, ShoppingBag } from "lucide-react";
import { useStore, type CartProduct } from "@/components/cart/store";
import { cn } from "@/lib/utils";

export function CardActions({ product }: { product: CartProduct }) {
  const { add, toggleWishlist, inWishlist, toggleCompare, inCompare } = useStore();
  const btn = "relative z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition duration-300 hover:scale-110 dark:bg-black/60 dark:text-white";
  return (
    <>
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button className={btn} onClick={() => toggleWishlist(product)} aria-pressed={inWishlist(product.id)} aria-label={`Add ${product.name} to wishlist`}>
          <Heart className={cn("h-4 w-4", inWishlist(product.id) && "fill-flame text-flame")} />
        </button>
        <button className={cn(btn, "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100")} onClick={() => toggleCompare(product)} aria-pressed={inCompare(product.id)} aria-label={`Compare ${product.name}`}>
          <GitCompareArrows className={cn("h-4 w-4", inCompare(product.id) && "text-electric")} />
        </button>
      </div>
      <button disabled={product.stock === 0} onClick={() => add(product)} aria-label={`Add ${product.name} to cart`}
        className="absolute inset-x-4 bottom-4 z-10 flex h-10 items-center justify-center gap-2 rounded-full bg-electric text-sm font-medium text-white shadow-soft transition duration-500 ease-apple disabled:opacity-60 lg:translate-y-14 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100">
        <ShoppingBag className="h-4 w-4" />{product.stock === 0 ? "Sold out" : "Add to cart"}
      </button>
    </>
  );
}
