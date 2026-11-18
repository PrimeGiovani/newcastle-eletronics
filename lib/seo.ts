import type { Metadata } from "next";
import { site } from "./config";
import type { Product, Review } from "./types";

export function buildMetadata({ title, description, path, images }: { title: string; description: string; path: string; images?: string[] }): Metadata {
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: site.name, locale: "en_NG", type: "website", images: images?.map((url) => ({ url })) },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org", "@type": ["Organization", "ElectronicsStore"], "@id": `${site.url}/#org`, brand: { "@type": "Brand", name: "Newcastle" },
  name: site.name, url: site.url, logo: `${site.url}/logo.png`, image: `${site.url}/emblem.png`, telephone: site.phone, email: site.email, priceRange: "₦₦",
  address: { "@type": "PostalAddress", streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.state, postalCode: site.address.postalCode, addressCountry: "NG" },
  openingHours: "Mo-Sa 08:30-18:30", sameAs: Object.values(site.social),
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org", "@type": "WebSite", url: site.url, name: site.name,
  potentialAction: { "@type": "SearchAction", target: `${site.url}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" },
});

export const productJsonLd = (p: Product, reviews: Review[]) => ({
  "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.sku, image: p.images, description: p.description,
  brand: { "@type": "Brand", name: p.brand }, manufacturer: { "@id": `${site.url}/#org` }, category: p.category,
  ...(p.reviewCount > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount } }),
  review: reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.author }, reviewRating: { "@type": "Rating", ratingValue: r.rating }, reviewBody: r.body, datePublished: r.createdAt })),
  offers: {
    "@type": "Offer", url: `${site.url}/product/${p.slug}`, priceCurrency: "NGN", price: p.price, itemCondition: "https://schema.org/NewCondition",
    availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", seller: { "@id": `${site.url}/#org` },
    shippingDetails: { "@type": "OfferShippingDetails", shippingDestination: { "@type": "DefinedRegion", addressCountry: "NG" } },
    hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", applicableCountry: "NG", returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: 7 },
  },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: site.url + it.path })),
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
