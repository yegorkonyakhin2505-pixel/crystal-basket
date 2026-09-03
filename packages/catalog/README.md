# Catalog — how to add or change products

Everything you sell lives in small JSON files here. You never touch the design.

## Add a bracelet
1. Copy `content/products/the-still-mind.json` → `content/products/the-new-one.json` (lowercase, dashes; the file name becomes the URL `/products/the-new-one/`).
2. Edit the fields. `intention` must match a file in `content/intentions/`; each entry in `stones` must match a file in `content/stones/`.
3. Add photos to `apps/web/public/images/products/the-new-one/` and list them: `"images": ["main.jpg", "wrist.jpg"]`. First one is the tile image.
4. Commit. If anything is wrong the build fails and names the file and field.

## Prices
`priceAED` is whole dirhams. Add `"compareAtAED": 299` for a strike-through price. `"inStock": false` shows "made to order".

## Card checkout
Create a payment link (Stripe, Ziina, Tap) and paste it into `"stripePaymentLink"`. The "Buy now" button appears on that product.

## Flags on the homepage
`featured` → hero/story slots · `bestseller` → Bestsellers row + badge · `isNew` → New in row + badge.

## Stacks
`content/stacks/*.json`: exactly three product file names and a set price. Add `image` for a photo under `apps/web/public/images/stacks/`.

## New stone or intention
Copy an existing file in `content/stones/` or `content/intentions/`. For an intention, add a 3:4 photo under `apps/web/public/images/intentions/<slug>.jpg`.
