# GEO audit — crystalbasket.store

Generative Engine Optimization (AI Overviews / AI Mode, ChatGPT search, Perplexity, Bing Copilot).
Audited 2026-09-15 against the 46 URLs in `raw/urls.txt`, the pre-fetched HTML in `raw/pages/`, `raw/home-render.json`, and a live fetch of `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`.

Framing note: Google's AI optimization guide says optimizing for AI search "is still SEO". Everything below is ordinary on-page work aimed at the passages AI engines quote. `llms.txt` is included because the task asked for it, but it carries no weight for Google and is unproven for the others (see finding 9).

---

## Citability score: **51 / 100**

| Dimension | Weight | Score | Why |
|---|---|---|---|
| Citability (quotable passages) | 25% | 45 | Every stone and product page opens with a clean one-sentence definition ("Citrine is worn for prosperity, warmth and a bright, optimistic outlook"), which is exactly the pattern engines quote. But no page contains a self-contained 40–80-word answer to the questions people actually ask; FAQ answers are 20–35 words; stone pages are 81–104 words total. |
| Structural readability | 20% | 45 | Product pages are well sectioned. Elsewhere, H1s are taglines ("A monthly ritual, five minutes long."), there are no question headings anywhere (FAQ questions are `<summary>` text, not headings), and only one `<table>` exists on the whole site (size guide). |
| Multi-modal | 15% | 50 | Product pages carry 6 images with descriptive alt text. Stone pages show no photo of the stone itself, only product cards. No video. |
| Authority & brand signals | 20% | 35 | Brand name is perfectly consistent (986 mentions of "Crystal Basket", "Dubai" on every page, Instagram and hello@ in every footer). Undermined by a placeholder WhatsApp number on every page (110 links to `wa.me/971500000000`), no Organization schema, no dates, no reviews, and a sitemap that stamps all 46 URLs with the build time. |
| Technical accessibility | 20% | 80 | Fully static HTML (home render: `is_spa: false`), accordion content is in the DOM, canonicals correct, robots.txt open to all, valid 46-URL sitemap. Missing: `/llms.txt`, RSL, explicit AI-crawler groups in the deployed robots.txt. |

**Weighted: 51.** The site's technical base is unusually good for its size; what holds it back is thin, tagline-led content on exactly the pages (stones, intentions, care, size guide, FAQ) that answer the questions AI engines get asked.

### Platform-specific readiness

| Surface | Score | Note |
|---|---|---|
| Google AI Overviews | 45 | Strongly ranking-correlated. Site must rank top-10 for "citrine bracelet meaning" style queries first; passage structure is the second lever. |
| Google AI Mode | 50 | Broader pool, favours freshness and entity clarity. Fake `lastmod` and no Organization entity hurt here. |
| ChatGPT search | 40 | `OAI-SearchBot` is allowed (via `*`). ChatGPT leans on Wikipedia/Reddit; a brand with zero third-party mentions has little to be matched against. |
| Perplexity | 50 | `PerplexityBot` allowed; clean HTML is exactly what it likes. No Reddit/community presence. |
| Bing Copilot | 45 | Bingbot allowed. No evidence of Bing Webmaster Tools verification or IndexNow; Copilot cites what Bing has indexed. |

---

## AI crawler access (live robots.txt, fetched 2026-09-15)

Live file, verbatim:

```
User-Agent: *
Allow: /
Disallow: /wishlist/

Sitemap: https://crystalbasket.store/sitemap.xml
```

There are no bot-specific groups, so every crawler inherits `*` and is **allowed** except `/wishlist/`. Reported per bot, against the capability each one actually governs:

| Bot | Governs | Live status | Notes |
|---|---|---|---|
| Googlebot | Google Search, AI Overviews, AI Mode | Allowed | The only bot that matters for Google AI surfaces. |
| Google-Extended | Gemini / Vertex training & grounding only | Allowed | Not a Google Search signal. Allowing it is a licensing choice. |
| OAI-SearchBot | ChatGPT search citability | Allowed | The bot that decides ChatGPT citations. |
| GPTBot | OpenAI model training only | Allowed | Says nothing about ChatGPT search. Licensing choice. |
| ChatGPT-User | User-triggered browsing | n/a | Ignores robots.txt by design. |
| Claude-SearchBot | Claude search citability | Allowed | |
| ClaudeBot | Anthropic training only | Allowed | Licensing choice. |
| PerplexityBot | Perplexity search | Allowed | |
| Bingbot | Bing index → Copilot | Allowed | |
| Applebot | Siri / Spotlight / Safari discovery | Allowed | |
| Applebot-Extended | Apple Intelligence training opt-out label | Allowed | Not a crawler; labels Applebot's fetches. Licensing choice. |
| CCBot | Common Crawl (training datasets) | Allowed | Licensing choice. |

**Recommendation for a new brand:** leave every one of these open. Discovery is worth more than withholding 46 pages of copy from training sets. The training-only bots (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended) can be closed later without touching search citability.

**Working-tree note (not a live finding):** `apps/web/src/app/robots.ts` was edited today at 15:32 (uncommitted, `git status` shows ` M`) to add an explicit `AI_CRAWLERS` group. The local `apps/web/out/robots.txt` (built 01:02) and the live file predate that edit. Two things to fix in that edit before it ships: `anthropic-ai` is not a user-agent Anthropic documents (their support article lists only ClaudeBot, Claude-User, Claude-SearchBot), and `host:` is a Yandex-only directive that other parsers ignore. See the recommended block at the end of this file. This audit did not touch the source.

### Other machine-readable files

| File | Status |
|---|---|
| `/llms.txt` | 404 (HTML 404 page returned) |
| `/llms-full.txt` | 404 |
| `/sitemap.xml` | 200, valid urlset, 46 URLs, every `<lastmod>` = `2026-09-14T21:04:32.747Z` (build time) |
| `/license.xml` (RSL 1.0) | 404 — no licensing terms published |
| `/ai.txt` | 404 |

---

## Ranked findings

Ordered by expected impact on AI citations. Effort: S = under an hour, M = a few hours, L = a day or more.

### 1. Stone pages are 81–104 words and never answer "what is an X bracelet worn for?" — Impact: High · Effort: M

**Evidence.** All 16 `/stones/*` pages follow the same template: H1 = stone name, one definition sentence, a six-row spec list (Worn for / Chakra / Zodiac / Colour / Water / Sun), then product cards. Word counts from `raw/parsed/`: amethyst 93, citrine 94, rose-quartz 101, smoky-quartz 81. The only H2 is "Bracelets with Citrine". The definition sentence is excellent and should stay first; the problem is that nothing after it is quotable.

**Why it matters.** "citrine bracelet meaning", "what is a citrine bracelet good for", "which wrist citrine" are the questions AI engines get for this category. An engine wants a 40–80-word block it can lift whole. Today the best it can find is 24 words.

**Fix.** Keep the H1 and the definition sentence. Add three question-headed sections (H2) under the spec block, each opening with a direct answer in the first sentence, and convert the spec list to a real `<table>`. Target 250–350 words per stone page. Ready-to-use example for `/stones/citrine/`:

> **What is a citrine bracelet worn for?**
> A citrine bracelet is traditionally worn for abundance, optimism and confidence in work and money. Citrine is a honey-yellow quartz linked to the solar plexus chakra and to Leo, Gemini and Aries. Natural citrine fades in strong sun, so charge it under moonlight rather than on a windowsill. Crystal Basket strings natural, untreated citrine (not heat-treated amethyst) in 8 mm beads. (66 words)
>
> **Which wrist do you wear citrine on?**
> Wear citrine on the left wrist. By tradition the left side receives, and abundance stones are worn to draw something in. Pair it with pyrite or green aventurine on the same wrist for a single-intention stack. (37 words)
>
> **How do you cleanse a citrine bracelet?**
> Cleanse citrine overnight in moonlight, on a selenite plate for a few hours, or in palo santo or sage smoke. A brief rinse in plain water is fine. Avoid long direct sun: it fades the colour. Cleanse on arrival and about once a month. (45 words)

Since stone copy lives in `packages/catalog/content/stones/*.json`, this is a content change plus one template change (render three new fields as H2 + paragraph), not sixteen page edits.

### 2. Placeholder phone number `+971 50 000 0000` is on every page — Impact: High · Effort: S (blocked on NEEDED N01)

**Evidence.** 110 links to `wa.me/971500000000` across the 46 pages (header "WhatsApp us", every "Order on WhatsApp" button, FAQ). `NEEDED.md` row N01 confirms it is a placeholder. Meanwhile the footer says "hello@crystalbasket.store" and "Instagram" on every page, which are real.

**Why it matters.** Bing, Google and the LLM engines extract phone numbers as entity attributes and cross-check them against directories. A number that is visibly fake (all zeros) reads as an unfinished or untrustworthy site, and it is the single most repeated fact on the domain. It also breaks the "consistent NAP" test that Copilot and local-flavoured AI answers use.

**Fix.** Ship the real WhatsApp business number in `site.ts` (N01). Until then, consider hiding the number-bearing links behind the email link rather than publishing a fake one. No source change was made by this audit.

### 3. No Organization entity: no schema, no sameAs, no address, no dates — Impact: High · Effort: S

**Evidence.** Grep across all 46 pages: `"Organization"` 0, `"WebSite"` 0, `"BreadcrumbList"` 0, `sameAs` 0, `datePublished`/`dateModified` 0, `<time>` 0. Only `Product` (12 product pages) and `FAQPage` (`/faq/`) exist. `og:site_name` is set, `og:locale` is `en_GB`.

**Why it matters.** Engines resolve "Crystal Basket" to an entity by joining the site's stated name, location, socials and email. Right now that join has to be inferred from footer text. An `Organization` block with `sameAs` → Instagram, `email`, `address.addressLocality: "Dubai"`, `areaServed: "AE"` gives every engine the same answer. Dates matter separately: SE Ranking's 1.3M-citation study found content under 3 months old ~3x more likely to be cited; with no dates at all, the site cannot claim freshness.

**Fix.** Add one JSON-LD `Organization` (plus `WebSite`) in `apps/web/src/app/layout.tsx`, fed from `site.ts`. Add `BreadcrumbList` to product, stone and intention pages (breadcrumbs are already rendered as text). Add a visible "Updated <date>" line on care, size-guide and FAQ, sourced from a `updatedAt` field in content rather than the build clock.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://crystalbasket.store/#org",
  "name": "Crystal Basket",
  "url": "https://crystalbasket.store/",
  "logo": "https://crystalbasket.store/brand/logo-badge.svg",
  "email": "hello@crystalbasket.store",
  "description": "Hand-strung natural crystal bracelets chosen by intention. Made and cleansed in Dubai, delivered across the UAE.",
  "address": { "@type": "PostalAddress", "addressLocality": "Dubai", "addressCountry": "AE" },
  "areaServed": "AE",
  "sameAs": ["https://www.instagram.com/crystal.basket/"]
}
```

(Add the WhatsApp number as `telephone` only once N01 is real. Do not add a `LocalBusiness` type until there is a physical address to back it.)

### 4. The site's best answers (wrist, cleansing, sizes) are 20–35 words and repeated on 13 URLs — Impact: High · Effort: M

**Evidence.** The seven "Wearing & caring" FAQ answers (`/faq/`) are also rendered verbatim under "Things people ask us" on all 12 product pages (grep for "Which wrist should I wear it on" hits 13 files). The answers are good but short:

- Which wrist: 26 words.
- How often to cleanse: 17 words.
- How many to stack: 39 words.

`/care/` (209 words) and `/size-guide/` (185 words) hold the fuller versions but under tagline H1s ("A monthly ritual, five minutes long." / "Measure once. Wear it every day.") with no H2s.

**Why it matters.** When 13 URLs carry the same 26-word answer, the engine has no reason to prefer any one of them and will typically cite none, or cite a competitor whose page is about that question. The canonical answer to "which wrist do you wear a crystal bracelet on" should live on exactly one page, be 40–80 words, sit under a heading that is the question, and be the fullest version on the site.

**Fix.**
- On `/faq/`: expand each answer to 40–80 words and make each question a real `<h3>` inside the `<summary>` (or above the accordion). Keep `FAQPage` schema here only. Add "Updated" date.
- On product pages: keep three product-specific questions max (wrist for *this* intention, water for *these* stones, stacking) and link to `/faq/` for the rest.
- On `/care/` and `/size-guide/`: descriptive H1 plus question H2s (below).

Ready-to-use passages (each self-contained, each names the brand once so the quote carries attribution):

> **Which wrist do you wear a crystal bracelet on?**
> By tradition the left wrist receives energy and the right wrist projects it. Wear calming, love and abundance stones such as amethyst, rose quartz and citrine on the left, and protective or confidence stones such as black tourmaline and tiger's eye on the right. There is no rule worth stressing over: Crystal Basket's advice is to wear it on the wrist that feels right and keep it off the hand you write with if it rubs. (79 words)

> **How do you cleanse a crystal bracelet?**
> Cleanse a crystal bracelet when it arrives and about once a month afterwards. Three safe methods: leave it on a windowsill overnight in moonlight (safe for every stone), rest it on a selenite plate for a few hours, or pass it through palo santo, sage or oud smoke. Keep hematite, lapis lazuli and pyrite out of water, and keep amethyst, citrine, carnelian and rose quartz out of long direct sun, which fades their colour. (75 words)

> **What size crystal bracelet should I buy?**
> Crystal Basket bracelets come in three lengths. S is 16 cm and fits a 14–15.5 cm wrist; M is 18 cm for a 15.5–17 cm wrist; L is 20 cm for a 17–18.5 cm wrist. Every piece uses 8 mm beads on 1 mm stretch cord, roughly 20, 23 or 25 beads. Measure just below the wrist bone with a strip of paper; if you are between sizes, go up, because an 8 mm bracelet sits better slightly loose. (78 words)

### 5. Tagline H1s and no question headings on the help pages — Impact: Medium · Effort: S

**Evidence.** From `raw/parsed/`: `/care/` H1 "A monthly ritual, five minutes long.", `/size-guide/` H1 "Measure once. Wear it every day.", `/faq/` H1 "Things people ask us on WhatsApp.", `/about/` H1 "A basket of stones on a kitchen table.", `/stacks/` H1 "Three pieces. 15% off." None of these five pages has an H2. Sub-sections ("Moonlight", "Selenite", "How to measure", "Sizes") are styled text, not headings.

**Why it matters.** Question-shaped headings are the strongest structural match to how AI queries are phrased, and the heading is what the engine uses to decide what a passage is *about*. A tagline H1 tells it nothing. The brand voice can stay as a subhead directly under a plain H1.

**Fix.** Swap roles: plain, descriptive H1; tagline as the first line beneath it. Suggested:

| Page | H1 (new) | Keep tagline as sub-line | H2s to add |
|---|---|---|---|
| `/care/` | How to cleanse and care for a crystal bracelet | yes | How often should you cleanse a crystal bracelet? · Moonlight · Selenite · Smoke · Which crystals should stay out of water? · Which crystals fade in sunlight? · Everyday care |
| `/size-guide/` | Crystal bracelet size guide | yes | How to measure your wrist · Which size should I order? (with the existing table) · Why every bracelet is 8 mm |
| `/faq/` | Crystal bracelet FAQ | yes | Wearing & caring · Ordering & delivery in the UAE |
| `/about/` | About Crystal Basket, Dubai | yes | How each bracelet is made |
| `/stones/` | Crystal bracelet stone meanings | — | (list stays) |

### 6. Intention pages define a product family but not the intention — Impact: Medium · Effort: M

**Evidence.** `/intentions/*` run 97–121 words: H1 = intention name, a two-sentence blurb, stones list, chakra, product cards, "Related pieces". Good sentence present on abundance: "Worn on the left wrist to receive." No page says what a "protection bracelet" *is* or which stones count.

**Fix.** Add a definition-first paragraph and one comparison table per intention. Example for `/intentions/protection/`:

> **What is a protection crystal bracelet?**
> A protection bracelet is a crystal bracelet strung from stones traditionally worn to absorb or deflect other people's energy: black tourmaline, black obsidian, hematite and smoky quartz. It is usually worn on the right wrist, the projecting side. Crystal Basket's protection pieces are matte black 8 mm beads with a single gold accent, so they read as jewellery rather than a talisman. (63 words)

| Stone | Worn for | Water safe | Best on |
|---|---|---|---|
| Black tourmaline | boundaries, grounding | brief rinse | right wrist |
| Black obsidian | shielding, truth | brief rinse | right wrist |
| Hematite | grounding, focus | no | right wrist |

### 7. Sitemap `lastmod` is the build timestamp on all 46 URLs — Impact: Medium · Effort: S

**Evidence.** Live `sitemap.xml`: 46 `<url>` entries, 46 identical `<lastmod>2026-09-14T21:04:32.747Z</lastmod>`. `sitemap.ts` sets `lastModified: now` for every entry. Every deploy (there were three in the last two days) rewrites all 46 dates.

**Why it matters.** Engines learn quickly that a sitemap whose dates move in lock-step is not telling them anything, and then ignore it for crawl prioritisation. It also removes the one freshness signal the site could legitimately send when a stone or care page is genuinely updated.

**Fix.** Give each content JSON an `updatedAt` (or derive from `git log -1 --format=%cI -- <file>` at build) and use that for `lastModified`. Fixed pages can use the last commit touching their route file. This is a small change in `sitemap.ts` plus the catalog schema.

### 8. Stone pages show no image of the stone — Impact: Medium · Effort: M (blocked on NEEDED N05 photography)

**Evidence.** `/stones/citrine/` image sources: `/images/products/the-alchemist/main.jpg`, `/images/products/the-seven/main.jpg`. `apps/web/public/images/` has `about`, `hero`, `intentions`, `products`, `stacks` — no `stones/` folder. Alt text on product images is good ("The Fortune — Luck Bracelet · Green Aventurine & Tiger's Eye").

**Fix.** One bead-detail photo per stone (16 images) with alt "Natural citrine 8 mm beads, honey yellow" and an `ImageObject` in the stone page's future schema. Multi-modal pages see materially higher AI selection rates; a stone page is where a photo of the stone is expected.

### 9. No `/llms.txt` — Impact: Low · Effort: S

**Evidence.** `GET /llms.txt` → 404 (HTML). `GET /llms-full.txt` → 404.

**Honest weighting.** Google states `llms.txt` "is not needed for Google Search and does not help or hurt visibility". Server-log audits show the major AI crawlers rarely request it. It costs ten minutes, harms nothing, and gives any agent that does look a curated map with the brand facts stated once, so it is worth adding as a static file in `apps/web/public/llms.txt` (static export serves it as-is). The ready-to-use file is at the end of this document. Do not expect a measurable citation change from it.

### 10. No Bing Webmaster / IndexNow footprint — Impact: Low-Medium · Effort: S

**Evidence.** Nothing on the domain indicates Bing verification; GitHub Pages cannot run IndexNow pings itself. Copilot cites from the Bing index, and Bing indexes small new sites slowly without a verified property.

**Fix.** Verify crystalbasket.store in Bing Webmaster Tools (DNS TXT via Cloudflare or a `BingSiteAuth.xml` in `public/`), submit the sitemap, and add an IndexNow ping step to `deploy.yml` (a single curl with a key file in `public/`).

### 11. No RSL / licensing statement — Impact: Low · Effort: S

**Evidence.** `/license.xml` 404, no `Link: rel="license"` header, no `ai.txt`. Not a citability issue. Noted for completeness; if the owner later wants to allow search use but restrict training, RSL 1.0 is the way to say so machine-readably.

---

## What is already working (keep it)

- **Static HTML everywhere.** `home-render.json` reports `is_spa: false`; accordion bodies (`<details>`, 167 across 13 pages) are in the served HTML, so non-JS crawlers see product FAQ, materials and care text.
- **Definition sentences.** Every stone and product page opens with "X is worn for …" (112 occurrences) or "traditionally worn" (42). This is the exact "X is …" pattern engines quote. Keep the honest "traditionally worn" wording; there are zero occurrences of "cures/heals/healing".
- **Product pages** (655–830 words): descriptive `<title>` ("The Fortune · Luck Bracelet · Green Aventurine & Tiger's Eye · Crystal Basket"), `Product` + `Offer` JSON-LD with AED price and availability, materials table, per-stone meanings, care steps, delivery terms. These are the most citable pages on the site.
- **Brand consistency.** "Crystal Basket" (never "CrystalBasket"), "Dubai" and "UAE" on every page, Instagram `@crystal.basket` and `hello@crystalbasket.store` in every footer, canonical tags correct, `og:site_name` set.
- **Size table.** The one real `<table>` on the site is the wrist-size table; it is the right format and should be copied to the size H2 on every product page.

---

## Brand-mention / entity check

| Signal | Status | Note |
|---|---|---|
| Name consistency on-site | Good | 986× "Crystal Basket", one spelling |
| Location on-site | Good | "Dubai" 202×, "UAE"/"United Arab Emirates" 214× |
| Instagram | Present | `instagram.com/crystal.basket`, 138 links; not declared in schema |
| Email | Present | `hello@crystalbasket.store`, 138 links; live via Cloudflare routing (NEEDED N14) |
| Phone / WhatsApp | **Placeholder** | `971500000000` on 110 links (NEEDED N01) |
| TikTok | Hidden | link suppressed until handle exists (correct) |
| Organization schema / sameAs | Missing | finding 3 |
| Reviews | Hidden | N03: section off until real quotes exist (correct; do not fake) |
| Wikipedia / Wikidata | None expected | new brand; not a realistic target |
| Reddit / YouTube / TikTok mentions | Not measured | no tooling in this pass; assume none. These are the strongest external correlates of AI citation (YouTube ~0.74). Cheapest start: short Instagram/TikTok reels re-posted to a YouTube channel titled with the same question headings as the pages ("Which wrist do you wear a crystal bracelet on?"). |

---

## Recommended robots.txt

Behaviour is identical to today's file for every listed bot (all already allowed via `*`); the named groups make the intent explicit and survive a future `*` tightening. Under RFC 9309 a bot that finds its own group ignores `*`, so each group must repeat the `/wishlist/` rule. Dropped from the working-tree draft: `anthropic-ai` (not documented by Anthropic) and `host:` (Yandex-only).

```
# Search & AI-search crawlers (these decide citations)
User-agent: Googlebot
User-agent: Bingbot
User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Applebot
User-agent: DuckAssistBot
Allow: /
Disallow: /wishlist/

# Training-only crawlers (licensing preference, not search visibility).
# Open for now: a new brand gains more from being known than from withholding 46 pages.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
User-agent: meta-externalagent
User-agent: Amazonbot
Allow: /
Disallow: /wishlist/

User-agent: *
Allow: /
Disallow: /wishlist/

Sitemap: https://crystalbasket.store/sitemap.xml
```

Equivalent `robots.ts` shape (for whoever finishes the uncommitted edit): two `rules` entries with `userAgent` arrays as above, keep `disallow: ["/wishlist/"]` on each, keep `sitemap`, remove `host`. Run `make check` before committing.

---

## Ready-to-use /llms.txt

Save as `apps/web/public/llms.txt` (served at `https://crystalbasket.store/llms.txt` by the static export). Follows llmstxt.org: H1, blockquote summary, free paragraphs, H2 link sections, `## Optional` for secondary pages.

```markdown
# Crystal Basket

> Hand-strung natural crystal bracelets chosen by intention. A small studio in Dubai, United Arab Emirates. Natural, undyed 8 mm stone beads on 1 mm stretch cord, cleansed on selenite before shipping. Next-day delivery across the UAE, cash on delivery available, free delivery over 250 AED. Prices in AED.

Crystal Basket sells twelve bracelets across eight intentions (protection, love, abundance, calm, confidence, focus, grounding, sleep) using sixteen natural stones. Crystal meanings on the site reflect traditional beliefs and are not medical advice. Sizes: S 16 cm (14–15.5 cm wrist), M 18 cm (15.5–17 cm), L 20 cm (17–18.5 cm); custom lengths on request. Any three bracelets are 15% off as a stack. Contact: hello@crystalbasket.store · Instagram @crystal.basket.

## Guides

- [FAQ](https://crystalbasket.store/faq/): Which wrist to wear a crystal bracelet on, showering, sleeping, stacking, cleansing frequency, payment, delivery, exchanges
- [Cleanse & care](https://crystalbasket.store/care/): How to cleanse a crystal bracelet (moonlight, selenite, smoke), which stones to keep out of water and sun, everyday care
- [Size guide](https://crystalbasket.store/size-guide/): How to measure your wrist; S/M/L bracelet lengths and the wrist range each fits
- [Our story](https://crystalbasket.store/about/): How each bracelet is sourced, strung, cleansed and packed in Dubai
- [Wellness disclaimer](https://crystalbasket.store/disclaimer/): Crystal properties are traditional beliefs, not medical claims

## Shop

- [All bracelets](https://crystalbasket.store/shop/): Twelve natural crystal bracelets, 65–105 AED
- [Stacks & sets](https://crystalbasket.store/stacks/): Curated three-piece stacks by intention; any three bracelets 15% off
- [Shop by intention](https://crystalbasket.store/intentions/): Eight intentions and the stones traditionally worn for each

## Bracelets

- [The Alchemist](https://crystalbasket.store/products/the-alchemist/): Abundance bracelet, citrine and pyrite, 14k gold-filled accent, 105 AED
- [The Anchor](https://crystalbasket.store/products/the-anchor/): Grounding bracelet, smoky quartz and hematite, 75 AED
- [The Aurora](https://crystalbasket.store/products/the-aurora/): Focus bracelet, labradorite, 14k gold-filled accent, 80 AED
- [The Clear Sight](https://crystalbasket.store/products/the-clear-sight/): Focus bracelet, lapis lazuli and clear quartz, 75 AED
- [The Devotion](https://crystalbasket.store/products/the-devotion/): Love bracelet, rose quartz and moonstone, 90 AED
- [The Fortune](https://crystalbasket.store/products/the-fortune/): Luck bracelet, green aventurine and tiger's eye, 75 AED
- [The Guardian](https://crystalbasket.store/products/the-guardian/): Protection bracelet, black tourmaline and hematite, 95 AED
- [The Lionheart](https://crystalbasket.store/products/the-lionheart/): Confidence bracelet, tiger's eye and carnelian, 75 AED
- [The Seven](https://crystalbasket.store/products/the-seven/): Chakra bracelet, seven stones root to crown, 75 AED
- [The Shield](https://crystalbasket.store/products/the-shield/): Protection bracelet, black obsidian, 65 AED
- [The Still Mind](https://crystalbasket.store/products/the-still-mind/): Calm bracelet, amethyst, 65 AED
- [The Tender Heart](https://crystalbasket.store/products/the-tender-heart/): Love bracelet, rose quartz, 65 AED

## Intentions

- [Protection](https://crystalbasket.store/intentions/protection/): Black tourmaline, obsidian, hematite, smoky quartz; usually worn on the right wrist
- [Love & self-love](https://crystalbasket.store/intentions/love/): Rose quartz, moonstone; worn on the left wrist
- [Abundance & wealth](https://crystalbasket.store/intentions/abundance/): Citrine, green aventurine, pyrite, tiger's eye; worn on the left wrist to receive
- [Calm & ease](https://crystalbasket.store/intentions/calm/): Amethyst, rose quartz, the seven chakra stones
- [Confidence & courage](https://crystalbasket.store/intentions/confidence/): Tiger's eye, carnelian
- [Focus & clarity](https://crystalbasket.store/intentions/focus/): Lapis lazuli, clear quartz, labradorite
- [Grounding & stability](https://crystalbasket.store/intentions/grounding/): Smoky quartz, hematite, red jasper
- [Sleep & rest](https://crystalbasket.store/intentions/sleep/): Amethyst, moonstone

## Stone meanings

- [Stone library](https://crystalbasket.store/stones/): All sixteen stones with what each is traditionally worn for, chakra and zodiac
- [Amethyst](https://crystalbasket.store/stones/amethyst/): Calm, intuition, sleep; crown chakra
- [Black obsidian](https://crystalbasket.store/stones/black-obsidian/): Shielding, truth, release
- [Black tourmaline](https://crystalbasket.store/stones/black-tourmaline/): Protection, boundaries, grounding
- [Carnelian](https://crystalbasket.store/stones/carnelian/): Vitality, creativity, drive
- [Citrine](https://crystalbasket.store/stones/citrine/): Abundance, joy, optimism; solar plexus; natural, not heat-treated
- [Clear quartz](https://crystalbasket.store/stones/clear-quartz/): Clarity, amplification, intention
- [Green aventurine](https://crystalbasket.store/stones/green-aventurine/): Luck, opportunity, growth
- [Hematite](https://crystalbasket.store/stones/hematite/): Grounding, focus, steadiness; keep out of water
- [Labradorite](https://crystalbasket.store/stones/labradorite/): Transformation, aura shield
- [Lapis lazuli](https://crystalbasket.store/stones/lapis-lazuli/): Truth, wisdom, expression; keep out of water
- [Moonstone](https://crystalbasket.store/stones/moonstone/): Intuition, cycles, new beginnings
- [Pyrite](https://crystalbasket.store/stones/pyrite/): Wealth, action, willpower; keep out of water
- [Red jasper](https://crystalbasket.store/stones/red-jasper/): Stamina, grounding, courage; root chakra
- [Rose quartz](https://crystalbasket.store/stones/rose-quartz/): Love, compassion, self-worth; heart chakra
- [Smoky quartz](https://crystalbasket.store/stones/smoky-quartz/): Grounding, release
- [Tiger's eye](https://crystalbasket.store/stones/tigers-eye/): Confidence, courage, willpower

## Optional

- [Home](https://crystalbasket.store/): Storefront home page
- [Sitemap](https://crystalbasket.store/sitemap.xml): All 46 URLs
```

Once the real WhatsApp number exists (N01), add it to the contact line. Do not add an `llms-full.txt` until the stone and guide pages have been expanded; a full-text dump of 90-word pages adds nothing.

---

## Implementation order (plain English, for Yegor)

1. **Fix the fake phone number** (N01) — nothing else on this list matters as much to trust.
2. **Expand the seven FAQ answers and the care/size pages** using the passages above; give those pages plain H1s and question H2s. One afternoon of content work.
3. **Add three question sections to each stone JSON** (worn for / which wrist / how to cleanse) and render them; convert the spec list to a table. Half a day, mostly writing.
4. **Add Organization + WebSite + BreadcrumbList JSON-LD** in the layout and real `lastmod` in the sitemap. An hour.
5. **Finish and commit the `robots.ts` edit** with the block above (drop `anthropic-ai` and `host`), and add `public/llms.txt`. Twenty minutes.
6. Verify in Bing Webmaster Tools; add an IndexNow ping to the deploy workflow.
7. When real photography arrives (N05), add one bead-detail image per stone page.

Re-score after steps 1–5: expected 70–75.

---

## audit-data.json (AI Search Readiness)

```json
{
  "category": "AI Search Readiness",
  "score": 51,
  "dimensions": {
    "citability": 45,
    "structural_readability": 45,
    "multimodal": 50,
    "authority_brand": 35,
    "technical_accessibility": 80
  },
  "platforms": { "google_ai_overviews": 45, "google_ai_mode": 50, "chatgpt_search": 40, "perplexity": 50, "bing_copilot": 45 },
  "crawler_access": {
    "Googlebot": "allowed", "Bingbot": "allowed", "OAI-SearchBot": "allowed", "Claude-SearchBot": "allowed",
    "PerplexityBot": "allowed", "Applebot": "allowed",
    "GPTBot": "allowed (training)", "ClaudeBot": "allowed (training)", "Google-Extended": "allowed (training)",
    "Applebot-Extended": "allowed (training)", "CCBot": "allowed (training)",
    "source": "no bot-specific groups; all inherit User-Agent: * with Disallow: /wishlist/"
  },
  "llms_txt": "missing (404)",
  "llms_full_txt": "missing (404)",
  "rsl_license": "missing",
  "ssr": true,
  "schema_present": ["Product (12)", "FAQPage (1)"],
  "schema_missing": ["Organization", "WebSite", "BreadcrumbList"],
  "findings": [
    { "id": "GEO-1", "severity": "high", "title": "Stone pages 81-104 words, no question-headed answer blocks", "pages": 16 },
    { "id": "GEO-2", "severity": "high", "title": "Placeholder WhatsApp number 971500000000 on every page (110 links)", "blocked_on": "NEEDED N01" },
    { "id": "GEO-3", "severity": "high", "title": "No Organization/WebSite/Breadcrumb schema, no sameAs, no dates" },
    { "id": "GEO-4", "severity": "high", "title": "Wrist/cleanse/size answers are 17-39 words and duplicated on 13 URLs" },
    { "id": "GEO-5", "severity": "medium", "title": "Tagline H1s and zero H2s on care, size-guide, faq, about, stacks" },
    { "id": "GEO-6", "severity": "medium", "title": "Intention pages (97-121 words) never define the intention" },
    { "id": "GEO-7", "severity": "medium", "title": "Sitemap lastmod = build time on all 46 URLs" },
    { "id": "GEO-8", "severity": "medium", "title": "Stone pages show no image of the stone", "blocked_on": "NEEDED N05" },
    { "id": "GEO-9", "severity": "low", "title": "No /llms.txt (optional; ignored by Google)" },
    { "id": "GEO-10", "severity": "low", "title": "No Bing Webmaster / IndexNow footprint" },
    { "id": "GEO-11", "severity": "low", "title": "No RSL licensing statement" }
  ]
}
```
