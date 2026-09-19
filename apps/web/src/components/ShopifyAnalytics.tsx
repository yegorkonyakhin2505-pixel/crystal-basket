"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useShopifyCookies } from "@shopify/hydrogen-react";
import { trackPageView } from "@/lib/analytics";
import { site } from "@/lib/site";

/**
 * Reports this storefront to Shopify analytics (sessions, page views, Live View).
 * The cookies are scoped to the root domain so the visit carries into Shopify checkout
 * on site.checkoutDomain and orders are attributed to the same session.
 */
export function ShopifyAnalytics() {
  const path = usePathname();
  const root = new URL(site.url).hostname.replace(/^www\./, "");
  useShopifyCookies({ hasUserConsent: true, domain: root, checkoutDomain: site.checkoutDomain });
  useEffect(() => { trackPageView(path); }, [path]);
  return null;
}
