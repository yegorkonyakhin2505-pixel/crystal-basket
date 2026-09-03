# Crystal Basket — Project Context for Claude Code

You are working on **Crystal Basket**, a Dubai-based crystal bracelet brand's storefront. Owner is a woman selling energy bracelets now, raw crystals later. Market: UAE, prices in AED, customers are mostly women.

> **Read before every session:** `README.md` (module status) · `NEEDED.md` (what the owner still has to provide) · `PLATFORM.md` (every route, component and package)
> **PLATFORM.md is the manifest. Update it in the same commit as any route/component change.**

## Stakeholders

- **Yegor** — builds and operates the site via Claude Code. Beginner developer; talk in plain English, hand over one paste-ready command at a time.
- **The owner ("she")** — sells the bracelets. Edits products via JSON files or, later, an admin panel. Never touches components.

## Architecture

- **Monorepo:** pnpm workspaces. `apps/web` (Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4) + `packages/catalog` (zod-validated content + typed queries).
- **Phase 1 (now):** fully static export → GitHub Pages under `/crystal-basket`. No backend. Card checkout = payment links in product JSON. Orders = WhatsApp deep links.
- **Phase 2 (planned):** `apps/api` (FastAPI + Postgres) for orders, customers, admin panel and WhatsApp order intake. `next.config.ts` already documents the same-origin `/api/*` proxy pattern to adopt; `QueryProvider` is already mounted.
- **Design:** light theme only, Swarovski-style layout (centered wordmark, nav row beneath, photo hero, beige bands, 4-up white grid with hairline dividers). Tokens in `apps/web/src/styles/tokens.css`; rules in `apps/web/src/components/ui/DESIGN.md`.
- **Images:** AI-generated placeholders (Higgsfield, 2026-09-03) in `apps/web/public/images`. Replace with real photography without changing code.

## Repo layout

```
crystal-basket/
├── apps/web/                 # Next.js storefront (static export)
│   └── src/{app,components/{ui,Store},lib,hooks,styles}
├── packages/catalog/         # content JSON + zod schemas + queries + tests
│   └── content/{products,stones,intentions,stacks}/*.json
├── docs/decisions/           # ADRs
├── scripts/                  # dev/deploy helpers
├── .github/workflows/        # ci.yml (gates) · deploy.yml (GitHub Pages)
├── Makefile                  # all dev commands (`make help`)
├── CLAUDE.md · README.md · PLATFORM.md · NEEDED.md
└── _old/                     # previous Astro build, git-ignored, delete when comfortable
```

## Module map

| ID | Module | Where |
|---|---|---|
| M1 | Catalog (content + schemas + queries) | `packages/catalog/` |
| M2 | Storefront pages | `apps/web/src/app/` |
| M3 | Design system | `apps/web/src/components/ui/`, `src/styles/tokens.css` |
| M4 | Filtering & sort (client, static) | `apps/web/src/components/Store/FilterBar.tsx` |
| M5 | Buy flow (bead/size → payment link / WhatsApp) | `apps/web/src/components/Store/BuyBox.tsx`, `src/lib/whatsapp.ts` |
| M6 | Stack builder | `apps/web/src/components/Store/StackBuilder.tsx` |
| M7 | Wishlist (localStorage) | `apps/web/src/hooks/useWishlist.ts` |
| M8 | Newsletter bar (flag-gated) | `apps/web/src/components/Store/NewsletterBar.tsx` |
| M9 | Deploy (GitHub Pages) | `.github/workflows/deploy.yml` |

## Critical rules

1. **Phased delivery.** Every change leaves the site building and deployable.
2. **Content is data.** Products, stones, intentions and stacks live only in `packages/catalog/content`. A schema failure must fail the build, never ship silently.
3. **No hex in components.** Use `cb-*` tokens. Light theme only; do not add dark mode.
4. **Shipped dark.** New integrations default off behind a flag in `apps/web/src/lib/site.ts` and a `TODO[NEEDED:Nxx]` marker pointing at `NEEDED.md`.
5. **Honest copy.** Crystal claims use "traditionally worn for", never "cures". The disclaimer page stays.
6. **Money is AED integers** in content; fils in the future API.
7. **Static export must keep working** until Phase 2 explicitly replaces it. No server-only features in `apps/web` without a decision in `docs/decisions/`.
8. **`make check` before finishing:** catalog tests + typecheck + build must be green.
9. Never commit unless asked. Conventional-commit subjects (`feat(shop): …`).
