// Single source of truth for brand details — edit these before launch.
export const site = {
  name: "VoltEdge Electronics & Solar",
  shortName: "VoltEdge",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.voltedge.com",
  description:
    "Premium air conditioners, solar systems, lithium batteries, home appliances and electronics at competitive prices. Expert installation, warranty support and free solar consultation.",
  phone: "+234 800 000 0000",
  whatsapp: "2348000000000", // international format, digits only
  email: "sales@voltedge.com",
  address: { street: "12 Energy Avenue", city: "Lagos", region: "Lagos", country: "NG", postalCode: "100001" },
  hours: "Mon–Sat 8:00–18:00",
  social: { facebook: "https://facebook.com/voltedge", instagram: "https://instagram.com/voltedge", linkedin: "https://linkedin.com/company/voltedge" },
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Solar Solutions", href: "/solar-solutions" },
  { label: "About Us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export const waLink = (text = "Hello, I'd like to enquire about your products.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
