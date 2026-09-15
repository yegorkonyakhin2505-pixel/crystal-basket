import { site } from "./site";
import { routes } from "./paths";

/**
 * Schema.org JSON-LD builders. Every page that emits structured data goes through
 * here so the organisation, shipping and return facts are stated once.
 * Values come from site.ts and the catalog; nothing is invented (no ratings until N03).
 */
const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": ORG_ID,
  name: site.name,
  url: site.url,
  logo: { "@type": "ImageObject", url: `${site.url}/brand/logo-badge.svg`, width: 1200, height: 1200 },
  image: `${site.url}/images/hero/hero-1.jpg`,
  description: site.description,
  email: site.email,
  areaServed: { "@type": "Country", name: "United Arab Emirates" },
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "AE" },
  currenciesAccepted: site.currency,
  paymentAccepted: "Credit card, Cash on delivery",
  sameAs: [`https://instagram.com/${site.instagram}`, ...(site.tiktok ? [`https://tiktok.com/@${site.tiktok}`] : [])],
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

/** Shipping and returns as Google's Product rich result expects them (merchant listing experience). */
export const shippingDetailsLd = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 25, currency: "AED" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "AE" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
  },
};
export const freeShippingDetailsLd = {
  ...shippingDetailsLd,
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "AED" },
  // Free over the site threshold; Google has no minimum-order field, so we describe it in text on the page as well.
  name: `Free delivery over ${site.freeDeliveryAED} AED`,
};
export const returnPolicyLd = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "AE",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
  itemCondition: "https://schema.org/NewCondition",
};

export function breadcrumbLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Home", routes.home] as [string, string], ...items].map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${site.url}${path}`,
    })),
  };
}

export function itemListLd(name: string, items: { name: string; path: string; image?: string | null }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${site.url}${p.path}`,
      ...(p.image ? { image: `${site.url}${p.image}` } : {}),
    })),
  };
}

/** Serialise for a <script type="application/ld+json">; "<" is escaped so user content can never close the tag. */
export const ld = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
