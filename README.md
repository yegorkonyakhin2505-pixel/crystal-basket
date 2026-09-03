# Crystal Basket

Storefront for **Crystal Basket**, a Dubai-based crystal bracelet brand. Static site built with [Astro 5](https://astro.build), Tailwind CSS v4 and a few React islands. No backend: card checkout runs on payment links, and every product has a pre-filled WhatsApp order button.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
npm run check      # type-check .astro/.tsx files
```

Node 22 or newer.

## What's inside

| Path | What it is |
|---|---|
| `src/content/products/*.json` | One file per bracelet. **The only place the owner needs to edit to add or change a product.** |
| `src/content/stones/*.json` | Stone library (meaning, chakra, zodiac, care flags). |
| `src/content/intentions/*.json` | The eight shop-by-intention categories. |
| `src/content/stacks/*.json` | Curated three-piece sets. |
| `src/content.config.ts` | Zod schemas. A typo in a product file fails the build with a readable error. |
| `src/data/site.json` | Brand name, WhatsApp number, delivery copy, discount %, review numbers. |
| `src/styles/global.css` | The six colour themes and the semantic token bridge into Tailwind. |
| `src/lib/themes.ts` | Theme metadata used by the switcher and `/themes`. |
| `src/components/` | Astro components + React islands (`BuyBox`, `StackBuilder`, `ThemeSwitcher`). |
| `public/images/products/<slug>/` | Real product photos go here. Until then a generated bracelet illustration is used. |
| `CONTENT-GUIDE.md` | Step-by-step for the shop owner: add a bracelet, change prices, set the WhatsApp number, enable card checkout, swap themes. |

## Themes

Six palettes, each with a light and dark variant, switchable live from the floating **Theme** button, from `/themes`, or by URL: `?theme=midnight&mode=dark`.

`ivory` (default) · `midnight` · `eucalyptus` · `rose` · `obsidian` · `moonstone`

Components never contain hex values. They use semantic tokens (`bg-bg`, `text-muted`, `bg-accent`, `border-border`, `rounded-brand`, `font-display`) that resolve per theme. To make a theme the permanent default, change the fallback in the inline boot script in `src/layouts/BaseLayout.astro` and the `:root` block in `global.css`.

## Commerce

- **WhatsApp**: `wa.me` deep links with a pre-filled order message. Set the number in `src/data/site.json`.
- **Card checkout**: paste a Stripe / Ziina / Tap / PayTabs payment link into `stripePaymentLink` on any product and the "Buy now" button turns on. Selected bead size and wrist size are appended as `client_reference_id`.
- Later, when volume justifies a cart and order dashboard, Snipcart can sit on top of the same JSON with `data-item-*` attributes.

## Deploying

Output is plain static files, so any host works. Recommended: Cloudflare Pages (free, commercial use allowed, unlimited bandwidth). Build command `npm run build`, output directory `dist`. GitHub Pages and Netlify also work. Vercel's Hobby plan does not allow commercial sites.

Set `site` in `astro.config.mjs` to the final domain before going live.
