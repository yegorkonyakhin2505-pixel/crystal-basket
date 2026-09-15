# Content quality & E-E-A-T audit — crystalbasket.store

**Audited:** 2026-09-15 · 46 URLs from `raw/urls.txt` (raw HTML in `raw/pages/`, parsed meta in `raw/parsed/`, `<main>` text re-extracted for word counts and claim checks)
**Scope:** copy, claims compliance, thin/duplicate content, metadata, E-E-A-T, readability, AI-citation readiness, internal linking, topical gaps. Technical, schema-validity, image and speed findings belong to their own reports and are only cross-referenced here.
**Scores are heuristics** (this skill's internal model, not Google-internal signals). Search Console is the first-party source for what actually ranks.

## Category score: **52 / 100**

| Sub-score | Score | One-line reason |
|---|---|---|
| E-E-A-T (weighted) | 47 / 100 | Honest, first-hand process copy, but nobody is named, the phone number is a placeholder, and there are no reviews, policies, address or sources. |
| Content depth | 48 / 100 | 12 product pages are fine (620–790 words) but 81 % boilerplate; the 24 stone + intention pages that should rank for "X bracelet meaning" / "protection bracelet" are 51–103 words each. |
| Metadata quality | 72 / 100 | 46/46 titles and descriptions unique, no templating detected; 12 product descriptions 183–251 chars, 11 product titles 63–81 chars, no title contains Dubai/UAE. |
| Claims compliance | 80 / 100 | Zero "cure/heal/treat" in main copy; disclaimer present and linked from every product. House rule "traditionally worn for" applied on only 6 of 24 stone/intention pages; 6 health-adjacent phrases (sleep, anxious, cycles). |
| Readability | 85 / 100 | Flesch 64–83 on all customer pages (disclaimer 34, acceptable for legal). Short sentences, plain English, consistent brand voice. |
| AI-citation readiness | 38 / 100 | FAQ answers are quotable, but questions are rendered as buttons not headings, no definition sentences, no tables besides sizing, no dates, no sources, no named author/entity. |
| Internal linking | 60 / 100 | Product ↔ stone ↔ intention links exist, but stone pages never link to intentions or care; nothing links body-text to stacks/size guide; wishlist linked 138× but absent from the crawl list. |

### E-E-A-T breakdown (skill model: Trust 30 · Expertise 25 · Authority 25 · Experience 20)

| Factor | Score | Key signals found / missing |
|---|---|---|
| Experience | 11 / 20 | Real process detail: "48 hours on selenite", "1mm premium stretch cord, double-knotted and hidden inside a bead", "checked bead by bead for dye, glass and glue", origin story on a Dubai kitchen table. Missing: any named person, any photo of real work (images are AI placeholders per NEEDED N05), any customer story. |
| Expertise | 12 / 25 | Stone facts are accurate and specific (hematite/lapis/pyrite kept dry, citrine "natural, not heat-treated amethyst", sun-fade list). Missing: author/founder credentials, zero external references, no "what the stone actually is" (mineral, hardness, origin) on any stone page. |
| Authoritativeness | 7 / 25 | One outbound social link (Instagram). No press, no citations, no third-party mentions on-site, no Organization schema. |
| Trustworthiness | 17 / 30 | HTTPS, email on every page, wellness disclaimer, AED prices, delivery/exchange terms on every product, "not medical advice" footer. Missing: real phone (placeholder `971500000000` in 110 links), legal entity/address, privacy, terms, returns/refund and delivery pages, reviews, dates; one contradictory payment statement. |

### Page inventory (main-content words, nav/footer excluded)

| Page type | Pages | Words (main) | Floor (skill) | Verdict |
|---|---|---|---|---|
| Home | 1 | 278 | 500 | Thin: mostly card labels; one 45-word paragraph of prose |
| Shop / Stacks / Intentions index / Stones index | 4 | 171 / 320 / 51 / 136 | — | Grids with one intro sentence each |
| Intention pages | 8 | 77–103 | 500 (category) | Thin: one 30-word paragraph + product cards |
| Stone pages | 16 | 66–86 | 500 (category) | Thin: one sentence + spec list + product cards |
| Product pages | 12 | 623–791 | 300–400 | Volume OK, but 81 % shared boilerplate (see F6) |
| About / Care / FAQ / Size guide / Disclaimer | 5 | 190 / 192 / 332 / 168 / 114 | — | Good quality, short; keyword-blind H1s |

---

## Ranked findings

Severity order. Each has evidence (URL + quoted text) and a concrete fix. Fix owners: **Content** = catalog JSON / page copy (owner or Yegor), **Owner** = information only she can supply (`NEEDED.md`), **Dev** = component/template change.

### F1 · CRITICAL — The WhatsApp number is a placeholder on every page
**Evidence:** 110 links across all 46 pages go to `https://wa.me/971500000000?text=Hi%20Crystal%20Basket!...` ("WhatsApp us" in the header, "Order on WhatsApp" on every product and stack). `/faq/`: "Message us on WhatsApp." `/size-guide/`: "Message us on WhatsApp with your wrist measurement". Known as NEEDED **N01**.
**Why it matters:** Trust is the heaviest E-E-A-T factor. A rater or shopper who taps the primary contact/order CTA reaches a dead number; the FAQ's entire premise ("Things people ask us on WhatsApp") is unverifiable.
**Fix (Owner → `apps/web/src/lib/site.ts` → `whatsapp`):** supply the real business number. Until then, hide the "Order on WhatsApp" buttons behind the existing flag and leave email as the visible contact.

### F2 · HIGH — No policy or contact pages at all
**Evidence:** The only internal routes linked from the home page are `/about/ /care/ /disclaimer/ /faq/ /intentions/ /shop/ /size-guide/ /stacks/ /stones/ /wishlist/`. Zero pages contain "privacy", "refund", "terms" or a delivery fee. `/faq/` says "Next-day across the UAE… Free over 250 AED" and every product says "Free over 250 AED", but the charge under 250 AED (25 AED per Shopify, NEEDED N13) is never stated. Returns exist only as "Can I exchange the size? Yes. Unworn, within 14 days." — no refund position, no damaged-item process, no legal entity, no address, no hours. NEEDED **N09** marks delivery terms as "assumed".
**Fix (Content + Dev):** add four static pages and link them in the footer "Help" column: `/delivery/` (fee, free threshold, next-day cut-off time, COD, emirates covered, courier), `/returns/` (14-day exchange, refund rule, damaged/wrong item, who pays courier), `/privacy/` (what the newsletter popup and Shopify collect), `/contact/` (WhatsApp, email, hours, "Dubai, UAE" + trade-licence name once available). Add `Organization` schema with the same details (schema report).

### F3 · HIGH — Nobody is named; "who made this" is unanswered
**Evidence:** `/about/`: "Every bracelet is chosen, strung and cleansed by one pair of hands" — the hands are never named. No founder name, photo, or date anywhere; the single image alt is "Stringing gemstone beads at the studio table" and is an AI placeholder (NEEDED N05). Sourcing is "graders we know" with no country of origin.
**Why:** Google's "Who created it?" test fails on every page; AI engines cannot attribute the brand to a person or entity.
**Fix (Owner → Content):** on `/about/` add a short first-person block: founder's first name, since when, which area of Dubai, one real photo of her stringing, and where the strands come from (e.g. Brazil for amethyst/citrine, Madagascar for labradorite — she knows this). Add `Person` (founder) inside `Organization` schema. Sign the care/size/FAQ pages "Written by [name], Crystal Basket, updated [date]".

### F4 · HIGH — Superlative claims with no social proof behind them
**Evidence:** Home and `/shop/`: "Bestseller" badge on The Alchemist and The Shield; home H2 "The ones that leave first". `/intentions/calm/`: "The most gifted intention in our basket." `/products/the-anchor/`: "Our most-worn men's piece." No review, rating, count or testimonial appears on any page; NEEDED **N03** confirms the testimonial section is hidden because the sample quotes "were invented". Product schema has no `aggregateRating`.
**Fix (Owner + Dev):** collect 5–10 real WhatsApp/Instagram reviews (with permission, first name + emirate), show them on home and the relevant product page, and feed `aggregateRating`/`review` into Product schema. Until then, soften to "Popular" or drop the badges — an unsupported "Bestseller" reads as marketing filler to raters.

### F5 · HIGH — Stone and intention pages are thin (66–103 words) and are exactly the pages that should rank
**Evidence:** `/stones/black-obsidian/` (66 words) is, in full: "Volcanic glass with a mirror-like polish. Obsidian is worn as a shield and for the honesty to see what needs releasing." + a 6-row spec list + one product card. `/intentions/love/` (77 words): one 33-word paragraph, two stone chips, two product cards. `/intentions/` index: 51 words. Titles promise more than the page delivers: "Black Obsidian bracelet meaning · Crystal Basket".
**Why:** "amethyst bracelet meaning", "black tourmaline bracelet", "protection bracelet" are the informational queries this catalogue can own in the UAE; a 66-word page loses to any 800-word competitor and gives an AI answer engine nothing to cite.
**Fix (Content, catalog JSON `stones/*.json` and `intentions/*.json` → new `longDescription`/`faq` fields; Dev renders them):** per stone, 300–450 words in five short sections with real H2s: *What it is* (mineral family, Mohs hardness, where it is mined), *Traditionally worn for*, *Which wrist and how to wear it*, *Pairs well with* (link the stones and the stack), *Care* (the water/sun rows already exist; link `/care/`), plus 3 stone-specific Q&As ("Is black obsidian safe in water?", "How do I tell real obsidian from glass?"). Per intention, 250–400 words: who it is for in plain words, the 2–4 stones and why each, which wrist, the curated stack, and 2 Q&As. Start with the 4 highest-intent pages: protection, calm, love, amethyst.

### F6 · HIGH — Product pages are 81 % shared boilerplate
**Evidence:** Across the 12 product pages, 7,408 words in substantive lines, only 1,422 (19 %) unique to a page. 39 lines appear on ≥ 9 of 12 pages, including the identical 7-question "Things people ask us" block (also the whole of `/faq/`), "Activate, cleanse & care", "What's in the box", and "Delivery & returns". Page-unique prose is one paragraph: `/products/the-shield/`: "The piece: Polished eight-millimetre obsidian, nothing else…" — the "Stones in this bracelet" text is copied verbatim from the stone pages.
**Why:** Duplicate main content dilutes what each product page is "about" and reads as scaled/templated to raters; the FAQ block on 13 pages competes with `/faq/` for the same questions.
**Fix (Content + Dev):** (a) add a 120–200-word product-specific section: why this stone combination, who buys it (gift vs self, occasion), how it looks on the wrist (bead count is already there — add weight in grams and finish), what makes it different from its sibling (Shield vs Guardian, Devotion vs Tender Heart). (b) Replace the generic 7-question block with 2–3 questions specific to that piece ("Can I wear The Guardian in the shower?" → no, hematite) and link "More questions → /faq/". Keep `FAQPage` schema on `/faq/` only (Google no longer shows FAQ rich results for merchant pages anyway).

### F7 · MEDIUM — Claims rule applied inconsistently; six health-adjacent phrases
**Evidence (compliant):** no "cure", "heal", "treat", "relieve", "anxiety", "depression", "insomnia", "pain" or "proven" in any main-content copy; the only hits are the disclaimer itself ("not intended to diagnose, treat, cure or prevent"). Every product page ends "Crystal meanings reflect traditional beliefs and are not medical advice" with a link to `/disclaimer/`. Good.
**Evidence (rule deviation):** the house rule is "traditionally worn for". It appears on only 2 of 16 stone pages (amethyst, red-jasper), 2 of 8 intention pages (focus, protection) and 2 of 12 product pages. The other 20 use the bare form, e.g. `/stones/black-tourmaline/`: "Black tourmaline is worn to absorb heaviness…"; `/stones/citrine/`: "Citrine is worn for prosperity…". Bare "is worn to" is not a medical claim, but it drops the hedge the brand chose.
**Evidence (health-adjacent, worth rewording):**
- `/stones/amethyst/`, `/products/the-still-mind/`, `/products/the-seven/`: "support restful sleep"; `/products/the-still-mind/`: "support deeper sleep"
- `/intentions/calm/` (also in its meta description): "worn to soften an anxious mind"
- `/stacks/`: "three bracelets for the anxious and the overthinking"
- `/stones/moonstone/`, `/products/the-devotion/`: "worn for intuition, feminine cycles and fresh starts"
- `/stones/carnelian/`, `/products/the-lionheart/`: "physical energy"
- `/stones/labradorite/`, `/products/the-aurora/`: "protection of the aura" (fine metaphysically; just needs "traditionally")
**Fix (Content, catalog JSON):** one pass over `stones/*.json` and `intentions/*.json` so every claim sentence reads "traditionally worn for/to …". Reword the sleep/anxiety lines to outcome-free phrasing: "traditionally worn at bedtime", "worn by people who want a quieter evening", "for the overthinkers" (drop "anxious"), "worn through the month's phases" (drop "feminine cycles"). This also removes the words most likely to trip ad-platform review (Meta/Google Shopping health policies).

### F8 · MEDIUM — Data bugs visible in the copy
**Evidence:**
- `/stones/` and `/stones/smoky-quartz/`: "Worn for: Grounding, Release, Release" (duplicate tag).
- `/intentions/grounding/`: "Stones: Amethyst, Carnelian, Citrine, Clear Quartz, Green Aventurine, Hematite, Lapis Lazuli, Red Jasper, Smoky Quartz — Chakra: Root" — the list is auto-aggregated from The Seven's stones; `/stones/amethyst/` itself says "Chakra: Third Eye, Crown" and "Worn for: Calm, Intuition, Sleep". A reader (or a rater checking accuracy) sees the site contradicting itself.
- `/intentions/sleep/`: first product shown is The Aurora — tagged "Focus", sold out.
- `/intentions/love/` has no "Related pieces" section while every other intention does (only 2 products).
**Fix (Content + Dev):** curate `stones[]` per intention in `intentions/*.json` rather than deriving from product membership; dedupe `wornFor`; sort in-stock first and same-intention first on intention grids.

### F9 · MEDIUM — Meta descriptions and titles run long on the money pages
**Evidence:** all 12 product descriptions are 183–251 chars, e.g. `/products/the-guardian/` (251): "Walk into any room and leave with your own energy intact. Matte black tourmaline strung with cool, mirror-bright hematite and a single 14k gold-filled bead. Traditionally worn to absorb heaviness…". Four intention descriptions are 166–202 chars. Eleven product titles are 63–81 chars: "The Clear Sight · Focus Bracelet · Lapis Lazuli & Clear Quartz · Crystal Basket" (79). `/stones/` description is 61 chars. No title or description on the site contains "Dubai" or "UAE" except home/shop/about descriptions. Templating check: `templated_ratio 0.0`, `site_risk low`, no shared CTA phrases — all 46 pairs unique.
**Fix (Content, catalog JSON `seo.title` / `seo.description`):** product title pattern "The Guardian — Black Tourmaline & Hematite Protection Bracelet | Crystal Basket" (≤ 60 incl. brand; drop the middle dot chain). Descriptions ≤ 155 chars, keyword first, one trust fact: "Black tourmaline & hematite protection bracelet, hand-strung in Dubai. Natural 8 mm beads, next-day UAE delivery, free re-string for life." Add "Dubai" to the 8 intention titles ("Protection bracelets, Dubai · Crystal Basket").

### F10 · MEDIUM — Brand-voice H1s and titles carry no search terms
**Evidence:** Home H1 "Energy you can wear." (title "Crystal Basket — Energy you can wear."); `/about/` H1 "A basket of stones on a kitchen table."; `/care/` H1 "A monthly ritual, five minutes long."; `/size-guide/` H1 "Measure once. Wear it every day."; `/faq/` H1 "Things people ask us on WhatsApp." Only `/shop/` has a descriptive H1 ("Crystal bracelets"). The stone pages' H1 is just the stone name ("Amethyst") while the title says "Amethyst bracelet meaning".
**Fix (Content, Dev keeps the strapline as a styled eyebrow):** H1 = what the page is, strapline stays underneath. Home: "Crystal bracelets, hand-strung in Dubai"; care: "How to cleanse and care for a crystal bracelet"; size guide: "Crystal bracelet size guide (S, M, L in cm)"; FAQ: "Crystal bracelet FAQ"; stone: "Amethyst bracelet: meaning, chakra and care".

### F11 · MEDIUM — Low AI-citation readiness: answers exist but are not marked as answers
**Evidence:** `raw/parsed/faq.json` reports `h2: []`, `h3: []` — the 11 questions render as accordion buttons, not headings, so the page has an H1 and no sub-structure. Same on the 12 product FAQ blocks. No stone page has a definition sentence ("Amethyst is a purple variety of quartz…"); the only table on the site is the size chart. No page shows a publish/updated date (render tool fell back to `2026-01-01`; the only date on site is "© 2026"). No outbound references. Good raw material exists: "Real stone is cold to the touch, heavier than it looks, and no two beads match." and "Tradition says the left wrist receives (calm, love, abundance) and the right wrist projects (protection, confidence)." are exactly the quotable sentences AI answers lift.
**Fix (Dev + Content):** render accordion questions as `<h3>` inside the button; open a stone page with a one-sentence definition; add a sortable "16 stones at a glance" table on `/stones/` (stone · traditionally worn for · chakra · wrist · water-safe · sun-safe) — it doubles as the best internal-link hub on the site; add "Last reviewed: [month year]" to care, size, FAQ and disclaimer; cite one reference per stone page (Mindat or GIA, `rel="noopener"` new tab).

### F12 · MEDIUM — Stale or contradictory operational copy
**Evidence:** `/faq/` "How do I pay?": "Secure checkout with cash on delivery across the UAE (card payments are coming soon), or order on WhatsApp and pay by bank transfer or cash on delivery." NEEDED **N02/N13** record Stripe card payments live in Shopify checkout since 2026-09-13. `/faq/`: "Next-day across the UAE, once your order is confirmed." — NEEDED **N09** says the courier and COD terms are still "assumed". `/about/` "What's next": "Raw crystals, tumbled stones, clusters and towers are coming to the basket next" — undated roadmap promise.
**Fix (Content):** rewrite the payment answer ("Pay by card at checkout, or cash on delivery."); confirm the courier SLA and cut-off before keeping "next-day" (or say "1–2 working days"); date the "What's next" line or remove it.

### F13 · MEDIUM — Internal-link gaps between the three content families
**Evidence (from main-content links only):**
- 16 stone pages link only to `/`, `/stones/` and products — never to the intention they serve, never to `/care/` (even though each has "Keep dry" / "Fades in sunlight" rows), never to `/stacks/`.
- 8 intention pages link to stones and products but not to the matching curated stack (`/stacks/` has "The Calm Stack", "The Protection Stack", "The Abundance Stack") or to `/size-guide/`.
- Product pages link to their intention only through the breadcrumb; the "Worn well together" grid is products only, no link to the stack that contains them.
- Nothing in body copy links to `/about/` except the home teaser; `/faq/` answers mention "Our stack builder" and "size guide" without linking them.
- `/wishlist/` is linked 138× (header + footer on every page) but is not in `urls.txt`/sitemap — check with the technical report whether it is intentionally noindex.
- Every product receives the same site-wide link count (7–20 pages) because the only product links are grids; the home page grid is the only editorial prioritisation.
**Fix (Dev, template-level):** stone page → "Traditionally worn for [intention] →" chip + "Care notes for [stone] →" link; intention page → "Shop the [Intention] Stack, 15 % off →" + size-guide link; product → "Part of The Protection Stack →"; FAQ answers → inline links to `/stacks/`, `/size-guide/`, `/care/`.

### F14 · LOW — Home page is thin and never says what the shop is in plain words
**Evidence:** 278 main-content words; the only prose is the 45-word "Our story" teaser. Nowhere on the home page does the phrase "crystal bracelets" appear with "Dubai" in a sentence other than the eyebrow "Hand-strung in Dubai".
**Fix (Content):** one 100–150-word block under the hero or above the footer: what you sell, who makes it, where, how it ships, the disclaimer in a sentence, linking to `/shop/`, `/about/`, `/delivery/`. Add 3 home-level FAQs (delivery, real stones, sizing).

### F15 · LOW — Sold-out pieces give the shopper nothing to do
**Evidence:** `/products/the-aurora/` and `/products/the-devotion/` show "Sold out"; schema says `availability: BackOrder` but the copy never says whether or when they return, and there is no notify/reserve line. They still appear first on `/intentions/sleep/` and `/intentions/focus/`.
**Fix (Content + Dev):** a one-line "Restrung in small batches; message us to reserve the next one" under the button; sort sold-out to the end of grids.

### F16 · LOW — Accessibility/alt gaps that also cost content signal
**Evidence:** `/stacks/` builder: 13 of 16 images have empty alt; every page's hero/breadcrumb image has `alt=''`. Product and grid images are well described ("The Guardian — Protection Bracelet · Black Tourmaline & Hematite"). Cross-ref the images report.
**Fix (Dev):** reuse the product card alt in the stack builder tiles.

### F17 · LOW — Disclaimer is legally sound but dense
**Evidence:** Flesch 34 (`/disclaimer/`), 114 words, the only page below 60. Fine for a legal page.
**Fix (Content):** add one plain-English line at the top: "Our bracelets are jewellery. Wear them for what they mean to you, not instead of a doctor." Keep the legal text below.

---

## What is working (keep it)

- Voice is consistent, specific and human across all 46 pages: "Roll the bracelet on and off over the hand instead of stretching it wide." / "Stretch cord is a wear part." — no AI-typical filler phrases found.
- Honest positioning: "We do not promise the stones will change your life. We promise they are real, they are strung to last…" (`/about/`) is the best E-E-A-T sentence on the site; quote it on the home page.
- Concrete, checkable product facts on every product: bead count per size, cord gauge, "Natural, undyed, A-grade", box contents, care exceptions per stone.
- All 46 title/description pairs unique; no templated-metadata pattern.
- FAQ answers are short, direct and quotable; `FAQPage` schema present on `/faq/`; `Product` schema with AED offer on all 12 products.
- Disclaimer linked from every product page and the footer.

---

## 10 highest-value new pages / sections (one-line briefs)

1. **`/delivery/` — UAE delivery & cash on delivery.** Fee under 250 AED, free threshold, next-day cut-off, emirates covered, courier name, COD rules; the page every "crystal bracelet dubai delivery" and pre-checkout shopper looks for.
2. **`/returns/` — Exchanges & returns.** 14-day size swap, refund position, damaged-on-arrival, who pays courier, how to start (WhatsApp/email); required trust page for a rater and for Shopify payment providers.
3. **`/about/` rebuild — "Made by [name] in Dubai".** Founder name + real photo + since when + stone origins by country + the sourcing/stringing/cleansing steps already written; add `Organization`/`Person` schema and a `/contact/` block (WhatsApp, email, hours).
4. **Guide: "Crystal bracelets traditionally worn for calm and stress" (`/guides/crystal-bracelets-for-calm/`).** Targets "crystal bracelet for anxiety dubai" without using the word in the claim: amethyst, rose quartz, moonstone; which wrist; The Calm Stack; 5 Q&As; links Still Mind/Tender Heart.
5. **Guide: "Which wrist do you wear a crystal bracelet on?"** The FAQ answer expanded to 500 words with a left/right table by intention; one of the most-asked crystal questions and the site already owns the best short answer.
6. **Guide: "How to tell if a crystal bracelet is real"** — cold-to-touch, weight, no two beads alike, dye test, glass vs stone, heat-treated citrine; turns the brand's "natural, undyed" promise into a citable checklist.
7. **`/gifts/` — Crystal bracelet gifts in Dubai.** By occasion (birthday, Eid, Mother's Day, bridesmaid, new job, new baby), by recipient, handwritten card + linen pouch, next-day delivery, gift stacks; "most gifted intention" claim lives here with proof.
8. **Guide: "The seven chakras and their stones"** — one page that supports The Seven and all 16 stone pages' "Chakra" rows, with a stone/chakra/colour/wrist table.
9. **`/men/` — Crystal bracelets for men.** The Anchor, Shield, Guardian; black/matte stones, 8 mm on a larger wrist (size L), no gold accent options; backs the "most-worn men's piece" line with a real landing page.
10. **`/stones/` upgrade — "16 stones at a glance" table + "Which crystals can be worn together" section.** Stone · traditionally worn for · chakra · wrist · water-safe · sun-safe; pairing rules feed the stack builder and give AI engines one dense, citable table.

Honourable mentions: a real reviews section (N03) on home + products; "Crystal bracelet care in Dubai heat" (sun, sweat, perfume — a local angle for `/care/`); a short "Are crystal bracelets halal / cultural note" answer if the owner is comfortable, since it is a common UAE query.

---

## Method notes

- Word counts: `<main>` text only (nav, mega-menu and footer removed), so they are lower than `raw/parsed/*.json` `word_count`, which includes chrome.
- Boilerplate ratio: lines of ≥ 4 words shared verbatim across pages of the same type.
- Readability: Flesch Reading Ease computed on the same `<main>` text; sentences of ≥ 3 words.
- Claims scan: 35-term vocabulary (cure/heal/treat/relieve/anxiety/depression/insomnia/pain/stress/therap*/medic*/proven/scientif*/detox/immune/hormon*/fertility/menstrua*/guarantee/prevent/…) over raw HTML and main text; every hit reviewed in context.
- Metadata templating: `metadata_template.py` from the seo skill over all 46 title/description pairs.
- Live site was not fetched; everything is from the pre-fetched crawl of 2026-09-15. `NEEDED.md` was read for status only; no site source was modified.
