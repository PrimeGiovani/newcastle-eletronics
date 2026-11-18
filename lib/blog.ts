import { img } from "./site";
export type Post = { slug: string; title: string; excerpt: string; date: string; author: string; image: string; category: string; body: string[] };
export const posts: Post[] = [
  { slug: "how-to-size-a-solar-system-for-your-home", title: "How to Size a Solar System for Your Home", category: "Solar Guides",
    excerpt: "A step-by-step guide to calculating your load, choosing inverter capacity and battery storage.", date: "2026-10-02", author: "Engineering Team",
    image: img("photo-1509391366360-2e959784a276", 1000),
    body: ["List every appliance and its wattage, then multiply by daily hours of use to get watt-hours.", "Add 25% headroom to your peak load to choose your inverter size.", "Battery capacity should cover night-time usage — divide nightly watt-hours by usable depth of discharge (80–90% for LiFePO4).", "Finally, size your panel array to recharge batteries and power daytime loads using 4–5 peak sun hours."] },
  { slug: "inverter-ac-vs-non-inverter-ac", title: "Inverter AC vs Non-Inverter AC: Which Saves More?", category: "Buying Guides",
    excerpt: "Why inverter compressors use up to 60% less electricity — and when they pay for themselves.", date: "2026-09-18", author: "Product Team",
    image: img("photo-1631545806609-35d4ae440431", 1000),
    body: ["Non-inverter compressors switch fully on and off, wasting energy on every restart.", "Inverter compressors vary speed to hold temperature steadily, cutting consumption dramatically.", "Inverter ACs are also far easier to run on solar thanks to low startup current."] },
  { slug: "lithium-vs-lead-acid-batteries", title: "Lithium vs Lead-Acid Batteries for Solar", category: "Solar Guides",
    excerpt: "Cycle life, cost per kWh and safety compared.", date: "2026-08-30", author: "Engineering Team",
    image: img("photo-1620714223084-8fcacc6dfd8d", 1000),
    body: ["LiFePO4 batteries deliver 6,000+ cycles versus 500–1,200 for lead-acid.", "Over their lifespan, lithium batteries have a lower cost per stored kWh.", "They're also maintenance-free, lighter and safer when paired with a quality BMS."] },
];
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
