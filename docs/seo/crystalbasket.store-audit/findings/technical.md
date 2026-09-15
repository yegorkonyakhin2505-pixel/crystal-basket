# Technical SEO — crystalbasket.store

**Audit date:** 2026-09-15 (re-verified live after the same-day deploy) · **Scope:** 46 sitemap URLs (all fetched) + live header/redirect/robots/sitemap/404/schema checks · **Host:** GitHub Pages (Fastly edge, `x-github-edge-region: uaenorth`), custom domain, DNS on Cloudflare (DNS-only, so GitHub's Let's Encrypt cert keeps auto-renewing)
**Sources:** `raw/pages/*.html`, `raw/parsed/*.json`, `raw/sitemap.json`, `raw/home-render.json` (pre-deploy snapshot) cross-checked against fresh `curl`/HTML fetches of `/`, `/shop/`, `/stones/`, `/intentions/`, `/stacks/`, `/products/the-alchemist/`, `/stones/amethyst/`, `/intentions/protection/`, `/wishlist/`, `/robots.txt`, `/llms.txt`, `/sitemap.xml`, the 404 page, image assets and JS/CSS chunks. PSI/CrUX unavailable (rate-limited, no key), so Core Web Vitals are source-inspection estimates only.
**Note on the snapshot:** the pre-fetch was taken before a deploy at ~11:35 UTC today that added `Organization`(`OnlineStore`)/`WebSite` JSON-LD site-wide, `BreadcrumbList`+`ItemList` on several templates, `OfferShippingDetails`/`hasMerchantReturnPolicy` on Product schema, an explicit AI-crawler group in `robots.txt`, and `/llms.txt`. All structured-data and robots.txt findings below are from the **live** re-fetch, not the snapshot. Every image-weight, JS-weight, redirect, and content-length number below was independently re-verified live today and is unchanged from the snapshot.

## Technical Score: 76/100

| Category | Status | Score | One-line verdict |
|---|---|---|---|
| Crawlability | pass | 90 | robots.txt valid with a deliberate AI-crawler group, sitemap valid (46/46), every page ≤2 clicks from home, no orphans |
| Indexability | warn | 78 | Self-canonicals on all 46 pages, zero duplicate titles/descriptions; 24 stone/intention pages are thin (67–121 words) |
| Security | warn | 70 | HTTPS enforced, single-hop 301s, valid Let's Encrypt cert; **no** HSTS/CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy (GitHub Pages cannot set them) |
| URL Structure | pass | 92 | Clean, hyphenated, trailing-slash consistent; non-slash → slash 301 in one hop |
| Mobile | warn | 75 | Viewport OK, 16px base font, `text-size-adjust:100%`; client-rendered welcome popup fires on every visit; desktop nav links ~36px tall |
| Core Web Vitals (est.) | warn | 62 | LCP hero is a 556 KB 2000×1125 JPEG with no `srcset`/WebP; 4.5 MB of images on the home page; no `width`/`height` on any of 189 `<img>` tags (CLS covered by CSS aspect-ratio wrappers) |
| Structured Data | pass | 87 | `Organization`(`OnlineStore`)+`WebSite` now on all 46 pages; `Product` (with shipping + returns) on all 12 PDPs; `BreadcrumbList`+`ItemList` on `/shop/` and all 8 intention-detail pages, `BreadcrumbList` on all 16 stone-detail pages; gap: `/stones/`, `/intentions/`, `/stacks/` index pages get neither |
| JS Rendering | pass | 95 | True static export (SSG): `is_spa: false`, all copy, JSON-LD, canonicals and prices in raw HTML |
| IndexNow | fail | 0 | Not implemented (no key file, no submission step anywhere in the repo); Bing/Yandex rely on crawl only |

Weighting: Crawlability 15 · Indexability 15 · CWV 15 · Security 10 · URL 10 · Mobile 10 · Structured Data 10 · JS 10 · IndexNow 5.

**What is already right (do not touch):** every one of the 46 URLs has a self-referencing canonical that exactly matches its sitemap `<loc>`; no page carries a blocking `meta robots`; there are no duplicate titles or descriptions; the sitemap is declared in robots.txt, returns 200 and validates as a `urlset`; `http://`, `http://www`, `https://www` all 301 in one hop to `https://crystalbasket.store/`; the 404 page returns a real HTTP 404 with `<meta name="robots" content="noindex">`; fonts are self-hosted, preloaded and `font-display: swap`; there are zero third-party scripts; the site is a genuine static export, not a client-rendered shell. **New since the last pass:** `Organization`/`WebSite` JSON-LD is live on every page; `Product` JSON-LD now includes `offers.shippingDetails` and `offers.hasMerchantReturnPolicy` (previously missing, needed for Merchant-listing rich results); `robots.txt` now names 16 AI-crawler user-agents explicitly instead of relying only on the wildcard group; `/llms.txt` exists, is generated from the same catalog data as the site (prices and "currently sold out" flags match live stock), so it can't drift out of sync the way a hand-written file would.

---

## Critical (fix immediately)

None. Nothing on the site blocks crawling or indexing.

---

## High (fix within 1 week)

### H1. Hero LCP image is a 556 KB, 2000×1125 JPEG served to every device, no responsive variants, no modern format
- **Evidence:** `https://crystalbasket.store/` — `<img src="/images/hero/hero-1.jpg" alt="" fetchPriority="high">`. Live `Content-Length: 556528`, `image/jpeg`, pixel size 2000×1125 (confirmed via `file` on the downloaded bytes). Zero `srcset=`, zero `<picture>` across all 46 pages. `/shop/` hero `hero-2.jpg` is 280,205 bytes. All site images are `.jpg`; none are WebP/AVIF.
- **Why it matters:** This is the LCP element on the home page. 556 KB over a mobile connection is ~1.5–2 s of download alone, before render. Static export means no on-the-fly image resizing.
- **Fix:** Generate width variants at build time (e.g. a `sharp` script in `scripts/`: 640/1024/1600/2000 px, WebP + JPEG fallback, quality ~75) into `apps/web/public/images/**`, then render `<picture>` with `<source type="image/webp" srcset="…">`. Target: hero ≤120 KB on mobile, ≤250 KB on desktop. Same pipeline fixes H2.

### H2. Home page references 4.5 MB of images; intention tiles are 210–370 KB each
- **Evidence:** Sum of live `Content-Length` for the 18 unique `<img>` sources on `/`: **4,525,489 bytes** (re-verified today, byte-for-byte identical to the snapshot). Worst offenders: `intentions/protection.jpg` 370,305 B, `intentions/love.jpg` 329,304 B, `intentions/abundance.jpg` 318,182 B, `intentions/grounding.jpg` 311,094 B, `about/studio.jpg` 309,380 B — all rendered inside `aspect-[3/4]` cards that display at roughly 300 px wide on desktop and 180 px on mobile.
- **Mitigation already in place:** most of these carry `loading="lazy"`, so it's deferred, but each tile still pulls 3–4× the pixels it displays, and image-search crawlers fetch all of them regardless of lazy-loading.
- **Fix:** Same build-time resize pipeline as H1. A 600 px-wide WebP variant (~40–60 KB) per tile would cut home-page image weight from 4.5 MB to well under 1 MB.

### H3. Four below-the-fold product images are `<link rel="preload">`ed, competing with the hero for bandwidth
- **Evidence:** `/` `<head>` preloads `hero-1.jpg` (fetchPriority high) **and** `the-alchemist/main.jpg` (143,210 B), `the-devotion/main.jpg` (101,369 B), `the-shield/main.jpg` (114,758 B), `the-aurora/main.jpg` (154,134 B) — matching `<img loading="eager">` tags in the featured-products grid. Same pattern on `/shop/`. ~513 KB of eager, non-LCP images start downloading at the same time as the LCP hero, even though "The ones that leave first" is at least two screens below the fold on a phone. Two of the four (`the-devotion`, `the-aurora`) are currently sold out per `/llms.txt`.
- **Fix:** In the featured-products component, drop the `priority`/`loading="eager"` prop that emits the preload for the featured grid; keep it only on the actual hero image. Let the grid use `loading="lazy"` like every other card.

### H4. Every page ships ~90–100 KB of inline React Server Component payload, making a 300-word home page a 245 KB HTML document
- **Evidence:** `/` raw HTML is 245,245 bytes live today (245 KB total incl. gzip-negotiated transfer per response headers), of which the `self.__next_f.push(...)` inline script blocks carry roughly 96 KB of duplicated nav/footer/product data, while visible text is 303 words. Even `/disclaimer/` (131 words) ships a comparably bloated document. The 404 page is 199 KB.
- **Why it matters:** Not an indexing blocker (far under Googlebot's 2 MB cap), but it raises time-to-first-paint on mobile, and every crawl fetches ~90 KB compressed for 1–2 KB of unique text.
- **Fix:** Pass client components (`FilterBar`, `StackBuilder`, `BuyBox`, `CartDrawer`) only the fields they render (slug, name, price, image, tags) instead of full catalog objects. Check with `ANALYZE=true pnpm build` or by diffing `__next_f` block size after each change. Realistic target: <120 KB raw per page.

---

## Medium (fix within 1 month)

### M1. 24 stone and intention pages are thin (67–121 words) on near-identical templates
- **Evidence (word_count):** `/stones/smoky-quartz/` 81, `/stones/black-obsidian/` 82, `/stones/pyrite/` 83 … max `/stones/lapis-lazuli/` 102. Intentions: `/intentions/love/` 97 … max `/intentions/protection/` 121. `/intentions/` hub is 67 words. By contrast product pages are 655–830 words.
- **Why it matters:** Stone-meaning queries ("amethyst bracelet meaning") are exactly the informational intent these pages target, and 80–120 words won't compete with 800–1500-word pages. Google may bucket these as "crawled, currently not indexed."
- **Fix:** Extend `packages/catalog` with optional long-form fields for stones (history, chakra/zodiac detail, care notes, 2–3 FAQs) and intentions (which stones and why, stacking suggestions). Target 400+ words each.

### M2. `/wishlist/` is `Disallow`ed in robots.txt but linked from every page and has no `noindex`
- **Evidence:** live `robots.txt`: `Disallow: /wishlist/`. Live `/wishlist/` returns 200 with a self-referencing canonical and no `meta robots` tag. It is linked from every one of the 46 crawled pages (46 inbound internal links, confirmed by link-graph analysis of `parsed/*.json`).
- **Why it matters:** `Disallow` prevents crawling, not indexing. With 46 internal links pointing at it, Google can still index the bare URL with a "No information is available for this page" snippet. It's an empty, client-only localStorage page — a bad thing to show in search results.
- **Fix:** Remove `Disallow: /wishlist/` and instead set `robots: { index: false, follow: true }` in the wishlist page's metadata, so Google can crawl it, read the `noindex`, and drop it cleanly (or drop any existing index entry).

### M3. Structured data is rolled out inconsistently across the three collection index pages
- **Evidence (live, today):** `/shop/` carries `OnlineStore`, `WebSite`, `BreadcrumbList` **and** `ItemList` (`numberOfItems: 12`). Every intention-detail page (e.g. `/intentions/protection/`) carries all four too (`ItemList` scoped to that intention's bracelets). Every stone-detail page (e.g. `/stones/amethyst/`) carries `OnlineStore`, `WebSite`, `BreadcrumbList` (no `ItemList` needed — it's a single-stone page, not a list). But **`/stones/`, `/intentions/`, and `/stacks/` — the three top-level collection/listing pages — carry only `OnlineStore`+`WebSite`**, with no `BreadcrumbList` and no `ItemList`, even though they list 16, 8 and 3 items respectively.
- **Why it matters:** These three pages are exactly the kind of listing page `ItemList` is meant for, and they're one nav-click from home — a natural breadcrumb target too. The inconsistency looks like the schema helper was applied per-template rather than per-page-type and missed these three.
- **Fix:** Apply the same `ItemList`(+`BreadcrumbList`) builder already used on `/shop/` to `/stones/`, `/intentions/`, and `/stacks/`, listing their respective stones/intentions/stacks.

### M4. Product schema's `image` field is a single string even though a `lifestyle.jpg` exists for every product
- **Evidence:** live Product JSON-LD for `/products/the-alchemist/`: `"image":"https://crystalbasket.store/images/products/the-alchemist/main.jpg"` (string, not array). `https://crystalbasket.store/images/products/the-alchemist/lifestyle.jpg` returns 200 and is not referenced in the schema.
- **Why it matters:** Google's Product structured-data guidelines recommend multiple images where available; Merchant Center listings and Shopping surfaces use extra images when present.
- **Fix:** Change `image` to an array `[main, lifestyle]` in the schema builder. (`FAQPage` on `/faq/` is valid but Google restricted FAQ rich results to government/health sites in Aug 2023 — the markup is harmless, just don't expect a rich result from it.)

### M5. robots.txt names 16 AI crawlers individually but treats all of them the same as the default group — worth a deliberate decision, plus one cosmetic error
- **Evidence:** live `robots.txt` adds a second group for `GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Applebot-Extended, Bingbot, CCBot, DuckAssistBot, Amazonbot, meta-externalagent`, each with the same `Allow: / / Disallow: /wishlist/` as the wildcard group. Net effect: **identical to not having the group at all**, since it doesn't restrict anything the default `User-Agent: *` doesn't already allow.
- **Why it matters, if it matters:** This list mixes pure search-answer crawlers (`OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Perplexity-User`, `Bingbot`, `DuckAssistBot`) — which is what you want for AI-search citations — with pure model-training crawlers (`GPTBot`, `Google-Extended`, `CCBot`, `anthropic-ai`, `Applebot-Extended`, `meta-externalagent`). Allowing both is a legitimate choice (more AI visibility, product copy used for training too) but it should be a choice, not a byproduct of copy-pasting a common block list. If the owner ever wants "cite us, don't train on us," this group is where that split would go.
- **Separately:** the trailing `Host: https://crystalbasket.store` line is a non-standard directive Yandex deprecated in 2018 and never respected by Google/Bing; its value also includes a URL scheme, which was never valid syntax even under the old spec (a bare hostname was expected). It's ignored by every current crawler, so it's cosmetic, not a real problem — safe to delete for clarity, no urgency.
- **Fix:** Confirm the AI-crawler allow list reflects an intentional decision (documented as such, e.g. in `NEEDED.md` or an ADR); optionally split training bots into their own group if the training question ever needs a different answer than the citation question. Drop the `Host:` line whenever `robots.txt` is next touched.

### M6. No security headers at all; GitHub Pages cannot set them, Cloudflare proxy can
- **Evidence:** live `curl -I https://crystalbasket.store/` returns `server: GitHub.com`, `cache-control: max-age=600`, `access-control-allow-origin: *`, and nothing else: no `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Honest impact:** HTTPS itself is the only page-experience signal Google weighs here, and it passes. These headers are hygiene/clickjacking/downgrade protection, not a ranking factor. **GitHub Pages has no mechanism to set custom response headers — there is no fix inside this repo.**
- **Fix (only if the DNS-only decision is revisited):** Proxying `crystalbasket.store`/`www` through Cloudflare (orange-cloud) would let Transform Rules add `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. But per the existing DNS setup, records are deliberately kept DNS-only so GitHub's own certificate keeps auto-renewing; proxying risks breaking that unless Cloudflare's edge cert and "Full (strict)" SSL mode are configured carefully first. This is a real trade-off, not a quick win — flagging it here for the record, not recommending flipping the proxy.

### M7. Hashed static assets are cached for only 10 minutes
- **Evidence:** every `/_next/static/**` chunk and every `/images/**` file: `cache-control: max-age=600` (confirmed live today). These files are content-hashed and effectively immutable.
- **Why it matters:** Repeat visits re-validate ~200 KB of JS/CSS plus every image every 10 minutes. Not a ranking factor, but it worsens LCP/INP on second and later page views.
- **Fix:** GitHub Pages can't change this natively. If Cloudflare proxying is ever adopted (see M6), add a Cache Rule for `/_next/static/*` and `/images/*` with a 1-year edge/browser TTL, plus enable Brotli and Polish (lossy + WebP) — that alone would deliver most of H1/H2 without touching the repo.

### M8. Welcome-offer popup renders on every visit after 3 s, which can read as an intrusive interstitial on mobile
- **Evidence:** commit `eddbbbb`: "welcome popup returns every visit (per-tab dismiss), 30-day hide after subscribing, 3s delay." The modal is client-rendered (not in the raw HTML), so Googlebot Smartphone (which executes JS) will see it fire on first visit to any page.
- **Why it matters:** Google's intrusive-interstitial guidance targets full-screen popups shown shortly after a user arrives from search, especially on mobile. A 3-second delay does not exempt it if it covers the main content.
- **Fix:** Either show it after meaningful engagement (second page view, 50% scroll, or exit intent) capped at once per 7 days, or convert it to a bottom sheet occupying ≤30% of viewport height on screens <768px. Keep the small `NewsletterBar` as-is; it's compliant.

### M9. No `width`/`height` on any of the 189 `<img>` tags
- **Evidence:** every image across `parsed/*.json` and today's live HTML lacks explicit `width`/`height`. CLS is currently prevented by CSS: cards use `aspect-[3/4]`/`aspect-square` wrappers and heroes sit in fixed-height sections (confirmed: `protection.jpg` sits inside `<div class="aspect-[3/4] overflow-hidden">`), so the practical risk today is low, limited to any future image dropped outside those wrappers.
- **Fix:** Pass intrinsic `width`/`height` through the shared image component as cheap insurance, alongside the H1/H2 resize work.

### M10. Product titles and descriptions exceed SERP display limits
- **Evidence (titles, chars, live-verified):** all 11 PDP titles are 63–81 characters (`the-guardian` 81, `the-clear-sight` 79, `the-lionheart` 78 …), pattern `The Guardian · Protection Bracelet · Black Tourmaline & Hematite · Crystal Basket`; Google's display cut-off is roughly 60 characters. **Descriptions:** all 11 PDPs are 183–251 characters against a ~155–160 character display limit (`the-guardian` 251, `the-lionheart` 250, `the-alchemist` 240). Four of the eight intention pages are also over: `intentions/abundance` 202, `intentions/protection` 200, `intentions/love` 193, `intentions/focus` 166. Everything else (home, shop, stones index, about, care, faq, disclaimer, size-guide, stacks) is within range.
- **Fix:** Shorten the PDP title template to `{Name} · {Intention} Bracelet | Crystal Basket` (~45–55 chars) and move the stone list into the visible H1/subtitle instead of the `<title>`. Write a dedicated ≤155-character `seoDescription` field per product/intention in the catalog JSON instead of reusing the longer marketing blurb.

---

## Low (backlog)

### L1. IndexNow not implemented
- **Evidence:** no key file at any checked path; no `indexnow` references anywhere in the repo (`route.ts`, workflows, scripts). Bing and Yandex discover changes only by crawling.
- **Fix:** Generate a 32-char key, publish it at `apps/web/public/<key>.txt`, and add a step to `.github/workflows/deploy.yml` that POSTs changed sitemap URLs to `https://api.indexnow.org/indexnow` after a successful deploy (the bundled `indexnow_submit.py` helper can do this). Optional but free and low-effort.

### L2. Sitemap `<lastmod>` is a single build timestamp on all 46 URLs, and `<priority>` is emitted
- **Evidence:** live `sitemap.xml` — every entry today carries `<lastmod>2026-09-15T11:34:42.908Z</lastmod>` (one identical value across all 46 URLs); `<priority>` ranges 1.0 (home) down to 0.3 (faq/disclaimer).
- **Why it matters:** Google only trusts `lastmod` when it's "consistently and verifiably accurate"; a value that changes for every URL on every deploy is ignored, and `priority` is ignored entirely. No penalty, just a lost signal.
- **Fix:** Derive `lastmod` per URL from `git log -1 --format=%cI -- <content json>` or an explicit `updatedAt` field in the catalog; drop `<priority>`.

### L3. `index.html`, `index.txt` and `?_rsc=` variants of every page are reachable
- **Evidence (live-verified today):** `/index.html` 200, `/shop/index.html` 200, `/shop/index.txt` 200 (`text/plain`, RSC payload), `/index.txt` 200. None are linked in HTML; the `.html` variants carry the correct canonical to the slash URL.
- **Why it matters:** Harmless today because of the self-canonicals, but `.txt` RSC payloads have no canonical and would be plain-text duplicates if ever crawled/discovered.
- **Fix:** Add `Disallow: /*.txt$` to `robots.txt` (leave `/sitemap.xml` and `/robots.txt` itself unaffected — confirm the pattern doesn't accidentally catch them). GitHub Pages can't redirect `index.html` → `/`; the canonical already handles that, leave it.

### L4. Hero and header images use `alt=""`; stack-builder thumbnails have empty alt
- **Evidence:** `/` `hero-1.jpg` `alt=""`; `/shop/` `hero-2.jpg` `alt=""`; all 8 intention header images `alt=""`; `/stacks/` `stacks-wrist.jpg` `alt=""` plus the 12 product thumbnails inside the stack builder. Product-page and grid images elsewhere are correctly described (e.g. "Protection bracelets", "The Alchemist — Abundance Bracelet · Citrine & Pyrite").
- **Fix:** Hero: `alt="Crystal bracelet on a wrist, Crystal Basket Dubai"` or the page's H1 text. Stack builder: `alt={product.name}`.

### L5. Desktop nav links are ~36px tall; product-page accordion rows use 14px text
- **Evidence (live class inspection):** nav link `<a class="text-[14px] tracking-wide py-2 …">` → roughly 20px line-height + 16px padding ≈ 36px, under the 48px touch-target guideline. `<summary class="… py-4 text-[14px] …">` rows on product accordions are ~52px tall (fine) but at 14px text. Buttons elsewhere use `h-11`/`h-13` (44–52px, fine). Mobile uses a hamburger menu, so the small nav links are desktop-only.
- **Fix:** `py-3` on nav links, or accept as desktop-only (mouse pointer, not a touch target there). Optional.

### L6. `og:locale` is `en_GB` for a UAE store
- **Evidence:** every page: `<meta property="og:locale" content="en_GB">`.
- **Fix:** `en_AE` in the metadata base, or leave as-is — harmless for Google, minor for Facebook/WhatsApp link previews. No `hreflang` is needed (single language, single region — confirmed `hreflang: []` is correct here, not a gap).

### L7. WhatsApp deep links point to a placeholder number
- **Evidence:** every page: `https://wa.me/971500000000?text=…` (live-confirmed unchanged). Not a crawl/index issue, but it's the primary conversion path and the number is a placeholder. Already tracked in `NEEDED.md`; recorded here so the audit is complete.

### L8. No analytics or Search Console verification visible in HTML
- **Evidence:** no `google-site-verification` meta tag, no GA4/GTM/Plausible/Clarity script on any page (zero third-party requests site-wide). Verification may exist via a DNS TXT record on Cloudflare, which this audit can't see from the HTML.
- **Fix:** Confirm the Search Console property exists (a Domain property via the Cloudflare DNS TXT record is the cleanest option) and that `/sitemap.xml` is submitted. Without it, none of the crawl/index behavior above can be measured from Google's side.

---

## Reference data

**Redirect matrix (all single-hop 301, re-verified live):**
| Request | Result |
|---|---|
| `http://crystalbasket.store/` | 301 → `https://crystalbasket.store/` |
| `http://www.crystalbasket.store/` | 301 → `https://crystalbasket.store/` |
| `https://www.crystalbasket.store/` | 301 → `https://crystalbasket.store/` |
| `https://crystalbasket.store/shop` | 301 → `/shop/` |
| `https://crystalbasket.store/products/` | 404 (no index page; not linked anywhere, fine) |
| `https://crystalbasket.store/this-does-not-exist-xyz` | 404, `<meta name="robots" content="noindex">`, 199 KB |

**robots.txt (live today):**
```
User-Agent: *
Allow: /
Disallow: /wishlist/

User-Agent: GPTBot
User-Agent: OAI-SearchBot
User-Agent: ChatGPT-User
User-Agent: ClaudeBot
User-Agent: Claude-SearchBot
User-Agent: anthropic-ai
User-Agent: PerplexityBot
User-Agent: Perplexity-User
User-Agent: Google-Extended
User-Agent: Applebot
User-Agent: Applebot-Extended
User-Agent: Bingbot
User-Agent: CCBot
User-Agent: DuckAssistBot
User-Agent: Amazonbot
User-Agent: meta-externalagent
Allow: /
Disallow: /wishlist/

Host: https://crystalbasket.store
Sitemap: https://crystalbasket.store/sitemap.xml
```
`sitemap_discovery.py` confirms `/sitemap.xml` is declared, resolves 200, and validates as a `urlset`; the three common fallback sitemap paths correctly 404 (no phantom sitemaps).

**Structured data by template (live today):**
| Template | Organization+WebSite | BreadcrumbList | ItemList | Product |
|---|---|---|---|---|
| `/` (home) | yes | — | — | — |
| `/shop/` | yes | yes | yes (12 items) | — |
| `/stones/` (index) | yes | **no** | **no** | — |
| `/stones/{slug}/` (16 pages) | yes | yes | — | — |
| `/intentions/` (index) | yes | **no** | **no** | — |
| `/intentions/{slug}/` (8 pages) | yes | yes | yes (per-intention) | — |
| `/stacks/` | yes | **no** | **no** | — |
| `/products/{slug}/` (11 pages) | yes | yes | — | yes, with `shippingDetails`+`hasMerchantReturnPolicy` |
| `/faq/` | yes | — | — | (`FAQPage`, rich-result eligibility restricted by Google since Aug 2023) |

**Link graph:** 46/46 sitemap URLs reachable from `/`; depth 0: 1 page, depth 1: 37 pages, depth 2: 8 pages; zero orphans; only non-sitemap internal target is `/wishlist/` (46 inbound links, deliberately excluded from the sitemap).

**Page weight (home, live today):** HTML 245,245 bytes uncompressed · CSS one file, 54,149 bytes uncompressed · JS 11 chunks, ~208 KB decompressed total, all `async` except one `noModule` polyfill chunk · fonts: 3 self-hosted woff2 preloaded (`Cormorant Garamond` normal 400, `Jost` normal 300, `Cormorant Garamond` **italic** 400 — worth confirming the italic weight is actually used above the fold before spending a preload slot on it) · images 4,525,489 bytes (≈1.07 MB of that is eager/preloaded: hero + 4 product cards).

**TLS:** GitHub-managed Let's Encrypt certificate on the apex domain; HTTPS enforced with a 301 from HTTP; DNS is deliberately DNS-only on Cloudflare so this renewal keeps working.

**Things GitHub Pages cannot do, so don't spend time on them in this repo:** custom response headers (HSTS/CSP/etc.), configurable cache-control TTLs, Brotli compression, server-side redirects beyond the built-in slash/`www`/`http` handling, on-the-fly image resizing. All four become available by proxying through Cloudflare (see M6/M7), which is a deliberate trade-off against the current DNS-only cert-renewal setup, not a quick win.
