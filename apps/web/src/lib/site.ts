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
  url: "https://crystalbasket.store",
  /** Shopify checkout runs on this subdomain (Settings → Domains), so the whole journey stays on crystalbasket.store. */
  checkoutDomain: "shop.crystalbasket.store",
  /** Public Shopify shop id, used to report this storefront's traffic in Shopify analytics. */
  shopifyShopId: "gid://shopify/Shop/76545687731",
  city: "Dubai",
  currency: "AED",
  /** TODO[NEEDED:N01] real WhatsApp business number, digits only. */
  whatsapp: "971500000000",
  email: "hello@crystalbasket.store",
  instagram: "crystal.basket",
  /** TODO[NEEDED:N06] TikTok handle; empty hides the footer link. */
  tiktok: "",
  /** Standard UAE delivery fee (Shopify UAE zone, N13). Shown on product pages and /delivery/, and in Offer schema. */
  deliveryFeeAED: 25,
  freeDeliveryAED: 250,
  deliveryCopy: "Next-day delivery across the UAE.",
  announcement: "Free UAE delivery over 250 AED · Every piece cleansed & charged before it ships",
  stackDiscountPct: 15,
  /** Build-your-own bracelet (/build/). Price = base + the highest stone tier used + the gold-filled bead. Shopify product "custom-bracelet" carries the same grid as variants. */
  custom: { handle: "custom-bracelet", baseAED: 75, tierAED: { classic: 0, select: 10, rare: 20 }, goldAED: 10, maxGold: 3 },
  /** TODO[NEEDED:N03] replace with real review numbers. */
  reviews: { average: 4.9, count: 312 },
  whatsappGreeting: "Hi Crystal Basket! I'd like to order:",
  /** Welcome offer shown in the popup and newsletter bar. */
  welcome: { pct: 10, code: "WELCOME10" },
} as const;

/** Feature flags. Default off. Flip once the matching NEEDED item is done. */
export const flags = {
  /** TODO[NEEDED:N02] card checkout via payment links in product JSON. */
  cardCheckout: true,
  /** TODO[NEEDED:N04] newsletter provider (Klaviyo/Mailchimp) form action. */
  newsletter: false,
  /** TODO[NEEDED:N03] real customer reviews. The sample quotes in Testimonials.tsx stay hidden until then. */
  reviews: false,
  /** Wishlist persisted in localStorage (no account needed). */
  wishlist: true,
  /** Welcome-offer popup after the first interaction. */
  offerPopup: true,
  /** TODO[NEEDED:N01] WhatsApp order and contact buttons. Off while site.whatsapp is the placeholder; every
   *  WhatsApp link falls back to email (lib/contact.ts). Set the real number, then flip to true. */
  whatsapp: false,
  /** Shopify cart + checkout switches on automatically when NEXT_PUBLIC_SHOPIFY_DOMAIN and
   *  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN are present at build time. See lib/shopify.ts. */
} as const;
