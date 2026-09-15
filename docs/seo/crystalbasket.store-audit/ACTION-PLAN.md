# crystalbasket.store — SEO Action Plan

_From the 2026-09-15 audit. ✅ shipped 2026-09-15 · ⏳ needs the owner · 🔧 Claude can do once unblocked · 🤔 decision_

## Critical

| # | Action | Status |
|---|---|---|
| C1 | Stop sending shoppers to the placeholder WhatsApp number | ✅ hidden behind `flags.whatsapp`, email fallback |
| C2 | Provide the real WhatsApp number, then flip `flags.whatsapp` | ⏳ owner (N01) → 🔧 |

## High

| # | Action | Status |
|---|---|---|
| H1 | Delivery, returns, contact and privacy pages | ✅ |
| H2 | Show the 25 AED delivery fee on product pages and in the cart | ✅ |
| H3 | Expand stone pages into "X bracelet meaning" guides | ✅ |
| H4 | Expand intention pages with a definition, stone table and FAQs | ✅ |
| H5 | Product-specific FAQs instead of the repeated block | ✅ |
| H6 | Responsive WebP hero and catalog images | ✅ |
| H7 | Stop the mega-menu prefetch storm | ✅ |
| H8 | Organization, WebSite, BreadcrumbList, shipping and return policy schema | ✅ |
| H9 | Verify Google Search Console and Bing Webmaster Tools, submit the sitemap | ⏳ (N17), 10 minutes with Cloudflare access |
| H10 | Name the founder with a real photo on the about page | ⏳ owner (N19) → 🔧 |
| H11 | Place one real card order end to end, then refund it | ⏳ Yegor |

## Medium

| # | Action | Status |
|---|---|---|
| M1 | Descriptive titles, H1s and ≤ 155-character descriptions | ✅ |
| M2 | `OutOfStock` for sold-out pieces, image arrays in Product schema | ✅ |
| M3 | CollectionPage on shop, intentions and stacks; stone WebPage | ✅ |
| M4 | Wishlist `noindex` instead of robots `Disallow` | ✅ |
| M5 | Intrinsic image dimensions, no below-the-fold preloads | ✅ |
| M6 | Consistent "traditionally worn for" copy, health-adjacent phrases removed, test gate | ✅ |
| M7 | Mobile product page shows price and buy box right after the photo | ✅ |
| M8 | Mobile horizontal scroll and popup plus bar clash | ✅ |
| M9 | Shopify stock storefront: `noindex`, path-preserving redirect | ⏳ (N18), theme.liquid edit |
| M10 | Real reviews, then `AggregateRating` | ⏳ owner (N03) → 🔧 |
| M11 | Welcome popup frequency on mobile | 🤔 owner |
| M12 | Free-delivery threshold versus the stack discount | 🤔 owner |
| M13 | Security headers and long cache on hashed assets | 🤔 needs Cloudflare proxy or a host change |

## Low

| # | Action | Status |
|---|---|---|
| L1 | IndexNow key and post-deploy ping | ✅ |
| L2 | Git-based sitemap `lastmod`, no `priority` | ✅ |
| L3 | Keep RSC `index.txt` files out of the index | ✅ robots |
| L4 | Descriptive `alt` on hero and stack-builder thumbnails | ✅ |
| L5 | "Last reviewed" dates on guide pages | ✅ |
| L6 | Terms of sale page | ⏳ (N20) |
| L7 | Size XL for wrists above 18.5 cm | 🤔 owner |
| L8 | Per-stack pages and bundle products in Shopify | 🔧 backlog |
| L9 | Replace AI placeholder photos (removes the need for IPTC AI labels) | ⏳ owner (N05) |

## Monitoring

1. Four to six weeks after Search Console verification, check impressions for "crystal bracelets Dubai", "protection bracelet", "amethyst bracelet meaning" and the FAQ questions.
2. Re-run `/seo audit https://crystalbasket.store` after the owner items land and compare with the 60 baseline.
3. Watch Core Web Vitals field data in Search Console once there is enough traffic.
