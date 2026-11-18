import type { Metadata } from "next";
import { site } from "./site";
import type { Product } from "./products";
import { productUrl } from "./products";

export function pageMeta({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: site.name, type: "website", images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const orgSchema = () => ({
  "@context": "https://schema.org", "@type": ["Organization", "ElectronicsStore"], name: site.name, url: site.url,
  logo: `${site.url}/logo.svg`, telephone: site.phone, email: site.email,
  address: { "@type": "PostalAddress", streetAddress: site.address.street, addressLocality: site.address.city, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: site.address.country },
  openingHours: "Mo-Sa 08:00-18:00", sameAs: Object.values(site.social),
});

export const productSchema = (p: Product) => ({
  "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.sku, description: p.description,
  image: [p.image], brand: { "@type": "Brand", name: p.brand },
  offers: { "@type": "Offer", url: site.url + productUrl(p), priceCurrency: "NGN", price: p.price,
    availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: site.name } },
});

export const breadcrumbSchema = (items: { name: string; href: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: site.url + it.href })),
});

export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
