#!/usr/bin/env python3
"""Generate docs/shopify/products.csv from the catalog content.

Shopify is the back office (ADR 0002). Product handles = catalog slugs, the only
variant option is "Wrist size" (every bracelet is 8 mm). Re-run after any price,
product or image change, then import in Shopify admin → Products → Import with
"Overwrite products with matching handles" ticked.

    python3 scripts/shopify-csv.py
"""
import csv, hashlib, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "packages", "catalog", "content")
IMAGES = os.path.join(ROOT, "apps", "web", "public", "images", "products")
OUT = os.path.join(ROOT, "docs", "shopify", "products.csv")
SITE = "https://crystalbasket.store"
SIZES = [("S", 16), ("M", 18), ("L", 20)]
COLUMNS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
    "Variant Fulfillment Service", "Variant Price", "Variant Requires Shipping", "Variant Taxable",
    "Image Src", "Image Position", "Image Alt Text", "SEO Title", "SEO Description", "Status",
]


def load(kind):
    d = os.path.join(CONTENT, kind)
    return {f[:-5]: json.load(open(os.path.join(d, f))) for f in sorted(os.listdir(d)) if f.endswith(".json")}


def image_url(slug, filename):
    path = os.path.join(IMAGES, slug, filename)
    if not os.path.exists(path):
        return ""
    digest = hashlib.md5(open(path, "rb").read()).hexdigest()[:8]
    return f"{SITE}/images/products/{slug}/{filename}?v={digest}"  # new hash = Shopify fetches the new photo


def main():
    products, stones, intentions = load("products"), load("stones"), load("intentions")
    rows = []
    for slug, p in products.items():
        stone_names = [stones[s]["name"] for s in p["stones"]]
        intention = intentions[p["intention"]]
        tags = [intention["short"]] + [intentions[i]["short"] for i in p.get("secondaryIntentions", [])] + stone_names + [p.get("style", "unisex")]
        if p.get("goldAccent"):
            tags.append("gold accent")
        if p.get("bestseller"):
            tags.append("bestseller")
        body = (
            f"<p><em>{p['promise']}</em></p><p>{p['body']}</p>"
            f"<p><strong>Stones:</strong> {', '.join(stone_names)}.<br><strong>Intention:</strong> {intention['name']}.<br>"
            f"<strong>Affirmation:</strong> “{p['affirmation']}”</p>"
            "<p>Natural, undyed stone on 8&nbsp;mm beads and 1&nbsp;mm premium stretch cord. Includes meaning card, care card and linen pouch. Cleansed on selenite before it ships.</p>"
        )
        title = p["name"]
        alt = f"{title} — {p['subtitle']}"
        img = image_url(slug, p["images"][0]) if p.get("images") else ""
        sku_base = "CB-" + slug.replace("the-", "").upper().replace("-", "")
        in_stock = p.get("inStock", True)
        for i, (size, cm) in enumerate(SIZES):
            if size not in p.get("sizes", ["S", "M", "L"]):
                continue
            first = i == 0
            rows.append({
                "Handle": slug,
                "Title": title if first else "",
                "Body (HTML)": body if first else "",
                "Vendor": "Crystal Basket" if first else "",
                "Product Category": "Apparel & Accessories > Jewelry > Bracelets" if first else "",
                "Type": "Crystal bracelet" if first else "",
                "Tags": ", ".join(tags) if first else "",
                "Published": "TRUE" if first else "",
                "Option1 Name": "Wrist size", "Option1 Value": f"{size} · {cm} cm",
                "Option2 Name": "", "Option2 Value": "",
                "Variant SKU": f"{sku_base}-{size}", "Variant Grams": 20,
                "Variant Inventory Tracker": "shopify", "Variant Inventory Qty": 5 if in_stock else 0, "Variant Inventory Policy": "continue" if in_stock else "deny",
                "Variant Fulfillment Service": "manual", "Variant Price": p["priceAED"],
                "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
                "Image Src": img if first else "", "Image Position": 1 if first and img else "", "Image Alt Text": alt if first and img else "",
                "SEO Title": f"{title} · {p['subtitle']}" if first else "",
                "SEO Description": p["promise"] if first else "",
                "Status": "active" if first else "",
            })
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)
    print(f"{OUT}: {len(products)} products, {len(rows)} variants")


if __name__ == "__main__":
    sys.exit(main())
