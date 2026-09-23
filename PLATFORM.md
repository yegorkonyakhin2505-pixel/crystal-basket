# Crystal Basket — Platform Manifest

> Single source of truth for what exists. Update in the same commit as any change.

## Packages

| Package | Path | Role |
|---|---|---|
| `web` | `apps/web` | Next.js 15 storefront, static export (`out/`) |
| `@crystal-basket/catalog` | `packages/catalog` | Content JSON, zod schemas, typed queries, vitest suite |

## Routes (`apps/web/src/app`)

| Route | File | Data | Notes |
|---|---|---|---|
| `/` | `page.tsx` | bestsellers, new, stacks | Hero (eyebrow is the H1 "Crystal bracelets, hand-strung in Dubai"), intention grid, bestsellers, plain-words summary paragraph, trust strip, stacks band, story, reviews. Absolute title "Crystal Bracelets Hand-Strung in Dubai \| Crystal Basket" |
| `/shop/` | `shop/page.tsx` | all products (in stock first) | ListingHero + FilterBar + ProductGrid · CollectionPage JSON-LD |
| `/products/[slug]/` | `products/[slug]/page.tsx` | product, stones, related | Grid areas: mobile order photo → buy box → detail photo; desktop photos left, sticky buy box right. H1 = name + `seoTitle`; `<title>`/description from `seoTitle`/`seoDescription`. BuyBox (wrist size only, all 8 mm, shows the 25 AED fee), "Part of The X Stack" link, accordions, related grid, three product-specific questions (wrist from the intention, water/sun from the stones, stack) as h3, Product JSON-LD via `productLd` (image array, OutOfStock when sold out, shipping + return policy) + BreadcrumbList |
| `/intentions/` | `intentions/page.tsx` | intentions | CategoryGrid · H1 "Crystal bracelets by intention" · CollectionPage + BreadcrumbList |
| `/intentions/[slug]/` | `intentions/[slug]/page.tsx` | primary + secondary products, curated `stones`, stack | Stone chips from the intention's curated list; grids in stock first; sleep shows the "also worn for" pieces as the main grid. Guide: "What is a … crystal bracelet?" (`definition`), which wrist, stone table, intention FAQ as h3, link to its stack (`/stacks/?stack=<id>#build`). CollectionPage + BreadcrumbList |
| `/stones/` | `stones/page.tsx` | stones | Tumbled-stone photo tiles (`public/images/stones/<id>.jpg`, gradient sphere fallback) + "16 stones at a glance" table (worn for, chakra, wrist, water, sun, Mohs) · H1 "Crystal meanings" · CollectionPage + BreadcrumbList |
| `/stones/[slug]/` | `stones/[slug]/page.tsx` | stone, products, intentions, pairings | H1 "X bracelet meaning". Facts table (incl. Mohs, found in, wrist) and question-headed H2 sections: worn for (`wornFor`), what is it (`mineral`), which wrist (`wristWhy`), how to cleanse (water/sun/`waterNote`), pairs with (`pairsWith`). WebPage (`about` Thing) + BreadcrumbList |
| `/build/` | `build/page.tsx` | stones, intentions, `site.custom` | Build-your-own bracelet: `BraceletBuilder` (client). Wrist size sets the 8 mm bead count (S 20, M 23, L 25); tap a stone to drop a bead (CSS `beadDrop`), slider drops several, repeat pattern, fill the rest, undo, tap a bead to remove. Price = `site.custom.baseAED` + highest stone tier + gold bead. Complete designs resolve the Shopify `custom-bracelet` variant (Wrist size × Stones tier × Gold bead) via `findVariantByOptions` and add it with the bead sequence as line attributes; `?d=<size>.<idx>...` share links. Email fallback when Shopify is off |
| `/stacks/` | `stacks/page.tsx` | stacks, all products | Curated sets (CTA links `?stack=<id>#build`, StackBuilder preselects that stack's in-stock pieces) + StackBuilder at `#build` · CollectionPage + BreadcrumbList |
| `/about/`, `/size-guide/`, `/care/`, `/faq/`, `/disclaimer/` | same-named folders | static | `PageIntro` header: descriptive H1 in label caps, display tagline, "Last reviewed" from git. Question H2s. `/faq/` renders `lib/faq.ts` with h3 questions, follow-up links and FAQPage JSON-LD; the disclaimer opens with a plain-English line |
| `/delivery/`, `/returns/`, `/contact/`, `/privacy/` | same-named folders | `site.ts` | Policy pages, factual only: 25 AED / free over 250 AED / 1–2 working days / COD; 14-day size exchange, refunds case by case, free restring; email + Instagram (+ WhatsApp when `flags.whatsapp`); Shopify/Stripe/localStorage data use. BreadcrumbList |
| `/llms.txt` | `llms.txt/route.ts` | whole catalog, FAQ | Generated Markdown map for AI assistants |
| `/wishlist/` | `wishlist/page.tsx` | all products (client filters by localStorage) | `noindex, follow` |
| 404 | `not-found.tsx` | | |
| `/robots.txt`, `/sitemap.xml` | `robots.ts`, `sitemap.ts` | all catalog ids | robots: search/answer crawlers, training crawlers and `*` all allowed; `/*index.txt$` (RSC payloads) disallowed. Sitemap: no wishlist, `lastmod` = last git commit touching the page source or its content JSON (`lib/git-date.ts`), no priority |

## Components

**`components/ui`** (design system, see `DESIGN.md`): `Button`, `ButtonLink`, `buttonClasses`, `Badge`, `Input`, `AccordionItem`, `SectionTitle`, `cn`.

**`components/Store`:** `Header` (server) + `HeaderClient` (sticky, compact on scroll with hysteresis, state-driven mega-menus with keyboard + Escape, mobile drawer as a dialog) · `Wordmark` · `Footer` · `NewsletterBar` (client, dismissable, shows the welcome code inline, renders its own spacer) · `OfferPopup` (client, welcome-offer modal ~3 s after load, defers while the bag is open) · `Hero` · `ListingHero` · `CategoryGrid` · `ProductGrid` · `ProductTile` (data-* attributes for FilterBar; heart is a sibling of the link; badge order Sold out › Leaving soon › New › Bestseller) · `BraceletBuilder` (see `/build/`) · `BeadRing` (SVG fallback art) · `LogoBadge` (palette 18: cream ink + gold bead on a `cb-rose` disc; `mono` prop for single-colour uses; renders `logo-badge-paths.ts`, generated by `scripts/logo-badge.py`) · `FilterBar` (client: anchored popovers on desktop, bottom sheet on mobile, faceted counts, chips, custom sort menu) · `BuyBox` (client; sold-out state with a "tell me when it’s back" contact link; optional "Pay by card" Stripe link next to the Shopify bag) · `StackBuilder` (client) · `WishlistButton` · `WishlistClient` · `TrustStrip` · `Testimonials` · `PageIntro` (guide/policy page header). WhatsApp buttons everywhere render only when `flags.whatsapp` is on; otherwise contact links fall back to email (`lib/contact.ts`). Mega-menu, drawer, footer and stone/intention links use `prefetch={false}`.

**Root:** `ShopifyAnalytics` (client; `useShopifyCookies` on the root domain plus a page-view event per route, so Shopify's dashboard and Live View report crystalbasket.store rather than the hidden stock store) · `Img` (base-path aware; when `lib/image-variants.json` lists the file, renders `<picture>` with a WebP `srcset` from `scripts/responsive-images.py` plus intrinsic width/height; pass `sizes`), `QueryProvider`, `SmoothScroll` (Lenis, nested scroll allowed; dialogs carry `data-lenis-prevent`; pins each client-side navigation to the top, keeps the browser's position on back/forward), `ScrollReveal` (re-attaches on route change and DOM mutations).

**Commerce (Shopify Storefront, env-gated):** checkout runs on `shop.crystalbasket.store` (Shopify primary domain, CNAME → shops.myshopify.com, DNS-only), so the whole journey stays on one root domain. `lib/shopify.ts` (GraphQL client: variant lookup by handle + "Wrist size", cart create/add/remove/fetch with `userErrors`, friendly errors, `CartGoneError`; cart lines carry variant and product gids for analytics) · `hooks/useCart.ts` (shared cart state, localStorage cart id, single in-flight restore, revalidates on `pageshow`, recreates an expired cart) · `components/Store/CartDrawer.tsx` · `BagButton.tsx` · "Add to bag" paths in `BuyBox` and `StackBuilder`. Off when `NEXT_PUBLIC_SHOPIFY_*` are empty; then payment links + WhatsApp apply.

## Lib & hooks

`lib/site.ts` (site config + feature flags) · `lib/paths.ts` (`routes`, `asset`, `BASE`) · `lib/whatsapp.ts` · `lib/images.ts` · `lib/sizes.ts` · `lib/faq.ts` (40–80-word answers with optional follow-up link) · `lib/contact.ts` (`contactUrl`, `orderByMessageUrl`, `contactChannel`; WhatsApp when `flags.whatsapp`, else email) · `lib/schema.ts` (JSON-LD builders: `organizationLd`, `websiteLd`, `productLd`, `breadcrumbLd`, `collectionPageLd`, `stonePageLd`, `faqPageLd`, shared `shippingDetailsLd` / `returnPolicyLd`, `ld()` serialiser) · `lib/analytics.ts` (`trackPageView`, `trackAddToCart`; events POST to `site.checkoutDomain`, which is Shopify-served, because our own host answers 405) · `lib/git-date.ts` (`lastCommitDate`, `formatReviewed`, `sources`) · `lib/image-variants.json` (generated) · `lib/subscribe.ts` (shared email-capture state, `OFFER_EVENT` so the bar hides while the popup is open) · `hooks/useWishlist.ts` (`ready`, `prune`) · `hooks/useDialog.ts` (Escape, focus trap, scroll lock, focus return; used by popup, bag drawer, mobile menu).

## Catalog API (`@crystal-basket/catalog`)

Product `leavingSoon` flag (rose tag, product-page note, home strip). Stone `image` (tumbled-stone photo). `loadCatalog()` · `getProducts/getStones/getIntentions/getStacks` · `getProduct/getStone/getIntention/getStack` · `productsForIntention(id, includeSecondary)` · `productsForStone` (in stock first) · `inStockFirst` · `stackForProduct` · `stonesForProduct` · `relatedProducts` (scored, backfilled, sold-out pieces last) · `stackSubtotal` · `formatAED` · `BEAD_MM` (8) · schemas + types. Client components import the fs-free subpaths `@crystal-basket/catalog/money` and `/schemas`.

## Static assets

`apps/web/public/images/{hero,intentions,products/<slug>,stacks,stones,about}` (stones: 16 tumbled-stone photos on white, generated 2026-09-23 as four 2×2 grids in Nano Banana Pro and cut by a one-off script; `docs/photos/real-stock-2026-09-23/` holds Alya's phone photos of real stock) · `favicon.svg`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (all from `scripts/logo-badge.py` + PIL) · `brand/logo-badge{,-dark}.svg`, `brand/logo-mark.svg`.

## Scripts

`scripts/shopify-csv.py` (catalog → `docs/shopify/products.csv`: Wrist-size-only variants with hashed image URLs, plus the `custom-bracelet` product with 18 variants for the builder; keep `CUSTOM` in step with `site.custom`) · `scripts/logo-badge.py` (badge geometry → component data + static SVGs; needs `pip install fonttools`) · `scripts/check-tokens.sh` (rule 3 gate, runs in CI and `make check`). · `scripts/install-lifestyle.py <slug> <image>` (fits an on-wrist photo to 900×1200 and sets it as the product's second image) · `scripts/responsive-images.py` (every JPEG under `public/images` → `<stem>-<w>.webp` at 480/800/1200/1600/2000 px plus `lib/image-variants.json`; rerun after adding photos). · `scripts/higgsfield-kit.py` (one paste-ready Higgsfield promo prompt plus numbered reference photos → `~/Desktop/crystal-basket-higgsfield` and `docs/marketing/higgsfield-promo.md`).

## Workflows

`ci.yml`: catalog tests → typecheck → build, on push/PR. `deploy.yml`: full-history checkout (git dates), build at root path for crystalbasket.store (`public/CNAME`), Shopify domain/token from repo vars → GitHub Pages, on push to `main`; then an `indexnow` job pings IndexNow with every sitemap URL (key file `public/111d836f4189ab2274f0b929c3e43b99.txt`).

## SEO

Audit (claude-seo v2.3.1, 2026-09-15) and the fixes shipped from it: `docs/seo/crystalbasket.store-audit/` (`FULL-AUDIT-REPORT.md`, `ACTION-PLAN.md`, `findings/`). Catalog SEO fields: product `seoTitle` (20–50) / `seoDescription` (90–155); intention `seoDescription`, `definition`, `wrist`, `stones`, `faq`; stone `mineral`, `mohs`, `foundIn`, `wornFor`, `wrist`, `wristWhy`, `waterNote`, `pairsWith`. Tests enforce unique product titles/descriptions, passage lengths and a banned medical-claims pattern.
