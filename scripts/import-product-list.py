#!/usr/bin/env python3
"""
Converts the Newcastle product spreadsheet (exported as CSV) into lib/products-data.ts.

    python3 scripts/import-product-list.py [data/product-list.csv]
    node --experimental-strip-types scripts/generate-seed.ts      # then rebuild supabase/seed.sql

Business rules (best sellers, sale items, new arrivals, coming soon) live in the CONFIG block below.
Descriptions and specs are built from the model name; review them in Admin → Products.
"""
import csv, json, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "data", "product-list.csv")
OUT = os.path.join(ROOT, "lib", "products-data.ts")

# ───────────────────────────── CONFIG ─────────────────────────────
DEFAULT_STOCK = 10                       # sheet has no stock column – set real stock in Admin → Inventory
SALE_PERCENT = 15
SALE_MODELS = {"NC 24CF", "NC 18CFIN/TB", "NC 18CFIN/GT", "NC 1818", "NC 9001G", "NC E017[B]"}
BEST_SELLER_MODELS = {"NC 2041", "NC 5001[NEW]", "NC E010"}
FEATURED_MODELS = {"NC 12SCSINV/BL", "NC 18CFIN/GT", "NC 24CF", "NC 5001[NEW]", "NC 9001G", "NC E017[T]", "NC 2041", "NC 1818"}
# Gas hobs are the new arrivals (previous "[OLD]" editions excluded)
# Solar: coming soon + price on request (prices are stored but hidden)
PRICE_OVERRIDES = {"NC E018[P]": 160000}  # sheet lists "#160,000K/#150,000K" – confirm the correct price
# Sheet says "GOLDEN" but the actual finish is rose gold (confirmed by Newcastle)
COLOUR_OVERRIDES = {"NC 18CFIN/GT": "Rose Gold"}
# Keep web addresses stable when a product name changes (avoids broken links / duplicate rows in Supabase)
SLUG_OVERRIDES = {"NC 18CFIN/GT": "newcastle-2-tons-inverter-round-standing-ac-gold-nc-18cfin-gt"}
# ──────────────────────────────────────────────────────────────────

SECTION_MAP = {  # sheet section → (top category, subcategory slug)
    "AIR CONDITIONERS": ("air-conditioners", None),
    "GAS COOKERS": ("kitchen-appliances", "gas-hobs"),
    "RANGEHOOD": ("kitchen-appliances", "range-hoods"),
    "MICROWAVES": ("kitchen-appliances", "microwaves"),
    "OVENS": ("kitchen-appliances", "ovens"),
    "BLENDER": ("kitchen-appliances", "small-appliances"),
    "AIR FRYER": ("kitchen-appliances", "small-appliances"),
    "CHARCOAL STOVE": ("kitchen-appliances", "small-appliances"),
    "HOME THEATER": ("sound-system", "home-theatre"),
    "SOUNDBARS": ("sound-system", "sound-bars"),
    "BOOM BOX": ("sound-system", "boom-box"),
    "PROTABLE": ("solar-solutions", "portable-power-stations"),
    "ALL IN ONE SOLUTION": ("solar-solutions", "all-in-one-ess"),
    "LITHIUM BATTERY": ("solar-solutions", "lithium-batteries"),
    "INVERTER": ("solar-solutions", "inverters"),
    "SOLAR PANEL": ("solar-solutions", "solar-panels"),
    "STREET LIGHT": ("solar-solutions", "street-lights"),
}

def clean(s): return re.sub(r"\s+", " ", s.replace("\u00a0", " ")).strip()
def price_of(s):
    s = s.strip()
    if not s: return None
    first = s.split("/")[0]
    digits = re.sub(r"[^\d.]", "", first.replace("K", ""))
    return int(float(digits)) if digits else None
def slugify(s): return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")
def title(s):
    small = {"and", "with", "&"}
    out = []
    for w in s.lower().split():
        if re.fullmatch(r"\d+(hp|cm|lts|w|kw|kwh|v|ah)", w): out.append(w.upper().replace("LTS", "L").replace("KWH", "kWh").replace("KW", "kW")); continue
        out.append(w if w in small else w.capitalize())
    return " ".join(out)

rows = list(csv.reader(open(SRC, encoding="utf-8-sig")))
products, section = [], None
for r in rows:
    a = clean(r[0]) if r else ""; b = clean(r[1]) if len(r) > 1 else ""
    if not a or a.upper().startswith("PRODUCTS"): continue
    key = a.upper().split(" - ")[-1].strip()
    if not b and key in SECTION_MAP: section = key; continue
    if section is None: continue
    products.append((section, a, b))

def describe(sub, sp, short):
    """Plain, factual product copy written per product type (only uses facts from the sheet)."""
    g = lambda k, d="": sp.get(k, d)
    first = short[0].upper() + short[1:]
    if sub in ("1hp-split-unit", "1-5hp-split-unit", "2hp-split-unit"):
        return (f"The Newcastle {g('Capacity')} split unit mounts neatly on the wall and comes in a {g('Colour').lower()} finish. "
                f"Its {g('Compressor').lower()} compressor adjusts output to hold your chosen temperature, which helps keep running costs down. "
                "Ask us about installation by our trusted installers.")
    if sub == "standing-units":
        shape = "round" if "round" in g("Type") else "block"
        cap = g('Capacity').replace(" Tons", "-ton")
        return (f"A {cap} floor-standing air conditioner with a {shape} design, finished in {g('Colour').lower()}. "
                f"Built for larger spaces such as living rooms, offices, shops and halls. Compressor: {g('Compressor').lower()}.")
    if sub == "gas-hobs":
        top = g("Top").lower().replace("tempered glass", "a tempered glass top").replace("stainless steel (black)", "a black stainless steel top").replace("stainless steel (silver)", "a silver stainless steel top")
        bits = [f"{g('Burners')} burners ({g('Configuration').lower()})", top]
        if "Flip-up" in g("Lid"): bits.append("a flip-up glass lid that covers the burners when not in use")
        if g("Timer") == "Yes": bits.append("a built-in timer")
        if g("Flame safety device") == "Yes": bits.append("a flame safety device")
        return f"This {g('Type').lower()} has " + ", ".join(bits[:-1]) + (" and " + bits[-1] if len(bits) > 1 else bits[0]) + ". Gas connection can be arranged with our trusted installers."
    if sub == "range-hoods":
        f = g("Features")
        return f"A {g('Width')} range hood in {g('Colour').lower()} to keep cooking smoke and smells out of your kitchen." + (f" Features: {f.lower()}." if f else "")
    if sub == "microwaves":
        kind = "built-in" if "Built-in" in g("Type") else "countertop"
        return f"A 21-litre {kind} microwave for reheating, defrosting and everyday cooking."
    if sub == "ovens":
        return f"A built-in cabinet oven ({g('Fuel').lower()})" + (" with soft-touch controls" if g("Controls") else "") + ", designed to fit neatly into your kitchen units."
    if sub == "small-appliances":
        return {"Blender": "A countertop blender for smoothies, soups, sauces and pepper.", "Air Fryer": "An air fryer for crisp results with little or no oil.",
                "Charcoal Stove": "A sturdy charcoal stove for outdoor cooking and grilling."}.get(g("Type"), first)
    if sub == "home-theatre":
        return "A home theatre multimedia speaker system for films, music and games at home."
    if sub == "sound-bars":
        return "A slim soundbar that sits below your TV for clearer dialogue and fuller sound."
    if sub == "boom-box":
        return "A portable boom box with MP3 playback for music at home or on the move."
    solar = {
        "portable-power-stations": lambda: f"A portable power station with {g('Output power')} output and {g('Battery capacity')} of battery storage, for backup power at home, in the shop or on the go.",
        "all-in-one-ess": lambda: f"An all-in-one energy storage system combining a {g('Inverter power')} inverter with {g('Battery capacity')} of battery storage in one unit.",
        "lithium-batteries": lambda: (f"A {g('Capacity')}, {g('Voltage')} {g('Amp-hours')} lithium battery for solar and backup power systems." if g("Capacity") else "A lithium battery for solar and backup power systems."),
        "inverters": lambda: f"A {g('Rated power')} solar inverter for {g('Battery voltage')} battery systems.",
        "solar-panels": lambda: f"A {g('Peak power')} monocrystalline solar panel ({g('Voltage')}) built with 182mm cells.",
        "street-lights": lambda: f"A {g('Power')} solar street light for estates, compounds, roads and car parks.",
    }
    if sub in solar: return solar[sub]() + " Coming soon: contact us to enquire or book ahead."
    return first

def parse(section, raw, price_raw):
    top, sub = SECTION_MAP[section]
    up = raw.upper()
    if top == "solar-solutions":
        model = re.sub(r"JTH-\s+", "JTH-", raw.replace("IOOO", "1000"))  # sheet typos: "JTH- ESS", IOOOW → 1000W
        desc_name = model
        model_code = (re.search(r"(JTH[\w\-+.]*)", model) or [None, None])[1] or re.sub(r"\s*solar panel\s*$", "", model, flags=re.I)
    else:
        parts = re.split(r"\s-\s(?=NC)", raw)
        desc_name, model_code = (parts[0], parts[1]) if len(parts) == 2 else (raw, None)
        model_code = clean(model_code or "")
    edition = "NEW" if "[NEW]" in up else "OLD" if "[OLD]" in up else None
    base_model = re.sub(r"\[(NEW|OLD)\]", "", model_code or "").strip()
    d = desc_name.replace("[NEW]", "").replace("[OLD]", "")
    d = d.replace("CARBINET", "CABINET").replace("ELECTERIC", "ELECTRIC").replace("SAFTYDEVICE", "SAFETY DEVICE").replace("MULTIMIDEA", "MULTIMEDIA").replace("I HP", "1HP").replace("1.5 HP", "1.5HP").replace("2 HP", "2HP")
    d = clean(re.sub(r"\{(.*?)\}", r"(\1)", d).replace("(", " (").replace("  ", " "))
    specs, highlights, art, installable = {}, [], "", False
    price = PRICE_OVERRIDES.get(model_code, price_of(price_raw))

    if top == "air-conditioners":
        installable = True
        colour = next((c for c in ["WHITE", "BLACK", "GOLDEN"] if c in up), "")
        inverter = "NON INVERTER" not in up
        cap = re.search(r"(1\.5|\d)\s?(HP|TONS)", up.replace("I HP", "1HP")); cap_s = f"{cap.group(1)} {'HP' if cap.group(2)=='HP' else 'Tons'}" if cap else ""
        if "ROUND" in up: sub, kind, art = "standing-units", "Floor-standing (round)", f"ac-round-{'gold' if colour=='GOLDEN' else 'black'}"
        elif "BLOCK" in up: sub, kind, art = "standing-units", "Floor-standing (block)", "ac-block-white"
        else:
            sub = {"1": "1hp-split-unit", "1.5": "1-5hp-split-unit", "2": "2hp-split-unit"}[cap.group(1)]; kind = "Wall-mounted split unit"; art = f"ac-split-{'black' if colour=='BLACK' else 'white'}"
        specs = {"Capacity": cap_s.replace("1 HP", "1HP").replace("1.5 HP", "1.5HP").replace("2 HP", "2HP"), "Type": kind, "Compressor": "Inverter" if inverter else "Non-inverter (fixed speed)", "Colour": COLOUR_OVERRIDES.get(model_code, colour.title().replace("Golden", "Gold"))}
        if specs["Colour"] == "Rose Gold": art = "ac-round-rosegold"
        highlights = [f"{specs['Capacity']} cooling capacity", "Inverter compressor for lower power use" if inverter else "Robust fixed-speed compressor", kind, f"{specs['Colour']} finish"]
        name = f"Newcastle {specs['Capacity']} {'Inverter' if inverter else 'Non-Inverter'} {'Split AC' if 'split' in kind else ('Round Standing AC' if 'round' in kind else 'Block Standing AC')} – {specs['Colour']}"
        short = f"{specs['Capacity']} {'inverter' if inverter else 'non-inverter'} {kind.lower()} air conditioner in {specs['Colour'].lower()}."
    elif sub == "gas-hobs":
        installable = True
        burners = int(re.search(r"(\d) BURNER", up).group(1))
        elec = re.search(r"\((\d) GAS ?\+ ?(\d) ELECTRIC\)", up.replace("{", "(").replace("}", ")"))
        flip = "FLIP UP" in up; table = "TABLE" in up
        finish = "Stainless steel (black)" if "STAINLESS BLACK" in up else "Stainless steel (silver)" if ("STAINLESS SILVER" in up or "SILVER" in up) else "Tempered glass"
        config = f"{elec.group(1)} gas + {elec.group(2)} electric" if elec else "All gas"
        specs = {"Burners": str(burners), "Configuration": config, "Top": finish, "Lid": "Flip-up glass lid" if flip else "No lid", "Type": "Table-top gas cooker" if table else "Gas hob"}
        if "TIMER" in up: specs["Timer"] = "Yes"
        if "WITH SAFETY" in d.upper() or "WITH SAFTY" in up: specs["Flame safety device"] = "Yes"
        if "WITHOUT SAFETY" in d.upper() or "WITHOUT SAFTY" in up: specs["Flame safety device"] = "No"
        if edition: specs["Edition"] = "New edition" if edition == "NEW" else "Previous edition"
        highlights = [f"{burners} burners – {config.lower()}", specs["Top"], specs["Lid"]] + (["Built-in timer"] if "Timer" in specs else []) + (["Flame safety device"] if specs.get("Flame safety device") == "Yes" else [])
        art = f"hob-{burners}-{'steel' if table else 'silver' if 'silver' in finish else 'black' if 'black' in finish else 'glass'}"
        if elec and art.endswith("glass"): art += "-e1"
        finish_name = {"Tempered glass": "Glass Top", "Stainless steel (black)": "Black Stainless Steel", "Stainless steel (silver)": "Silver Stainless Steel"}[finish]
        name = f"Newcastle {burners}-Burner {'Table Gas Cooker' if table else 'Gas Hob'}" + (f" ({config})" if elec else "") + ((" – Flip-up Silver" if "silver" in finish else " – Flip-up Glass") if flip else f" – {finish_name}") + (" with Timer" if "Timer" in specs else "")
        if specs.get("Flame safety device") == "Yes": name += " & Safety Device"
        if specs.get("Flame safety device") == "No": name += " (No Safety Device)"
        if edition: name += " (New Edition)" if edition == "NEW" else " (Previous Edition)"
        short = f"{burners}-burner {'table-top gas cooker' if table else 'gas hob'}, {config.lower()}, {specs['Top'].lower()}{', flip-up glass lid' if flip else ''}."
    elif sub == "range-hoods":
        installable = True
        width = re.search(r"(\d+)CM", up).group(1); colour = "Black" if "BLACK" in up or "(B)" in up or "[B]" in up else "Silver"
        feats = [f for f, k in [("Filter", "FILTER"), ("Hand-wave sensor", "HANDWAVE"), ("Plasma purification", "PLASMA"), ("Soft-touch controls", "SOFT TOUCH")] if k in up]
        specs = {"Width": f"{width}cm", "Colour": colour, **({"Features": ", ".join(feats)} if feats else {})}
        highlights = [f"{width}cm width", f"{colour} finish"] + feats
        art = f"hood-{width}-{colour.lower()}"
        short_feats = [{"Filter": "Filter", "Hand-wave sensor": "Hand-Wave", "Plasma purification": "Plasma"}[f] for f in feats if f != "Soft-touch controls"]
        name = f"Newcastle {width}cm {' & '.join(short_feats) + ' ' if short_feats else ''}Range Hood{' (Soft Touch)' if 'Soft-touch controls' in feats else ''} – {colour}"
        short = f"{width}cm range hood in {colour.lower()}{(' with ' + ', '.join(f.lower() for f in feats)) if feats else ''}."
    elif sub == "microwaves":
        installable = "CABINET" in d.upper()
        cabinet = "CABINET" in d.upper(); specs = {"Capacity": "21 litres", "Type": "Built-in (cabinet)" if cabinet else "Countertop (surface)"}
        highlights = ["21-litre capacity", specs["Type"]]; art = "microwave-builtin" if cabinet else "microwave-surface"
        name = f"Newcastle 21L {'Built-in' if cabinet else 'Countertop'} Microwave"; short = f"21-litre {specs['Type'].lower()} microwave."
    elif sub == "ovens":
        installable = True
        fuel = "Electric & gas" if "GAS" in up else "Electric"; specs = {"Type": "Built-in (cabinet) oven", "Fuel": fuel, **({"Controls": "Soft touch"} if "SOFT TOUCH" in up else {})}
        highlights = ["Built-in cabinet oven", fuel] + (["Soft-touch controls"] if "SOFT TOUCH" in up else [])
        art = "oven-builtin"; name = f"Newcastle Built-in {'Electric & Gas' if 'GAS' in up else 'Electric'} Oven" + (" (Soft Touch)" if "SOFT TOUCH" in up else ""); short = f"Built-in {fuel.lower()} cabinet oven."
    elif sub == "small-appliances":
        kind = "Blender" if "BLENDER" in up else "Air Fryer" if "AIR FRYER" in up else "Charcoal Stove"
        art = {"Blender": "blender", "Air Fryer": "air-fryer", "Charcoal Stove": "charcoal-stove"}[kind]
        specs = {"Type": kind}; highlights = [kind]; name = f"Newcastle {kind}"; short = f"Newcastle {kind.lower()}."
    elif top == "sound-system":
        kind = "Home Theatre Multimedia Speaker" if sub == "home-theatre" else "Soundbar" if sub == "sound-bars" else "Boom Box MP Player"
        art = {"home-theatre": "home-theatre", "sound-bars": "soundbar", "boom-box": "boombox"}[sub]
        specs = {"Type": kind}; highlights = [kind]; name = f"Newcastle {kind}"; short = f"Newcastle {kind.lower()}."
    else:  # solar
        installable = True
        u = model.upper()
        if sub == "portable-power-stations":
            m = re.search(r"(\d+)W\+(\d+)KWH", u); specs = {"Output power": f"{m.group(1)}W", "Battery capacity": f"{m.group(2)}kWh", "Type": "Portable power station"}
            art = "portable-ess"; name = f"Newcastle Portable Power Station {m.group(1)}W + {m.group(2)}kWh"
        elif sub == "all-in-one-ess":
            m = re.search(r"([\d.]+)KW\+(\d+)KWH", u); specs = {"Inverter power": f"{m.group(1)}kW", "Battery capacity": f"{m.group(2)}kWh", "Type": "All-in-one energy storage system"}
            art = "ess"; name = f"Newcastle All-in-One ESS {m.group(1)}kW + {m.group(2)}kWh"
        elif sub == "lithium-batteries":
            m = re.search(r"([\d.]+)KWH ([\d.]+)V-(\d+)AH", u)
            specs = {"Chemistry": "Lithium"} | ({"Capacity": f"{m.group(1)}kWh", "Voltage": f"{m.group(2)}V", "Amp-hours": f"{m.group(3)}Ah"} if m else {})
            art = "battery"; name = f"Newcastle {m.group(1)}kWh {m.group(2)}V {m.group(3)}Ah Lithium Battery" if m else "Newcastle Lithium Battery"
        elif sub == "inverters":
            m = re.search(r"([\d.]+)K(\d+)V", u); specs = {"Rated power": f"{m.group(1)}kW", "Battery voltage": f"{m.group(2)}V", "Type": "Solar inverter"}
            art = "inverter"; name = f"Newcastle {m.group(1)}kW {m.group(2)}V Solar Inverter"
        elif sub == "solar-panels":
            m = re.search(r"(\d+)V-(\d+)W", u); specs = {"Peak power": f"{m.group(2)}W", "Voltage": f"{m.group(1)}V", "Cell type": "182mm monocrystalline"}
            art = "solar-panel"; name = f"Newcastle {m.group(2)}W Mono Solar Panel"
        else:
            m = re.search(r"(\d+)W", u); specs = {"Power": f"{m.group(1)}W", "Type": "Solar street light"}
            art = "street-light"; name = f"Newcastle {m.group(1)}W Solar Street Light"
        highlights = list(specs.values())[:4]; short = name.replace("Newcastle ", "") + "."
        model_code = model_code or model
    model_disp = base_model or model_code
    full_name = f"{name} ({model_disp})" if model_disp and model_disp not in name else name
    sku_base = re.sub(r"[^A-Z0-9]+", "-", (base_model or model_code or name).upper()).strip("-")
    sku = sku_base + ("-NEW" if edition == "NEW" else "-PREV" if edition == "OLD" else "")
    is_solar = top == "solar-solutions"
    on_sale = model_code in SALE_MODELS
    compare = price if on_sale else None
    final_price = round(price * (100 - SALE_PERCENT) / 100) if on_sale and price else price
    return dict(
        slug=SLUG_OVERRIDES.get(model_code) or slugify(full_name.replace("Newcastle ", "newcastle ")), sku=sku, name=full_name, categorySlug=sub, top=top,
        price=final_price or 0, compareAtPrice=compare, stock=DEFAULT_STOCK,
        shortDescription=short[0].upper() + short[1:], description=describe(sub, specs, short),
        highlights=highlights[:5], specs={**specs, "Model": model_disp}, warranty="Newcastle manufacturer warranty – contact us for terms",
        isFeatured=model_code in FEATURED_MODELS, isBestSeller=model_code in BEST_SELLER_MODELS,
        isNew=sub == "gas-hobs" and edition != "OLD", comingSoon=is_solar, priceOnRequest=is_solar or not price,
        installable=installable, art=art, sheetRow=raw, sheetPrice=price_raw,
    )

out = [parse(*p) for p in products]

# ───────────── Reviews (optional): data/reviews.csv ─────────────
# Columns: sku, author, rating (1-5), title, review, date (YYYY-MM-DD), verified_purchase (yes/no)
# Only add GENUINE reviews from real customers (e.g. received on WhatsApp or in the showroom).
REVIEWS_SRC = os.path.join(ROOT, "data", "reviews.csv")
reviews, skus = [], {p["sku"] for p in out}
if os.path.exists(REVIEWS_SRC):
    for i, r in enumerate(csv.DictReader(open(REVIEWS_SRC, encoding="utf-8-sig")), start=2):
        if not any((v or "").strip() for v in r.values()): continue
        sku = (r.get("sku") or "").strip().upper().replace(" ", "-").replace("/", "-")
        if sku not in skus: raise SystemExit(f"reviews.csv line {i}: unknown SKU '{r.get('sku')}' (use the SKU column from products-imported-REVIEW.csv)")
        rating = int(r.get("rating") or 0)
        if not 1 <= rating <= 5: raise SystemExit(f"reviews.csv line {i}: rating must be 1-5")
        body = (r.get("review") or "").strip()
        if len(body) < 5: raise SystemExit(f"reviews.csv line {i}: review text is missing")
        reviews.append(dict(sku=sku, author=(r.get("author") or "Customer").strip(), rating=rating, title=(r.get("title") or "").strip(),
                            body=body, date=(r.get("date") or "").strip() or "2026-01-01", verified=(r.get("verified_purchase") or "").strip().lower() in ("yes", "y", "true", "1")))
open(os.path.join(ROOT, "lib", "reviews-data.ts"), "w").write(
    "/* Built from data/reviews.csv by scripts/import-product-list.py. */\n"
    "export type SheetReview = { sku: string; author: string; rating: number; title: string; body: string; date: string; verified: boolean };\n"
    "export const sheetReviews: SheetReview[] = " + json.dumps(reviews, indent=1, ensure_ascii=False) + ";\n")
print(f"{len(reviews)} reviews → lib/reviews-data.ts")
# uniqueness
for k in ("slug", "sku"):
    seen = {}
    for p in out:
        if p[k] in seen: raise SystemExit(f"Duplicate {k}: {p[k]}  ({seen[p[k]]}  vs  {p['sheetRow']})")
        seen[p[k]] = p["sheetRow"]
ts = "/* Built from data/product-list.csv by scripts/import-product-list.py. Edit the sheet, then re-run the script. */\n"
ts += "export type SheetProduct = { slug: string; sku: string; name: string; categorySlug: string; top: string; price: number; compareAtPrice: number | null; stock: number; shortDescription: string; description: string; highlights: string[]; specs: Record<string, string>; warranty: string; isFeatured: boolean; isBestSeller: boolean; isNew: boolean; comingSoon: boolean; priceOnRequest: boolean; installable: boolean; art: string; sheetRow: string; sheetPrice: string };\n"
ts += "export const sheetProducts: SheetProduct[] = " + json.dumps(out, indent=1, ensure_ascii=False) + ";\n"
open(OUT, "w").write(ts)
print(f"{len(out)} products → {os.path.relpath(OUT, ROOT)}")
from collections import Counter
print(Counter(p["categorySlug"] for p in out))
print("best sellers:", [p["name"] for p in out if p["isBestSeller"]])
print("on sale:", [(p["name"], p["compareAtPrice"], p["price"]) for p in out if p["compareAtPrice"]])
print("new:", sum(p["isNew"] for p in out), "| coming soon:", sum(p["comingSoon"] for p in out), "| price on request:", [p["name"] for p in out if p["priceOnRequest"] and not p["comingSoon"]])
