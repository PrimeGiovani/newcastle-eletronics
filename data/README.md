# Product data

| File | What it is |
|---|---|
| `product-list.csv` | Your product sheet, the **source of truth** (export of "Newcastle Online Product List – Sheet1") |
| `reviews.csv` | **Genuine** customer reviews to import (e.g. received by WhatsApp or in the showroom). Columns: `sku, author, rating, title, review, date, verified_purchase`. You can also add them one by one in **Admin → Reviews**. |
| `products-imported-REVIEW.csv` | What the website made of each row: names, SKUs, categories, prices and flags. Open it in Excel or Google Sheets to check. |

To update products from the sheet, run:
```bash
python3 scripts/import-product-list.py                       # sheet → lib/products-data.ts
node --experimental-strip-types scripts/generate-seed.ts     # → supabase/seed.sql
```
Business rules (best sellers, sale items and %, featured items, default stock) are in the **CONFIG** block at the top of `scripts/import-product-list.py`.

## Decisions made during import (please check)
1. **No stock column in the sheet.** Every available product is set to **10 in stock**. Set real stock in **Admin → Inventory**.
2. **[NEW] / [OLD] editions.** NC 5001 / 5001G, NC 590G and NC 7506 are listed as two products each, "New Edition" and "Previous Edition". Only the new editions are marked "New arrival".
3. **NC E018[P]**: the sheet says "#160,000K/#150,000K". I used **₦160,000**. Change it in Admin if 150,000 is correct.
4. **NC E19SCMP2** has no price, so it shows **"Price on request"** with Contact-us buttons until you add one.
5. **Best seller "Range hood E010"** is set on the **silver NC E010**. The black NC E010(B) isn't marked.
6. **Sale "18CFGT/TB"** applies to both **NC 18CFIN/TB (black)** and **NC 18CFIN/GT (gold)**.
7. **"Gas cookers" in the sheet are listed as "Gas Hobs"** (the new arrivals), including the 2-burner table gas NCT 17.
8. **Small appliances.** Blender, air fryer and charcoal stove are grouped under **Kitchen Appliances → Small Appliances**.
9. **Sheet typos fixed:** CARBINET → Cabinet, ELECTERIC → Electric, SAFTYDEVICE → Safety Device, MULTIMIDEA → Multimedia, JTH-ESS-IOOOW → 1000W.
10. **Descriptions, highlights and specs** are generated only from what the model name says. Nothing is invented (no BTU, wattage or warranty figures that weren't in the sheet). **Warranty** reads "Newcastle manufacturer warranty – contact us for terms" until you add real terms.
11. **Placeholder reviews and ratings were removed.** Real reviews come from customers on the website, **Admin → Reviews**, or `reviews.csv`.
12. **NC 18CFIN/GT is Rose Gold** (the sheet says "GOLDEN"). It's set via `COLOUR_OVERRIDES` in the importer, and its web address is kept unchanged.
