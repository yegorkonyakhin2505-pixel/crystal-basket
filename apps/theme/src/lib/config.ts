/** Site configuration injected by snippets/cb-config.liquid as window.CB (mirror of apps/web/src/lib/site.ts). */
export interface SiteConfig {
  name: string;
  city: string;
  currency: "AED";
  email: string;
  instagram: string;
  whatsapp: string;
  whatsappGreeting: string;
  deliveryFeeAED: number;
  freeDeliveryAED: number;
  deliveryCopy: string;
  stackDiscountPct: number;
  welcome: { pct: number; code: string };
  custom: { handle: string; baseAED: number; tierAED: { classic: number; select: number; rare: number }; goldAED: number; maxGold: number };
  flags: { whatsapp: boolean; offerPopup: boolean; reviews: boolean; wishlist: boolean };
  routes: Record<"home" | "shop" | "stacks" | "build" | "intentions" | "stones" | "about" | "sizeGuide" | "care" | "faq" | "disclaimer" | "delivery" | "returns" | "contact" | "privacy" | "wishlist" | "cart" | "checkout", string>;
  offerImage: string;
  cartEnabled: boolean;
}

declare global { interface Window { CB?: SiteConfig } }

const FALLBACK: SiteConfig = {
  name: "Crystal Basket", city: "Dubai", currency: "AED", email: "hello@crystalbasket.store", instagram: "crystal.basket",
  whatsapp: "971500000000", whatsappGreeting: "Hi Crystal Basket! I'd like to order:", deliveryFeeAED: 25, freeDeliveryAED: 250,
  deliveryCopy: "Next-day delivery across the UAE.", stackDiscountPct: 15, welcome: { pct: 10, code: "WELCOME10" },
  custom: { handle: "custom-bracelet", baseAED: 75, tierAED: { classic: 0, select: 3, rare: 3 }, goldAED: 10, maxGold: 6 },
  flags: { whatsapp: false, offerPopup: true, reviews: false, wishlist: true },
  routes: { home: "/", shop: "/collections/all", stacks: "/pages/stacks", build: "/pages/build", intentions: "/pages/intentions", stones: "/pages/stones", about: "/pages/about", sizeGuide: "/pages/size-guide", care: "/pages/care", faq: "/pages/faq", disclaimer: "/pages/disclaimer", delivery: "/pages/delivery", returns: "/pages/returns", contact: "/pages/contact", privacy: "/pages/privacy", wishlist: "/pages/wishlist", cart: "/cart", checkout: "/checkout" },
  offerImage: "", cartEnabled: true,
};

export const site: SiteConfig = typeof window !== "undefined" && window.CB ? { ...FALLBACK, ...window.CB } : FALLBACK;
export const flags = site.flags;
export const routes = site.routes;
