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
/** Every bracelet is strung on 8 mm beads (decided 2026-09-07); wrist size is the only variant. */
export const BEAD_MM = 8;
export const WristSize = z.enum(["S", "M", "L"]);
/** Tradition: the left wrist receives, the right projects. `either` for stones that follow their pairing. */
export const Wrist = z.enum(["left", "right", "either"]);
/** A question and a self-contained 40–80 word answer, rendered under a real heading. */
export const QA = z.object({ q: z.string().min(10), a: z.string().min(80) });

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
  /** SEO: meta description, keyword first, ≤155 characters. */
  seoDescription: z.string().min(70).max(155),
  /** "What is a … bracelet?": a definition-first 40–80 word answer. */
  definition: z.string().min(200),
  wrist: Wrist,
  /** Curated stones traditionally worn for this intention (not derived from products). */
  stones: z.array(Slug).min(1),
  faq: z.array(QA).min(2),
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
  /** "What is …?": mineral family and what makes it look the way it does. */
  mineral: z.string().min(60),
  /** Mohs hardness, e.g. "7" or "5.5 to 6.5". */
  mohs: z.string(),
  /** Where the stone is commonly found worldwide (general, not our supplier). */
  foundIn: z.string(),
  /** "What is a … bracelet worn for?": a self-contained 40–80 word answer. */
  wornFor: z.string().min(200),
  wrist: Wrist,
  /** Why that wrist, one or two sentences. */
  wristWhy: z.string().min(60),
  /** Extra care note when the stone must stay dry. */
  waterNote: z.string().optional(),
  pairsWith: z.array(Slug).default([]),
  /** Tumbled-stone photo under apps/web/public/images/stones/<file> (white background). */
  image: z.string().optional(),
});

export const ProductSchema = z.object({
  name: z.string(),
  subtitle: z.string(),
  intention: Slug,
  secondaryIntentions: z.array(Slug).default([]),
  stones: z.array(Slug).min(1),
  priceAED: z.number().int().positive(),
  compareAtAED: z.number().int().positive().optional(),
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
  /** Real stock we will not restring once sold: shows the "Leaving soon" tag and the home strip. */
  leavingSoon: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  /** SEO: <title> before the " · Crystal Basket" suffix, stones and type first. */
  seoTitle: z.string().min(20).max(50),
  /** SEO: meta description, ≤155 characters. */
  seoDescription: z.string().min(90).max(155),
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
export type QAData = z.infer<typeof QA>;
export type WristSide = z.infer<typeof Wrist>;

export interface Entry<T> {
  id: string;
  data: T;
}
export type Intention = Entry<IntentionData>;
export type Stone = Entry<StoneData>;
export type Product = Entry<ProductData>;
export type Stack = Entry<StackData>;
