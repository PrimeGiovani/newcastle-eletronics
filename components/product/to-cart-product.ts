import type { Product } from "@/lib/types";
import type { CartProduct } from "@/components/cart/store";
export const toCartProduct = (p: Product): CartProduct => ({
  id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images[0], brand: p.brand, stock: p.stock, installable: p.installable,
  comingSoon: p.comingSoon, priceOnRequest: p.priceOnRequest,
});
