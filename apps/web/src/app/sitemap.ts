import type { MetadataRoute } from "next";
import { getIntentions, getProducts, getStones } from "@crystal-basket/catalog";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed: [string, number][] = [
    [routes.home, 1], [routes.shop, 0.9], [routes.stacks, 0.8], [routes.intentions, 0.7], [routes.stones, 0.6],
    [routes.about, 0.4], [routes.sizeGuide, 0.4], [routes.care, 0.3], [routes.faq, 0.3], [routes.disclaimer, 0.1],
  ];
  const products = getProducts().map((p) => [routes.product(p.id), 0.8] as [string, number]);
  const intentions = getIntentions().map((i) => [routes.intention(i.id), 0.7] as [string, number]);
  const stones = getStones().map((s) => [routes.stone(s.id), 0.5] as [string, number]);
  return [...fixed, ...products, ...intentions, ...stones].map(([path, priority]) => ({ url: `${site.url}${path}`, lastModified: now, priority }));
}
