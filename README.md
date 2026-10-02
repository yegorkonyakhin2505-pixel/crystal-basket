# Crystal Basket

Storefront for **Crystal Basket**, a Dubai crystal bracelet brand. Next.js 15 static export served from GitHub Pages, content as validated JSON, orders via WhatsApp and payment links.

**Live:** https://crystalbasket.store. Since 2026-10-02 the storefront is the Shopify theme in `apps/theme` (store `utx8rj-t3.myshopify.com`); `apps/web` is the previous GitHub Pages site, kept for rollback (manual deploy only).

## Quick start

```bash
pnpm install
make dev          # http://localhost:3000
make check        # tests + typecheck + build (the CI gate)
pnpm --filter theme build   # Shopify theme: assets + CSS + islands into apps/theme/theme
pnpm --filter theme push    # upload to the unpublished theme (shopify theme push)
```

Node 22+, pnpm 10.

## Module status

| ID | Module | Status | Notes |
|---|---|---|---|
| M1 | Catalog | ✅ | 12 products (all 8 mm, wrist size S/M/L), 16 stones, 8 intentions, 3 stacks. Zod-validated, cross-referenced, tested (incl. image files exist). |
| M2 | Storefront pages | ✅ | Home, shop, product, intention ×8, stone ×16, stacks, about, size guide, care, FAQ, disclaimer, wishlist. |
| M3 | Design system | ✅ | Light only. Cormorant + Jost. `DESIGN.md`. |
| M4 | Filter & sort | ✅ | Client-side over data attributes: popovers / bottom sheet, faceted counts, chips, custom sort. |
| M5 | Buy flow | ✅ | Shopify bag + checkout live. COD + Stripe cards active. WhatsApp number still placeholder (N01). |
| M6 | Stack builder | ✅ | WhatsApp only until payment links exist. |
| M7 | Wishlist | ✅ | localStorage. |
| M8 | Newsletter | ⏳ | Popup + bar show WELCOME10 inline; no provider yet (N04). |
| M9 | Deploy | ✅ | Push to `main` → GitHub Pages at crystalbasket.store. |
| M10 | Shopify commerce | ✅ | Storefront API cart, Shopify checkout, 12 products / 36 variants imported. |
| M10 | Real photography | ⏳ | AI placeholders in place (N05). |
| M11 | ~~API + admin (phase 2)~~ | ✖ | Superseded by M12 (ADR 0003). |
| M12 | Shopify theme (`apps/theme`) | ✅ | The storefront rebuilt as a Shopify Online Store 2.0 theme: Liquid pages + React islands, same tokens, copy and images. Live theme "Crystal Basket (new)" (id 155126235315) since 2026-10-02; content migrated with `apps/theme/scripts/sync-shopify.ts`. crystalbasket.store points at Shopify since 2026-10-02 (N24 done). See ADR 0003 and `apps/theme/ARCHITECTURE.md`. |

## How the owner edits products

See `packages/catalog/README.md`. Short version: copy a JSON file in `packages/catalog/content/products/`, edit the fields, drop photos in `apps/web/public/images/products/<slug>/`, commit. The build fails loudly on any mistake.

## Repo layout

See `CLAUDE.md`. Full route/component inventory in `PLATFORM.md`. Outstanding owner inputs in `NEEDED.md`.
