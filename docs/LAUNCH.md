# Crystal Basket — launch checklist

_Updated 2026-09-07. ✅ done · ⏳ needs Alya or Yegor · 🔧 Claude can do once the prerequisite exists_

## Done

| # | Item | Where |
|---|---|---|
| ✅ | Website live at **crystalbasket.store**, HTTPS, GitHub Pages, auto-deploys on push | repo `crystal-basket` |
| ✅ | Design: Swarovski-style light layout, logo 05 badge, brand book | `docs/brand/` |
| ✅ | 14 bracelets, 16 stones, 8 intentions, 3 stacks with copy and AI placeholder photos | `packages/catalog/content` |
| ✅ | Shopify store (Basic plan, AED, Dubai), products imported with variants | `utx8rj-t3.myshopify.com` |
| ✅ | Bag + checkout wired (Storefront API), verified end to end | `apps/web/src/lib/shopify.ts` |
| ✅ | Cash on Delivery active, UAE shipping 25 AED / free over 250 AED, private mode off | Shopify → Settings |
| ✅ | Stock Shopify storefront redirects to crystalbasket.store | theme.liquid |
| ✅ | Welcome popup (10% code WELCOME10), wishlist, stack builder, filters | site |
| ✅ | Email DNS records in place (Forward Email) | GoDaddy DNS |

## Blocking launch (cannot take real money without these)

| # | Item | Who | How |
|---|---|---|---|
| ⏳ | **Trade license** (Dubai e-Trader / freelance permit / free-zone) | Alya | Required by every card gateway and BNPL provider |
| ⏳ | **Card payments**: Tap Payments (or PayTabs / Telr) merchant account | Alya applies with license + bank account | Then Shopify → Settings → Payments → Choose a provider → activate |
| ⏳ | **Discount code WELCOME10** created in Shopify (10% off, first order) | 🔧 Claude, 2 min | Shopify → Discounts |
| ⏳ | **WhatsApp business number** | Alya gives the number | 🔧 Claude puts it in `site.ts`; every order button uses it |

## Should be done before the first Instagram post

| # | Item | Who | How |
|---|---|---|---|
| ⏳ | **Email**: pick free Cloudflare routing (Yegor creates account, Claude does the rest) or pay Forward Email 3 USD/mo | Yegor/Alya decide | Then Gmail → "Send mail as" hello@crystalbasket.store |
| ⏳ | Real product photos (at least the on-white shot per bracelet) | Alya | Drop into `apps/web/public/images/products/<slug>/main.jpg`, Claude also uploads to Shopify |
| ⏳ | Real prices confirmed (site and Shopify must match) | Alya | Tell Claude the final numbers |
| ⏳ | Stock on hand per variant (currently 5 each as placeholder) | Alya | Shopify → Products → Inventory |
| ⏳ | Tabby + Tamara apps (after gateway approval) | Alya installs in Shopify | 🔧 Claude adds "pay in 4" line on product pages |
| ⏳ | Checkout branding (logo, colours) | 🔧 Claude | Shopify → Settings → Checkout → Customize |
| ⏳ | Instagram + TikTok handles, real contact email in footer | Alya | `site.ts` |
| ⏳ | Three real reviews to replace placeholders, honest review count | Alya | `Testimonials.tsx`, `site.ts` |
| ⏳ | Newsletter provider (Klaviyo free) connected to the popup | 🔧 Claude once account exists | `flags.newsletter` |
| ⏳ | Pixels: Meta + TikTok + GA4 | 🔧 Claude once IDs exist | layout |
| ⏳ | Courier account (Aramex / Quiqup) with COD | Alya | |
| ⏳ | Packaging printed: pouch stamp, meaning card, care card | Alya, specs in brand book p.11 | |

## Nice to have

Custom domain for checkout (shop.crystalbasket.store), Arabic version, Ramadan/Eid gift sets, raw crystals category, physical stock alerts.
