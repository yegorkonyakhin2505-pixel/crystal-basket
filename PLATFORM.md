# Crystal Basket — Platform Manifest

> Single source of truth for what exists. Update in the same commit as any change.

## Packages

| Package | Path | Role |
|---|---|---|
| `web` | `apps/web` | Next.js 15 storefront, static export (`out/`) |
| `@crystal-basket/catalog` | `packages/catalog` | Content JSON, zod schemas, typed queries, vitest suite |

## Routes (`apps/web/src/app`)

| Route | File | Data | Notes |
|---|---|---|---|
| `/` | `page.tsx` | bestsellers, new, stacks | Hero, intention grid, bestsellers, trust strip, stacks band, story, reviews |
| `/shop/` | `shop/page.tsx` | all products | ListingHero + FilterBar + ProductGrid |
| `/products/[slug]/` | `products/[slug]/page.tsx` | product, stones, related | Gallery, BuyBox, accordions, related grid, FAQ + JSON-LD |
| `/intentions/` | `intentions/page.tsx` | intentions | CategoryGrid |
| `/intentions/[slug]/` | `intentions/[slug]/page.tsx` | primary + secondary products | Stone chips band |
| `/stones/` | `stones/page.tsx` | stones | Sphere tiles |
| `/stones/[slug]/` | `stones/[slug]/page.tsx` | stone, products | Facts table |
| `/stacks/` | `stacks/page.tsx` | stacks, all products | Curated sets + StackBuilder |
| `/about/`, `/size-guide/`, `/care/`, `/faq/`, `/disclaimer/` | same-named folders | static | |
| `/wishlist/` | `wishlist/page.tsx` | all products (client filters by localStorage) | |
| 404 | `not-found.tsx` | | |

## Components

**`components/ui`** (design system, see `DESIGN.md`): `Button`, `ButtonLink`, `buttonClasses`, `Badge`, `Input`, `AccordionItem`, `SectionTitle`, `cn`.

**`components/Store`:** `Header` (server) + `HeaderClient` (sticky, compact on scroll, mega-menus, mobile drawer) · `Wordmark` · `Footer` · `NewsletterBar` (client, dismissable) · `OfferPopup` (client, welcome-offer modal after first interaction) · `Hero` · `ListingHero` · `CategoryGrid` · `ProductGrid` · `ProductTile` · `BeadRing` (SVG fallback art) · `FilterBar` (client) · `BuyBox` (client) · `StackBuilder` (client) · `WishlistButton` · `WishlistClient` · `TrustStrip` · `Testimonials`.

**Root:** `Img` (base-path aware `<img>`), `QueryProvider`, `SmoothScroll` (Lenis), `ScrollReveal`.

**Commerce (Shopify Storefront, env-gated):** `lib/shopify.ts` (GraphQL client: variant lookup by handle + options, cart create/add/remove/fetch) · `hooks/useCart.ts` (shared cart state, localStorage cart id) · `components/Store/CartDrawer.tsx` · `BagButton.tsx` · "Add to bag" paths in `BuyBox` and `StackBuilder`. Off when `NEXT_PUBLIC_SHOPIFY_*` are empty; then payment links + WhatsApp apply.

## Lib & hooks

`lib/site.ts` (site config + feature flags) · `lib/paths.ts` (`routes`, `asset`, `BASE`) · `lib/whatsapp.ts` · `lib/images.ts` · `lib/sizes.ts` · `lib/faq.ts` · `lib/subscribe.ts` (shared email-capture state) · `hooks/useWishlist.ts`.

## Catalog API (`@crystal-basket/catalog`)

`loadCatalog()` · `getProducts/getStones/getIntentions/getStacks` · `getProduct/getStone/getIntention/getStack` · `productsForIntention(id, includeSecondary)` · `productsForStone` · `stonesForProduct` · `relatedProducts` · `stackSubtotal` · `formatAED` · schemas + types.

## Static assets

`apps/web/public/images/{hero,intentions,products/<slug>,stacks,about}` · `favicon.svg`.

## Workflows

`ci.yml`: catalog tests → typecheck → build, on push/PR. `deploy.yml`: build at root path for crystalbasket.store (`public/CNAME`), Shopify domain/token from repo var + secret → GitHub Pages, on push to `main`.
