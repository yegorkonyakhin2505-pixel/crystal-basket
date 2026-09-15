import type { MetadataRoute } from "next";
import { getIntentions, getProducts, getStones } from "@crystal-basket/catalog";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { lastCommitDate, sources } from "@/lib/git-date";

export const dynamic = "force-static";

/**
 * lastmod is the last commit that touched the page's source or content file, so it only moves when the
 * page really changed (Google ignores lastmod that changes on every build). No priority/changefreq: ignored by Google.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = "packages/catalog/content";
  const fixed: [string, string[]][] = [
    [routes.home, [sources.page("page.tsx"), `${catalog}/products`]],
    [routes.shop, [sources.page("shop"), `${catalog}/products`]],
    [routes.stacks, [sources.page("stacks"), `${catalog}/stacks`]],
    [routes.intentions, [sources.page("intentions/page.tsx"), `${catalog}/intentions`]],
    [routes.stones, [sources.page("stones/page.tsx"), `${catalog}/stones`]],
    [routes.about, [sources.page("about")]],
    [routes.sizeGuide, [sources.page("size-guide"), "apps/web/src/lib/sizes.ts"]],
    [routes.care, [sources.page("care")]],
    [routes.faq, [sources.page("faq"), "apps/web/src/lib/faq.ts"]],
    [routes.delivery, [sources.page("delivery")]],
    [routes.returns, [sources.page("returns")]],
    [routes.contact, [sources.page("contact")]],
    [routes.privacy, [sources.page("privacy")]],
    [routes.disclaimer, [sources.page("disclaimer")]],
  ];
  const entries: [string, string[]][] = [
    ...fixed,
    ...getProducts().map((p) => [routes.product(p.id), [...sources.product(p.id), sources.page("products/[slug]")]] as [string, string[]]),
    ...getIntentions().map((i) => [routes.intention(i.id), [...sources.intention(i.id), sources.page("intentions/[slug]")]] as [string, string[]]),
    ...getStones().map((s) => [routes.stone(s.id), [...sources.stone(s.id), sources.page("stones/[slug]")]] as [string, string[]]),
  ];
  return entries.map(([path, files]) => {
    const lastModified = lastCommitDate(...files);
    return { url: `${site.url}${path}`, ...(lastModified ? { lastModified } : {}) };
  });
}
