# crystalbasket.store — Full SEO Audit

_Audited 2026-09-15 with claude-seo v2.3.1 against the live site (46 URLs). Fixes shipped the same day; see "Status after fixes". Scores are the skill's heuristics, not Google signals. Search Console is the source of truth once verified._

## Executive summary

**SEO Health Score (live site before fixes): 60 / 100**
**Business type:** e-commerce, single-brand D2C jewellery store, Dubai, UAE-only delivery, static Next.js storefront with Shopify checkout.

| Category | Weight | Score | Source |
|---|---|---|---|
| Technical SEO | 22% | 76 | `findings/technical.md` |
| Content quality | 23% | 52 | `findings/content.md` |
| On-page SEO | 20% | 60 | titles/meta 72, headings and internal links 60, SXO gap 40 (`content.md`, `sxo.md`) |
| Schema / structured data | 10% | 48 | `findings/schema.md` |
| Performance (lab) | 10% | 65 | `findings/visual-performance.md` |
| AI search readiness | 10% | 51 | `findings/geo.md` |
| Images | 5% | 59 | `findings/sitemap-images.md` |

Supporting scores: e-commerce 64, sitemap 74, visual/UX 62, SXO gap 40.

### Top 5 issues found

1. **Every WhatsApp order and contact button pointed at a placeholder number** (`971500000000`), on all 46 pages.
2. **The pages that should rank were thin.** 16 stone and 8 intention pages had 51–103 words on near-identical templates; product pages were 81% shared boilerplate.
3. **No policy or contact pages.** No delivery, returns, contact or privacy page, and the 25 AED delivery fee was never shown on product pages.
4. **Structured data gaps.** Sold-out pieces marked `BackOrder`, a single product image, no breadcrumbs or collection markup on the index pages, stone pages untyped.
5. **Heavy, non-responsive images and a prefetch storm.** A 556 KB hero JPEG served to phones, 4.5 MB of home-page images, about 2.3 MB of silently prefetched page payloads from the mega-menu, and a horizontal-scroll bug on mobile.

### Top 5 quick wins identified

1. Hide WhatsApp buttons behind a flag and fall back to email until the real number exists.
2. Descriptive, query-shaped titles and H1s ("Amethyst bracelet meaning", "Crystal Bracelet FAQ").
3. `OutOfStock` for sold-out pieces, image arrays, breadcrumbs everywhere.
4. `noindex` on the wishlist instead of a robots `Disallow`.
5. Git-based sitemap `lastmod` and an IndexNow ping on deploy.

## Technical SEO (76)

- **Working:** true static HTML (all copy, prices, JSON-LD and canonicals in the raw response), clean trailing-slash URLs, one-hop redirects, valid sitemap, every page two clicks from home.
- **Found:** hero LCP image 556 KB with no responsive variants; four below-the-fold product images preloaded; about 90–100 KB of inline React Server Component payload per page; no `width`/`height` on 189 images; wishlist blocked in robots but linked everywhere without `noindex`; sitemap `lastmod` a single build time; no IndexNow; no security headers (GitHub Pages cannot set them); 10-minute cache on hashed assets.

## Content quality (52)

- **Working:** readable (Flesch 64–83), honest first-hand process copy, disclaimer linked from every product, no "cure/heal" claims.
- **Found:** placeholder WhatsApp number; nobody named on the about page; no policies; thin stone and intention pages; boilerplate-heavy product pages; "traditionally worn for" applied on 6 of 24 guide pages and six health-adjacent phrases; superlatives with no reviews behind them; stale copy ("card payments coming soon", "things people ask us on WhatsApp").

## On-page SEO (60)

- **Found:** brand-voice H1s with no search terms (home "Energy you can wear.", care "A monthly ritual, five minutes long."); product titles 63–81 characters and descriptions 183–251 characters; stone pages never linked to intentions or care; FAQ questions rendered as buttons rather than headings.
- **SXO:** "crystal bracelets Dubai" results are store homes and collections from UAE specialists that lead with Dubai, delivery speed and trust. "X bracelet meaning" results are long guides with tables and FAQs, which the 60-word stone pages could not match.

## Schema (48)

- **Found (live):** `Product` with a single image and `BackOrder` on sold-out pieces; no `Organization`/`WebSite`, no shipping or return policy on offers, no `BreadcrumbList` despite visible breadcrumbs, no collection markup, stone pages untyped. FAQPage valid but no SERP benefit for a store.
- **Keep out:** `AggregateRating` until reviews are real.

## Performance (65, lab)

- Fast TTFB and good code splitting, undercut by the hero image, the mega-menu prefetching every intention and stone page on hover, and the RSC payload inlined in every HTML document.

## Images (59)

- JPEG only, no WebP/AVIF, no `srcset`; empty `alt` on the hero and stack-builder thumbnails; images are AI placeholders with no IPTC "AI-generated" labelling.

## AI search readiness (51)

- **Working:** `llms.txt`, AI crawlers allowed, static HTML.
- **Found:** no definition sentences, no comparison tables, no dates, answers not marked as headings, no named entity behind the brand, no quotable 40–80-word passages on guide pages.

---

## Status after fixes (shipped 2026-09-15)

| Area | What changed |
|---|---|
| Contact | WhatsApp buttons hidden behind `flags.whatsapp` (off); every contact link uses email until the real number is set. |
| Delivery fee | "Delivery 25 AED, free over 250 AED" on product pages, cart and FAQ; `site.deliveryFeeAED` feeds the Offer schema. |
| New pages | `/delivery/`, `/returns/`, `/contact/`, `/privacy/`, linked from a new footer Help column and `llms.txt`. |
| Stone pages | H1 "X bracelet meaning"; facts table with Mohs hardness, origin and wrist; question-headed sections for worn for, what it is, which wrist, how to cleanse, pairings; links to intentions and care. Main content now 375–422 words. |
| Intention pages | Curated stone list, "What is a … crystal bracelet?" definition, wrist guidance, stone table, two FAQs as headings, link to the matching stack. Main content 343–382 words. |
| Product pages | `seoTitle` / `seoDescription` per product (titles ≤ 50 plus brand, descriptions ≤ 155); H1 carries the descriptive name; three product-specific questions replace the repeated seven; mobile order is photo, price and buy box, then detail photo; stack link. |
| Guide pages | Descriptive H1s (FAQ, care, size guide, about), question H2s, "Last reviewed" dates from git; FAQ answers expanded to 40–80 words with follow-up links; plain-English line opening the disclaimer. |
| Home | Title "Crystal Bracelets Hand-Strung in Dubai", H1 "Crystal bracelets, hand-strung in Dubai", plain-words summary paragraph, mobile overflow fixed. |
| Schema | `OnlineStore` + `WebSite` sitewide; `Product` with image array, `OutOfStock`, `OfferShippingDetails` and `MerchantReturnPolicy`; `BreadcrumbList` on every hub, guide and policy page; `CollectionPage` on shop, intentions and stacks; stone `WebPage` with `about`; FAQPage on `/faq/`. |
| Images | WebP variants at 480–2000 px with `srcset`, intrinsic width and height on every catalog image, descriptive `alt` on hero and builder thumbnails, no below-the-fold preloads. |
| Crawl | Wishlist `noindex, follow` (no longer blocked); robots groups for search, answer and training crawlers; RSC `index.txt` files disallowed; sitemap `lastmod` from git, no `priority`; IndexNow key and post-deploy ping. |
| UX | Mega-menu and footer links no longer prefetch; welcome popup is a bottom sheet on mobile and the newsletter bar hides while it is open; sold-out pieces sort last. |
| Claims | Copy switched to "traditionally worn for", health-adjacent phrases reworded; a catalog test now fails the build on a medical-claims pattern. |

## Still open

| Item | Why it is open |
|---|---|
| Real WhatsApp number (NEEDED N01) | Owner input. Flip `flags.whatsapp` once set. |
| Founder name, photo and studio photos (N19) | Owner input; biggest remaining E-E-A-T gap. |
| Real reviews (N03) | Owner input; never fabricate. |
| Search Console and Bing verification (N17) | Needs a DNS TXT record in the owner's Cloudflare account. |
| Shopify stock storefront (N18) | Should be `noindex` and redirect path-to-path; today it redirects to the home page. |
| Terms of sale page (N20) | Shopify can generate one. |
| Security headers and long asset caching | GitHub Pages cannot set headers. Needs the Cloudflare proxy (currently DNS-only by design) or a host move. |
| RSC payload in every HTML page | Inherent to Next static export; revisit if field data shows slow LCP. |
| IPTC "AI-generated" labels on placeholder photos | Moot once real photography replaces them (N05). |
| Decisions for the owner | Welcome popup on every visit (possible intrusive interstitial); free-delivery threshold of 250 AED is out of reach with a discounted three-piece stack (best case 233.75 AED); largest size fits an 18.5 cm wrist, small for many men. |
