# Crystal Basket

Storefront for **Crystal Basket**, a Dubai crystal bracelet brand. Next.js 15 static export served from GitHub Pages, content as validated JSON, orders via WhatsApp and payment links.

**Live:** https://crystalbasket.store (GitHub Pages, custom domain). Shopify store `utx8rj-t3.myshopify.com` handles cart, checkout and orders.

## Quick start

```bash
pnpm install
make dev          # http://localhost:3000
make check        # tests + typecheck + build (the CI gate)
```

Node 22+, pnpm 10.

## Module status

| ID | Module | Status | Notes |
|---|---|---|---|
| M1 | Catalog | ✅ | 12 products (all 8 mm, wrist size S/M/L), 16 stones, 8 intentions, 3 stacks. Zod-validated, cross-referenced, tested (incl. image files exist). |
| M2 | Storefront pages | ✅ | Home, shop, product, intention ×8, stone ×16, stacks, about, size guide, care, FAQ, disclaimer, wishlist. |
| M3 | Design system | ✅ | Light only. Cormorant + Jost. `DESIGN.md`. |
| M4 | Filter & sort | ✅ | Client-side over data attributes: popovers / bottom sheet, faceted counts, chips, custom sort. |
| M5 | Buy flow | ✅ | Shopify bag + checkout live. COD active; card gateway pending (N13). WhatsApp number still placeholder (N01). |
| M6 | Stack builder | ✅ | WhatsApp only until payment links exist. |
| M7 | Wishlist | ✅ | localStorage. |
| M8 | Newsletter | ⏳ | Popup + bar show WELCOME10 inline; no provider yet (N04). |
| M9 | Deploy | ✅ | Push to `main` → GitHub Pages at crystalbasket.store. |
| M10 | Shopify commerce | ✅ | Storefront API cart, Shopify checkout, 12 products / 36 variants imported. |
| M10 | Real photography | ⏳ | AI placeholders in place (N05). |
| M11 | API + admin (phase 2) | 📋 | Not started. See `docs/decisions/0001-tech-stack.md`. |

## How the owner edits products

See `packages/catalog/README.md`. Short version: copy a JSON file in `packages/catalog/content/products/`, edit the fields, drop photos in `apps/web/public/images/products/<slug>/`, commit. The build fails loudly on any mistake.

## Repo layout

See `CLAUDE.md`. Full route/component inventory in `PLATFORM.md`. Outstanding owner inputs in `NEEDED.md`.
