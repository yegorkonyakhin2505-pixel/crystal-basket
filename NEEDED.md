# Crystal Basket — What We Need From the Owner

Each item maps to a `TODO[NEEDED:Nxx]` marker in code. Mark ✅ when provided.

_Last updated: 2026-09-06_

| ID | What | Why | Where it goes | Status |
|---|---|---|---|---|
| **N01** 🚨 | WhatsApp business number (international, digits only) | Every order button points here | `apps/web/src/lib/site.ts` → `whatsapp` | ⏳ placeholder `971500000000` |
| **N02** ⚠️ | Payment links per product (Stripe / Ziina / Tap) | Turns on the "Buy now" button | `packages/catalog/content/products/*.json` → `stripePaymentLink` | ⏳ |
| **N03** ⚠️ | Real reviews + honest review count | Homepage social proof | `site.ts` → `reviews`; `components/Store/Testimonials.tsx` | ⏳ placeholders |
| **N04** | Newsletter provider (Klaviyo/Mailchimp) endpoint | Email capture from the welcome popup + bottom bar; today emails stay in the visitor's browser and the code WELCOME10 is shown at once | `site.ts` → `flags.newsletter`, `welcome`; `OfferPopup.tsx`, `NewsletterBar.tsx` | ⏳ local only |
| **N05** | Real product & lifestyle photography | Replace AI placeholders | `apps/web/public/images/**` | ⏳ AI placeholders live |
| **N06** | Instagram / TikTok handles, contact email | Footer links | `site.ts` | ⏳ placeholders |
| **N07** | Custom domain | Replace github.io link | crystalbasket.store (GoDaddy). DNS → GitHub Pages, HTTPS enforced, github.io redirects | ✅ live 2026-09-06 |
| **N08** | Final brand decisions: keep the name, logo file if any | Wordmark is text today | `components/Store/Wordmark.tsx` | ⏳ |
| **N09** | Delivery partner + COD terms | Delivery copy accuracy | `site.ts` → `deliveryCopy`, `freeDeliveryAED` | ⏳ assumed |
| **N10** | ~~Decision: phase 2 backend host~~ | Superseded: Shopify is the back office (ADR 0002) | `docs/decisions/0002-shopify-back-office.md` | ✅ decided 2026-09-06 |
| **N11** | Shopify Storefront API token | Turns on Add to bag + checkout on our site | Headless channel → storefront "My Store Headless" → public token in repo var `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` (client-side token by design) | ✅ 2026-09-06 |
| **N12** | Product import into Shopify | Variants must exist for the cart to resolve them | Imported from `docs/shopify/products.csv`: 14 products, 87 variants, images | ✅ 2026-09-06 |
| **N14** | Business email on the domain | hello@ / orders@ / any@crystalbasket.store | Forward Email (free, DNS-only): MX mx1/mx2.forwardemail.net + TXT `forward-email=<owner gmail>` at GoDaddy. Catch-all forwards to the owner's Gmail. To *send* as hello@, add it in Gmail → Settings → Accounts → "Send mail as" (uses Gmail SMTP with an app password). | ✅ receiving 2026-09-06 · sending: owner sets up in Gmail |
| **N13** | Shopify shipping + payments | UAE delivery rates, COD, card gateway | Standard delivery 25 AED, free over 250 AED (UAE zone) ✅ · Cash on Delivery active ✅ · Private mode off ✅ · **Card gateway still needed** (Settings → Payments → Choose a provider: Tap/PayTabs/Telr, needs trade license) ⏳ · Checkout branding (logo, colours) ⏳ |
