/** Nigerian states, LGAs, shipping rules and phone validation. */
export type Zone = "lagos" | "south-west" | "fct" | "south" | "north";

export const STATES: { name: string; zone: Zone }[] = [
  ["Abia", "south"], ["Adamawa", "north"], ["Akwa Ibom", "south"], ["Anambra", "south"], ["Bauchi", "north"],
  ["Bayelsa", "south"], ["Benue", "north"], ["Borno", "north"], ["Cross River", "south"], ["Delta", "south"],
  ["Ebonyi", "south"], ["Edo", "south"], ["Ekiti", "south-west"], ["Enugu", "south"], ["FCT - Abuja", "fct"],
  ["Gombe", "north"], ["Imo", "south"], ["Jigawa", "north"], ["Kaduna", "north"], ["Kano", "north"],
  ["Katsina", "north"], ["Kebbi", "north"], ["Kogi", "north"], ["Kwara", "north"], ["Lagos", "lagos"],
  ["Nasarawa", "north"], ["Niger", "north"], ["Ogun", "south-west"], ["Ondo", "south-west"], ["Osun", "south-west"],
  ["Oyo", "south-west"], ["Plateau", "north"], ["Rivers", "south"], ["Sokoto", "north"], ["Taraba", "north"],
  ["Yobe", "north"], ["Zamfara", "north"],
].map(([name, zone]) => ({ name, zone: zone as Zone }));

/** LGAs for the highest-volume delivery states. Other states fall back to free-text LGA entry.
 *  To add a state, extend this map (full list: 774 LGAs – NBS / INEC). */
export const LGAS: Record<string, string[]> = {
  Lagos: ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  "FCT - Abuja": ["Abaji", "Abuja Municipal (AMAC)", "Bwari", "Gwagwalada", "Kuje", "Kwali"],
  Rivers: ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emohua", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"],
  Oyo: ["Akinyele", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ido", "Ogbomosho North", "Ogbomosho South", "Oluyole", "Ona Ara", "Oyo East", "Oyo West", "Saki East", "Saki West"],
  Kano: ["Dala", "Fagge", "Gwale", "Kano Municipal", "Kumbotso", "Nasarawa", "Tarauni", "Ungogo", "Dawakin Kudu", "Gezawa", "Kura", "Madobi", "Minjibir", "Warawa"],
  Ogun: ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ifo", "Ijebu Ode", "Obafemi Owode", "Sagamu", "Ewekoro", "Ikenne", "Remo North"],
};

/** Orders at or above this subtotal get free delivery anywhere in Nigeria. */
export const FREE_SHIPPING_THRESHOLD = 2_000_000;

/** "standard" = delivery to the customer's address; "pickup" = collect from the Newcastle showroom. */
export type DeliveryMethod = "standard" | "pickup";
export const DELIVERY_METHODS: Record<DeliveryMethod, { label: string; note: string }> = {
  standard: { label: "Delivery to my address", note: "Free on orders of ₦2,000,000 and above. Below that, Newcastle will contact you to arrange shipping." },
  pickup: { label: "Pick up at our showroom", note: "Free – 18 Oba Daudu St, Iyana Iba, Ojo, Lagos. We'll call when your order is ready." },
};

/**
 * Shipping rules (set by Newcastle):
 *  • Pickup – always free.
 *  • Delivery, subtotal ≥ ₦2M – free.
 *  • Delivery, subtotal < ₦2M – not charged online; Newcastle contacts the customer to arrange shipping.
 */
export function shippingQuote(subtotal: number, method: DeliveryMethod = "standard") {
  if (method === "pickup") return { fee: 0, free: true, arrangeLater: false };
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;
  return { fee: 0, free, arrangeLater: !free };
}

export const shippingLabel = (q: ReturnType<typeof shippingQuote>, method: DeliveryMethod) =>
  method === "pickup" ? "Free pickup" : q.free ? "FREE" : "To be arranged";

/** Accepts 0803…, +234803…, 234803… ; returns E.164 (+234XXXXXXXXXX) or null. */
export function normalizeNgPhone(input: string): string | null {
  const d = input.replace(/[\s()-]/g, "");
  const m = d.match(/^(?:\+?234|0)([789][01]\d{8})$/);
  return m ? `+234${m[1]}` : null;
}
export const NG_PHONE_PATTERN = "^(\\+?234|0)[789][01]\\d{8}$";
