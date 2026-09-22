import type { Product, Stone } from "@crystal-basket/catalog";
import { site } from "./site";
import { routes } from "./paths";

/**
 * Schema.org JSON-LD builders. Every page that emits structured data goes through here so the
 * organisation, shipping and return facts are stated once and match the visible copy
 * (/delivery/, /returns/, product delivery line). Nothing is invented: no ratings until N03.
 */
const U = (path: string) => `${site.url}${path}`;
export const ORG_ID = `${site.url}/#organization`;
export const SITE_ID = `${site.url}/#website`;

/** 14-day unworn size exchange, courier covered once. An exchange, not a refund. */
export const returnPolicyLd = {
  "@type": "MerchantReturnPolicy",
  "@id": `${site.url}/#returns`,
  applicableCountry: "AE",
  returnPolicyCountry: "AE",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  itemCondition: "https://schema.org/NewCondition",
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
  refundType: "https://schema.org/ExchangeRefund",
  merchantReturnLink: U(routes.returns),
};

/** Standard UAE delivery. The free-over-threshold rule is order-level, so it lives in visible copy, not here. */
export const shippingDetailsLd = {
  "@type": "OfferShippingDetails",
  "@id": `${site.url}/#shipping-uae`,
  shippingRate: { "@type": "MonetaryAmount", value: site.deliveryFeeAED, currency: site.currency },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "AE" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
  },
};

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": ORG_ID,
  name: site.name,
  url: site.url,
  logo: { "@type": "ImageObject", url: U("/brand/logo-badge.svg"), width: 1200, height: 1200 },
  image: U("/images/hero/hero-1.jpg"),
  description: site.description,
  email: site.email,
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: site.email, availableLanguage: "en", areaServed: "AE" },
  areaServed: { "@type": "Country", name: "United Arab Emirates" },
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "AE" },
  sameAs: [`https://www.instagram.com/${site.instagram}/`, ...(site.tiktok ? [`https://www.tiktok.com/@${site.tiktok}`] : [])],
  hasMerchantReturnPolicy: returnPolicyLd,
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  name: site.name,
  url: site.url,
  inLanguage: "en",
  publisher: { "@id": ORG_ID },
};

export function productLd(p: Product, stones: Stone[], images: string[], description: string) {
  const d = p.data;
  const url = U(routes.product(p.id));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${d.name} — ${d.subtitle}`,
    description,
    sku: p.id,
    brand: { "@type": "Brand", name: site.name },
    material: stones.map((s) => s.data.name).join(", "),
    color: stones.map((s) => s.data.color).join(", "),
    category: "Apparel & Accessories > Jewelry > Bracelets",
    audience: { "@type": "PeopleAudience", suggestedGender: d.style === "men" ? "male" : d.style === "women" ? "female" : "unisex" },
    url,
    image: images.map(U),
    offers: {
      "@type": "Offer",
      url,
      price: d.priceAED,
      priceCurrency: site.currency,
      // Sold out means the buy button is disabled and Shopify stock is 0 with overselling off.
      availability: d.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID, "@type": "Organization", name: site.name },
      shippingDetails: shippingDetailsLd,
      hasMerchantReturnPolicy: returnPolicyLd,
    },
  };
}

export function breadcrumbLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Home", routes.home] as [string, string], ...items].map(([name, path], i) => ({
      "@type": "ListItem", position: i + 1, name, item: U(path),
    })),
  };
}

type ListEntry = { name: string; path: string; image?: string | null };
const itemList = (name: string, items: ListEntry[]) => ({
  "@type": "ItemList",
  name,
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: U(it.path), ...(it.image ? { image: U(it.image) } : {}) })),
});

/** Listing pages (shop, intentions, stacks, index hubs): a CollectionPage whose main entity is the grid in DOM order. */
export function collectionPageLd(name: string, path: string, description: string, items: ListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": U(path),
    url: U(path),
    name,
    description,
    isPartOf: { "@id": SITE_ID },
    mainEntity: itemList(name, items),
  };
}

/** Stone guide page: about the stone, listing the bracelets that contain it. No medical types. */
export function stonePageLd(stone: Stone, name: string, description: string, items: ListEntry[], image?: string | null) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": U(routes.stone(stone.id)),
    url: U(routes.stone(stone.id)),
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": SITE_ID },
    about: { "@type": "Thing", name: stone.data.name, alternateName: `${stone.data.name} crystal`, ...(image ? { image: U(image) } : {}) },
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: U(image) } } : {}),
    ...(items.length ? { mainEntity: itemList(`Bracelets with ${stone.data.name}`, items) } : {}),
  };
}

export function faqPageLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** Serialise for a <script type="application/ld+json">; "<" is escaped so content can never close the tag. */
export const ld = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
