# Crystal Basket — launch checklist

_Updated 2026-09-07. ✅ done · ⏳ needs Alya or Yegor · 🔧 Claude can do once the prerequisite exists_

## Done

| # | Item | Where |
|---|---|---|
| ✅ | Website live at **crystalbasket.store**, HTTPS, GitHub Pages, auto-deploys on push | repo `crystal-basket` |
| ✅ | Design: Swarovski-style light layout, logo 05 badge, brand book | `docs/brand/` |
| ✅ | 12 bracelets (all 8 mm, S/M/L), 16 stones, 8 intentions, 3 stacks with copy and AI placeholder photos; prices set by Alya 2026-09-07 | `packages/catalog/content` |
| ✅ | Shopify store (Basic plan, AED, Dubai), products imported with variants | `utx8rj-t3.myshopify.com` |
| ✅ | Bag + checkout wired (Storefront API), verified end to end | `apps/web/src/lib/shopify.ts` |
| ✅ | Cash on Delivery active, UAE shipping 25 AED / free over 250 AED, private mode off | Shopify → Settings |
| ✅ | Stock Shopify storefront redirects to crystalbasket.store | theme.liquid |
| ✅ | Welcome popup + WELCOME10 discount live in Shopify (10% off order, one per customer), wishlist, stack builder, filters | site · Shopify → Discounts |
| ✅ | Stack discount: automatic "Stack of 3 · 15% off" on any 3+ items (Shopify → Discounts), so the builder's total is what checkout charges. Does not combine with WELCOME10 | Shopify → Discounts |
| ✅ | Shopify catalog synced 2026-09-07: 12 products, wrist size only (8 mm), owner's prices, The Lunar + The Exhale deleted | `docs/shopify/products.csv` |
| ✅ | Email: any address @crystalbasket.store forwards to Alya's Gmail (Cloudflare Email Routing). DNS now hosted on Cloudflare | Cloudflare, Alya's account |

## Blocking launch (cannot take real money without these)

| # | Item | Who | How |
|---|---|---|---|
| ⏳ | **Trade license** (Dubai e-Trader / freelance permit / free-zone) | Alya | Required by every card gateway and BNPL provider |
| ⏳ | **Card payments**: Tap Payments (or PayTabs / Telr) merchant account | Alya applies with license + bank account | Then Shopify → Settings → Payments → Choose a provider → activate |
| ⏳ | **WhatsApp business number** | Alya gives the number | 🔧 Claude puts it in `site.ts`; every order button uses it |

## Should be done before the first Instagram post

| # | Item | Who | How |
|---|---|---|---|
| ⏳ | **Send as hello@crystalbasket.store** from Gmail | Alya, 3 min | Gmail → Settings → Accounts and Import → "Send mail as" → add hello@crystalbasket.store, Gmail SMTP with an app password |
| ⏳ | Real product photos (at least the on-white shot per bracelet) | Alya | Drop into `apps/web/public/images/products/<slug>/main.jpg`, Claude also uploads to Shopify |
| ⏳ | Stock on hand per variant (currently 5 each as placeholder) | Alya | Shopify → Products → Inventory |
| ⏳ | Tabby + Tamara apps (after gateway approval) | Alya installs in Shopify | 🔧 Claude adds "pay in 4" line on product pages |
| ⏳ | Checkout branding (logo, colours) | 🔧 Claude | Shopify → Settings → Checkout → Customize |
| ⏳ | TikTok handle (Instagram @crystal.basket and hello@ email are in the footer) | Alya | `site.ts` |
| ⏳ | Three real reviews + honest count (reviews section is hidden until then) | Alya | `Testimonials.tsx`, `site.ts` → `flags.reviews` |
| ⏳ | Newsletter provider (Klaviyo free) connected to the popup | 🔧 Claude once account exists | `flags.newsletter` |
| ⏳ | Pixels: Meta + TikTok + GA4 | 🔧 Claude once IDs exist | layout |
| ⏳ | Courier account (Aramex / Quiqup) with COD | Alya | |
| ⏳ | Packaging printed: pouch stamp, meaning card, care card | Alya, specs in brand book p.11 | |

## Nice to have

Custom domain for checkout (shop.crystalbasket.store), Arabic version, Ramadan/Eid gift sets, raw crystals category, physical stock alerts.
