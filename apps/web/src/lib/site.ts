/**
 * Site configuration. Everything a non-developer may need to change lives
 * here or in packages/catalog/content. Flags default OFF ("shipped dark") and
 * are switched on by editing this file once the NEEDED.md item is provided.
 */
export const site = {
  name: "Crystal Basket",
  tagline: "Energy you can wear.",
  description:
    "Hand-strung crystal bracelets chosen by intention. Natural stones, cleansed and charged before they leave Dubai.",
  url: "https://yegorkonyakhin2505-pixel.github.io/crystal-basket",
  city: "Dubai",
  currency: "AED",
  /** TODO[NEEDED:N01] real WhatsApp business number, digits only. */
  whatsapp: "971500000000",
  email: "hello@crystalbasket.ae",
  instagram: "crystalbasket.ae",
  tiktok: "crystalbasket.ae",
  freeDeliveryAED: 250,
  deliveryCopy: "Same-day delivery in Dubai, next-day across the UAE.",
  announcement: "Free UAE delivery over 250 AED · Every piece cleansed & charged before it ships",
  stackDiscountPct: 15,
  /** TODO[NEEDED:N03] replace with real review numbers. */
  reviews: { average: 4.9, count: 312 },
  whatsappGreeting: "Hi Crystal Basket! I'd like to order:",
} as const;

/** Feature flags. Default off. Flip once the matching NEEDED item is done. */
export const flags = {
  /** TODO[NEEDED:N02] card checkout via payment links in product JSON. */
  cardCheckout: true,
  /** TODO[NEEDED:N04] newsletter provider (Klaviyo/Mailchimp) form action. */
  newsletter: false,
  /** Wishlist persisted in localStorage (no account needed). */
  wishlist: true,
} as const;
