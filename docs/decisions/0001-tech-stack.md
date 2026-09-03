# ADR 0001 — Tech stack and phasing

**Date:** 2026-09-03 · **Status:** accepted

## Context
Small UAE bracelet brand, one owner, no developer on staff. Needs a live link immediately, a design that reads as jewellery (Swarovski reference), and a path to real orders/admin later. Yegor wants the same construction approach as his other systems: monorepo, typed data contracts, living docs, gated CI, shipped-dark flags.

## Decision
- **Now:** pnpm workspace, `apps/web` Next.js 15 App Router with `output: "export"`, `packages/catalog` holding content as zod-validated JSON. GitHub Pages hosting (public repo, deploy workflow).
- **Design:** light theme only, Swarovski-style layout, Cormorant Garamond + Jost, tokens in CSS variables bridged to Tailwind v4.
- **Commerce:** payment links per product + WhatsApp deep links. No cart.
- **Later (phase 2):** `apps/api` FastAPI + Postgres for orders/customers/admin and WhatsApp intake, fronted by the same-origin `/api/*` rewrite pattern. Requires a host decision (NEEDED N10). Static export is dropped only when that lands.

## Consequences
- Owner edits JSON (or a git-backed CMS later) instead of a dashboard until phase 2.
- Filtering is client-side over rendered tiles; fine for <100 SKUs.
- No server features may be added to `apps/web` without a new ADR.

## Alternatives rejected
- Shopify: monthly fee, Shopify Payments UAE is early-access only, design lock-in.
- Astro (first build): worked, but Next.js keeps the frontend identical to the phase-2 target and to Yegor's other projects.
