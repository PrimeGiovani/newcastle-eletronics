/** Nigerian states, shipping zones, LGAs and phone validation. */
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

export const ZONE_RATES: Record<Zone, { label: string; fee: number; days: [number, number] }> = {
  lagos: { label: "Lagos", fee: 5000, days: [1, 2] },
  "south-west": { label: "South-West", fee: 8000, days: [2, 3] },
  fct: { label: "Abuja (FCT)", fee: 10000, days: [2, 4] },
  south: { label: "South-South / South-East", fee: 12000, days: [3, 5] },
  north: { label: "North", fee: 15000, days: [4, 7] },
};

export const FREE_SHIPPING_THRESHOLD = 1_000_000;

export type DeliveryMethod = "standard" | "express" | "pickup";
export const DELIVERY_METHODS: Record<DeliveryMethod, { label: string; note: string }> = {
  standard: { label: "Standard delivery", note: "Doorstep delivery by our logistics partners" },
  express: { label: "Express delivery", note: "Priority dispatch – arrives faster" },
  pickup: { label: "Showroom pickup (Iyana Iba, Ojo, Lagos)", note: "Free – ready within 24 hours" },
};

export const zoneFor = (state: string): Zone => STATES.find((s) => s.name === state)?.zone ?? "north";

export function shippingQuote(state: string, subtotal: number, method: DeliveryMethod = "standard") {
  if (method === "pickup") return { fee: 0, days: [0, 1] as [number, number], zone: "lagos" as Zone };
  const zone = zoneFor(state);
  const r = ZONE_RATES[zone];
  let fee = subtotal >= FREE_SHIPPING_THRESHOLD && method === "standard" ? 0 : r.fee;
  let days = r.days;
  if (method === "express") { fee = Math.round(r.fee * 1.75); days = [Math.max(1, r.days[0] - 1), Math.max(1, r.days[1] - 2)]; }
  return { fee, days, zone };
}

export const estimateDateRange = ([a, b]: [number, number], from = new Date()) => {
  const add = (n: number) => { const d = new Date(from); let added = 0; while (added < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) added++; } return d; };
  const f = (d: Date) => d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
  return a === b ? f(add(a)) : `${f(add(a))} – ${f(add(b))}`;
};

/** Accepts 0803…, +234803…, 234803… ; returns E.164 (+234XXXXXXXXXX) or null. */
export function normalizeNgPhone(input: string): string | null {
  const d = input.replace(/[\s()-]/g, "");
  const m = d.match(/^(?:\+?234|0)([789][01]\d{8})$/);
  return m ? `+234${m[1]}` : null;
}
export const NG_PHONE_PATTERN = "^(\\+?234|0)[789][01]\\d{8}$";
