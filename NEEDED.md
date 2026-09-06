# Crystal Basket — What We Need From the Owner

Each item maps to a `TODO[NEEDED:Nxx]` marker in code. Mark ✅ when provided.

_Last updated: 2026-09-03_

| ID | What | Why | Where it goes | Status |
|---|---|---|---|---|
| **N01** 🚨 | WhatsApp business number (international, digits only) | Every order button points here | `apps/web/src/lib/site.ts` → `whatsapp` | ⏳ placeholder `971500000000` |
| **N02** ⚠️ | Payment links per product (Stripe / Ziina / Tap) | Turns on the "Buy now" button | `packages/catalog/content/products/*.json` → `stripePaymentLink` | ⏳ |
| **N03** ⚠️ | Real reviews + honest review count | Homepage social proof | `site.ts` → `reviews`; `components/Store/Testimonials.tsx` | ⏳ placeholders |
| **N04** | Newsletter provider (Klaviyo/Mailchimp) endpoint | Email capture from the welcome popup + bottom bar; today emails stay in the visitor's browser and the code WELCOME10 is shown at once | `site.ts` → `flags.newsletter`, `welcome`; `OfferPopup.tsx`, `NewsletterBar.tsx` | ⏳ local only |
| **N05** | Real product & lifestyle photography | Replace AI placeholders | `apps/web/public/images/**` | ⏳ AI placeholders live |
| **N06** | Instagram / TikTok handles, contact email | Footer links | `site.ts` | ⏳ placeholders |
| **N07** | Custom domain | Replace github.io link | crystalbasket.store bought on GoDaddy 2026-09-06; `public/CNAME`, Pages custom domain, base path "" | ✅ pending DNS |
| **N08** | Final brand decisions: keep the name, logo file if any | Wordmark is text today | `components/Store/Wordmark.tsx` | ⏳ |
| **N09** | Delivery partner + COD terms | Delivery copy accuracy | `site.ts` → `deliveryCopy`, `freeDeliveryAED` | ⏳ assumed |
| **N10** | ~~Decision: phase 2 backend host~~ | Superseded: Shopify is the back office (ADR 0002) | `docs/decisions/0002-shopify-back-office.md` | ✅ decided 2026-09-06 |
| **N11** 🚨 | Shopify Storefront API token | Turns on Add to bag + checkout on our site | Shopify admin → Settings → Apps → Develop apps → custom app → Storefront API → token → `gh secret set SHOPIFY_STOREFRONT_TOKEN` | ⏳ store `utx8rj-t3` created, token pending |
| **N12** | Product import into Shopify | Variants must exist for the cart to resolve them | Upload `~/Desktop/crystal-basket-shopify-products.csv` in Shopify admin → Products → Import | ⏳ CSV generated |
| **N13** | Shopify checkout branding + shipping zones + COD | Checkout matches the site; UAE delivery rates | Shopify admin → Settings → Checkout / Shipping / Payments | ⏳ |
