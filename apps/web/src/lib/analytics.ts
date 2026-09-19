"use client";
import {
  AnalyticsEventName,
  AnalyticsPageType,
  ShopifySalesChannel,
  getClientBrowserParameters,
  sendShopifyAnalytics,
  type ShopifyAnalyticsProduct,
} from "@shopify/hydrogen-react";
import { shopifyEnabled, type Cart } from "./shopify";
import { site } from "./site";

/**
 * Shopify analytics for our own storefront. Without this, Shopify only counts visits to the
 * (hidden) stock Online Store, so the admin dashboard shows almost nothing. These events make
 * crystalbasket.store the traffic Shopify reports: sessions, page views, Live View and add-to-cart.
 * Cookies are set on the root domain so checkout on site.checkoutDomain continues the same session.
 */
// Events post to https://<this host>/.well-known/shopify/monorail/... so it must be a Shopify-served
// host: our own domain is GitHub Pages and answers 405. The checkout subdomain is Shopify's and shares
// our root domain, so the visit, the cookies and the order all belong to one session.
const EVENT_HOST = site.checkoutDomain;

const base = () => ({
  hasUserConsent: true,
  shopId: site.shopifyShopId,
  currency: site.currency as "AED",
  acceptedLanguage: "EN" as const,
  shopifySalesChannel: ShopifySalesChannel.headless,
});

/** Map our routes onto the page types Shopify understands, so its reports group pages sensibly. */
export function pageTypeFor(path: string): string {
  if (path === "/") return AnalyticsPageType.home;
  if (path.startsWith("/products/")) return AnalyticsPageType.product;
  if (path.startsWith("/intentions/") || path.startsWith("/stones/") || path === "/shop/" || path === "/stacks/") return AnalyticsPageType.collection;
  if (path === "/intentions/" || path === "/stones/") return AnalyticsPageType.listCollections;
  if (path === "/privacy/" || path === "/returns/" || path === "/delivery/" || path === "/disclaimer/") return AnalyticsPageType.policy;
  return AnalyticsPageType.page;
}

export function trackPageView(path: string) {
  if (!shopifyEnabled) return;
  void sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.PAGE_VIEW_2,
      payload: {
        ...getClientBrowserParameters(),
        ...base(),
        pageType: pageTypeFor(path),
        canonicalUrl: `${site.url}${path}`,
      },
    },
    EVENT_HOST,
  ).catch(() => {});
}

export function trackAddToCart(cart: Cart, merchandiseIds: string[]) {
  if (!shopifyEnabled) return;
  const added = cart.lines.filter((l) => merchandiseIds.includes(l.variantGid));
  const lines = added.length ? added : cart.lines;
  const products: ShopifyAnalyticsProduct[] = lines.map((l) => ({
    productGid: l.productGid,
    variantGid: l.variantGid,
    name: l.title,
    variantName: l.variantTitle,
    brand: l.vendor || site.name,
    price: String(l.priceAED),
    quantity: l.quantity,
  }));
  void sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.ADD_TO_CART,
      payload: {
        ...getClientBrowserParameters(),
        ...base(),
        cartId: cart.id,
        totalValue: cart.subtotalAED,
        products,
      },
    },
    EVENT_HOST,
  ).catch(() => {});
}
