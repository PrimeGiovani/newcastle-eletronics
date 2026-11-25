export type Category = { id: string; slug: string; name: string; description: string; image: string; parentSlug: string | null; sortOrder: number };
export type Brand = { id: string; slug: string; name: string };
export type Product = {
  id: string; slug: string; sku: string; name: string;
  brand: string; brandSlug: string; category: string; categorySlug: string; parentCategorySlug: string | null;
  price: number; compareAtPrice: number | null; stock: number; lowStockThreshold: number;
  rating: number; reviewCount: number; soldCount: number;
  images: string[]; shortDescription: string; description: string;
  highlights: string[]; specs: Record<string, string>; warranty: string;
  isFeatured: boolean; isBestSeller: boolean; isNew: boolean; flashDealEndsAt: string | null;
  /** Not yet available – shown with "Coming soon" and a Contact-us button instead of Add to cart */
  comingSoon: boolean;
  /** Price hidden ("Price on request"); cannot be bought online */
  priceOnRequest: boolean;
  installable: boolean; createdAt: string;
};
export type Review = { id: string; productId: string; author: string; rating: number; title: string; body: string; photos: string[]; verified: boolean; createdAt: string };
export type Coupon = { code: string; type: "percent" | "fixed"; value: number; minSubtotal: number; maxDiscount: number | null; expiresAt: string | null; active: boolean };

export type ProductFilters = {
  q?: string; category?: string; brands?: string[]; min?: number; max?: number; rating?: number;
  inStock?: boolean; isNew?: boolean; bestSeller?: boolean; deals?: boolean;
  sort?: "popular" | "newest" | "price-asc" | "price-desc" | "rating"; page?: number; perPage?: number;
};

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "return_requested" | "returned";
export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded", "return_requested", "returned"];
