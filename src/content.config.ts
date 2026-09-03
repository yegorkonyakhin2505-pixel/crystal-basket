import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections. Every JSON file under src/content/<collection>/ is
 * validated against the schema below at build time, so a typo in a product
 * file fails the build with a readable message instead of shipping broken.
 */

const intentions = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/intentions' }),
  schema: z.object({
    name: z.string(),
    short: z.string(), // 1–2 word nav label
    tagline: z.string(), // one-line promise
    triad: z.array(z.string()).length(3),
    description: z.string(),
    chakra: z.array(z.string()),
    /** Two hex colours used only for the generated placeholder art. */
    palette: z.tuple([z.string(), z.string()]),
    order: z.number(),
  }),
});

const stones = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/stones' }),
  schema: z.object({
    name: z.string(),
    keywords: z.array(z.string()).min(2),
    chakra: z.array(z.string()),
    zodiac: z.array(z.string()),
    color: z.string(),
    palette: z.tuple([z.string(), z.string()]),
    description: z.string(),
    waterSafe: z.boolean().default(true),
    sunSafe: z.boolean().default(true),
    tier: z.enum(['classic', 'select', 'rare']).default('classic'),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    subtitle: z.string(),
    intention: reference('intentions'),
    secondaryIntentions: z.array(reference('intentions')).default([]),
    stones: z.array(reference('stones')).min(1),
    priceAED: z.number().positive(),
    compareAtAED: z.number().positive().optional(),
    beadSizes: z.array(z.union([z.literal(6), z.literal(8), z.literal(10)])).min(1),
    defaultBead: z.union([z.literal(6), z.literal(8), z.literal(10)]).default(8),
    sizes: z.array(z.enum(['S', 'M', 'L'])).default(['S', 'M', 'L']),
    goldAccent: z.boolean().default(false),
    style: z.enum(['unisex', 'women', 'men']).default('unisex'),
    triad: z.array(z.string()).length(3),
    promise: z.string(),
    body: z.string(),
    affirmation: z.string(),
    includes: z.array(z.string()).default([
      'Bracelet on premium 1mm stretch cord',
      'Stone meaning & affirmation card',
      'Cleanse & care card',
      'Linen pouch',
    ]),
    /** Files under public/images/products/<slug>/ . Empty = generated placeholder. */
    images: z.array(z.string()).default([]),
    /** Paste a Stripe / Ziina / Tap payment link here to enable card checkout. */
    stripePaymentLink: z.string().url().optional(),
    inStock: z.boolean().default(true),
    featured: z.boolean().default(false),
    bestseller: z.boolean().default(false),
    isNew: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const stacks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/stacks' }),
  schema: z.object({
    name: z.string(),
    intention: reference('intentions'),
    products: z.array(reference('products')).length(3),
    priceAED: z.number().positive(),
    description: z.string(),
    stripePaymentLink: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { intentions, stones, products, stacks };
