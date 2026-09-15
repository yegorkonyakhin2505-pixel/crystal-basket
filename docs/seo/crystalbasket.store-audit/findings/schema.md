# Schema.org / structured-data audit — crystalbasket.store

**Score: 48 / 100** (live site, fetched 2026-09-15)
Projected after the fixes below: ~85 / 100.

| Area | Weight | Live | Notes |
|---|---|---|---|
| Page-type coverage (Org, WebSite, Breadcrumb, listings, products) | 40 | 14 | Only products + FAQ carry markup; 33 of 46 pages have none |
| Product completeness vs Google merchant-listing spec | 30 | 16 | Required fields pass; shipping, returns, itemCondition absent; 2 availability mismatches |
| Validity and hygiene | 20 | 18 | All blocks parse, https context, absolute URLs, no placeholders, no fake ratings, server-rendered |
| Site-wide entity signals (logo, sameAs, contact) | 10 | 0 | No Organization anywhere |

Scope: 46 URLs from `raw/urls.txt` (home, shop, stacks, intentions index + 8, stones index + 16, 12 products, about, care, faq, size-guide, disclaimer). Source: `raw/pages/*.html` (raw fetch) and `raw/home-render.json` (`is_spa: false`, `structured_data.block_count: 0`). No Microdata or RDFa on any page. All JSON-LD is in the initial HTML (static export), so nothing depends on JavaScript execution.

> **Working-tree note (not part of the live score).** The repo has *uncommitted* structured-data work that is not yet deployed: `apps/web/src/lib/schema.ts` (untracked) plus edits to `layout.tsx`, `products/[slug]/page.tsx`, `shop/page.tsx`, `intentions/[slug]/page.tsx`, `stones/[slug]/page.tsx`. It already covers findings 1, 2, 3 and 5 below. Section 5 validates that draft against Google's requirements so it can be finished rather than duplicated. This audit did not touch any source file.

---

## 1. Detection — what exists today

| Page(s) | JSON-LD types | Count |
|---|---|---|
| `/products/*` (12) | `Product` with nested `Brand`, `Offer` | 12 blocks |
| `/faq/` | `FAQPage` (11 `Question`s) | 1 block |
| `/` `/shop/` `/stacks/` `/intentions/` + 8 intention pages `/stones/` + 16 stone pages `/about/` `/care/` `/size-guide/` `/disclaimer/` | none | 0 |

Generated in `apps/web/src/app/products/[slug]/page.tsx` (Product) and `apps/web/src/app/faq/page.tsx` (FAQPage).

### Live Product block (identical shape on all 12; The Seven shown)

```json
{"@context":"https://schema.org","@type":"Product",
 "name":"The Seven — Chakra Bracelet · Seven Stones, Root to Crown",
 "description":"All seven centres, in order, on one wrist. …",
 "brand":{"@type":"Brand","name":"Crystal Basket"},
 "material":"Red Jasper, Carnelian, Citrine, Green Aventurine, Lapis Lazuli, Amethyst, Clear Quartz",
 "sku":"the-seven",
 "url":"https://crystalbasket.store/products/the-seven/",
 "image":"https://crystalbasket.store/images/products/the-seven/main.jpg",
 "offers":{"@type":"Offer","priceCurrency":"AED","price":75,
           "url":"https://crystalbasket.store/products/the-seven/",
           "availability":"https://schema.org/InStock"}}
```

Prices live: 65 (Shield, Still Mind, Tender Heart), 75 (Anchor, Clear Sight, Fortune, Lionheart, Seven), 80 (Aurora), 90 (Devotion), 95 (Guardian), 105 (Alchemist). Availability: 10 × `InStock`, 2 × `BackOrder` (Aurora, Devotion).

---

## 2. Validation of existing markup

| Block | Check | Result |
|---|---|---|
| Product ×12 | `@context` https, valid `@type`, JSON parses | PASS |
| Product ×12 | Required for merchant listing: `name`, `image`, `offers.price`, `offers.priceCurrency`, `offers.availability` | PASS |
| Product ×12 | Identifier: `sku` (= slug), `brand` | PASS (no gtin/mpn — acceptable for handmade) |
| Product ×12 | `image` absolute, 1200×1200 JPG (>50k px, 1:1) | PASS — but single image; 7 products also have `lifestyle.jpg` not listed; 4:3 / 16:9 crops absent |
| Product ×12 | `offers.url` present | PASS |
| Product ×12 | `offers.shippingDetails` | FAIL (missing) — shipping enhancement not eligible |
| Product ×12 | `offers.hasMerchantReturnPolicy` | FAIL (missing) — returns enhancement not eligible |
| Product ×12 | `offers.itemCondition` | WARN (missing, recommended) |
| Product ×12 | `aggregateRating` / `review` | PASS — correctly absent (`flags.reviews=false`; `site.reviews 4.9/312` is a placeholder and must never reach markup) |
| Product ×2 | Availability matches page | FAIL — Aurora and Devotion pages say "Sold out · Tell me when it's back · This piece is between batches" but markup says `BackOrder` (= orderable now, ships later). Use `OutOfStock`, or `PreOrder` only if the buy button actually takes the order. |
| Product ×12 | Price matches page | PASS (e.g. "75 AED" visible on The Seven) |
| FAQPage | Valid; 11 Q/A; every question visible in page text; one `acceptedAnswer` each; no HTML in answers | PASS |
| FAQPage | Google rich result | INFO — FAQ rich results were retired for all sites on 2026-05-07. Keep the block (harmless, consistent with page); do not expect a SERP feature. |
| FAQPage | Serialisation | WARN — uses raw `JSON.stringify`; a `<` in an answer could close the `<script>`. The new `ld()` helper escapes it; FAQ page should use it too. |
| Home | Any markup | FAIL — none |
| Category / stone / info pages | Any markup | FAIL — none, despite an `aria-label="Breadcrumb"` nav on every product, intention and stone page |

---

## 3. Ranked findings

### F1 — HIGH — No Organization / OnlineStore and no WebSite anywhere
Evidence: `raw/pages/home.html` has 0 JSON-LD blocks; `home-render.json` → `structured_data.block_count: 0`. Google has no machine-readable brand entity, logo, social profile or contact for "Crystal Basket". Everything needed exists on-page: `mailto:hello@crystalbasket.store`, `https://instagram.com/crystal.basket`, "Dubai" in the footer, logo at `/brand/logo-badge.svg` (1200×1200 SVG, ≥112 px, SVG accepted for `logo`).
Fix: emit block 6.1 + 6.2 site-wide from `layout.tsx` (draft does this). Do **not** add `telephone`/WhatsApp `contactPoint` until N01 replaces the `971500000000` placeholder.

### F2 — HIGH — Offers carry no shipping or return policy
Evidence: all 12 `Offer`s have only `priceCurrency`, `price`, `url`, `availability`. Google's merchant listing "shipping" and "returns" enhancements require `shippingDetails` and `hasMerchantReturnPolicy`. Site facts: UAE only, 25 AED standard (NEEDED.md N13, Shopify UAE zone), free over 250 AED (announcement bar), next-day / 1–2 business days, 14-day unworn size exchange with courier covered once (FAQ).
Two content gaps to close alongside the markup:
- **"25 AED" appears nowhere on the site** (grep of all 46 pages: no "25 AED" / "AED 25"). Google requires structured data to match visible content; add "Delivery 25 AED · free over 250 AED" to the product-page delivery line and/or FAQ.
- The policy is an **exchange**, not a refund. Use `refundType: ExchangeRefund` so the markup does not promise money back.
Fix: blocks 6.3 and 6.4, referenced from every `Offer` (draft does this; see §5 for the two missing required properties).

### F3 — HIGH — No BreadcrumbList although breadcrumb navigation exists
Evidence: `<nav aria-label="Breadcrumb">` present on 12 product, 8 intention, 16 stone pages and on `/shop/`, `/stacks/`, `/intentions/`, `/stones/` — 40 pages — with no matching `BreadcrumbList`. Example trail (The Seven): Home › Bracelets › Grounding & Stability › The Seven. This is the cheapest rich-result win on the site (breadcrumb trail replaces the raw URL in the snippet).
Fix: block 6.5 on every page with the nav, positions in DOM order, last item may omit `item`. Draft covers product/shop/intention/stone pages; add the three index pages (`/intentions/`, `/stones/`, `/stacks/`).

### F4 — MEDIUM — Availability contradicts page copy on 2 products
Evidence: `products__the-aurora.html`, `products__the-devotion.html` show "Sold out" while JSON-LD says `https://schema.org/BackOrder`. Source: `availability: d.inStock ? InStock : BackOrder`. Mismatched availability is a merchant-listing policy issue and can suppress the price snippet.
Fix: map `inStock=false` → `https://schema.org/OutOfStock` (or add a third catalog state for genuine pre-orders → `PreOrder`).

### F5 — MEDIUM — Listing pages have no ItemList / CollectionPage
Evidence: `/shop/` links 12 products, each intention page 3–4, `/stacks/` 9, all without markup. An `ItemList` of `ListItem → url` (Google's "summary page" carousel pattern) tells Google which product URLs a category page is about and in what order. Modest SERP upside (product carousels on category pages are still limited-rollout), solid crawl/entity upside.
Fix: block 6.6 on `/shop/`, the 8 intention pages and `/stacks/`; wrap the page as `CollectionPage` with `mainEntity`. Keep `position` in the same order as the grid. Do **not** put full `Product` + `Offer` for every item on listing pages — Google asks that product markup describe the page's main entity only.

### F6 — MEDIUM — Product `image` is a single URL
Evidence: 7 products (`the-alchemist`, `the-aurora`, `the-devotion`, `the-fortune`, `the-guardian`, `the-seven`, `the-shield`) have `lifestyle.jpg` not listed. Google recommends several images and 1:1, 4:3, 16:9 aspect ratios for merchant listings.
Fix: `image: [main, lifestyle]` where present (block 6.7). Adding a 16:9 crop is optional.

### F7 — LOW — Stone pages (16) are untyped
Evidence: `stones__amethyst.html` — title "Amethyst bracelet meaning", h1 "Amethyst", h2 "Bracelets with Amethyst" linking 2 products; `og:image` falls back to the generic hero. These are glossary pages, not articles (no author, no date) and must not use medical types (house rule: "traditionally worn for"). No Google rich result applies.
Recommendation: `BreadcrumbList` (draft) + a light `WebPage` whose `about` is a `Thing` named for the stone and whose `mainEntity`/`hasPart` is an `ItemList` of the bracelets that contain it (block 6.8). It costs nothing and gives AI/entity crawlers a clean stone → product graph. Skip `Article`.

### F8 — INFO — FAQPage: valid, keep, no SERP benefit
11 questions, all visible, answers match the shipping/returns facts used in F2 (good consistency). Google retired FAQ rich results for all sites on 2026-05-07; any AI-answer benefit is unconfirmed. Keep it; switch it to the `ld()` serialiser.

### F9 — LOW — Ratings must stay out until reviews are real
`site.reviews = { average: 4.9, count: 312 }` is marked `TODO[NEEDED:N03]`. It is correctly absent from markup today. When real reviews arrive, add `aggregateRating` only with the true count and only if the reviews are shown on the page.

### F10 — LOW — Variants are flattened into a string
The draft adds `size: "S (16 cm), M (18 cm), L (20 cm)"` on the parent `Product`. Google treats `size` as one value per product/variant. Either drop `size` from the parent or model `ProductGroup → hasVariant` (Shopify already has "Wrist size" variants; prices are identical, so the flat Product is acceptable for now).

### F11 — LOW — `OnlineStore` draft uses LocalBusiness-only properties
`paymentAccepted` and `currenciesAccepted` belong to `LocalBusiness`; `OnlineStore` (→ `OnlineBusiness` → `Organization`) is not a `LocalBusiness`, so validator.schema.org will warn. Harmless to Google; drop them or ignore the warning. Opportunity: Google supports **Organization-level** `hasMerchantReturnPolicy` — state the policy once on the `OnlineStore` and reference it by `@id` from each Offer.

---

## 4. Missing-opportunity map

| Page | Add |
|---|---|
| all pages (layout) | `OnlineStore` (6.1), `WebSite` (6.2) |
| `/products/*` | `shippingDetails` (6.3), `hasMerchantReturnPolicy` (6.4), `itemCondition`, `seller`, `category`, image array, `BreadcrumbList` (6.5), availability fix |
| `/shop/`, `/intentions/*`, `/stacks/` | `BreadcrumbList` + `CollectionPage`/`ItemList` (6.6) |
| `/intentions/`, `/stones/` | `BreadcrumbList` only |
| `/stones/*` | `BreadcrumbList` + `WebPage` with `about` + `ItemList` (6.8) |
| `/about/` | optional `AboutPage` (`@type`, `name`, `isPartOf`, `about: {@id: #organization}`) |
| `/care/`, `/size-guide/` | nothing — `HowTo` is deprecated (Sept 2023); do not add it |
| `/faq/` | keep `FAQPage`; use `ld()` |

---

## 5. Validation of the uncommitted draft (`apps/web/src/lib/schema.ts`)

| Block | Status | What to change |
|---|---|---|
| `organizationLd` (`OnlineStore`, `@id …/#organization`, logo ImageObject 1200×1200 SVG, `email`, `address` Dubai/AE, `areaServed`, `sameAs` Instagram, TikTok gated on `site.tiktok`) | PASS | Optional: remove `paymentAccepted`/`currenciesAccepted` (F11); add `hasMerchantReturnPolicy` with `@id`; add `contactPoint` only after N01. |
| `websiteLd` (`WebSite`, `publisher → @id`) | PASS | — |
| `shippingDetailsLd` (`OfferShippingDetails`, 25 AED, `DefinedRegion AE`, handling 0–1 / transit 1–2 `DAY`) | PASS | Show "25 AED" on the page (F2). `freeShippingDetailsLd` is unreachable while every product is < 250 AED (the `d.priceAED >= 250` branch compares a single item price to an order threshold); harmless, but keep the free-over-250 wording in visible copy rather than in `name`. |
| `returnPolicyLd` (`MerchantReturnPolicy`, `applicableCountry AE`, finite window, 14 days, `ReturnByMail`, `FreeReturn`, `NewCondition`) | WARN | **Add `returnPolicyCountry: "AE"`** (required by Google since March 2025) and **`refundType: "https://schema.org/ExchangeRefund"`** (policy is a size exchange, not a refund). |
| Product additions (`category`, `color`, `size`, `audience`, `itemCondition`, `seller`, shipping, returns) | PASS with notes | `size` string → drop or ProductGroup (F10). `availability` still maps `inStock=false` → `BackOrder` (F4). `image` still a single URL (F6). |
| `breadcrumbLd()` | PASS | Also call it on `/intentions/`, `/stones/`, `/stacks/`. |
| `itemListLd()` | PASS | Also call on `/stacks/`; optionally wrap in `CollectionPage`. |
| `ld()` (`<` → `<`) | PASS | Use it in `faq/page.tsx` too. |
| Placement | PASS | Emitted in the static HTML `<body>`; Google reads JSON-LD anywhere in the document. |

---

## 6. Ready-to-paste JSON-LD (real site values)

All blocks use `https://schema.org`, absolute URLs and `@id` links so entities are stated once. Paste each into its own `<script type="application/ld+json">` (or merge into one `@graph`).

### 6.1 OnlineStore (site-wide, from `layout.tsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": "https://crystalbasket.store/#organization",
  "name": "Crystal Basket",
  "url": "https://crystalbasket.store",
  "logo": {
    "@type": "ImageObject",
    "url": "https://crystalbasket.store/brand/logo-badge.svg",
    "width": 1200,
    "height": 1200
  },
  "image": "https://crystalbasket.store/images/hero/hero-1.jpg",
  "description": "Hand-strung crystal bracelets chosen by intention. Natural stones, cleansed and charged before they leave Dubai.",
  "email": "hello@crystalbasket.store",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "hello@crystalbasket.store",
    "availableLanguage": "en",
    "areaServed": "AE"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "areaServed": { "@type": "Country", "name": "United Arab Emirates" },
  "sameAs": ["https://instagram.com/crystal.basket"],
  "hasMerchantReturnPolicy": { "@id": "https://crystalbasket.store/#returns" }
}
```
Add `"telephone"` / a WhatsApp `ContactPoint` only once N01 supplies the real number.

### 6.2 WebSite (site-wide)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://crystalbasket.store/#website",
  "name": "Crystal Basket",
  "url": "https://crystalbasket.store",
  "inLanguage": "en",
  "publisher": { "@id": "https://crystalbasket.store/#organization" }
}
```
(No `SearchAction`: the site has no search page, and the sitelinks search box is no longer shown.)

### 6.3 OfferShippingDetails (UAE, 25 AED, next-day)

```json
{
  "@type": "OfferShippingDetails",
  "@id": "https://crystalbasket.store/#shipping-uae",
  "shippingRate": { "@type": "MonetaryAmount", "value": 25, "currency": "AED" },
  "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "AE" },
  "deliveryTime": {
    "@type": "ShippingDeliveryTime",
    "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
    "transitTime":  { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" }
  }
}
```
The "free over 250 AED" threshold has no per-offer field Google acts on; keep it in visible copy (announcement bar, product delivery line). If a single item ever costs ≥ 250 AED, emit the same block with `"value": 0`.

### 6.4 MerchantReturnPolicy (14-day unworn exchange, courier covered once)

```json
{
  "@type": "MerchantReturnPolicy",
  "@id": "https://crystalbasket.store/#returns",
  "applicableCountry": "AE",
  "returnPolicyCountry": "AE",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 14,
  "itemCondition": "https://schema.org/NewCondition",
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/FreeReturn",
  "refundType": "https://schema.org/ExchangeRefund",
  "merchantReturnLink": "https://crystalbasket.store/faq/"
}
```

### 6.5 BreadcrumbList (product example — The Seven)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://crystalbasket.store/" },
    { "@type": "ListItem", "position": 2, "name": "Bracelets", "item": "https://crystalbasket.store/shop/" },
    { "@type": "ListItem", "position": 3, "name": "Grounding & Stability", "item": "https://crystalbasket.store/intentions/grounding/" },
    { "@type": "ListItem", "position": 4, "name": "The Seven", "item": "https://crystalbasket.store/products/the-seven/" }
  ]
}
```
Intention page: Home › Intentions (`/intentions/`) › Calm & Ease (`/intentions/calm/`). Stone page: Home › Stones (`/stones/`) › Amethyst (`/stones/amethyst/`). Shop: Home › Bracelets.

### 6.6 CollectionPage + ItemList (category example — /intentions/calm/)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://crystalbasket.store/intentions/calm/",
  "url": "https://crystalbasket.store/intentions/calm/",
  "name": "Calm & Ease",
  "description": "Turn the volume down on a loud mind. Lilac and white stones worn to soften an anxious mind and slow the day down.",
  "isPartOf": { "@id": "https://crystalbasket.store/#website" },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Calm & Ease bracelets",
    "numberOfItems": 4,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "The Still Mind",   "url": "https://crystalbasket.store/products/the-still-mind/",   "image": "https://crystalbasket.store/images/products/the-still-mind/main.jpg" },
      { "@type": "ListItem", "position": 2, "name": "The Aurora",       "url": "https://crystalbasket.store/products/the-aurora/",       "image": "https://crystalbasket.store/images/products/the-aurora/main.jpg" },
      { "@type": "ListItem", "position": 3, "name": "The Tender Heart", "url": "https://crystalbasket.store/products/the-tender-heart/", "image": "https://crystalbasket.store/images/products/the-tender-heart/main.jpg" },
      { "@type": "ListItem", "position": 4, "name": "The Seven",        "url": "https://crystalbasket.store/products/the-seven/",        "image": "https://crystalbasket.store/images/products/the-seven/main.jpg" }
    ]
  }
}
```
For `/shop/` use name "Crystal bracelets", `numberOfItems: 12`, DOM order: the-alchemist, the-devotion, the-shield, the-aurora, the-clear-sight, the-guardian, the-still-mind, the-tender-heart, the-anchor, the-fortune, the-lionheart, the-seven. For `/stacks/`: the 9 linked products.

### 6.7 Product, complete (The Seven)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://crystalbasket.store/products/the-seven/#product",
  "name": "The Seven — Chakra Bracelet · Seven Stones, Root to Crown",
  "description": "All seven centres, in order, on one wrist. Red jasper, carnelian, citrine, aventurine, lapis, amethyst and clear quartz set in the traditional root-to-crown order on matte black beads. Worn for overall balance.",
  "sku": "the-seven",
  "brand": { "@type": "Brand", "name": "Crystal Basket" },
  "material": "Red Jasper, Carnelian, Citrine, Green Aventurine, Lapis Lazuli, Amethyst, Clear Quartz",
  "category": "Apparel & Accessories > Jewelry > Bracelets",
  "url": "https://crystalbasket.store/products/the-seven/",
  "image": [
    "https://crystalbasket.store/images/products/the-seven/main.jpg",
    "https://crystalbasket.store/images/products/the-seven/lifestyle.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://crystalbasket.store/products/the-seven/",
    "price": 75,
    "priceCurrency": "AED",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://crystalbasket.store/#organization" },
    "shippingDetails": { "@id": "https://crystalbasket.store/#shipping-uae" },
    "hasMerchantReturnPolicy": { "@id": "https://crystalbasket.store/#returns" }
  }
}
```
Rules: `availability` → `https://schema.org/OutOfStock` when the page shows "Sold out" (Aurora, Devotion today). Products without `lifestyle.jpg` (Anchor, Clear Sight, Lionheart, Still Mind, Tender Heart) keep a one-element array. No `aggregateRating` until N03. If `@id` references are inconvenient in a static build, inline 6.3 and 6.4 in place of the `@id` objects — that is what the draft does and it is equally valid.

### 6.8 Stone page (Amethyst)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://crystalbasket.store/stones/amethyst/",
  "url": "https://crystalbasket.store/stones/amethyst/",
  "name": "Amethyst bracelet meaning",
  "description": "The classic calming stone. Amethyst is traditionally worn to quiet an overactive mind, support restful sleep and open intuition.",
  "inLanguage": "en",
  "isPartOf": { "@id": "https://crystalbasket.store/#website" },
  "about": { "@type": "Thing", "name": "Amethyst", "alternateName": "Amethyst crystal" },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Bracelets with Amethyst",
    "numberOfItems": 2,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "The Still Mind", "url": "https://crystalbasket.store/products/the-still-mind/" },
      { "@type": "ListItem", "position": 2, "name": "The Seven",      "url": "https://crystalbasket.store/products/the-seven/" }
    ]
  }
}
```
Keep claims in `description` to the existing "traditionally worn to…" wording; do not use `MedicalEntity`, `Drug` or health-claim types.

---

## 7. Implementation order and verification

1. Ship `OnlineStore` + `WebSite` site-wide (F1).
2. Add shipping + returns to every Offer, with `returnPolicyCountry` and `refundType`, and put "Delivery 25 AED · free over 250 AED" in visible copy (F2). Fix `OutOfStock` mapping (F4).
3. `BreadcrumbList` on all 40 breadcrumb pages (F3).
4. `CollectionPage`/`ItemList` on shop, intentions, stacks (F5); image arrays (F6).
5. Stone `WebPage` (F7); FAQ → `ld()` (F8).

Verify with the Rich Results Test (Product, Breadcrumb, Organization, Merchant listing) and validator.schema.org on one product, one intention, one stone page and the homepage; then watch Search Console → Shopping › Merchant listings and Enhancements › Breadcrumbs after the next crawl.

Not recommended: `HowTo` for care/size guide (deprecated 2023), new `FAQPage` blocks for SERP purposes (retired 2026-05-07), `LocalBusiness` (no walk-in premises), `AggregateRating` from placeholder numbers.
