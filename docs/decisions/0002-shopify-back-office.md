# ADR 0002 — Shopify as back office, our site as storefront

**Date:** 2026-09-06 · **Status:** accepted

## Context
Going live needs cart, checkout, orders, inventory, discount codes, Tabby/Tamara and a phone-friendly admin for a non-technical owner. Building that (ADR 0001 phase 2) is weeks of work and ongoing ops.

## Decision
Hybrid: the Next.js site remains the storefront and design surface. Shopify (Basic) provides cart, checkout, orders, inventory, payments and apps. Integration via the Storefront API from the browser (public token); checkout is Shopify-hosted and branded. Product handles equal catalog slugs; variant options are "Bead size" (6/8/10 mm) and "Wrist size" (S/M/L).

## Consequences
- Catalog JSON stays the source for copy, meanings, images and site structure; Shopify is the source for price, stock and orders. Prices must be kept in sync (catalog price is display-only; Shopify price is charged). A later sync script can pull prices from Shopify at build time.
- The checkout page is Shopify's; only branding is customisable below Shopify Plus.
- Cost: ~29 USD/month + gateway fees. Shopify Payments UAE is early access; a third-party gateway adds 2%.
- The custom FastAPI backend from ADR 0001 is shelved.
