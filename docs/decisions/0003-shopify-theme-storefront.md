# ADR 0003 — The storefront moves into Shopify as a theme

**Date:** 2026-10-02 · **Status:** accepted (in progress)

## Context
ADR 0002 kept the Next.js static site as the storefront and used Shopify for cart, checkout, orders and payments. In practice the split shows: two hosts (GitHub Pages + shop.crystalbasket.store), analytics that had to be stitched together, a stock Shopify storefront that must be hidden with a redirect, and an owner who edits JSON files instead of an admin. Yegor asked for the whole website to live inside Shopify so the Shopify admin is the one place for products, pages, orders and analytics.

## Decision
Rebuild the storefront as a Shopify Online Store 2.0 theme in `apps/theme`, with the same design tokens, copy, images and interactive components as `apps/web`:

- **Liquid renders every page** (layout, sections, snippets). Class lists are copied verbatim from the React components and Tailwind v4 compiles them to one stylesheet, so the look is unchanged.
- **Interactive parts stay React.** The bracelet builder, stack builder, search, filters, bag drawer, buy box, wishlist, welcome popup and newsletter bar are bundled as islands (`cb-islands.js`) and mounted into `[data-island]` elements. Where an island has visible initial state, Liquid renders the same markup first so nothing shifts.
- **Content lives in Shopify.** Products and variants are Shopify products; product facts (intention, stones, promise, affirmation, badges, SEO) are product metafields in namespace `crystal`; stones, intentions and stacks are metaobjects with online-store pages; non-product photos are Shopify Files or theme assets. `packages/catalog` becomes the migration source, pushed by `apps/theme/scripts/sync-shopify.ts`, until the owner edits in the admin directly.
- **Cart and analytics are native**: Shopify's Ajax cart API on the same origin, Shopify's own page and cart tracking. The Storefront API client, the hydrogen-react analytics shim and the storefront redirect snippet are retired when the theme goes live.
- **Rollout:** push unpublished and compare against the live site; migrate content; then point crystalbasket.store at Shopify as the primary domain, publish, 301 the old paths, and switch GitHub Pages off. `apps/web` stays in the repo until the theme has been live for a while, then is removed.

## Consequences
- Page-to-page navigation becomes a full load (no client-side routing). Prefetching softens it; it is the one visible difference.
- Some URLs change (`/shop/` → `/collections/all`, guides → `/pages/<name>`, stone and intention pages to Shopify's metaobject URLs). Every old path gets a permanent redirect.
- The design tokens rule (no hex in components) now also covers `apps/theme/src` and the Liquid theme (`scripts/check-tokens.sh`).
- `PLATFORM.md` gains the theme's routes, sections, snippets and islands; CI type-checks the theme package.
- Shopify Payments still needs a UAE trade licence (unchanged by this decision).
