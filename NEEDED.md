# Crystal Basket — What We Need From the Owner

Each item maps to a `TODO[NEEDED:Nxx]` marker in code. Mark ✅ when provided.

_Last updated: 2026-09-03_

| ID | What | Why | Where it goes | Status |
|---|---|---|---|---|
| **N01** 🚨 | WhatsApp business number (international, digits only) | Every order button points here | `apps/web/src/lib/site.ts` → `whatsapp` | ⏳ placeholder `971500000000` |
| **N02** ⚠️ | Payment links per product (Stripe / Ziina / Tap) | Turns on the "Buy now" button | `packages/catalog/content/products/*.json` → `stripePaymentLink` | ⏳ |
| **N03** ⚠️ | Real reviews + honest review count | Homepage social proof | `site.ts` → `reviews`; `components/Store/Testimonials.tsx` | ⏳ placeholders |
| **N04** | Newsletter provider (Klaviyo/Mailchimp) form action | Email capture | `site.ts` → `flags.newsletter`; `NewsletterBar.tsx` | ⏳ mailto fallback |
| **N05** | Real product & lifestyle photography | Replace AI placeholders | `apps/web/public/images/**` | ⏳ AI placeholders live |
| **N06** | Instagram / TikTok handles, contact email | Footer links | `site.ts` | ⏳ placeholders |
| **N07** | Custom domain (e.g. crystalbasket.ae) | Replace github.io link | GitHub Pages settings + `site.ts` → `url`; set `NEXT_PUBLIC_BASE_PATH=""` in `deploy.yml` | ⏳ |
| **N08** | Final brand decisions: keep the name, logo file if any | Wordmark is text today | `components/Store/Wordmark.tsx` | ⏳ |
| **N09** | Delivery partner + COD terms | Delivery copy accuracy | `site.ts` → `deliveryCopy`, `freeDeliveryAED` | ⏳ assumed |
| **N10** | Decision: phase 2 backend host (Yegor's Mac, VPS) | Needed before orders/admin work starts | `docs/decisions/` | ⏳ |
