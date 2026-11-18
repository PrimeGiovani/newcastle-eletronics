export const site = {
  name: "Newcastle Electronics",
  tagline: "Reliable Technology For Every Home",
  description:
    "For over 30 years, Newcastle has designed and manufactured inverter air conditioners, sound systems, gas cookers, home appliances and solar solutions. Factory-direct prices, nationwide delivery and warranty across Nigeria.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.newcastleelectronics.com",
  phone: "+234 706 837 6168",
  email: "info@newcastleelectronics.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2347068376168",
  address: { street: "18 Oba Daudu St, Iyana Iba", city: "Ojo", state: "Lagos", country: "NG", postalCode: "102101" },
  /** One-line display form used across the site */
  addressLine: "18 Oba Daudu St, Iyana Iba, Ojo, Lagos, Nigeria",
  hours: "Mon–Sat 8:30am – 6:30pm",
  social: {
    instagram: "https://instagram.com/newcastleelectronics",
    facebook: "https://facebook.com/newcastleelectronics",
    x: "https://x.com/newcastleng",
  },
};

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Air Conditioners", href: "/category/air-conditioners" },
  { label: "Sound System", href: "/category/sound-system" },
  { label: "Kitchen Appliances", href: "/category/kitchen-appliances" },
  { label: "Solar Solutions", href: "/solar-solutions" },
  { label: "Deals", href: "/deals" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export type WaIntent = "sales" | "product" | "quote" | "support";
const waTemplates: Record<WaIntent, string> = {
  sales: "Hello Newcastle Electronics, I'd like to speak with sales.",
  product: "Hello, I have a question about this product:",
  quote: "Hello, I'd like a quotation for:",
  support: "Hello, I need help with my order. Order number:",
};
export const waLink = (intent: WaIntent = "sales", extra = "") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`${waTemplates[intent]} ${extra}`.trim())}`;
