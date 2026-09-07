# Crystal Basket — What We Need From the Owner

Each item maps to a `TODO[NEEDED:Nxx]` marker in code. Mark ✅ when provided.

_Last updated: 2026-09-07_

| ID | What | Why | Where it goes | Status |
|---|---|---|---|---|
| **N01** 🚨 | WhatsApp business number (international, digits only) | Every order button points here | `apps/web/src/lib/site.ts` → `whatsapp` | ⏳ placeholder `971500000000` |
| **N02** ⚠️ | Payment links per product (Stripe / Ziina / Tap) | Turns on the "Buy now" button | `packages/catalog/content/products/*.json` → `stripePaymentLink` | ⏳ |
| **N03** ⚠️ | Real reviews + honest review count | Homepage social proof | `site.ts` → `reviews` + `flags.reviews`; `components/Store/Testimonials.tsx` | ⏳ section hidden until real quotes exist (sample quotes were invented) |
| **N04** | Newsletter provider (Klaviyo/Mailchimp) endpoint | Email capture from the welcome popup + bottom bar; today emails stay in the visitor's browser and the code WELCOME10 is shown at once | `site.ts` → `flags.newsletter`, `welcome`; `OfferPopup.tsx`, `NewsletterBar.tsx` | ⏳ local only |
| **N05** | Real product & lifestyle photography | Replace AI placeholders | `apps/web/public/images/**` | ⏳ AI placeholders live |
| **N06** | Instagram / TikTok handles, contact email | Footer links | `site.ts` | ⏳ placeholders |
| **N07** | Custom domain | Replace github.io link | crystalbasket.store (GoDaddy). DNS → GitHub Pages, HTTPS enforced, github.io redirects | ✅ live 2026-09-06 |
| **N08** | Logo | Concept 05 (bead badge) chosen by Yegor 2026-09-06 | `components/Store/LogoBadge.tsx`, `public/brand/logo-badge*.svg`, `public/favicon.svg`; concepts in `docs/brand/logos` | ✅ |
| **N09** | Delivery partner + COD terms | Delivery copy accuracy | `site.ts` → `deliveryCopy`, `freeDeliveryAED` | ⏳ assumed |
| **N10** | ~~Decision: phase 2 backend host~~ | Superseded: Shopify is the back office (ADR 0002) | `docs/decisions/0002-shopify-back-office.md` | ✅ decided 2026-09-06 |
| **N11** | Shopify Storefront API token | Turns on Add to bag + checkout on our site | Headless channel → storefront "My Store Headless" → public token in repo var `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` (client-side token by design) | ✅ 2026-09-06 |
| **N12** | Product import into Shopify | Variants must exist for the cart to resolve them | `python3 scripts/shopify-csv.py` → import `docs/shopify/products.csv` with "overwrite": 12 products, 36 variants (Wrist size only), images | ✅ re-imported 2026-09-07 |
| **N14** | Business email on the domain | hello@ / orders@ / any@crystalbasket.store | **Cloudflare Email Routing**, free. DNS for the domain now lives on Cloudflare (account: Alya's Gmail; nameservers george/marlowe.ns.cloudflare.com). Catch-all → alyaromaya@gmail.com, MX + SPF + DKIM managed by Cloudflare. GitHub Pages records kept DNS-only. To *send* as hello@: Gmail → Settings → Accounts → Send mail as. | ✅ 2026-09-07 |
| **N16** | Stack discount | Builder promises 15% off any three | Automatic discount "Stack of 3 · 15% off", min. 3 items, order-level | ✅ 2026-09-07 |
| **N13** | Shopify shipping + payments | UAE delivery rates, COD, card gateway | Standard delivery 25 AED, free over 250 AED (UAE zone) ✅ · Cash on Delivery active ✅ · Private mode off ✅ · **Card gateway still needed** (Settings → Payments → Choose a provider: Tap/PayTabs/Telr, needs trade license) ⏳ · Checkout branding (logo, colours) ⏳ |

| **N15** | Shopify default storefront (utx8rj-t3.myshopify.com shows the stock "My Store" theme) | Customers only reach it via "Continue shopping" after checkout | Online Store → Themes → ⋯ → Edit code → `layout/theme.liquid`, paste the redirect snippet from `docs/shopify/redirect-snippet.liquid` right after `<head>`. Claude could not open that menu under automation. | ✅ redirect added to theme.liquid 2026-09-07 |
