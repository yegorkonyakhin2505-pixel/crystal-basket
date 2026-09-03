# Content guide (for the shop owner)

Everything you sell lives in small text files. You never need to touch the design to change products, prices or copy. Edit the files on GitHub (click the pencil icon) or in any text editor, then commit. The site rebuilds itself.

## 1. Add a bracelet

1. Go to `src/content/products/`.
2. Copy an existing file, for example `the-still-mind.json`, and name the copy after your new piece in lowercase with dashes: `the-wanderer.json`. The file name becomes the web address (`/products/the-wanderer`).
3. Change the fields:

```json
{
  "name": "The Wanderer",
  "subtitle": "Grounding Bracelet · Smoky Quartz & Lava Stone",
  "intention": "grounding",
  "secondaryIntentions": ["protection"],
  "stones": ["smoky-quartz", "hematite"],
  "priceAED": 229,
  "beadSizes": [8, 10],
  "defaultBead": 8,
  "goldAccent": false,
  "style": "unisex",
  "triad": ["Roots", "Steady", "Present"],
  "promise": "One line, said to the customer, under 14 words.",
  "body": "Two or three sentences. What the stones are worn for, then how it feels to wear.",
  "affirmation": "I am here.",
  "images": [],
  "inStock": true,
  "featured": false,
  "bestseller": false,
  "isNew": true,
  "tags": []
}
```

- `intention` must match a file name in `src/content/intentions/` (`protection`, `love`, `abundance`, `calm`, `confidence`, `focus`, `grounding`, `sleep`).
- `stones` must match file names in `src/content/stones/`. To add a new stone, copy a stone file first.
- `style` is `unisex`, `women` or `men`. It drives the filter chips on the shop page.
- `featured` puts it in the homepage hero. `bestseller` and `isNew` add the badge and the homepage rows.

If you make a mistake (a missing comma, a stone that doesn't exist) the build fails and tells you the file and the field. Nothing broken ever goes live.

## 2. Add photos

Create a folder `public/images/products/the-wanderer/` and drop in your photos, then list them in order in the product file:

```json
"images": ["wrist.jpg", "flat.jpg", "macro.jpg"]
```

The first image is the main one. Recommended: an on-wrist shot in 4:5, a flat lay in 1:1, a close-up of the beads. Until photos exist the site draws a bracelet from the stone colours automatically.

## 3. Change a price or mark sold out

Edit `priceAED`. To show a strike-through "was" price add `"compareAtAED": 299`. Set `"inStock": false` to show "made to order" text (the buttons still work so people can ask).

## 4. Set your WhatsApp number, delivery text, discount

Open `src/data/site.json`.

- `whatsapp`: international format, digits only, no plus sign. Example for a UAE mobile: `9715XXXXXXXX`.
- `freeDeliveryAED`, `deliveryCopy`, `announcement`: the top bar and delivery lines.
- `stackDiscountPct`: the discount when someone builds a stack of three.
- `reviews`: the number shown in the hero and testimonials section. Keep it honest.
- `instagram`, `tiktok`, `email`.

## 5. Replace the placeholder reviews

The three quotes on the homepage are placeholders. Edit them in `src/components/Testimonials.astro` (the `reviews` list at the top) with real customer words and first names.

## 6. Turn on card checkout

1. In Stripe (or Ziina, Tap, PayTabs), create a Payment Link for the product at its price.
2. Paste the link into the product file: `"stripePaymentLink": "https://buy.stripe.com/..."`.
3. The "Buy now" button appears automatically. Bead size and wrist size chosen by the customer are attached to the payment as a reference, so you see them in your dashboard.

Products without a link show a grey "Card checkout coming soon" button and the WhatsApp button still works.

## 7. Curated stacks

`src/content/stacks/` holds sets of exactly three product file names and a set price. Copy one to add another.

## 8. Choose a colour theme

Open the site, click the floating **Theme** button (bottom left), try the six palettes and light/dark. Share a look with `?theme=rose&mode=dark` on the end of any address. When you have decided, tell your developer which one to make the default.

## 9. Pages you may want to edit

- `src/pages/about.astro`: the story.
- `src/data/faq.ts`: the questions on every product page and the FAQ page.
- `src/pages/disclaimer.astro`: the legal wellness disclaimer. Keep it.
