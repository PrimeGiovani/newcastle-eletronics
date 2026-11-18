"use client";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type CartProduct } from "@/components/cart/store";
import { formatNaira } from "@/lib/utils";
export function BundleAdd({ products }: { products: CartProduct[] }) {
  const { add, notify } = useStore();
  const total = products.reduce((s, p) => s + p.price, 0);
  const available = products.filter((p) => p.stock > 0);
  return (
    <div className="text-center lg:w-56">
      <p className="text-sm text-muted-foreground">Total for {products.length} items</p>
      <p className="text-2xl font-semibold">{formatNaira(total)}</p>
      <Button className="mt-3 w-full" disabled={!available.length} onClick={() => { available.forEach((p) => add(p)); notify(`${available.length} items added to cart`); }}><ShoppingBag />Add all to cart</Button>
    </div>
  );
}
