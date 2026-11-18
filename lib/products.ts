import { img } from "./site";

export type Category = {
  slug: string; name: string; short: string; description: string; image: string;
  metaTitle: string; metaDescription: string;
};
export type Product = {
  slug: string; category: string; name: string; tagline: string; price: number; oldPrice?: number;
  image: string; gallery?: string[]; badges?: string[]; highlights: string[];
  specs: Record<string, string>; warranty: string; inStock: boolean; featured?: boolean; brand: string; sku: string;
  description: string;
};

const IM = {
  ac: "photo-1631545806609-35d4ae440431", ac2: "photo-1585338447937-7082f8fc763d",
  solar: "photo-1509391366360-2e959784a276", solar2: "photo-1508514177221-188b1cf16e9d",
  battery: "photo-1620714223084-8fcacc6dfd8d", inverter: "photo-1624397640148-949b1732bb0a",
  street: "photo-1513828583688-c52646db42da", sound: "photo-1545454675-3531b543be5d",
  cooker: "photo-1556911220-bff31c812dba", hood: "photo-1556909114-f6e7ad7d3136",
};

export const categories: Category[] = [
  { slug: "air-conditioners", name: "Air Conditioners", short: "AC Units", image: img(IM.ac),
    description: "Energy-efficient inverter split and standing units from 1HP to 3HP for homes, offices and hotels.",
    metaTitle: "Air Conditioners – Inverter Split & Standing AC Units",
    metaDescription: "Buy 1HP, 1.5HP, 2HP split and 3HP standing inverter air conditioners. Genuine units, expert installation and warranty support." },
  { slug: "solar-solutions", name: "Solar Solutions", short: "Solar Systems", image: img(IM.solar),
    description: "Solar panels, hybrid and off-grid inverters, lithium batteries, all-in-one ESS and solar street lights.",
    metaTitle: "Solar Panels, Inverters & Lithium Batteries",
    metaDescription: "Complete solar solutions: mono PERC panels, hybrid inverters, LiFePO4 batteries, ESS systems and street lights. Free solar consultation." },
  { slug: "audio-systems", name: "Audio Systems", short: "Audio Systems", image: img(IM.sound),
    description: "Cinematic sound bars with Dolby Audio and wireless subwoofers.",
    metaTitle: "Sound Bars & Home Audio Systems",
    metaDescription: "Premium sound bars with wireless subwoofers, Bluetooth and HDMI ARC. Competitive prices and fast delivery." },
  { slug: "kitchen-appliances", name: "Kitchen Appliances", short: "Kitchen Appliances", image: img(IM.cooker),
    description: "Gas cookers and range hoods built for modern kitchens.",
    metaTitle: "Gas Cookers & Range Hoods – Kitchen Appliances",
    metaDescription: "Shop durable gas cookers and stainless range hoods. Genuine products, warranty support and delivery." },
];

const P = (p: Product) => p;
export const products: Product[] = [
  P({ slug: "1hp-inverter-split-ac", category: "air-conditioners", name: "1HP Inverter Split AC", brand: "VoltEdge", sku: "VE-AC-1HP",
    tagline: "Quiet, efficient cooling for bedrooms up to 15m²", price: 385000, oldPrice: 420000, image: img(IM.ac, 800), featured: true,
    badges: ["Inverter", "Up to 60% energy saving"], inStock: true, warranty: "2 years unit, 5 years compressor",
    highlights: ["Inverter compressor", "R32 eco refrigerant", "Turbo cool mode", "Low-voltage startup (150V)"],
    specs: { "Cooling capacity": "9,000 BTU", "Power input": "780W", Refrigerant: "R32", "Noise level": "24 dB(A)", "Room size": "Up to 15m²" },
    description: "A compact inverter split unit engineered for efficient, whisper-quiet cooling in bedrooms and small offices." }),
  P({ slug: "1-5hp-inverter-split-ac", category: "air-conditioners", name: "1.5HP Inverter Split AC", brand: "VoltEdge", sku: "VE-AC-15HP",
    tagline: "The best-selling all-rounder for living rooms", price: 465000, oldPrice: 510000, image: img(IM.ac2, 800), featured: true,
    badges: ["Best seller", "Inverter"], inStock: true, warranty: "2 years unit, 5 years compressor",
    highlights: ["Inverter compressor", "Wi-Fi app control", "Anti-corrosion gold fin", "Self-clean"],
    specs: { "Cooling capacity": "12,000 BTU", "Power input": "1,050W", Refrigerant: "R32", "Noise level": "26 dB(A)", "Room size": "Up to 22m²" },
    description: "Our most popular unit balances capacity, efficiency and smart features for living rooms and offices." }),
  P({ slug: "2hp-inverter-split-ac", category: "air-conditioners", name: "2HP Inverter Split AC", brand: "VoltEdge", sku: "VE-AC-2HP",
    tagline: "Powerful cooling for large rooms and offices", price: 590000, image: img(IM.ac, 800), inStock: true,
    warranty: "2 years unit, 5 years compressor", highlights: ["Inverter compressor", "4-way airflow", "Wi-Fi control", "Sleep mode"],
    specs: { "Cooling capacity": "18,000 BTU", "Power input": "1,550W", Refrigerant: "R32", "Room size": "Up to 32m²" },
    description: "High-capacity inverter split AC for large living areas, conference rooms and hotel suites." }),
  P({ slug: "3hp-standing-unit-ac", category: "air-conditioners", name: "3HP Floor Standing AC", brand: "VoltEdge", sku: "VE-AC-3HPS",
    tagline: "Commercial-grade cooling for halls and showrooms", price: 1150000, image: img(IM.ac2, 800), inStock: true,
    warranty: "2 years unit, 5 years compressor", highlights: ["Long-throw airflow 15m", "Inverter", "Touch display", "Auto-restart"],
    specs: { "Cooling capacity": "24,000 BTU", "Power input": "2,400W", Refrigerant: "R410A", "Room size": "Up to 50m²" },
    description: "A floor-standing unit for halls, churches, restaurants, showrooms and open-plan offices." }),
  P({ slug: "550w-mono-perc-solar-panel", category: "solar-solutions", name: "550W Mono PERC Solar Panel", brand: "VoltEdge", sku: "VE-PV-550",
    tagline: "Tier-1 half-cut cells, 21.3% efficiency", price: 145000, image: img(IM.solar, 800), inStock: true,
    warranty: "12 years product, 25 years performance", highlights: ["Half-cut cell design", "21.3% efficiency", "IP68 junction box", "Salt-mist resistant"],
    specs: { "Peak power": "550W", Efficiency: "21.3%", "Cell type": "Mono PERC half-cut", Dimensions: "2279×1134×35mm" },
    description: "High-yield monocrystalline module for residential and commercial rooftop arrays." }),
  P({ slug: "5kw-hybrid-inverter", category: "solar-solutions", name: "5KW Hybrid Inverter", brand: "VoltEdge", sku: "VE-INV-5H",
    tagline: "Grid, solar and battery in one smart unit", price: 820000, image: img(IM.inverter, 800), inStock: true,
    warranty: "5 years", highlights: ["Pure sine wave", "Dual MPPT", "Wi-Fi monitoring", "Lithium compatible"],
    specs: { "Rated power": "5,000W", "PV input max": "6,500W", "Battery voltage": "48V", MPPT: "2" },
    description: "Hybrid inverter that intelligently balances solar, battery and grid power." }),
  P({ slug: "3-5kw-off-grid-inverter", category: "solar-solutions", name: "3.5KW Off-grid Inverter", brand: "VoltEdge", sku: "VE-INV-35O",
    tagline: "Reliable power where the grid can't reach", price: 520000, image: img(IM.inverter, 800), inStock: true,
    warranty: "3 years", highlights: ["Built-in MPPT 100A", "Works without battery", "LCD display", "Generator input"],
    specs: { "Rated power": "3,500W", "Battery voltage": "24V", "PV input max": "4,000W" },
    description: "Standalone off-grid inverter for homes, shops and remote sites." }),
  P({ slug: "10kwh-lithium-battery", category: "solar-solutions", name: "10KWh LiFePO4 Lithium Battery", brand: "VoltEdge", sku: "VE-BAT-10",
    tagline: "6,000+ cycles, wall or rack mounted", price: 2350000, oldPrice: 2550000, image: img(IM.battery, 800), featured: true,
    badges: ["6,000 cycles", "10-yr design life"], inStock: true, warranty: "5 years",
    highlights: ["LiFePO4 chemistry", "Smart BMS", "CAN/RS485 comms", "Expandable to 16 units"],
    specs: { Capacity: "10.24 kWh", Voltage: "51.2V", "Cycle life": "6,000+ @ 80% DoD", Weight: "92kg" },
    description: "Safe, long-life lithium iron phosphate storage compatible with major hybrid inverters." }),
  P({ slug: "5kw-all-in-one-ess", category: "solar-solutions", name: "5KW All-in-One Solar ESS", brand: "VoltEdge", sku: "VE-ESS-5",
    tagline: "Inverter + 10KWh battery in one sleek cabinet", price: 3650000, image: img(IM.solar2, 800), featured: true,
    badges: ["Plug & play", "Free consultation"], inStock: true, warranty: "5 years",
    highlights: ["Integrated 5KW hybrid inverter", "10KWh LiFePO4", "App monitoring", "UPS switch < 10ms"],
    specs: { "Inverter power": "5,000W", "Battery capacity": "10.24 kWh", "PV input max": "6,500W", Enclosure: "IP65" },
    description: "A complete energy storage system that installs in hours and powers a typical home 24/7." }),
  P({ slug: "100w-solar-street-light", category: "solar-solutions", name: "100W All-in-One Solar Street Light", brand: "VoltEdge", sku: "VE-SL-100",
    tagline: "Dusk-to-dawn lighting with motion sensor", price: 95000, image: img(IM.street, 800), inStock: true,
    warranty: "2 years", highlights: ["Motion sensor", "IP65", "Remote control", "12-hour runtime"],
    specs: { "LED power": "100W", Battery: "LiFePO4 30Ah", "Charge time": "6–8 hours sun" },
    description: "Self-contained street light for estates, roads, car parks and compounds." }),
  P({ slug: "2-1-dolby-sound-bar", category: "audio-systems", name: "2.1Ch Dolby Sound Bar 300W", brand: "VoltEdge", sku: "VE-SB-300",
    tagline: "Cinematic sound with wireless subwoofer", price: 210000, image: img(IM.sound, 800), featured: true, inStock: true,
    warranty: "1 year", highlights: ["Dolby Audio", "Wireless subwoofer", "HDMI ARC", "Bluetooth 5.0"],
    specs: { "Total power": "300W", Channels: "2.1", Connectivity: "HDMI ARC, Optical, BT, USB" },
    description: "Upgrade your TV audio with deep bass and crystal-clear dialogue." }),
  P({ slug: "4-burner-gas-cooker", category: "kitchen-appliances", name: "4-Burner Gas Cooker with Oven", brand: "VoltEdge", sku: "VE-GC-4B",
    tagline: "Auto-ignition, glass lid, 60L oven", price: 365000, image: img(IM.cooker, 800), featured: true, inStock: true,
    warranty: "1 year", highlights: ["Auto ignition", "60L oven with grill", "Flame failure safety", "Stainless steel top"],
    specs: { Burners: "4 gas", "Oven capacity": "60L", Dimensions: "60×60×85cm" },
    description: "A full-size cooker built for busy family kitchens." }),
  P({ slug: "90cm-chimney-range-hood", category: "kitchen-appliances", name: "90cm Chimney Range Hood", brand: "VoltEdge", sku: "VE-RH-90",
    tagline: "1,000m³/h suction, touch control", price: 285000, image: img(IM.hood, 800), inStock: true,
    warranty: "1 year", highlights: ["1,000m³/h suction", "Baffle filters", "LED lighting", "Touch control"],
    specs: { Width: "90cm", Suction: "1,000 m³/h", "Noise level": "52 dB" },
    description: "Keeps your kitchen fresh with powerful, quiet extraction." }),
];

export const solarSubcats = ["Solar Panels", "Hybrid Inverters", "Off-grid Inverters", "Lithium Batteries", "All-in-One ESS Systems", "Solar Street Lights"];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getProduct = (cat: string, slug: string) => products.find((p) => p.category === cat && p.slug === slug);
export const byCategory = (cat: string) => products.filter((p) => p.category === cat);
export const featured = () => products.filter((p) => p.featured);
export const formatPrice = (n: number) => "₦" + n.toLocaleString("en-NG");
export const productUrl = (p: Product) => `/products/${p.category}/${p.slug}`;
