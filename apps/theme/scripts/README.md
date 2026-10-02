# Theme scripts

Run everything from `apps/theme` (`cd apps/theme` or `pnpm --filter theme exec …`). Both scripts use `tsx`, which is a
devDependency of this package.

## build-data.ts

Copies images and fonts into `theme/assets`, writes `snippets/cb-img.liquid` and `snippets/cb-logo-badge.liquid`.
Runs as part of `pnpm --filter theme build`.

## sync-shopify.ts — catalog → Shopify

Pushes `packages/catalog/content` into Shopify so the theme can read everything from Shopify objects
(see `../ARCHITECTURE.md`, "Metaobject definitions"). It talks to the Admin API through the Shopify CLI
(`shopify store execute`), so no token is stored in the repo.

### One-time: authenticate the CLI against the store

```sh
shopify store auth --store utx8rj-t3.myshopify.com --scopes read_products,write_products,read_metaobject_definitions,write_metaobject_definitions,read_metaobjects,write_metaobjects,read_content,write_content,read_online_store_navigation,write_online_store_navigation,read_files,write_files,read_publications,write_publications
```

This opens an "Install app" page in the browser; approve it. The session is stored by the CLI on this Mac
(re-run the command when it expires or when a step reports "Not authenticated").

### Steps

```sh
pnpm exec tsx scripts/sync-shopify.ts check                 # auth + catalog sanity check
pnpm exec tsx scripts/sync-shopify.ts definitions           # metaobject definitions stone/intention/stack + product metafield definitions (namespace cb)
pnpm exec tsx scripts/sync-shopify.ts files                 # stone, bead, intention, stack and site photos → Shopify Files (fetched from https://crystalbasket.store)
pnpm exec tsx scripts/sync-shopify.ts metaobjects           # every stone, intention and stack entry (status active)
pnpm exec tsx scripts/sync-shopify.ts products              # cb.* metafields + SEO title/description + tags on the existing products
pnpm exec tsx scripts/sync-shopify.ts pages                 # /pages/about … /pages/stones with template suffixes and SEO fields
pnpm exec tsx scripts/sync-shopify.ts all                   # the five above, in order (redirects are never implied)
pnpm exec tsx scripts/sync-shopify.ts redirects             # 301s from the old crystalbasket.store paths; run only after the domain moves to Shopify
```

Flags: `--dry-run` prints every planned mutation and sends nothing (no auth needed); `--handle=<catalog id>` limits
metaobjects/products/pages to one entry. Every step is idempotent: re-run after editing the catalog JSON.

Order matters the first time: `definitions` before `metaobjects`/`products` (reference fields need definition ids),
`files` before `metaobjects` (image fields need file ids), and the products must already exist in Shopify
(`scripts/shopify-csv.py` + CSV import) before `products`/`metaobjects` (stacks reference products).

State (`scripts/.sync-state.json`): ids of definitions, files, metaobjects, products and pages. Safe to commit; delete
it to force a full re-read from Shopify.

### Where things land

| Catalog | Shopify | Theme reads it as |
|---|---|---|
| `stones/*.json` | metaobject `stone`, handle = id, pages at `/pages/stones/<id>` | `shop.metaobjects.stone[handle]`, `metaobject` on the stone template |
| `intentions/*.json` | metaobject `intention`, pages at `/pages/intentions/<id>` | `shop.metaobjects.intention.values` (sort by `sort_order`) |
| `stacks/*.json` | metaobject `stack` | `shop.metaobjects.stack.values` |
| `products/*.json` extras | product metafields `crystal.*` | `product.metafields.crystal.<key>.value` |
| photos | Files `stone-<id>.jpg`, `bead-<id>.png`, `intention-<id>.jpg`, `stack-<id>.jpg`, `site-*.jpg` | `metaobject.image.value | image_url`, `shopify://shop_images/<file>` in settings |
| guide pages | pages with `templateSuffix` = handle | `templates/page.<handle>.json` |

Metaobject pages use Shopify's documented URL pattern `/pages/<urlHandle>/<entry-handle>`; the url handles are
`stones` and `intentions` (override with `CB_STONE_URL_HANDLE` / `CB_INTENTION_URL_HANDLE`). The actual value is read
back from the definition and saved in the state file, and the redirect step uses it.

### Environment

`SHOPIFY_STORE` (default `utx8rj-t3.myshopify.com`), `SHOPIFY_API_VERSION` (default `2026-07`), `SHOPIFY_BIN`
(path to the `shopify` binary), `CB_IMAGE_BASE` (where the images are fetched from, default `https://crystalbasket.store`).

### Validating the GraphQL

`pnpm exec tsx scripts/validate-ops.ts` checks every document in `scripts/lib/ops.ts` against the Admin schema through
the shopify-ai-toolkit validator (no store access needed).
