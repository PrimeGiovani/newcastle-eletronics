/**
 * Feature switches.
 * customerAccounts – customer sign-in / register (email + Google), "My account", saved addresses & cards.
 *   When off: guest checkout only, reviews are submitted with name + email and published after staff approval,
 *   and /auth/login becomes a hidden staff-only login for the admin dashboard.
 *   Override per deployment with NEXT_PUBLIC_CUSTOMER_ACCOUNTS=on|off (Vercel → Environment Variables).
 */
const ACCOUNTS_DEFAULT = "off"; // This build: guest checkout only (no customer sign-in)
export const features = {
  customerAccounts: (process.env.NEXT_PUBLIC_CUSTOMER_ACCOUNTS ?? ACCOUNTS_DEFAULT).toLowerCase() !== "off",
};

export const site = {
  name: "Newcastle Electronics",
  tagline: "Reliable Technology For Every Home",
  description:
    "For over 30 years, Newcastle has designed and manufactured inverter air conditioners, sound systems, gas cookers, home appliances and solar solutions. Factory-direct prices, nationwide delivery and warranty across Nigeria.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.newcastleelectronics.com",
  /** Calls only */
  phone: "+234 810 902 4035",
  phoneLocal: "0810 902 4035",
  phoneHref: "tel:+2348109024035",
  /** WhatsApp only (no calls) */
  whatsappDisplay: "+234 706 837 6168",
  whatsappLocal: "0706 837 6168",
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
  { label: "Kitchen Appliances", href: "/category/kitchen-appliances" },
  { label: "Air Conditioners", href: "/category/air-conditioners" },
  { label: "Solar Solutions", href: "/solar-solutions" },
  { label: "Sound System", href: "/category/sound-system" },
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
