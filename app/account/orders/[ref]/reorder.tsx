"use client";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/cart/store";
import type { Product } from "@/lib/types";
import { toCartProduct } from "@/components/product/to-cart-product";

export function Reorder({ ids }: { ids: string[] }) {
  const { add } = useStore(); const router = useRouter();
  async function reorder() {
    const { items } = (await fetch(`/api/products?ids=${ids.join(",")}`).then((r) => r.json())) as { items: Product[] };
    items.filter((p) => p.stock > 0 && !p.comingSoon && !p.priceOnRequest).forEach((p) => add(toCartProduct(p)));
    router.push("/cart");
  }
  return <Button variant="outline" size="sm" onClick={reorder} disabled={!ids.length}><RotateCcw />Reorder</Button>;
}
