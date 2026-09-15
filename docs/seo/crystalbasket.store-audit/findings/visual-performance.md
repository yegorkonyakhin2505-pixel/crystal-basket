# Visual & Performance Review — crystalbasket.store

**Audit date:** 2026-09-15 · **Pages:** `/`, `/shop/`, `/products/the-alchemist/`, `/stones/amethyst/` · **Method:** live Playwright rendering (desktop 1920×1080, mobile 375×812 @2x DPR) + `curl` header/byte checks against the live site (PageSpeed Insights API is rate-limited without a key, so all metrics below are direct browser measurements, not Lighthouse/CrUX). `lcp_subparts.py` (CrUX) returned no data — no API key configured, so field p75 LCP/INP/CLS could not be pulled; every number below is a lab measurement from a single run.

## Scores

| | Score | Basis |
|---|---|---|
| **Performance** | **65 / 100** | Fast TTFB and clean code-splitting are undercut by an oversized, non-responsive LCP hero image and ~2.3 MB of silently-prefetched RSC payloads on desktop |
| **Visual / UX** | **62 / 100** | Design is on-brand and clean, but the mobile product page hides price/CTA below the fold, the stone page leans on a placeholder gradient blob, a real horizontal-scroll bug exists on the mobile home page, and the popup+bar combo double-asks for email |

---

## Screenshots captured

- `screenshots/home/desktop.png`, `screenshots/home/mobile.png` — first-load state (popup already visible; see below)
- `screenshots/home/mobile-popup-at-4.5s.png` — mobile, 4.5 s after `networkidle`, showing the welcome popup + bottom bar stacked
- `screenshots/shop/desktop.png`, `screenshots/shop/mobile.png`
- `screenshots/products-the-alchemist/desktop.png`, `screenshots/products-the-alchemist/mobile.png`
- `screenshots/stones-amethyst/desktop.png`, `screenshots/stones-amethyst/mobile.png`

(All paths relative to `/Users/yegor/crystal basket/docs/seo/crystalbasket.store-audit/`.)

---

## Ranked findings

### 1. [High — Performance] LCP hero image is oversized, single-size, and not a modern format
**Evidence:** `/` — `<img src="/images/hero/hero-1.jpg" fetchPriority="high">`, correctly `<link rel=preload as=image>`'d in `<head>`. Live `curl -sI`: `Content-Length: 556528` (544 KB), `Content-Type: image/jpeg`. Downloaded and measured: **2000×1125 px**, JPEG only — no `srcset`, no `<picture>`, no WebP/AVIF. This exact same 2000 px-wide file is served to the 375 px-wide mobile viewport (device-scale-factor 2 → 750 physical px needed, 2.7× more pixels shipped than used). A `PerformanceObserver` confirmed this `<img>` **is** the LCP element on both viewports (LCP `startTime` 316 ms desktop / 424 ms mobile in an unthrottled lab run — on a throttled 4G connection this 544 KB is the dominant contributor to LCP).
**Fix:** Generate WebP/AVIF + a width ladder (640/960/1400/2000) at build time and serve via `<picture>`/`srcset`+`sizes`. Target ≤120 KB delivered on mobile. Same treatment for the 4 preloaded product teaser images (101–154 KB each) and the 8 intention tiles (212–370 KB each, `loading=lazy` so they don't gate LCP but still cost real mobile data once scrolled to).

### 2. [High — Performance] ~2.3 MB of background RSC prefetch requests fire on desktop that the visitor never asked for
**Evidence:** Instrumented `page.on('response')` for a full home-page load (desktop viewport). Beyond the 66 "normal" requests, **30 additional `GET …/index.txt?_rsc=…` requests** fired automatically post-load — one per stone (16), one per intention (8), plus `/shop/`, `/stacks/`, `/about/`, `/wishlist/`, totaling **2,333,179 bytes**. These are Next.js App Router `<Link>` prefetches: the desktop "By stone" / "By intention" mega-menus stay mounted in the DOM (just `opacity-0 invisible`) so every link inside them is still "in viewport" and gets prefetched at idle. On mobile the same menus collapse into a hamburger and are not in the layout tree the same way, so mobile only fired 5 such requests (398 KB) — this is overwhelmingly a **desktop** cost.
**Fix:** Set `prefetch={false}` on the mega-menu `<Link>`s (Next.js only needs `prefetch="viewport"`/default on primary nav items a visitor is likely to click next), or wrap the hidden menu content so it isn't rendered until the trigger is hovered/focused. This has no user-visible effect and removes ~2.3 MB of unnecessary transfer per desktop session.

### 3. [High — Visual/UX] Mobile PDP hides price and the buy CTA below the fold
**Evidence:** `screenshots/products-the-alchemist/mobile.png` — the entire 812 px-tall first viewport is consumed by the sticky bars, breadcrumb, and the square product photo. Price ("105 AED"), wrist-size selector, "Add to bag" and "Order on WhatsApp" — the only conversion actions on the page — are all below the fold. Desktop (`products-the-alchemist/desktop.png`) shows all of this comfortably above the fold in the right column, so it's a mobile-only regression.
**Fix:** Either cap the image height on mobile (e.g. `max-h-[55vh]` instead of full-width square) or move a condensed price/CTA sliver into view (a small sticky "105 AED · Add to bag" bar is the common pattern) so first-viewport mobile visitors see it's buyable without scrolling.

### 4. [Medium — Visual/UX] Mobile home page has a real horizontal-scroll bug
**Evidence:** Measured in-browser: `document.documentElement.scrollWidth = 401` vs `clientWidth = 375` on the mobile home page (26 px of horizontal overflow — `home_mobile.horizontal_scroll = true`; desktop and both other pages measured `false`). Walking the DOM for elements whose `getBoundingClientRect()` exceeds the viewport isolated the offender: a `div.aspect-[3/4] lg:aspect-[4/5] overflow-hidden.reveal` card (and its children) sitting at `left:16, right:401, width:385` — i.e. a card/teaser block that is wider than the 375 px viewport minus its own left inset, with no `overflow-x-hidden` on an ancestor to contain it. The whole page becomes side-scrollable by ~26 px, which is a classic "peeking carousel card" mobile bug.
**Fix:** Add `overflow-x-hidden` on the section wrapping this card grid, or clamp the card's width to `calc(100vw - 2rem)` / use a proper `overflow-x-auto` scroll-snap container instead of letting the card bleed past the body.

### 5. [Medium — Visual/UX] Welcome popup + bottom newsletter bar double-ask for the same thing, and the popup borders on an intrusive interstitial on mobile
**Evidence:** `screenshots/home/desktop.png` shows the popup already open (fired inside the first ~1 s post-`networkidle` in this run); `screenshots/home/mobile-popup-at-4.5s.png` shows it firing later on mobile (~4.5 s). In both cases the popup ("10% off your first bracelet") sits **on top of** the bottom bar ("We'd love to stay in touch. Join for 10% off your first bracelet.") — the exact same offer, asked twice, simultaneously visible. On mobile the popup covers essentially the full viewport below the header (dimmed backdrop, only the close-X and header peeking out), which is the shape of what Google's mobile popup-interstitial guidance targets: a screen-covering promo that appears during the visit and blocks the main content, even though it is time-delayed rather than immediate and is easily dismissible (visible "×" and "No thanks, full price is fine" link, which does count in the site's favor and likely keeps it out of the worst "interstitial" bucket, but the full-bleed mobile layout is still a risk if it fires for visitors arriving from search).
**Fix:** Suppress the bottom bar while the popup is open (or vice versa) so the same offer isn't shown twice at once; on mobile consider shrinking the popup so the page content is visibly present behind it (partial-height sheet rather than near-full-screen), and confirm (per the module's own per-tab/30-day logic) that it does not re-fire for the same visitor who already dismissed it within the session.

### 6. [Low — Visual/UX] Stone detail page leans on a placeholder gradient circle, not a photo
**Evidence:** `screenshots/stones-amethyst/mobile.png` and `desktop.png` — the "stone" visual is not an image at all; it's a pure-CSS `div.aspect-square.rounded-full` with an inline `radial-gradient` (confirmed in the raw HTML — zero image bytes, so no performance cost, but on mobile this gradient ball is ~full viewport width and pushes the actually useful content (Worn for / Chakra / Zodiac table) further down). It reads as an unfinished placeholder rather than a real crystal photo, on a page whose whole job is to sell the tactile/visual appeal of the stone.
**Fix:** Not a performance issue (zero bytes) but a content/design gap — swap in real stone macro photography per the project's stated image pipeline once available (`NEEDED.md`), and/or shrink the placeholder's mobile footprint so the spec table is visible sooner.

### 7. [Low — Performance] Body font-size is 15px, one pixel under the 16px mobile-readability guideline
**Evidence:** `getComputedStyle(document.body).fontSize` measured **15px** on every page/viewport tested (home, shop, product, stone — both mobile and desktop). `agent_ux_check.py` independently flagged this the same way (`"base_size": 15, "readable": false`). Visually the type reads fine in the screenshots because of the display serif's large x-height, but it's technically under Google's 16px baseline recommendation that avoids mobile-Safari auto-zoom-on-focus and improves legibility for the site's likely older/female Dubai audience.
**Fix:** Bump the base body/paragraph size token to 16px; low effort, no layout risk since spacing is mostly `rem`-based.

### 8. [Informational — Performance] What's already right
- TTFB is excellent: 96–121 ms measured via `curl -w` (GitHub Pages + Fastly edge, `x-github-edge-region: uaenorth`) — not a bottleneck for any metric.
- Fonts are self-hosted via `next/font`, preloaded, `font-display: swap`, and every `@font-face` carries a `size-adjust` fallback-metric override — this is the correct pattern to avoid font-swap layout shift; no CLS risk found from web fonts.
- All sampled images sit inside Tailwind `aspect-square`/fixed-height wrapper `div`s (hero: `h-[72vh] min-h-[520px] max-h-[820px]`; product cards: `aspect-square`), so even though no `<img>` carries `width`/`height` attributes, space is reserved by CSS before the image loads — no CLS was observed from images in this run.
- JS is well code-split: the route-specific chunk for the home page is 6 KB (2.6 KB gzipped) and for the product page ~similar; the big shared chunks (`polyfills`, two ~173 KB vendor chunks) are cached across all pages via `max-age=600` + immutable-style hashed filenames.
- Gzip is active at the CDN (verified with `curl --compressed`): the full JS+CSS payload for the home page is ~674 KB uncompressed but only **~218 KB over the wire** (208 KB JS + 9.5 KB CSS gzipped).

---

## Raw numbers (for reference)

**Home page, first load, unthrottled lab run:**

| Viewport | Total requests | Total bytes | JS | CSS | Fonts | Images | Other (RSC prefetch) |
|---|---|---|---|---|---|---|---|
| Mobile | 37 | 4.98 MB | 548 KB | 54 KB | 104 KB | 3.63 MB | 398 KB (5 req) |
| Desktop | 66 | 7.51 MB | 555 KB | 54 KB | 104 KB | 4.22 MB | 2.33 MB (30 req) |

**Product page (`/products/the-alchemist/`), first load:**

| Viewport | Total requests | Total bytes | JS | CSS | Fonts | Images | Other (RSC prefetch) |
|---|---|---|---|---|---|---|---|
| Mobile | 30 | 2.14 MB | 646 KB | 54 KB | 104 KB | 744 KB | 335 KB (4 req) |
| Desktop | 60 | 4.31 MB | 653 KB | 54 KB | 104 KB | 744 KB | 2.50 MB (32 req) |

(HTML document itself: 245–256 KB uncompressed on the wire per page — large for markup alone, driven by inline Next.js flight/JSON-LD data; not re-litigated here since `technical.md` already covers structured-data payload weight.)

**Confirmed LCP element per `PerformanceObserver` (`largest-contentful-paint`, buffered):**
- Home, mobile: `hero-1.jpg`, LCP `startTime` 424 ms
- Home, desktop: `hero-1.jpg`, LCP `startTime` 316 ms
- Product, mobile: `the-alchemist/main.jpg`, LCP `startTime` 772 ms
- Product, desktop: `the-alchemist/main.jpg`, LCP `startTime` 240 ms

These are same-network lab numbers (no throttling), so treat them as a floor, not a real-world estimate — on a throttled/mobile-data connection the 544 KB hero and 143 KB product photo (finding #1) would push these materially higher, which is the reasoning behind the Performance score.

**Mobile above-the-fold stack (measured, home page):** black announcement bar (~44 px) → white header with hamburger/logo/search/wishlist/bag (~120 px) → hero photo starts around ~180 px. No layout shift was observed between these on load (all fixed-height). The bottom newsletter bar is present from first paint (not late-mounting) and reserves its own space, so it does not itself cause CLS — its main cost is the vertical real estate it permanently removes from an already-short mobile viewport, compounded by the popup covering the rest (finding #5).
