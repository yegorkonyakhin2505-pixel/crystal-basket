import { z } from "zod";

/**
 * Catalog schemas — the single typed contract for every content file under
 * packages/catalog/content/. A file that fails its schema fails `pnpm test`
 * and the web build, so broken content never ships.
 *
 * Money is stored in fils (AED × 100) as integers, never floats.
 */

export const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case slug");
export const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const BeadMm = z.union([z.literal(6), z.literal(8), z.literal(10)]);
export const WristSize = z.enum(["S", "M", "L"]);

export const IntentionSchema = z.object({
  name: z.string(),
  short: z.string(),
  tagline: z.string(),
  triad: z.array(z.string()).length(3),
  description: z.string(),
  chakra: z.array(z.string()),
  palette: z.tuple([Hex, Hex]),
  order: z.number().int(),
  /** Category tile photo under apps/web/public/images/intentions/<slug>.jpg */
  image: z.string().optional(),
});

export const StoneSchema = z.object({
  name: z.string(),
  keywords: z.array(z.string()).min(2),
  chakra: z.array(z.string()),
  zodiac: z.array(z.string()),
  color: z.string(),
  palette: z.tuple([Hex, Hex]),
  description: z.string(),
  waterSafe: z.boolean().default(true),
  sunSafe: z.boolean().default(true),
  tier: z.enum(["classic", "select", "rare"]).default("classic"),
});

export const ProductSchema = z.object({
  name: z.string(),
  subtitle: z.string(),
  intention: Slug,
  secondaryIntentions: z.array(Slug).default([]),
  stones: z.array(Slug).min(1),
  priceAED: z.number().int().positive(),
  compareAtAED: z.number().int().positive().optional(),
  beadSizes: z.array(BeadMm).min(1),
  defaultBead: BeadMm.default(8),
  sizes: z.array(WristSize).default(["S", "M", "L"]),
  goldAccent: z.boolean().default(false),
  style: z.enum(["unisex", "women", "men"]).default("unisex"),
  triad: z.array(z.string()).length(3),
  promise: z.string(),
  body: z.string(),
  affirmation: z.string(),
  includes: z
    .array(z.string())
    .default([
      "Bracelet on premium 1mm stretch cord",
      "Stone meaning & affirmation card",
      "Cleanse & care card",
      "Linen pouch",
    ]),
  /** Files under apps/web/public/images/products/<slug>/ */
  images: z.array(z.string()).default([]),
  /** Stripe / Ziina / Tap payment link. Present = card checkout enabled. */
  stripePaymentLink: z.string().url().optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const StackSchema = z.object({
  name: z.string(),
  intention: Slug,
  products: z.array(Slug).length(3),
  priceAED: z.number().int().positive(),
  description: z.string(),
  stripePaymentLink: z.string().url().optional(),
  featured: z.boolean().default(false),
  image: z.string().optional(),
});

export type IntentionData = z.infer<typeof IntentionSchema>;
export type StoneData = z.infer<typeof StoneSchema>;
export type ProductData = z.infer<typeof ProductSchema>;
export type StackData = z.infer<typeof StackSchema>;

export interface Entry<T> {
  id: string;
  data: T;
}
export type Intention = Entry<IntentionData>;
export type Stone = Entry<StoneData>;
export type Product = Entry<ProductData>;
export type Stack = Entry<StackData>;
