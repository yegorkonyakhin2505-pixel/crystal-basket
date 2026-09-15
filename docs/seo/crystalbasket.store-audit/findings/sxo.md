# Search Experience (SXO) Review — crystalbasket.store

## SXO Gap Score: **40 / 100**

This score is separate from the SEO Health Score. Higher means the pages are closer to what Google rewards for these queries and what a shopper needs in order to buy.

- **Audit date:** 2026-09-15.
- **Page evidence:** pre-fetched HTML of all 46 URLs (`raw/pages/`, `raw/parsed/`) and `raw/home-render.json` (`mode_used: raw`, `is_spa: false`, so the raw DOM is the rendered DOM). Also the mobile and desktop screenshots in `screenshots/`, plus `NEEDED.md`, `docs/LAUNCH.md` and `apps/web/src/lib/site.ts`, read only.
- **SERP evidence:** live WebSearch on 2026-09-15 for 7 target queries plus 3 supporting queries. The 6 ranking UAE competitors were benchmarked with WebFetch.
- **Scope:** copy findings are **not** repeated from `content.md`. Where a gap overlaps, this report cites that file's finding number and adds only the experience angle.
- No website source was modified.
- **In-progress note:** at the time of writing, the uncommitted working tree (not deployed, not made by this audit) already adds `flags.whatsapp: false` with an email fallback (`lib/contact.ts`) and `site.deliveryFeeAED: 25` for product pages and a `/delivery/` page. These would partly close gaps 1 and 3 once shipped. This report scores the live site as crawled.

---

## 0. Headline

**The money pages are the right type. The discovery pages, and every path that leaves the "Add to bag" button, are not.**

**Money pages.** For the commercial queries ("crystal bracelets Dubai", "rose quartz bracelet UAE", "chakra bracelet Dubai") Google rewards UAE crystal-store homepages, collection grids and product pages. Crystal Basket has all three and they are structurally sound.

**The mismatches:**
1. **CRITICAL: `/stones/amethyst/`.** The title is "Amethyst bracelet meaning", but it is a spec card, and 7 of 7 ranking results are long guides.
2. **HIGH: `/intentions/calm/`.** The anxiety SERP is split between guides and collections, so it wants a hybrid "which one is for me" page. It gets one sentence and one actual calm bracelet.
3. **HIGH: no page at all for "gift for her".**
4. **HIGH (for the men's persona): no men's entry.** "Protection" in the UAE SERP largely means evil-eye (nazar) jewellery, which the site never addresses.

**The shopper who does arrive then hits five walls:**
1. Every WhatsApp path, eight distinct jobs, dials the placeholder `971500000000`.
2. There is no proof the shop is real, while ranking rivals show "1,000+ reviews", "Est. 2016" and physical stores.
3. A 25 AED delivery fee first appears at Shopify checkout. After the 15 % stack discount, no three in-stock bracelets can reach the 250 AED free-delivery line.
4. Two of the four "The ones that leave first" pieces are sold out.
5. The gift buyer has no way to add a message except the dead WhatsApp.

---

## 1. SERP evidence by query (observed 2026-09-15)

Page types follow `seo-sxo/references/page-type-taxonomy.md`. For retail I map them as follows:
- **Product (collection):** a grid with prices and buy buttons.
- **Product (PDP):** a single product page.
- **Landing (store home):** a brand homepage.
- **Blog:** a guide or listicle.

| # | Query | Top results observed (type) | Consensus | Best Crystal Basket page | Severity |
|---|---|---|---|---|---|
| 1 | crystal bracelets Dubai | Swarovski UAE sale grid (collection, fashion "crystal") · Neon Star crystal-bracelets (collection) · Mokshabay category (collection) · Spiritual Sootsayer, Raw Spiritual, Holly Holistic, OOAK Stones, Maison de Crystals, Rocksology (6 store homes) · Rocksology bead-bracelets (collection) | **Landing/store home 60 %, collection 40 %**. 9/10 are UAE specialists, 0 marketplaces, 0 guides | `/` and `/shop/` | **ALIGNED type, MEDIUM gap.** Winners put "Healing Crystals … Dubai, UAE" in titles and lead with trust (Holly Holistic "Dubai's #1 … Est. 2016"; Neon Star "FREE 2 HOUR DELIVERY IN DUBAI"). Our home leads with "Energy you can wear." (title/H1 copy: see content F10) |
| 2 | crystal bracelet for anxiety UAE (+ "which crystal bracelet is best for anxiety") | Etsy "Anxiety Relief Crystal Bracelet" (PDP) · Urja by Zariin, Keeta, Nirvana "Top 7" (3 guides) · InJewels "Calmness + Anxiety", Be An Infinite Warrior, Orvel "Anti Anxiety" (3 collections) · Tarah "Best crystal bracelet for anxiety" (PDP) · Maison de Crystals, Alpine Crystals (2 homes) | **Product/collection 50 %, guide 33 %, home 17 %.** Google is hedging, so the winning type is **Hybrid** (a collection that answers "which stone"). Guides name amethyst and rose quartz first and add "see a doctor if…" caveats | `/intentions/calm/` | **HIGH mismatch.** Thin collection vs hybrid expectation |
| 3 | protection bracelet UAE | Amazon.ae red-rope amulet (PDP) · Noon men's bracelets, Noon women's bracelets, Namshi bracelets (3 marketplace grids) · Spiritual Sootsayer bracelets (collection) · Urban + Mystic protection bracelet (PDP) · Three Phase UAE "I tested the triple protection bracelet" (review) · Blushield EMF press release | **Product/collection 75 %, marketplaces 50 %.** Intent is fractured: amulet/nazar, generic men's bracelets, crystal "triple protection", EMF. Companion query "evil eye bracelet Dubai protection" returned **10/10 evil-eye pages** (Galeries Lafayette, Noon, Piece of You, 2 Birds Dubai) | `/intentions/protection/` | **ALIGNED type, MEDIUM intent gap.** Never says whether this is or is not an evil-eye bracelet; no men's framing |
| 4 | amethyst bracelet meaning | crystals.com (~2,000 words, 7 H2s, author + date, shop CTAs) · Chibuntu · Element 79 · Eclore · JW Patronus · Healing Sounds · Kaashir (**7 retailer blog guides**) | **Blog 100 %.** Retailers win with guides that embed products | `/stones/amethyst/` (title "Amethyst bracelet meaning") | **CRITICAL mismatch.** The title promises a guide; the page is a spec card, and on mobile its second screen is a gradient sphere, not the stone |
| 5 | rose quartz bracelet UAE | Noon ×3, Cartlow, Maison Etherique, Nomadic Camel (6 PDPs) · Holly Holistic rose-quartz, Moon Magic, UNICEF Market, Rose Quartz Store (4 collections) | **Product 100 %**, UAE marketplaces 40 %. Noon from ~AED 120 with COD, same-day, BNPL, free returns; Holly Holistic AED 35–399 | `/products/the-tender-heart/` (65 AED) | **ALIGNED.** `/stones/rose-quartz/` competes for the same term (LOW) |
| 6 | chakra bracelet Dubai | Noon 7-chakra (PDP, ~AED 41) · Azar Stone, Eternity Dubai, Divine Sansar (PDPs) · Walmart, UNICEF, Golden Lotus Mala, Buddha Blossom (collections) · Divine Sansar seven-chakras guide | **Product 89 %**, guide 11 % | `/products/the-seven/` (75 AED) | **ALIGNED** |
| 7 | crystal bracelet gift for her UAE | Swarovski "Gifts for her" (collection: same-day, free gift wrap, BNPL) · Noon "gift for girlfriends" (PDP) · Swarovski sale, Ted Baker, Neon Star, Rocksology (collections) · Party Centre favours (PDP) · Raw Spiritual (home) · Divine Sansar "Can crystal bracelets be gifted?" (2,000+ word UAE gifting guide, 9-question FAQ) | **Product/collection 80 %**, home 10 %, guide 10 % | none. `gift` exists only as a hidden catalog tag | **HIGH: no page targets the intent** |

**Supporting queries:**
- **"crystal bracelets for men Dubai black obsidian tiger eye"** (7/8 product): 5 Amazon "triple protection" sets (tiger's eye + obsidian + hematite, often 10 mm), Divine Sansar "Can Men Wear Crystal Bracelets? Guide for Men in UAE", and The Green Crystal men's tiger-eye category.
- **"how to tell if crystal bracelet is real or fake":** 9/9 guides. A strong **skepticism** signal. Several say "extremely cheap crystal bracelets are often fake", which matters for a 65 AED price point (gap 6).

**Cross-query observations:**
1. **Store homepages rank for the head term.** For "crystal bracelets Dubai", 6 of 10 winners are brand homepages, so the home page is a primary ranking asset, not only `/shop/`.
2. **"Crystal" is ambiguous.** Swarovski UAE ranks #1 for "crystal bracelets Dubai" and "gift for her". The site's own trust line "Never dyed, never glass" is the right self-selector and should be visible in search snippets, not only in the home trust band.
3. **Marketplaces own the stone-name product queries.** Noon, Amazon.ae and Cartlow take 40–50 % of the rose quartz and protection results. They compete on COD, same-day delivery, BNPL and ratings, not on meaning, so a specialist wins on proof and guidance.
4. **The informational layer belongs to retailer blogs, not publishers.** Every "meaning" and "which one" result is a shop's guide with embedded products. That is exactly the hybrid format the stone and intention templates could become.

---

## 2. Page-type alignment summary

| Site page type | Count | Target intent | Match | Severity |
|---|---|---|---|---|
| Home `/` | 1 | Store home for "crystal bracelets Dubai" | Type aligned; trust/local proof missing | MEDIUM |
| Shop `/shop/` | 1 | Collection | Aligned | LOW (experience gaps below) |
| Product `/products/*` | 12 | PDP for stone/chakra product queries | Aligned (price, size, Add to bag, Product schema) | LOW–MEDIUM |
| Stacks `/stacks/` | 1 | Sets/bundles | Aligned, but curated stacks cannot be added to bag (gap 1) | MEDIUM |
| Stone `/stones/*` | 16 | "X bracelet meaning" → Blog/Hybrid | Spec card titled "meaning" | **CRITICAL** |
| Intention `/intentions/*` | 8 | "crystal bracelet for anxiety/protection" → Hybrid/collection | Thin collection; calm = 1 primary product | **HIGH** (calm), MEDIUM (protection) |
| Gift | 0 | "gift for her UAE" → collection + guide | Missing | **HIGH** |
| Men | 0 | "crystal bracelets for men / protection" → collection | Missing (Style filter only) | **HIGH** for persona P4 |

---

## 3. What the ranking UAE competitors show a shopper

These are the rivals that actually outrank the site for these queries. Details come from WebFetch summaries of each page, so treat them as indicative.

| Signal | **Crystal Basket** | Raw Spiritual (PDP) | Holly Holistic (home) | Rocksology (collection) | Divine Sansar (PDP) | Neon Star (collection) | Maison de Crystals (home) |
|---|---|---|---|---|---|---|---|
| Reviews / proof | none | 1,159 reviews, "Rated 4.8/5 … Loved by 30,000+" | "200+ reviews", 5.0, "Est. 2016", Al Quoz store | Yas Mall store, "Lifetime Warranty" | "100% Authentic", "Easy Returns" badges | none | none |
| Single-bracelet price | 65–105 AED | 149 AED | 35–399 AED (rose quartz) | 149–340 AED, strike-through sale prices | 99 AED (was 125) | 125 AED | 61–275 AED |
| Free delivery from | 250 AED (fee 25 AED shown only at checkout) | 99 AED | 500 AED | always free | 30 AED | free 2-hour in Dubai | 75 AED |
| Speed promise | "Next-day across the UAE" (no cut-off) | Same-day +15 AED if ordered before 10 AM; 1–2 days standard | not stated | not stated | 2–7 business days | 2 hours (Dubai) | 1–2 business days |
| Gifting | Pouch + card listed in accordion; message only via WhatsApp | Gift box 5.99 AED + free greeting card with message | none visible | none | "Is this a gift?" note field + gifting guide | none | none |
| Sizing | S/M/L to an 18.5 cm wrist; custom via WhatsApp | S/M/L to 21 cm + "Add 1–1.5 cm to your wrist" | — | "customizable … to fit your wrist" | stretch, "fits most" | — | — |
| BNPL | none (Tabby/Tamara pending) | Tabby, Tamara, Apple Pay | none | Tabby | Tabby | none | none |
| WhatsApp | placeholder number | yes | real number | real number | 2 numbers + hours | real number | real number |
| Men | Style filter "Men's" (2 items) | — | none | Men's / Women's / Kids | men's guide | — | ring styles only |

**Reading:** Crystal Basket is the **cheapest specialist** in this set and the only one offering COD with next-day delivery at no advertised extra fee. It is also the only one with **no working WhatsApp**, **no proof** and the **highest free-delivery threshold** except Holly Holistic, whose threshold comes with a store and a decade of reviews.

---

## 4. User stories (derived from observed SERP signals)

1. **Awareness → decision.** As an **anxious first-time buyer**, I want to know which stone people wear for a racing mind and which bracelet holds it, because I want something calming I can touch today, but I'm blocked by **not knowing whether crystal claims are honest or whether this shop is real**.
   *Signals: guides "best crystal bracelets for stress relief and anxiety" (Urja, Keeta, Nirvana) naming amethyst and rose quartz first; Etsy/Orvel "anxiety relief" listings; 9/9 "real or fake" guides; SERP caveats "a doctor or mental health professional can help".*
2. **Decision.** As a **gift buyer**, I want a meaningful bracelet that arrives in time, gift-ready with my message, in a size that fits someone I can't measure, because the occasion is fixed, but I'm blocked by **no gift-message option, no delivery cut-off and no "don't know her size" guidance**.
   *Signals: Swarovski "Gifts for her" (same-day, free gift wrap); Raw Spiritual gift box + free greeting card, same-day before 10 AM; Divine Sansar "Is this a gift?" note field and UAE gifting guide.*
3. **Consideration.** As a **crystal-literate collector**, I want to verify the stone, grade, origin and treatment and see the actual strand, because marketplace listings at ~41 AED make me suspect dye and glass, but I'm blocked by **a one-sentence stone page, generated imagery and no origin data**.
   *Signals: 7/7 "amethyst bracelet meaning" results are ~2,000-word retailer guides; Noon 7-chakra ~AED 41 vs specialists at 99–149 AED; Maison de Crystals chakra/zodiac navigation.*
4. **Consideration → decision.** As a **men's protection buyer**, I want a dark, minimal protection bracelet that fits an 18–20 cm wrist and reads as masculine, because I'd wear it to work and when travelling, but I'm blocked by **no men's entry point, a gold accent on the flagship protection piece, sizes that stop at 18.5 cm, and no answer to "is this an evil-eye bracelet?"**
   *Signals: 10/10 evil-eye results for "evil eye bracelet Dubai protection"; Amazon "triple protection" tiger eye/obsidian/hematite sets; "Can men wear crystal bracelets? Guide for men in UAE"; Rocksology Men's filter.*
5. **Consideration.** As a **Dubai shopper comparing specialist stores**, I want delivery cost, speed and proof at a glance, because I have five local tabs open, but I'm blocked by **a free-delivery banner whose real fee only appears at checkout, and zero reviews next to rivals showing 200–1,000+**.
   *Signals: 6/10 store homepages for "crystal bracelets Dubai" leading with "#1", "Est. 2016", "FREE 2 HOUR DELIVERY"; Noon/Amazon listings advertising COD, same-day and free returns.*

---

## 5. SXO Gap Score breakdown

| Dimension | Score | Evidence |
|---|---|---|
| Page type | **8 / 15** | Store home, collection, 12 PDPs and a stack builder match the commercial SERPs (queries 1, 5, 6). Stone pages are a CRITICAL mismatch for "meaning" (7/7 guides). Calm is a HIGH mismatch (hybrid SERP). There is no gift page (80 % collection SERP) and no men's page. |
| Content depth | **6 / 15** | PDPs answer buying questions (bead count per size, cord, box, care exceptions, 14-day swap). Stone pages and the calm page are far below the ~2,000-word guides they compete with (depth detail in content F5; not repeated). |
| UX signals | **7 / 15** | **Positives:** desktop buy box above the fold (price, S/M/L with cm ranges, "Between sizes? Go up", Add to bag, COD and delivery bullets); filters by intention, stone, style and price; stack builder with live total. **Negatives:** 8 WhatsApp jobs dead-end; mobile PDP first screen has no name, price or CTA; popup plus sticky email bar on mobile; search icon overlaps the wordmark on every mobile page; sold-out pieces in slots 2 and 4; delivery fee hidden until checkout; curated stacks have only a WhatsApp CTA. |
| Schema | **6 / 15** | Product with AED offer on 12 PDPs and FAQPage on `/faq/`. No Organization, BreadcrumbList, shippingDetails, hasMerchantReturnPolicy or ItemList (full detail in `schema.md`). |
| Media | **5 / 15** | 1–2 images per product, all AI placeholders (N05). No on-wrist shot per size or on a man's wrist, no video. Stone pages show a gradient sphere instead of the stone. Rivals show multiple real angles. |
| Authority / trust | **3 / 15** | Zero reviews (`flags.reviews: false`), no named maker, no address, placeholder phone. Checkout hands off to an unbranded Shopify page (`LAUNCH.md`: "Checkout branding ⏳", custom checkout domain not set). Card statement reads "AMPLIFY MKTG MGMT". Rivals: 1,159 reviews, "Est. 2016", physical stores. Honest disclaimer and "we do not promise the stones will change your life" are real positives. |
| Freshness | **5 / 10** | Site rebuilt 14 Sep 2026 and a "New in" sort exists. The FAQ still says card payments are "coming soon" (content F12), there are no dates anywhere, and sold-out pieces carry no restock timing. |
| **Total** | **40 / 100** | |

---

## 6. Personas and page scores

**Pages scored:**
- Home `/`
- Shop `/shop/`
- Product `/products/the-guardian/` (95 AED, black tourmaline + hematite, 14k gold-filled accent, unisex)
- Intention `/intentions/calm/`
- Stone `/stones/amethyst/`

These give each persona at least one page aimed at them. `/intentions/protection/` is scored as a supplement for P4.

**Weights** are estimated from SERP share and the owner's audience (mostly women): P1 35 %, P2 25 %, P3 20 %, P4 20 %.

### P1 — Anxious first-time buyer (weight 35 %)
- **Situation:** woman, 25–40, Dubai, first crystal purchase. Searched "crystal bracelet for anxiety" / "which crystal bracelet is best for anxiety".
- **Goal:** the one bracelet traditionally worn for a loud mind; confidence that it is real stone and a real shop; pay cash when it arrives.
- **Emotional state:** skeptical but hopeful. **Journey:** awareness → decision in one session.
- **Key questions:** Which stone, which bracelet? Is this shop legit? What if it doesn't fit?
- **SERP evidence:** anxiety guides naming amethyst and rose quartz; "anxiety relief" listings; 9/9 "real or fake" guides.

| Page | Score | Reason |
|---|---|---|
| Home | **5/10** | The Calm tile is in the first scroll, and the trust band ("Never dyed, never glass. Variation is proof." · COD · next-day) speaks to her. Nothing proves the shop is real (no review, no named maker), the popup interrupts after about 3 s, and 2 of 4 "The ones that leave first" are sold out. |
| Shop | **4/10** | The Intention filter reaches Calm in two taps. But she then faces 12 equal choices with no "start here" and no ratings, and "Recommended" puts sold-out The Devotion second. |
| Product (Guardian) | **4/10** | Not her intention, though the trust scaffolding is the best on the site: "Natural, undyed, A-grade", 14-day swap, COD, disclaimer. Her natural next step, "Order on WhatsApp" to ask "this or amethyst?", reaches a dead number. |
| Intention (Calm) | **3/10** | Her landing page for the query. Home promised "Calm · 4 bracelets"; the page shows one calm piece (The Still Mind) plus three "Related" pieces, one of them sold out. It doesn't say why amethyst, doesn't link the 174 AED Calm Stack, and has no honest "what crystals can and can't do" box. |
| Stone (Amethyst) | **4/10** | The first sentence answers her question ("traditionally worn to quiet an overactive mind"), and the water/sun rows are practical. On mobile the next screen is a gradient sphere, and there is no route to Calm or the stack. |

### P2 — Gift buyer (weight 25 %)
- **Situation:** buying for a wife, sister, friend or mother (birthday, Eid, UAE Mother's Day on 21 March). Searched "crystal bracelet gift for her UAE".
- **Goal:** a meaningful piece that arrives on time, gift-ready with a message, in a size that fits someone they can't measure.
- **Emotional state:** time pressure, evaluating carefully. **Journey:** consideration → decision.
- **Key questions:** Will it arrive by the date? Can I add a message and hide the price? What size if I don't know hers? Can she swap it?
- **SERP evidence:** Swarovski gift wrap + same-day; Raw Spiritual gift box + greeting card; Divine Sansar gift note field + UAE gifting guide.

| Page | Score | Reason |
|---|---|---|
| Home | **5/10** | Stacks with strike-through set prices (174 vs 205 AED) and "next-day across the UAE" suit a gift. There is no Gifts door, no delivery cut-off, and the pouch and meaning card appear nowhere on the home page. |
| Shop | **4/10** | The intro says "Whether you are gifting or treating yourself…", then offers no gift filter, although 5 products carry a `gift` tag in catalog JSON. The only piece tagged gift + new, The Devotion, sits sold out in slot 2. |
| Product (Guardian) | **4/10** | "What's in the box" (linen pouch, meaning card) makes it giftable but is hidden in an accordion. Size M is preselected with no "don't know her size?" help. There is no gift-message field in the bag (`CartDrawer.tsx` has only "Delivery and discount codes are applied at checkout"), no arrival date, and a unisex protection piece is a weak "for her" pick. |
| Intention (Calm) | **4/10** | "The most gifted intention in our basket" is written for this persona, then shows one product and no link to the Calm Stack. |
| Stone (Amethyst) | **3/10** | The Zodiac row (Pisces, Aquarius, Virgo) is a real gift hook, but amethyst is not framed as the February birthstone and there is no gift CTA. |

### P3 — Crystal-literate collector (weight 20 %)
- **Situation:** owns several stones, knows chakras, shops Holly Holistic and Instagram sellers. Searched "amethyst bracelet meaning", "rose quartz bracelet UAE", "chakra bracelet Dubai".
- **Goal:** a genuinely good strand at a fair price, verified for grade, origin and treatment.
- **Emotional state:** evaluating carefully, wary of dyed or glass beads. **Journey:** consideration.
- **Key questions:** Where is it from, is it treated, what grade? Can I see this strand? Other bead sizes?
- **SERP evidence:** 7/7 guides for "meaning"; chakra/zodiac navigation at Maison de Crystals; Noon 7-chakra at ~41 AED setting a "cheap = fake" frame.

| Page | Score | Reason |
|---|---|---|
| Home | **4/10** | "Never dyed, never glass" is her language. But the imagery reads as generated, no origins are given, and the whole range is 12 bracelets in one bead size. |
| Shop | **5/10** | The Stone filter over 16 stones is exactly how she browses. There is no chakra or zodiac filter and no bead-size choice. |
| Product (Guardian) | **6/10** | The best page for her: A-grade undyed, approximate bead count per size, 1 mm cord, chakra, zodiac, and a stone-specific warning ("Hematite does not like water"). Still missing: origin, real photos of this strand, weight, and a 6 or 10 mm option. |
| Intention (Calm) | **3/10** | Nothing she doesn't already know, and one amethyst piece. |
| Stone (Amethyst) | **3/10** | The title says "meaning"; the page delivers a spec card. The mobile hero is a gradient sphere rather than amethyst, and there is nothing on origin, heat treatment or how to spot fakes. Competing guides run about 2,000 words. |

### P4 — Men's protection buyer (weight 20 %)
- **Situation:** man, 25–45, Dubai, office and travel. Searched "protection bracelet UAE", "black obsidian tiger eye bracelet men".
- **Goal:** a dark, minimal bracelet that reads as protective and fits an 18–20 cm wrist.
- **Emotional state:** evaluating carefully, slightly self-conscious ("Can men wear crystal bracelets?" ranks). **Journey:** consideration → decision.
- **Key questions:** Is this for men? Will it fit my wrist? Any gold on it? Is this an evil-eye bracelet?
- **SERP evidence:** 10/10 evil-eye pages; Amazon "triple protection" sets; men's guide and men's filter at UAE rivals.

| Page | Score | Reason |
|---|---|---|
| Home | **3/10** | The hero is a woman's wrist with clear quartz, and gold accents and pastel tiles dominate. His only door is "Protection · 4 bracelets"; there is no Men in the nav. |
| Shop | **5/10** | Style → "Men's" exists, but the filter is an exact match (`t.style === id` in `FilterBar.tsx`) and returns 2 of 12 (The Shield, The Anchor). The Lionheart (tagged `men`, no gold) and The Guardian are style `unisex`, so they are hidden from Men's. Picking "Unisex" hides the men's pieces in turn. |
| Product (Guardian) | **5/10** | Right intention and dark stones, close to the "triple protection" pattern he saw on Amazon. But it has a 14k gold bead, L stops at "17–18.5 cm wrist" (custom lengths go to the dead WhatsApp), and there is no man's wrist in the photos. |
| Intention (Calm) | **2/10** | Not for him; the "Other intentions: Protection" chip is his only exit. |
| Stone (Amethyst) | **2/10** | Not his stone, and no route to black tourmaline, obsidian or hematite. |
| *Supplement: `/intentions/protection/`* | *4/10* | *The right page: The Shield (65 AED, style men) and The Guardian. It never says whether this is or isn't an evil-eye bracelet, has no men's framing, shows sold-out The Aurora in "Related", and doesn't link the Protection Stack.* |

### Score matrix (0–10)

| Page | P1 Anxious | P2 Gift | P3 Collector | P4 Men's protection | Page average |
|---|---|---|---|---|---|
| Home | 5 | 5 | 4 | 3 | 4.3 |
| Shop | 4 | 4 | 5 | 5 | 4.5 |
| Product (The Guardian) | 4 | 4 | 6 | 5 | 4.8 |
| Intention (Calm) | 3 | 4 | 3 | 2 | 3.0 |
| Stone (Amethyst) | 4 | 3 | 3 | 2 | 3.0 |
| **Persona average** | **4.0** | **4.0** | **4.2** | **3.4** | |

### Persona totals (4-dimension rubric, site-level across the five pages), weakest first

| Persona | Relevance | Clarity | Trust | Action | Total | Rating |
|---|---|---|---|---|---|---|
| P4 Men's protection buyer | 9/25 | 11/25 | 9/25 | 10/25 | **39/100** | Critical mismatch |
| P2 Gift buyer | 11/25 | 12/25 | 9/25 | 8/25 | **40/100** | Needs work |
| P1 Anxious first-time buyer | 14/25 | 11/25 | 8/25 | 11/25 | **44/100** | Needs work |
| P3 Crystal-literate collector | 12/25 | 15/25 | 9/25 | 13/25 | **49/100** | Needs work |
| **Weighted average** | | | | | **43/100** | |

**Weakest persona: P4 (39).**
- **Top issue:** no door. The Men's filter shows 2 of 12, sizes stop at 18.5 cm, and nothing separates crystal protection from nazar.
- **Fix:** gap 10.

**Biggest weighted opportunity: P1** ((100 − 44) × 0.35 = 19.6), ahead of P2 (15.0), P4 (12.2) and P3 (9.8). Trust and proof work (gaps 1–3) should therefore ship before the men's page, even though P4 scores lowest.

**Systemic issues:**
- **Trust** is the lowest dimension for every persona (8–9/25). No reviews, no named maker, placeholder WhatsApp and an unbranded checkout hurt all four.
- **Action** collapses wherever the path leaves "Add to bag": gift message, custom size, sold-out hold, curated stack, restring and exchange all route to WhatsApp.

---

## 7. Top 10 experience gaps (evidence → fix)

Owner tags: **[Owner]** needs information or a decision from the owner · **[Dev]** component or template change · **[Content]** catalog JSON or page copy · **[Shopify]** admin setting.

### Gap 1 · CRITICAL — WhatsApp is the only path for eight jobs, and the number is a placeholder
**Evidence.** `site.ts` `whatsapp: "971500000000"` (N01). The number is used for:
1. Header "WhatsApp us" on every page.
2. "Order on WhatsApp" on all 12 PDPs.
3. Sold-out "Tell me when it's back" plus "Message us and we will hold one for you" (`/products/the-aurora/`, `/products/the-devotion/`).
4. **The three curated stacks on `/stacks/`, whose only CTA is "Order on WhatsApp".** The page has exactly one "Add stack to bag", in the builder.
5. Builder "Mixed sizes? Order on WhatsApp and tell us".
6. `/size-guide/` "Need a custom length? Message us on WhatsApp".
7. FAQ gift wrap: "Add a note in the WhatsApp order and we will include a handwritten card".
8. FAQ restring "Message us on WhatsApp" and exchange "Send us your wrist measurement first".

Every ranking UAE rival in section 3 shows a working number, two of them with hours. (content F1 covers the placeholder; this gap is about the eight jobs that have no fallback.)

**Fix.**
1. **[Owner]** Supply the number (N01). This single change unblocks P1's question, P2's gift note and P4's custom size.
2. **[Dev]** Until then, keep WhatsApp dark behind a flag and give each job a non-WhatsApp route:
   - Curated stack card → "Add stack to bag · size M" (the builder already builds this cart) plus "Change sizes in the builder →" deep-linking `/stacks/?stack=calm`.
   - Sold-out → `mailto:hello@crystalbasket.store?subject=Hold The Aurora for me (size M)`.
   - Custom length → a "Custom length (cm)" line-item attribute on the cart line.
   - Gift note → cart note (gap 7).
   - Exchange and restring → a `/returns/` page with email (content F2).
3. **[Dev]** When the number exists, pre-fill context: the product, the selected size and the page URL are already in the order message; add them to the header "WhatsApp us" message too.

### Gap 2 · CRITICAL — No proof the shop is real, in a SERP where rivals lead with proof
**Evidence.**
- **No proof on site.** Zero reviews (`flags.reviews: false`; N03 notes the sample quotes were invented), no named maker, no address, yet "Bestseller" badges (content F3/F4).
- **The rivals lead with proof.** Raw Spiritual: "Rated 4.8/5 based on 1,000+ Reviews · Loved by 30,000+ · Money-Back Guarantee". Holly Holistic: "200+ reviews", "Est. 2016", store in Al Quoz. Rocksology: Yas Mall store, "Lifetime Warranty".
- **Experience-only trust breaks the content audit could not see:**
  1. **Mobile header defect.** On every mobile screenshot (home, shop, product, stone) the search icon sits on top of the wordmark ("CRYSTAL BASK[search]T"). The first screen looks broken.
  2. **Unbranded checkout.** Checkout hands off from crystalbasket.store to an unbranded Shopify checkout; `LAUNCH.md` lists "Checkout branding (logo, colours) ⏳" and the checkout custom domain as not done.
  3. **Unfamiliar card descriptor.** `LAUNCH.md` records the Stripe descriptor as "AMPLIFY MKTG MGMT". A first-time buyer who sees an unfamiliar name on the statement is a chargeback risk, and nothing on the site warns them.

**Fix.**
1. **[Owner]** Ask the first 10 buyers for a one-line review with first name and emirate, and turn on the hidden Testimonials section with honest counts only (N03).
2. **[Content]** Meanwhile add proof that already exists: a "Made by [first name] in Dubai" strip with one real photo of her stringing (content F3 has the copy), and 6 real Instagram posts or DMs shown with permission.
3. **[Dev]** Fix the mobile header overlap.
4. **[Shopify]** Apply checkout branding (logo, `cb` colours) and connect `shop.crystalbasket.store` as the checkout domain.
5. **[Content]** Add under the Checkout button and in the FAQ: "Secure Shopify checkout · card or cash on delivery". If the descriptor cannot become "CRYSTAL BASKET", add "Card payments appear as AMPLIFY MKTG MGMT on your statement" to the FAQ and the order confirmation.

### Gap 3 · HIGH — Delivery: the fee appears only at checkout, and free delivery is out of reach for stacks
**Evidence.**
- **The fee is hidden until checkout.** Announcement bar on every page: "Free UAE delivery over 250 AED". PDP bullet: "Next-day delivery across the UAE. Free over 250 AED." Cart drawer: "Delivery and discount codes are applied at checkout." The 25 AED fee under 250 AED is set in Shopify (`LAUNCH.md`, N13) and first shown at checkout.
- **The threshold is out of reach.**
  - Two in-stock bracelets top out at 105 + 95 = **200 AED**.
  - Shopify evaluates price-based rates on the **post-discount** subtotal, and the automatic stack discount takes 15 %. The most expensive in-stock trio (105 + 95 + 75 = 275) therefore becomes **233.75 AED**.
  - The curated stacks come to **217 / 174 / 200 AED**.
  - **Every stack buyer pays delivery**, while the stack page implies a set is the smart buy.
- **Small orders pay a large fee.** A single 65 AED bracelet becomes 90 AED at checkout (+38 %).
- **Rivals set a much lower bar.** Free delivery from AED 30 (Divine Sansar), 75 (Maison de Crystals), 99 (Raw Spiritual), always (Rocksology), 2-hour free in Dubai (Neon Star).
- **"Next-day" has no cut-off time, and the courier account is still ⏳** in `LAUNCH.md` (copy accuracy in content F12).

**Fix.**
1. **[Owner/Shopify]** Choose one:
   - (a) lower the free threshold to **150 AED**, so every curated stack and most pairs qualify; or
   - (b) keep 250 AED but add a "Free delivery on any stack of 3" shipping rule.
2. **[Content/Dev]** Put the real rule next to the price in the buy box ("Delivery 25 AED · free over [X] AED · COD available") and in the cart drawer as a progress line ("Add 85 AED for free delivery").
3. **[Owner]** Once the courier is signed, publish a cut-off: "Order by [2 pm] for next-day in Dubai, Sharjah and Ajman; 1–2 days to other emirates". Until then say "1–2 working days".
4. **[Content]** Add a one-line note in the welcome popup: "WELCOME10 can't be combined with the stack discount" (per `LAUNCH.md`), so the first code a new customer types doesn't disappoint.

### Gap 4 · HIGH — Sizing confidence stops at an 18.5 cm wrist and has no "don't know her size" path
**Evidence.**
- **Three sizes only.** Buy box and `/size-guide/` offer S 14–15.5 · M 15.5–17 · L 17–18.5 cm wrist. Anything larger is "Message us on WhatsApp" (dead, gap 1).
- **M is preselected on the PDP** (desktop screenshot shows "M · 18 cm" active). A gift buyer who never touches it ships M without deciding, and nothing tells them the 14-day swap exists at that moment. The swap is in the "Delivery & returns" accordion.
- **Rivals size wider and explain more.** Raw Spiritual: S 16–17 / M 18–19 ("Commonly Selected") / L 20–21 cm with "Add 1–1.5 cm to your wrist measurement". Rocksology: "customizable … to fit your wrist".
- **No proof on the wrist.** No on-wrist photo per size, no man's wrist.

**Fix.**
1. **[Owner/Shopify + Content]** Add **XL · 22 cm (18.5–20 cm wrist)** to the men's and unisex pieces.
2. **[Dev]** Under the size tiles: "Buying a gift? M fits a 15.5–17 cm wrist. If it's wrong, we swap it free within 14 days." Label the most-sold size only when the order data supports it.
3. **[Dev]** Put the custom-length request in the cart as a line attribute (gap 1).
4. **[Owner]** Shoot one on-wrist photo per size with the wrist measurement in the caption ("M on a 16 cm wrist").

### Gap 5 · HIGH — Sold-out pieces take prime slots, and their recovery path is dead
**Evidence.**
- **Prime slots.** Home "The ones that leave first" and `/shop/` default "Recommended" both show The Devotion (sold out) in slot 2 and The Aurora (sold out) in slot 4. On mobile `/shop/`, the first product row is The Alchemist next to a "SOLD OUT" Devotion.
- **Related grids.** The Aurora also appears in "Related pieces" on `/intentions/calm/` and `/intentions/protection/`, and in "Worn well together" on `/products/the-still-mind/` and `/products/the-guardian/`.
- **Dead recovery path.** The sold-out CTA "Tell me when it's back" goes to the placeholder number.
- **The data to fix it already exists.** Every grid tile carries `data-stock="0|1"`.
- Cross-references: messaging is content F15; `BackOrder` schema is ecommerce #2.

**Fix.**
1. **[Dev]** Sort `data-stock="0"` last in every grid and exclude sold-out items from "Related pieces" and "Worn well together".
2. **[Content]** Replace the two home bestseller slots with in-stock pieces (e.g. The Guardian, The Still Mind).
3. **[Dev]** On a sold-out PDP make the primary button the closest in-stock alternative: The Devotion → "Shop The Tender Heart · rose quartz · 65 AED"; The Aurora → "Shop The Clear Sight · 75 AED".
4. **[Dev]** Make the secondary action an email "Notify me" that works without WhatsApp: mailto now, Klaviyo back-in-stock once N04 exists.

### Gap 6 · MEDIUM — Price anchoring: the cheapest specialist in the SERP never says so, so a low price reads as risk
**Evidence.**
- **Singles have no reference point.** They cost 65–105 AED with no reference or value framing. Stacks do anchor well: "174 AED 205 AED".
- **Competitor prices in the same SERPs:** Raw Spiritual 149 · Neon Star 125 · Rocksology 149–340 (with strike-through) · Divine Sansar 99 (was 125) · Noon rose quartz from ~120 · Noon 7-chakra ~41.
- **The "real or fake" SERP (9/9 guides) says "extremely cheap crystal bracelets are often fake".** With no reviews (gap 2), 65 AED sits closer to Noon's ~41 than to the specialists and invites that doubt.

**Fix.**
1. **[Content/Dev]** Anchor on value, not invented compare-at prices, with a one-line "What 65 AED buys" under the price: "~23 natural A-grade 8 mm amethyst beads · 14k gold-filled bead · hand-strung in Dubai · free re-string for life". All of these facts are already on the page, split across accordions.
2. **[Dev]** Show stack savings in AED on cards ("Save 31 AED").
3. **[Owner]** Do not add strike-through "was" prices unless they are real. Dubai generally requires a DET promotion permit for advertised discounts; check before running sale pricing.
4. **[Owner]** When Tabby/Tamara are approved (`LAUNCH.md`), show "or 4 payments" only on stacks and 2+ item carts, where the basket size justifies it.

### Gap 7 · HIGH — Gifting has no door and no mechanics
**Evidence.**
- **The data exists but is never exposed.** Catalog JSON tags `gift` on 5 products (The Devotion [sold out], The Fortune, The Seven, The Still Mind, The Tender Heart). No filter, collection or nav item uses the tag.
- **No gift message except WhatsApp.** The only route is the dead WhatsApp (FAQ "Do you gift-wrap?"). The cart drawer has no note field; `lib/shopify.ts` only reads `checkoutUrl` and lines.
- **Gift-readiness is buried.** "Linen pouch" and "Stone meaning & affirmation card" sit inside the "What's in the box" accordion; "Ready to gift" appears only on `/about/`.
- **No delivery date and no "no price in the parcel" option.**
- **SERP winners:** Swarovski "Gifts for her" (free gift wrapping, same-day) · Raw Spiritual gift box 5.99 AED + free greeting card with message · Divine Sansar "Is this a gift? Leave a note" + a UAE gifting guide with a 9-question FAQ.

**Fix.** The `/gifts/` page brief is content #7; below are the mechanics it needs.
1. **[Dev]** Cart gift message: set the Storefront API cart `note` (`cartNoteUpdate`), labelled "Gift message: we handwrite it on the card". Add a "This is a gift: leave the price out of the parcel" checkbox as a cart attribute.
2. **[Dev]** Buy-box bullet above the fold: "Gift-ready: linen pouch + meaning card".
3. **[Content/Dev]** Expose the `gift` tag as a "Gifts" chip in the Style filter and a "Gifts" nav item.
4. **[Content]** Occasion stacks for Eid and UAE Mother's Day (21 March), using the size fallback from gap 4.

### Gap 8 · HIGH — Mobile first screens hide the answer, and two email layers compete for them
**Evidence (screenshots).**
- **Product.** `products-the-alchemist/mobile.png`: the whole first viewport is breadcrumb, packshot, on-wrist tile and affirmation card, with **no H1, no price and no Add to bag**, and a sticky "Email · SUBSCRIBE" bar covering the bottom.
- **Popup.** `product-mobile-5s-popup.png`: a full-screen "10% off your first bracelet" modal covers the page while the bar stays behind it. Per the recent commit it returns on every new visit after 3 s.
- **Shop.** `shop-mobile-1500ms-after-idle.png`: the intro hero fills the first screen, and the first product row starts at the fold, one of them sold out.
- **Stone.** `stones-amethyst/mobile.png`: H1 and one sentence, then a gradient sphere filling the next screen.
- For comparison, the desktop PDP puts name, price, sizes and CTA above the fold. Technical M6 covers the interstitial risk; this gap is about what each persona sees first.

**Fix. [Dev]**
1. **Mobile PDP order:** packshot → H1 + price → size tiles → Add to bag → delivery/COD/gift bullets. Move the on-wrist tile and affirmation card below the buy box.
2. **One email layer at a time:** hide the bar while the popup is eligible. Show the popup after the second page view or 50 % scroll, never on a PDP before the first add-to-bag.
3. **Shop hero:** cap at about 35 % of the viewport on mobile.
4. **Stone pages:** put "Bracelets with Amethyst" directly under the intro and replace the sphere with a real bead macro once photography exists (N05).

### Gap 9 · CRITICAL (stone) / HIGH (calm) — Discovery pages are the wrong type for their queries
**Evidence.**
- **Amethyst.** "amethyst bracelet meaning" = 7/7 retailer guides (crystals.com: ~2,000 words, 7 H2s, author and date, product CTAs throughout). `/stones/amethyst/` is H1 + one sentence + spec rows + 2 product cards.
- **Calm.** The anxiety SERP is split 50 % product/collection, 33 % guide. `/intentions/calm/` shows 1 primary product and 3 "related", one sold out. The home tile says "Calm · 4 bracelets" because the count includes secondary intentions.
- **Wording.** The winning pages use the word "anxiety"; the house rule avoids claims (content F7).
- Depth and copy detail: content F5, F7, F8.

**Fix. [Dev template + Content]**
1. **Stone template → Hybrid:**
   1. Answer box (the existing first sentence).
   2. "Bracelets with [stone]" strip.
   3. Meaning, chakra and which-wrist sections.
   4. "Real or dyed? How to check" (feeds P3 and the 9/9 skeptic SERP).
   5. Care rows linking `/care/`.
   6. 3 Q&As.
2. **Calm → Hybrid "start here" chooser above the grid:**
   - "Racing thoughts → The Still Mind (amethyst, 65 AED)"
   - "Heavy heart → The Tender Heart (rose quartz, 65 AED)"
   - "Want both, plus balance → The Calm Stack (174 AED)"
3. **Honest box.** Add an H2 in question form, "Is there a crystal bracelet for anxiety?", answered in the house voice: "Crystals are traditionally worn as a reminder to slow down; they are not a treatment. If anxiety is affecting daily life, please speak to a doctor." This matches the query and the SERP's own caveat without making a claim.
4. **Home tile counts.** Count primary-intention pieces only, or label them "1 bracelet + 3 that pair".

### Gap 10 · HIGH (P4) — The men's protection buyer has no door, and "protection" is ambiguous in the UAE
**Evidence.**
- **The SERP.** "evil eye bracelet Dubai protection" returned 10/10 evil-eye pages, and "protection bracelet UAE" is 50 % marketplaces (amulets, Noon men's bracelets). "crystal bracelets for men … obsidian tiger eye" is dominated by "triple protection" tiger's eye + obsidian + hematite sets. Divine Sansar ranks a "Can men wear crystal bracelets? Guide for men in UAE"; Rocksology has Men's / Women's / Kids filters.
- **The site.** No Men in the nav, and every lifestyle image is a woman's wrist. The Style "Men's" filter is exact-match and returns 2 of 12: The Lionheart (tagged `men`, no gold) is style `unisex`, and choosing "Unisex" hides The Shield and The Anchor. The Guardian carries a 14k gold bead, sizes stop at 18.5 cm (gap 4), and `/intentions/protection/` never says whether this is or isn't an evil-eye bracelet.

**Fix.** The `/men/` page brief is content #9; below is the experience layer.
1. **[Dev]** Make "Men's" return `men ∪ unisex without gold accent`: Shield, Anchor, Lionheart, Fortune, Seven.
2. **[Content]** Set The Lionheart to style `men`.
3. **[Dev]** Add "Men" to the primary nav.
4. **[Owner]** One on-wrist photo per men's piece on a man's wrist; XL size (gap 4).
5. **[Content]** On `/intentions/protection/`, a two-sentence clarifier: "Looking for an evil-eye (nazar) bracelet? Ours are natural protection stones (black tourmaline, obsidian, hematite) with no evil-eye charm." Evil-eye searchers self-select, and crystal buyers feel understood.
6. **[Owner]** Merchandising decision: a tiger's eye + obsidian + hematite piece would match the dominant "triple protection" pattern in the men's SERP; link it with "Shop the Protection Stack" (content F13).

---

## 8. What already works (keep it)

- **Desktop buy box.** Above the fold with price, size tiles showing wrist cm ranges, "Between sizes? Go up", "Add to bag · 95 AED" with the price repeated in the button, and COD, next-day and re-string bullets right under the CTA.
- **Stack builder.** Live subtotal, visible 15 % saving, and one "Add stack to bag". Strike-through set prices on home and `/stacks/` are real anchors, and the Shopify automatic discount means checkout matches the builder.
- **Real stone navigation.** Filters by stone and intention, and stone ↔ product links on every PDP, suit the collector.
- **Honest trust copy.** "Never dyed, never glass. Variation is proof." and "We do not promise the stones will change your life" fit a skeptical SERP, and a disclaimer is linked on every PDP.
- **Checkout options.** Card (Stripe) and COD both live at checkout, plus a 14-day size swap with the courier covered once. Rivals charge +10 AED for COD (Raw Spiritual).
- **Price position.** The lowest single-bracelet price among UAE specialists benchmarked, which is a strength once gaps 2 and 6 are fixed.

---

## 9. Priority actions

Ordered by weighted persona opportunity × effort.

**This week (owner info, Shopify settings, small template changes)**
1. **[Owner]** Real WhatsApp number (N01) → unblocks 8 jobs (gap 1).
2. **[Dev]** Sold-out last in every grid and out of Related / Worn well together; swap the two home bestseller slots (gap 5).
3. **[Owner/Shopify]** Decide the free-delivery rule (150 AED, or free on any stack). **[Dev]** Show the fee in the buy box and a progress line in the cart (gap 3).
4. **[Dev]** "Add stack to bag" on the three curated stack cards (gap 1).
5. **[Dev]** Fix the mobile header search icon overlapping the wordmark (gap 2).
6. **[Dev/Content]** Men's filter = men ∪ no-gold unisex; set The Lionheart to style `men` (gap 10).

**Next 2–4 weeks**
7. **[Dev]** Cart gift message + "no price in parcel" attribute; gift bullet in buy box; Gifts filter chip (gap 7).
8. **[Dev]** Mobile PDP reorder; a single email-capture layer, delayed (gap 8).
9. **[Owner]** First 10 real reviews and the maker's name and photo; **[Shopify]** checkout branding + checkout domain; card-descriptor note (gap 2).
10. **[Dev + Content]** Hybrid stone template (amethyst first) and the calm "start here" chooser with the honest anxiety box (gap 9; copy per content F5/F7).
11. **[Owner]** XL size + on-wrist photos per size and on a man's wrist; nazar clarifier on protection (gaps 4, 10).

**Later**
- `/gifts/` and `/men/` landing pages (content briefs #7, #9).
- Tabby/Tamara on stacks.
- Same-day Dubai option once a courier is signed.
- "Notify me" via Klaviyo (N04).

---

## 10. Limitations

- **SERP locality.** WebSearch is a US-region index. Results were steered with "Dubai"/"UAE" in the query but are not a google.ae results page from a UAE IP, so rankings, marketplace share and local-pack presence may differ in the UAE.
- **SERP features were not observable:** People Also Ask, ads, Shopping carousel, AI Overview, local pack and related searches. User stories use ranking page titles and question-shaped pages as a proxy for PAA, and say so.
- **No search volumes, Search Console or analytics data.** Persona weights (35/25/20/20) are estimates.
- **Competitor benchmarks come from WebFetch summaries of single pages** (a small model reading the page). Details such as review counts or thresholds may be incomplete or have changed; spot-check before quoting them publicly.
- **The live site was not re-fetched.** Page evidence is the pre-fetched crawl and screenshots of 2026-09-15 (`home-render.json` shows `mode_used: raw` with `is_spa: false`, so the raw DOM is complete). Popup and newsletter-bar behaviour comes from screenshots at 1.5 s and 5 s.
- **Checkout was not walked through.** The unbranded checkout, the 25 AED fee and the card descriptor come from `LAUNCH.md` and `NEEDED.md`. Shopify's post-discount threshold behaviour comes from Shopify community/help sources. Verify by placing a 3-bracelet test order.
- **Checkout platform search not tested.** Arabic-language queries and Instagram/TikTok in-app discovery were out of scope, although Instagram is likely a major entry point for this brand.
- **Wireframes were not generated** (not requested); available on request.

---

## 11. Cross-skill handoffs

| Need | Skill | Status |
|---|---|---|
| Stone/intention copy depth, claims wording, new-page briefs | `/seo content` | Done: `findings/content.md` (F5, F7, F10, briefs #7 gifts and #9 men) |
| Organization, shippingDetails (25 AED / free threshold), MerchantReturnPolicy, BreadcrumbList, ItemList | `/seo schema` | Done: `findings/schema.md` |
| Sold-out `BackOrder` schema, Merchant Center, Shopify duplicate storefront | `/seo ecommerce` | Done: `findings/ecommerce.md` |
| Popup as mobile interstitial, image weight, header overlap | `/seo technical` | `findings/technical.md` (M6); header overlap is new here |
| Real photography plan (per-size on-wrist, men's wrist, stone macros) | `/seo images` | Recommended once N05 photography starts |
| Google Business Profile as a service-area business (competitors show stores in Al Quoz, Yas Mall) | `/seo local` | Only once a trade licence and a verifiable business address exist (`LAUNCH.md`: trade licence ⏳) |

Generate a PDF report? Use `/seo google report`.

---

## 12. Structured findings (for `audit-data.json` → Search Experience)

```json
{
  "category": "Search Experience",
  "score": 40,
  "score_label": "SXO Gap Score",
  "persona_scores": {
    "anxious_first_time_buyer": {"total": 44, "relevance": 14, "clarity": 11, "trust": 8, "action": 11, "weight": 0.35, "pages": {"home": 5, "shop": 4, "product_the_guardian": 4, "intention_calm": 3, "stone_amethyst": 4}},
    "gift_buyer": {"total": 40, "relevance": 11, "clarity": 12, "trust": 9, "action": 8, "weight": 0.25, "pages": {"home": 5, "shop": 4, "product_the_guardian": 4, "intention_calm": 4, "stone_amethyst": 3}},
    "crystal_literate_collector": {"total": 49, "relevance": 12, "clarity": 15, "trust": 9, "action": 13, "weight": 0.20, "pages": {"home": 4, "shop": 5, "product_the_guardian": 6, "intention_calm": 3, "stone_amethyst": 3}},
    "mens_protection_buyer": {"total": 39, "relevance": 9, "clarity": 11, "trust": 9, "action": 10, "weight": 0.20, "pages": {"home": 3, "shop": 5, "product_the_guardian": 5, "intention_calm": 2, "stone_amethyst": 2, "intention_protection": 4}}
  },
  "dimension_scores": {"page_type": 8, "content_depth": 6, "ux_signals": 7, "schema": 6, "media": 5, "authority": 3, "freshness": 5},
  "mismatches": [
    {"query": "amethyst bracelet meaning", "serp_type": "Blog (7/7)", "page": "/stones/amethyst/", "page_type": "spec card", "severity": "CRITICAL"},
    {"query": "crystal bracelet for anxiety", "serp_type": "Hybrid (50% collection, 33% guide)", "page": "/intentions/calm/", "page_type": "thin collection", "severity": "HIGH"},
    {"query": "crystal bracelet gift for her UAE", "serp_type": "Collection (80%)", "page": null, "page_type": "missing", "severity": "HIGH"},
    {"query": "protection bracelet UAE", "serp_type": "Product/collection (75%), evil-eye intent", "page": "/intentions/protection/", "page_type": "collection", "severity": "MEDIUM"},
    {"query": "crystal bracelets Dubai", "serp_type": "Store home 60% / collection 40%", "page": "/", "page_type": "store home", "severity": "ALIGNED (trust gap)"},
    {"query": "rose quartz bracelet UAE", "serp_type": "Product (100%)", "page": "/products/the-tender-heart/", "page_type": "product", "severity": "ALIGNED"},
    {"query": "chakra bracelet Dubai", "serp_type": "Product (89%)", "page": "/products/the-seven/", "page_type": "product", "severity": "ALIGNED"}
  ],
  "findings": [
    {"id": "SXO-01", "severity": "CRITICAL", "title": "Eight customer jobs route only to a placeholder WhatsApp number; curated stacks have no Add to bag", "owner": "Owner+Dev", "refs": ["N01", "content F1"]},
    {"id": "SXO-02", "severity": "CRITICAL", "title": "No proof of a real shop vs rivals with 200-1,000+ reviews and stores; mobile header overlap; unbranded checkout; unfamiliar card descriptor", "owner": "Owner+Dev+Shopify", "refs": ["N03", "content F3/F4"]},
    {"id": "SXO-03", "severity": "HIGH", "title": "25 AED delivery fee shown only at checkout; no in-stock 3-bracelet stack can reach 250 AED after 15% discount (max 233.75)", "owner": "Owner+Dev", "refs": ["N09", "N13"]},
    {"id": "SXO-04", "severity": "HIGH", "title": "Sizes stop at 18.5 cm wrist; M preselected with no gift-size guidance; custom length only via WhatsApp", "owner": "Owner+Dev"},
    {"id": "SXO-05", "severity": "HIGH", "title": "Sold-out pieces in slots 2 and 4 on home and shop and in related grids; recovery CTA is dead", "owner": "Dev+Content", "refs": ["content F15", "ecommerce #2"]},
    {"id": "SXO-06", "severity": "MEDIUM", "title": "Lowest specialist price with no value framing reads as 'too cheap to be real' in a skeptical SERP", "owner": "Content+Dev"},
    {"id": "SXO-07", "severity": "HIGH", "title": "No gift entry, filter, message field or delivery date; gift tag unused; note only via WhatsApp", "owner": "Dev+Content", "refs": ["content brief #7"]},
    {"id": "SXO-08", "severity": "HIGH", "title": "Mobile first screens: PDP shows no name/price/CTA; popup plus sticky email bar; stone page gradient sphere", "owner": "Dev", "refs": ["technical M6"]},
    {"id": "SXO-09", "severity": "CRITICAL", "title": "Stone pages titled 'meaning' are spec cards vs 7/7 guides; calm is a thin collection vs hybrid SERP", "owner": "Dev+Content", "refs": ["content F5/F7/F8"]},
    {"id": "SXO-10", "severity": "HIGH", "title": "Men's buyer: exact-match Men's filter returns 2/12, no nav entry, gold accent, no XL, no evil-eye clarifier", "owner": "Dev+Content+Owner", "refs": ["content brief #9"]}
  ]
}
```

---

## Sources

SERP queries (WebSearch, 2026-09-15) and competitor pages (WebFetch):

- [Swarovski UAE — crystal bracelets sale](https://www.swarovski.ae/winter-sale-bracelets) · [Swarovski UAE — gifts for her](https://www.swarovski.ae/gifts-for-her)
- [Neon Star — crystal bracelets](https://neon-star.com/collections/crystal-bracelets)
- [Mokshabay — crystal bracelets Dubai](https://mokshabay.com/product-category/bracelets/crystal-bracelets-bracelets/)
- [Spiritual Sootsayer](https://spiritualsootsayer.com/) · [Spiritual Sootsayer bracelets](https://spiritualsootsayer.com/collections/bracelet)
- [Raw Spiritual](https://www.rawspiritual.com/) · [Raw Spiritual product page](https://www.rawspiritual.com/products/healing-crystal-adjustable-bracelet-for-healing-spiritual-awareness)
- [Holly Holistic](https://hollyholistic.com/) · [Holly Holistic rose quartz](https://hollyholistic.com/collections/rose-quartz)
- [OOAK Stones](https://ooakstones.com/)
- [Rocksology bead bracelets](https://www.rocksology.net/bead-bracelets) · [Rocksology](https://www.rocksology.net/)
- [Maison De Crystals](https://maisondecrystals.com/)
- [Etsy — anxiety relief crystal bracelet](https://www.etsy.com/listing/1723674067/anxiety-relief-crystal-bracelet)
- [Urja by Zariin — best crystal bracelets for stress relief and anxiety](https://urjabyzariin.com/blogs/the-world-of-crystals/the-best-crystal-bracelets-for-stress-relief-and-anxiety)
- [Alpine Crystals UAE](https://alpinecrystalsuae.com/) · [InJewels calmness + anxiety](https://injewels.net/collections/calmness-anxiety-crystals) · [Be An Infinite Warrior anxiety collection](https://beaninfinitewarrior.com/collections/anti-anxiety-crystal-bracelet)
- [Tarah — best crystal bracelet for anxiety](https://shoptarahco.com/products/best-crystal-bracelet-for-anxiety-and-depression) · [Keeta — stress relief crystal bracelets](https://keetaluxury.com/blogs/gemstone-meaning/stress-relief-crystal-bracelets) · [Nirvana Healing Essentials — top 7](https://nirvanahealingessentials.com/2026/04/27/top-7-crystal-bracelets-for-anxiety-stress-relief/) · [Orvel — anxiety relief](https://orvel.com/collections/anxiety-relief)
- [Amazon.ae — protection bracelet](https://www.amazon.ae/Protection-Bracelet-Sterling-Handmade-Adjustable/dp/B0BM9TZ4Q9) · [Noon men's bracelets](https://www.noon.com/uae-en/fashion/men-31225/mens-jewellery/bracelets-22419/) · [Noon women's bracelets](https://www.noon.com/uae-en/fashion/women-31229/womens-jewellery/bracelets-16960/) · [Namshi bracelets](https://en-ae.namshi.com/women-accessories-jewellery-bracelets/)
- [Blushield UAE (openPR)](https://www.openpr.com/news/3486322/blushield-debuts-groundbreaking-emf-protection-in-uae) · [The Urban + The Mystic protection bracelet](https://theurbanandthemystic.com/products/the-energy-project-protection-bracelet) · [Three Phase UAE triple protection](https://threephaseuae.com/Triple-Protection-Bracelet-Here-Are-The-Surprising-Benefits-I/348902)
- [Galeries Lafayette UAE evil eye bracelet](https://www.galerieslafayette.ae/ae/en/product/women/jewelry/fashion-jewelry/bracelets/ottoman-hands/alara-chain-evil-eye-bracelet/981592643.html) · [Noon evil eye bracelet](https://www.noon.com/uae-en/leather-protection-evil-eye-bracelet/N47017681A/p/) · [Piece of You evil eye Dubai](https://pieceofyou.ae/collections/evil-eye-jewellery-collection-dubai) · [2 Birds Dubai evil eye](https://2birdsdubai.com/products/evil-eye-bracelet)
- [crystals.com — amethyst bracelet meaning](https://www.crystals.com/blogs/news/guides-amethyst-bracelet-meaning-benefits-wear-guide) · [Chibuntu](https://chibuntu.com/blogs/life/amethyst-bracelet-meaning) · [Element 79](https://www.element79jewelry.com/blogs/element-79s-jewelry-blog/amethyst-bracelet-meaning-benefits-style-guide/) · [Eclore](https://eclorejewelry.com/blogs/news/amethyst-bracelet-meaning-healing-properties-and-how-to-wear-it) · [JW Patronus](https://jwpatronus.com/blogs/the-crystal-journal/amethyst-bracelet-meaning) · [Healing Sounds](https://healing-sounds.com/blogs/crystals/amethyst-bracelet-healing-guide) · [Kaashir](https://kaashir.com/blogs/gemstone-guides/amethyst-bracelet)
- [Noon rose quartz bracelet](https://www.noon.com/uae-en/rose-quartz-bracelet/N41522048A/p/) · [Cartlow rose quartz](https://www.cartlow.com/uae/en/pdp/id10556348/natural-rose-quartz-crystal-bracelet.html) · [Maison Etherique rose quartz](https://www.maisonetherique.com/products/rose-quartz-bracelet) · [Nomadic Camel](https://www.nomadiccamel.com/products/floral-charm-cuff-jade-rose-quartz-24k-gold-plated-bracelet) · [Moon Magic rose quartz](https://moonmagic.com/collections/rose-quartz-bracelets)
- [Noon 7 chakra bracelet](https://www.noon.com/uae-en/7-chakra-healing-bracelet/N19785841A/p/) · [Azar Stone chakra bracelet](https://azarstone.com/products/chakra-stone-bracelet) · [Eternity Dubai chakra bracelets](https://eternitydubai.com/product/chakra-healing-bracelets/) · [Divine Sansar 7 chakra bracelet](https://divinesansar.com/products/7-chakra-bracelet-natural-crystal-balance-wellbeing-uae) · [Divine Sansar seven chakras guide](https://divinesansar.com/blogs/guide/seven-chakras-guide)
- [Divine Sansar — can crystal bracelets be gifted](https://divinesansar.com/blogs/guide/can-crystal-bracelets-be-gifted) · [Divine Sansar — can men wear crystal bracelets](https://divinesansar.com/blogs/guide/can-men-wear-crystal-bracelets) · [Noon crystal bracelet gift for girlfriends](https://www.noon.com/uae-en/natural-crystal-bracelet-for-women-high-end-niche-gift-for-girlfriends-ideal-for-students-and-office-workers/Z0E1A0FCBBD0682060501Z/p/) · [Ted Baker UAE bracelets](https://tedbaker.ae/collections/bracelets)
- [Jade's Essence — how to tell if a crystal bracelet is real](https://jadesessence.com/blogs/crystal-guides/how-to-tell-if-crystal-bracelet-is-real) · [Astroyogi — real vs fake crystal bracelet](https://store.astroyogi.com/blogs/crystal/real-vs-fake-crystal-bracelet) · [Beadluma — real vs fake](https://beadluma.com/pages/guide-real-vs-fake-crystal)
- [Amazon — tiger eye black obsidian hematite bracelets](https://www.amazon.com/Jovivi-Hematite-Obsidian-Bracelets-Protection/dp/B09FPYTBPL) · [The Green Crystal men's tiger eye](https://thegreencrystal.com/product-category/mens-tiger-eye-bracelet/)
- [Shopify Community — shipping rate calculated after discount](https://community.shopify.com/c/payments-shipping-and/calculate-shipping-rate-before-discount/m-p/2608373) · [Shopify Help — troubleshooting shipping rates](https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/troubleshooting)
