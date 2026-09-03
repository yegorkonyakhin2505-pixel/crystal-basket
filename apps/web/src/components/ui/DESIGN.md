# Crystal Basket Design System

Hand-rolled, zero-dependency UI kit. Import from the barrel:

```tsx
import { Button, ButtonLink, Badge, AccordionItem, SectionTitle, cn } from "@/components/ui";
```

Reference layout: Swarovski.ae (centered wordmark, nav row beneath, full-bleed photo hero, beige bands, four-up white product grid with hairline dividers). Softer, warmer, aimed at women. **Light theme only** — there is no dark mode and none should be added.

## Tokens (Tailwind utilities — never hardcode hexes)

Defined in `src/styles/tokens.css`, bridged in `globals.css` `@theme`. Use as `bg-cb-*`, `text-cb-*`, `border-cb-*`.

| Utility | Hex | Use for |
|---|---|---|
| `cb-bg` / `white` | `#FFFFFF` | Page and product tiles |
| `cb-band` | `#F6F3EE` | Beige bands: filter bar, category grid, footer, sort row |
| `cb-band-2` | `#EFEAE2` | Hover on beige |
| `cb-ink` | `#1A1A1A` | Primary text, primary buttons |
| `cb-muted` | `#6B6B6B` | Secondary text, labels |
| `cb-faint` | `#A3A3A3` | Placeholders, disabled |
| `cb-line` | `#E6E2DC` | ALL hairlines, dividers, grid borders |
| `cb-rose` | `#8F5F66` | The one accent: wishlist active, links on hover, sale price, focus ring |
| `cb-rose-soft` | `#F4E9EA` | Tint fills (badges, notices) |
| `cb-gold` | `#C9A961` | Decorative only: the gold bead dot, thin rules. Never text. |

Fonts: `font-display` = Cormorant Garamond (headings, prices, product names). Body = Jost. Serif only for h1–h3, product names, prices and pull quotes. Everything else is Jost.

**Labels:** `label-caps` utility (11px, 0.14em tracking, uppercase, muted).

**Buttons:** uppercase tracked, square corners (no radius anywhere except `rounded-full` chips). One `primary` (black) per view; `outline` for the secondary action; `white` on top of photos.

**Spacing:** 4/8/12/16/24/32/48/64. Section padding `py-16 md:py-24`. Grid gap in product grids is 1px of `cb-line` (borders), not whitespace.

**Photos:** 1:1 product tiles on white, 3:4 category tiles, 16:9 hero. All images go through `<Img>` (`@/components/Img`) which prefixes the base path.

**Motion:** `reveal` class + IntersectionObserver in `ScrollReveal`, opacity/translate only, ≤700ms. Lenis smooth scroll wraps the page. Nothing else animates.
