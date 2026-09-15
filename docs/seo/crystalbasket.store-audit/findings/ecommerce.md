# E-commerce SEO — crystalbasket.store

**Score: 64 / 100**

| Sub-score | Weight | Score | One-line reason |
|---|---|---|---|
| Product schema completeness | 25% | 68 | `shippingDetails`, `hasMerchantReturnPolicy`, `itemCondition`, `seller`, `category`, `BreadcrumbList` are now live on every PDP; still no `returnPolicyCountry`/`refundType`, `image` stays a single string, and 2 sold-out SKUs still say `BackOrder` |
| Title & meta | 15% | 60 | Keyword-rich but 9/12 titles > 60 chars, H1 is the brand name only, descriptions have no price/CTA — unchanged by the latest deploy |
| Image optimisation | 20% | 55 | Good alt text, 1200 px JPEGs (full detail in `sitemap-images.md`); Product schema still exposes only the first image even where a second one exists on-page |
| Content quality | 20% | 60 | Unique copy per product, real spec table; category/stone pages stay thin (full detail in `content.md`/`sxo.md`) |
| Internal linking | 10% | 82 | Breadcrumbs, related products, stone↔product links present and now schema-backed with a live `BreadcrumbList`; small gaps remain |
| Technical / crawl | 10% | 65 | Static HTML, canonicals, sitemap, no facet URLs; the raw `utx8rj-t3.myshopify.com` storefront is still a crawlable, self-canonical duplicate |

**Data source:** on-page analysis (static) of `raw/pages/` plus fresh live fetches on 2026-09-15 (`render_page.py` on `/products/the-guardian/`, `/products/the-aurora/`, `/shop/`, `/intentions/calm/`, `/stones/amethyst/`, `/stacks/`, `/faq/`, plus `curl` on the myshopify storefront, both robots.txt files and `/llms.txt`) and a read of the repo source. **No DataForSEO / Merchant API is configured** — there is no Google Shopping or Amazon marketplace data, no price benchmarking, and no keyword-volume data in this report; collection-naming advice is qualitative. Per instructions, JSON-LD *syntax and property-level* validation is `findings/schema.md`'s job and is not repeated here — only findings schema.md doesn't cover (feed/Merchant-listing operations, category pages, collection naming, internal linking, stacks, sold-out UX, the Merchant Center path) are scored and detailed below.

**Important: the site moved since the other reports in this folder were written.** `content.md`, `geo.md`, `sitemap-images.md`, `sxo.md`, `technical.md` and `schema.md` were all audited against `raw/pages/*` and describe HEAD `92ecae1`. This report was written after commit `9bc13da` ("organisation, website, breadcrumb and item-list schema, merchant shipping/returns on offers, AI-crawler robots rules, generated llms.txt") landed on `main` and confirmed **live** by direct fetch. That commit is exactly the "latest deploy" referenced in this task and it supersedes the "not live yet" caveats in `schema.md` §5 and the prior `ecommerce.md` for: `OnlineStore`, `WebSite`, `BreadcrumbList` (product/shop/intention/stone pages), `ItemList` (shop + 8 intention pages), and per-`Offer` `shippingDetails`/`hasMerchantReturnPolicy`/`itemCondition`/`seller`/`category`. Everything else in those five other reports (titles, category copy depth, image weight/format, Core Web Vitals, `/stacks/`, `/intentions/` and `/stones/` index pages) is untouched by `9bc13da` and still accurate.

---

## Product snapshot (live, re-verified 2026-09-15)

| Product | Title chars | Price | Schema availability | Visible state | Images on page | Images in `Product.image` |
|---|---|---|---|---|---|---|
| The Alchemist | 74 | 105 AED | InStock | buyable | 2 | 1 |
| The Anchor | 78 | 75 | InStock | buyable | 1 | 1 |
| The Aurora | 72 | 80 | **BackOrder** | **Sold out**, button disabled | 2 | 1 |
| The Clear Sight | 83 | 75 | InStock | buyable | 1 | 1 |
| The Devotion | 75 | 90 | **BackOrder** | **Sold out**, button disabled | 2 | 1 |
| The Fortune | 86 | 75 | InStock | buyable | 2 | 1 |
| The Guardian | 85 | 95 | InStock | buyable | 2 | 1 |
| The Lionheart | 87 | 75 | InStock | buyable | 1 | 1 |
| The Seven | 74 | 75 | InStock | buyable | 2 | 1 |
| The Shield | 66 | 65 | InStock | buyable | 2 | 1 |
| The Still Mind | 58 | 65 | InStock | buyable | 1 | 1 |
| The Tender Heart | 63 | 65 | InStock | buyable | 1 | 1 |

Title pattern: `{Name} · {Intention} Bracelet · {Stones} · Crystal Basket`. Every product page now carries 4 JSON-LD blocks (`OnlineStore`, `WebSite`, `Product`, `BreadcrumbList`), server-rendered, verified live on `the-guardian` and `the-aurora`.

---

## Ranked findings

### 1. Critical — Every order and back-in-stock CTA still points at a placeholder WhatsApp number
**Evidence.** Live fetch of `/products/the-aurora/`: "This piece is between batches. Message us and we will hold one for you." links to `wa.me/971500000000…`. `apps/web/src/lib/site.ts:15` → `whatsapp: "971500000000"`, `TODO[NEEDED:N01]`; `NEEDED.md` still lists N01 as ⏳. Unaffected by the 9bc13da deploy.
**Why it matters.** Half of the buy flow — and the only sold-out recovery path — is dead. The new `OnlineStore` schema states `"email": "hello@crystalbasket.store"` as the contact channel Google can verify; the on-page WhatsApp promise it doesn't back up is a misrepresentation risk if Merchant Center or a shopper tests it.
**Fix.** Provide the real number (N01). Until then, hide WhatsApp CTAs behind the flag rather than shipping a placeholder, and route "Tell me when it's back" to an email capture instead (see finding 11).

### 2. High — The new merchant-listing schema still declares 2 sold-out products as orderable
**Evidence.** Live `Product` JSON-LD on `/products/the-aurora/` (fetched 2026-09-15): `"availability":"https://schema.org/BackOrder"`, while the page shows a disabled "Sold out" button and "This piece is between batches." Same on `/products/the-devotion/`. Shopify CSV has qty 0, inventory policy `deny` for both — Shopify itself will not accept an order either. `9bc13da` shipped the shipping/returns/condition upgrade but left `products/[slug]/page.tsx`'s `availability: d.inStock ? InStock : BackOrder` mapping untouched.
**Why it matters.** `BackOrder` means "purchasable now, ships later." Paired with a disabled buy button, this is a textbook availability mismatch — one of the most common Merchant Center item disapprovals — and it now sits inside an otherwise-complete Offer (shipping + returns + condition + seller), so it's the single remaining blocker on these two SKUs.
**Fix.** Map `inStock:false` → `https://schema.org/OutOfStock` (feed: `availability: out_of_stock`). Keep both pages indexed with price still in the Offer. Reserve `PreOrder` for a genuine take-the-order-now, ship-later case.

### 3. High — The new shipping/returns markup isn't Merchant-Center-safe yet, and the rate it states is invisible to shoppers
**Evidence.** Live `Offer.hasMerchantReturnPolicy` on `the-guardian`/`the-aurora`: `applicableCountry: "AE"`, `returnPolicyCategory: MerchantReturnFiniteReturnWindow`, `merchantReturnDays: 14`, `returnFees: FreeReturn` — **no `returnPolicyCountry`** (Google has required this alongside `applicableCountry` since March 2025) and **no `refundType`**, so the default read is a full refund. The real, visible policy (PDP accordion, FAQ) is a 14-day **unworn size exchange** with the courier covered once — not a no-questions refund. Separately, `Offer.shippingDetails.shippingRate.value` is `25` (AED) and it is the only place "25" appears: a full-text search of all 46 live pages (product copy, announcement bar, FAQ, `/size-guide/`) for "25 AED" / "AED 25" returns nothing; the fee is only stated in `llms.txt` (machine-readable, not shopper-visible: `"Delivery 25 AED, free over 250 AED"`).
**Why it matters.** Google requires structured data to match what a shopper actually sees; an Offer that structurally promises a bigger refund than the page does, and a shipping cost that appears nowhere for a human to read, are exactly the kind of mismatches Merchant Center's periodic re-review flags.
**Fix.** Add `returnPolicyCountry: "AE"` and `refundType: "https://schema.org/ExchangeRefund"` to `returnPolicyLd`; add "Delivery 25 AED · free over 250 AED" to the PDP delivery line and/or the announcement bar so page copy, schema and the Storefront checkout agree. (Property-level detail already in `schema.md` §3 F2 and §6.4 — flagging here only because the deploy shipped the block without these two fields and the "25 AED" gap is a live-copy problem, not a schema one.)

### 4. High — The raw Shopify storefront is still a crawlable, self-canonical duplicate — and its JS redirect drops shoppers on the homepage, not the matching page
**Evidence (live curl, 2026-09-15).** `https://utx8rj-t3.myshopify.com/products/the-guardian` → HTTP 200, `<link rel="canonical" href="https://utx8rj-t3.myshopify.com/products/the-guardian">`, `og:url` on the myshopify host, no `noindex` meta or `X-Robots-Tag`, and the redirect script is `if(location.hostname.indexOf("myshopify.com")>-1 && location.pathname.indexOf("/checkouts")!==0){location.replace("https://crystalbasket.store/")}` — this sends **every** non-checkout myshopify URL to `crystalbasket.store/`, not to the equivalent `/products/the-guardian/`. The page is also listed in `https://utx8rj-t3.myshopify.com/sitemap_products_1.xml` (all 12 handles present) and myshopify's `robots.txt` is `Allow: /`.
**Why it matters.** A self-canonical 200 with a working sitemap entry can still get indexed or chosen as canonical over a client-side redirect; if it is, the redirect target is the homepage, which would waste any authority the myshopify URL accrued and could confuse Search Console's canonical reporting. `utx8rj-t3.myshopify.com`'s own `robots.txt` also carries agent/skill-install instructions aimed at AI shopping assistants (treated here as untrusted page content, not acted on) — worth knowing this host is being treated as a first-class storefront by Shopify's own tooling even though it's meant to be invisible.
**Fix (Shopify admin, no repo change).** In `layout/theme.liquid` add `<meta name="robots" content="noindex, nofollow">` and override the canonical to `https://crystalbasket.store{{ request.path }}/` for product/collection templates; add a `robots.txt.liquid` with `Disallow: /` (checkout is unaffected by theme robots.txt). Change the redirect snippet to preserve the path (`location.replace("https://crystalbasket.store" + location.pathname)`) rather than always going to `/`. Never enable the Shopify Google & YouTube channel's product sync (see the Merchant Center path below).

### 5. High — No return/refund, privacy or terms pages on the storefront
**Evidence.** `raw/urls.txt` (46 URLs, unchanged by the deploy) has no `/returns/`, `/privacy/`, `/terms/`; the return policy exists only as one PDP-accordion sentence and one FAQ answer.
**Why it matters.** Merchant Center reviews the site for a clear, dedicated return/refund policy, contact details and terms before approving free listings; this is a routine account-level disapproval reason, independent of how good the per-product schema is.
**Fix.** Add `/delivery-returns/` (25 AED rate, free ≥ 250 AED, cash on delivery, next-day/1–2 business days, 14-day unworn exchange terms, courier-covered-once, free re-string for life, how to start an exchange), `/privacy/` and `/terms/`; link from the footer and the PDP accordion; mirror the text in Shopify Settings → Policies so the checkout footer isn't empty.

### 6. High — Titles and H1s still lead with the product name nobody searches for
**Evidence (live).** `<title>` on `/products/the-aurora/`: "The Aurora · Focus & Clarity Bracelet · Labradorite · Crystal Basket" (72 chars). H1 is "The Aurora" alone; the descriptive line is a `<p>` below it. No product title contains "crystal bracelet," "Dubai" or "UAE." Untouched by `9bc13da` (that commit only added JSON-LD calls to these route files, not copy).
**Fix.** Title: `{Stones} {Intention} Bracelet | Crystal Basket Dubai`, e.g. "Labradorite Focus Bracelet | Crystal Basket Dubai" (≤ 60 chars). Keep the product name as the primary word in the H1 but pair it with the descriptor: "The Aurora — Labradorite Focus & Clarity Bracelet." Apply the same swap to the 8 intention-page titles.

### 7. Medium — Product feed readiness: one image per SKU in schema, text-only category, GTIN/MPN correctly absent
**Evidence.** Live `Product.image` is a single string on all 12 pages even though 7 of them (`the-alchemist`, `the-aurora`, `the-devotion`, `the-fortune`, `the-guardian`, `the-seven`, `the-shield`) render a second `lifestyle.jpg` on the page itself (confirmed by regex on the live HTML). `category` is the plain string `"Apparel & Accessories > Jewelry > Bracelets"`, not a `CategoryCode` with a Google taxonomy ID. No `gtin`/`mpn` anywhere, and no `Variant Barcode` column in the Shopify CSV. (Full property-by-property grading of this block is `schema.md`'s F6/§6.7 — noted here only for what it means at feed-build time.)
**Why it matters for a feed, specifically.** Whether the feed is built from schema (`image_link`/`additional_image_link`) or by hand, right now only the *first* photo is machine-readable per product, so a schema-sourced feed under-represents inventory that already has two real photos. GTIN/MPN absence is correct for handmade goods and needs no schema property — declare `identifier_exists: no` at the feed level (or tick "This is a custom product" if ever using Shopify's own channel, which sets the same flag).
**Fix.** Turn `image` into an array (`[main, lifestyle]` where present) before any feed is generated from the page schema. Add `google_product_category: 191` (Apparel & Accessories > Jewelry > Bracelets) and `identifier_exists: no` at the feed/account level.

### 8. Medium — Category pages are architecturally clean but the copy is too thin to rank on its own
**Evidence.** `/shop/`: H1 "Crystal bracelets," meta description "Every Crystal Basket bracelet: natural 8 mm crystal beads strung by intention, delivered next day across the UAE," 12 tiles, no intro paragraph beyond the meta line. `/intentions/calm/`: title "Calm & Ease bracelets," H1 "Calm & Ease," 2-sentence intro ("Turn the volume down on a loud mind. Lilac and white stones worn to soften an anxious mind and slow the day down. The most gifted intention in our basket."), 1 primary product. `FilterBar.tsx` toggles DOM attributes only — no `URLSearchParams`, no `pushState` — so there are genuinely **zero facet URLs** to worry about (good for crawl budget, but it also means style facets like "men," "gold accent," or a price band have no landing page at all). 12 products total, so pagination isn't needed and none exists. (Full word-count/E-E-A-T grading is in `content.md`/`sxo.md`; noted here for the e-commerce-architecture angle only.)
**Why it matters.** `/shop/` and the 8 intention pages are the pages most likely to catch category-level shopping queries ("crystal bracelets Dubai," "protection crystal bracelet"), and a one-sentence intro under a two-word H1 gives Google little to match those queries against, even though the underlying filter/pagination architecture is sound.
**Fix.** Extend `/shop/` to ~100–120 words mentioning Dubai/UAE, 8 mm natural beads, "from 65 AED," delivery and the 15%-off stack; give intention pages one more sentence naming the stones used and who the piece suits. No pagination or facet-URL work needed — that part is already right.

### 9. Medium — Collection names favor brand voice over search demand
**Evidence (qualitative — no DataForSEO/keyword-volume data available).** Product names ("The Guardian," "The Alchemist") carry zero inherent search demand by design. Intention labels are on-brand but partly off-query: "Love & Self-Love," "Calm & Ease," "Abundance & Wealth," "Focus & Clarity." The likely query shapes for this niche are "crystal bracelet for protection/anxiety/love/money/sleep," "black tourmaline bracelet," "rose quartz bracelet," "crystal bracelet Dubai."
**Fix.** Keep the poetic names as product H1s and `og:title`, but lead every `<title>`/meta description with the descriptive, query-shaped phrase (finding 6). For intention pages, keep the on-brand H1 but shift the `<title>` toward the query form: "Crystal bracelets for protection," "Crystal bracelets for calm & anxiety," "Abundance & money crystal bracelets," "Sleep & rest crystal bracelets." Validate against Search Console impressions after 4–6 weeks once this ships; a Keyword Planner pull would settle exact wording, but none was available for this audit.

### 10. Medium — Stacks are one page with no bundle URL, schema or purchasable SKU
**Evidence (live, `/stacks/`).** Title "Stacks & sets · Crystal Basket," H1 "Three pieces. 15% off." Three curated stacks with images, alt text, product links, "217 AED / 255 AED" totals, and a stack builder that adds three individual product handles to the Shopify cart. Live structured-data check shows only `OnlineStore`+`WebSite` on this page — no `BreadcrumbList`, no `ItemList`, no `Product` — confirming `9bc13da` did not touch `stacks/page.tsx`. The 15% is an automatic order-level Shopify discount (per ADR notes), so no bundle SKU exists.
**Why it matters.** "Crystal bracelet set/stack" is a distinct buyer intent that a single hub page can't target three ways at once, and without a bundle SKU the stacks can't appear in a Merchant Center feed (`is_bundle`) or carry `Product` schema Google will trust.
**Fix.** Give each curated stack its own static route (e.g. `/stacks/protection-stack/`) with unique copy, `BreadcrumbList`, and a `Product` block (`isRelatedTo` the three components, combined price, image array); create matching Shopify bundle products so each stack has a real variant and can be fed with `is_bundle: yes`. Keep `/stacks/` as the hub + builder.

### 11. Medium — Sold-out UX is a dead end that routes back to the placeholder WhatsApp number
**Evidence (live, `/products/the-aurora/`).** Disabled "Sold out" button, "This piece is between batches. Message us and we will hold one for you." → the same `wa.me/971500000000` placeholder (finding 1), no ETA, no email capture. Tiles elsewhere show a "Sold out" badge and the stack builder disables sold-out items — both good and unchanged.
**Fix.** Keep both pages live and indexed (they hold the only Labradorite and Moonstone product content). Add a back-in-stock email form (Shopify back-in-stock app, or `subscribe.ts` once functional), an honest restock ETA, and a "meanwhile, for focus/love" row of in-stock alternatives from the same intention.

### 12. Low — Internal linking is solid; breadcrumbs are now schema-backed, small gaps remain
**Evidence (live).** PDP breadcrumb is both visible (`aria-label="Breadcrumb"` nav) and now emitted as `BreadcrumbList` JSON-LD (verified on `the-guardian`: Home › Bracelets › Protection › The Guardian); same on the 8 intention and 16 stone pages. Stone pages (e.g. `/stones/amethyst/`) list 1–2 bracelets that use the stone; the home page links only 4 products directly. `/intentions/`, `/stones/` and `/stacks/` (the three index pages) still carry no `BreadcrumbList` even though the nav is present on them too — `9bc13da` added the block to individual product/intention/stone pages and to `/shop/`, but not to these three hubs.
**Fix.** Add `BreadcrumbList` to `/intentions/`, `/stones/` and `/stacks/` (two-line change matching the existing pattern); add one sentence on each stone page linking to its intention page(s); link all 8 intentions and all 3 stacks with descriptive anchors from the home page body, not just the mega-menu.

### 13. Low — Identical FAQ block repeated on all 12 PDPs
**Evidence.** The same ~7-question, ~250-word FAQ renders on every product page; `FAQPage` schema exists only on `/faq/` (correct — see `schema.md` F8 on why no rich-result benefit is expected). Unchanged by the deploy.
**Fix.** Keep two generic questions and add two product-specific ones generated from catalog data (e.g. "Can I get Hematite wet?" from a `waterSafe` field), so each PDP carries some unique body text beyond the description and spec table.

### 14. Info — Price/stock sync between catalog JSON and Shopify is still manual
**Evidence.** Catalog price is display-only; Shopify is the charge of record (per ADR 0002). Live prices match the current Shopify CSV.
**Fix.** Before any Merchant Center feed submission, pull price and `availableForSale` from the Storefront API at build time so page, schema, feed and checkout can't drift — a price or stock mismatch is an item-level disapproval on its own.

---

## Recommended Merchant Center path (Shopify back office, public URLs on a static custom domain)

The constraint doesn't change with this deploy: Merchant Center requires every `link` to be on the verified, claimed website, and Shopify's own Google & YouTube channel only syncs Online Store URLs on `utx8rj-t3.myshopify.com`. That channel cannot be the product source here — `crystalbasket.store` has to be the one Merchant Center reads.

1. **Prerequisites — status after `9bc13da`.** Done: Organization/WebSite entity, per-Offer shipping and returns blocks, `itemCondition`, `seller`, `category`, breadcrumbs. Still open before submitting anything: fix the `BackOrder`→`OutOfStock` mapping (finding 2), add `returnPolicyCountry`/`refundType` and put "25 AED" delivery in visible copy (finding 3), add `/delivery-returns/`+`/privacy/`+`/terms/` (finding 5), turn `image` into an array (finding 7), and pull price/stock from the Storefront API at build time (finding 14). None of these are large changes, but Merchant Center will flag the availability mismatch and missing policy pages on first review.
2. **Account.** Create Merchant Center Next under the Google account that will also own Search Console. Business name "Crystal Basket," country UAE, currency AED. Verify and claim `crystalbasket.store` via Search Console (Domain property, DNS TXT in Cloudflare — the Cloudflare account is on Alya's Gmail, so either add the TXT there or share Search Console access). Do **not** attempt to claim the myshopify domain.
3. **Product source: a build-time feed file (recommended over the schema-crawl option).** Add a script that writes `apps/web/public/feeds/google-merchant.tsv` from `packages/catalog/content` plus Storefront API price/availability, deployed with the site; register it as "Add products from a file" with a daily scheduled fetch of `https://crystalbasket.store/feeds/google-merchant.tsv`. One row per product (S/M/L share price and stock; no per-size URLs exist). Columns: `id` (slug) · `title` (descriptive form, finding 6) · `description` · `link` (`https://crystalbasket.store/products/{slug}/`) · `image_link` (main.jpg) · `additional_image_link` (lifestyle.jpg where it exists) · `price` ("95.00 AED") · `availability` (in_stock/out_of_stock, from the fixed mapping) · `condition` new · `brand` Crystal Basket · `identifier_exists` no · `google_product_category` 191 · `product_type` "Crystal bracelets > Protection" · `material` · `color` · `age_group` adult · `shipping` "AE::Standard:25.00 AED" plus an account-level free-over-250 rule · `custom_label_0` intention. Alternative with zero new code, once findings 2, 3 and 7 ship: Merchant Center Next's "Add products from your website," which reads the live `Product` schema directly — workable for a 12-SKU catalogue, but stock changes only propagate when Google recrawls, which is slower than a scheduled feed fetch.
4. **Shipping and returns at account level.** Shipping service: United Arab Emirates, AED 25 flat, free from 250 AED, handling 0–1 day, transit 1–2 days, cash-on-delivery noted in policy text. Return policy: 14-day unworn-size exchange, courier covered once — written exactly as the new `/delivery-returns/` page will state it. These account-level settings back up (and can substitute for) the per-Offer `shippingDetails`/`hasMerchantReturnPolicy` blocks, and they must match Shopify Settings → Shipping.
5. **Keep availability honest after launch.** Rebuild on stock changes: a nightly scheduled GitHub Actions deploy plus a Shopify Flow ("inventory quantity changed" → HTTP request to a `repository_dispatch` endpoint) keeps the static export in sync. Turn on Merchant Center's automatic item updates (price/availability from structured data) as a safety net.
6. **Sold-out items.** Submit with `availability: out_of_stock`; never remove them from the feed or de-index the page.
7. **Shopify hygiene.** Noindex/disallow the theme pages and fix the redirect target (finding 4). Fill in Shopify Settings → Policies. Never install the Google & YouTube channel's product sync; if Shopify's conversion tracking tag is wanted later, install only the tag, not the product feed.
8. **After approval.** Start with free listings for the UAE; the same feed can power Shopping ads later. When real customer reviews exist, export them to catalog JSON at build time and add `aggregateRating`/`review` to schema plus a separate product-ratings feed — not before (placeholder ratings must never reach markup, per `schema.md` F9).

---

## Quick wins (in order)

1. `OutOfStock` for `inStock:false` on Aurora and Devotion (finding 2) — smallest possible code change, removes the biggest live Merchant Center blocker.
2. `returnPolicyCountry`/`refundType` on the return policy block, plus "Delivery 25 AED · free over 250 AED" added to visible PDP/announcement copy (finding 3).
3. Noindex + corrected canonical + path-preserving redirect + `robots.txt.liquid` on the Shopify theme (finding 4).
4. `/delivery-returns/`, `/privacy/`, `/terms/` pages, linked from the footer (finding 5).
5. Real WhatsApp number (N01) or hide the CTA (finding 1).
6. Title/H1/meta pattern change on PDPs and intention pages (findings 6, 9).
7. `image` → array in the Product schema; five missing lifestyle photos (finding 7, cross-ref `sitemap-images.md`).
8. `BreadcrumbList` on `/intentions/`, `/stones/`, `/stacks/`; give each curated stack its own page (findings 10, 12).
9. Build-time price/stock pull from Shopify, then the feed file and Merchant Center claim (finding 14, Merchant Center path).
