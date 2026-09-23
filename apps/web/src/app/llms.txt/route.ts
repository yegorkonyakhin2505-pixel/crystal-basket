import { BEAD_MM, getIntentions, getProducts, getStacks, getStones } from "@crystal-basket/catalog";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { orderingFaq, productFaq } from "@/lib/faq";

export const dynamic = "force-static";

/**
 * /llms.txt (llmstxt.org): a plain-Markdown map of the site for AI assistants and
 * answer engines, generated from the catalog so it never drifts from the pages.
 */
export function GET() {
  const u = (p: string) => `${site.url}${p}`;
  const products = getProducts();
  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description} Bracelets are ${BEAD_MM} mm natural, undyed stone beads on stretch cord, made in ${site.city}, priced in ${site.currency}, with next-day delivery across the UAE and cash on delivery or card at checkout. Crystal meanings describe traditional beliefs and are not medical advice.`,
    "",
    "## Facts",
    "",
    `- Brand: ${site.name}, ${site.city}, United Arab Emirates. Instagram: https://www.instagram.com/${site.instagram}/. Email: ${site.email}.`,
    `- Every bracelet is ${BEAD_MM} mm beads, wrist sizes S 16 cm, M 18 cm, L 20 cm; custom lengths on request.`,
    `- Prices ${Math.min(...products.map((p) => p.data.priceAED))} to ${Math.max(...products.map((p) => p.data.priceAED))} AED. Delivery ${site.deliveryFeeAED} AED, free over ${site.freeDeliveryAED} AED, 1 to 2 business days in the UAE.`,
    `- Any three bracelets are ${site.stackDiscountPct}% off as a stack. Exchange unworn within 14 days; free re-stringing for life.`,
    "",
    "## Bracelets",
    "",
    ...products.map((p) => `- [${p.data.name}](${u(routes.product(p.id))}): ${p.data.subtitle}. ${p.data.promise} ${p.data.priceAED} AED${p.data.inStock ? "" : " (currently sold out)"}.`),
    "",
    "## Intentions",
    "",
    ...getIntentions().map((i) => `- [${i.data.name}](${u(routes.intention(i.id))}): ${i.data.tagline} ${i.data.description}`),
    "",
    "## Stones",
    "",
    ...getStones().map((s) => `- [${s.data.name}](${u(routes.stone(s.id))}): traditionally worn for ${s.data.keywords.join(", ").toLowerCase()}. ${s.data.description}`),
    "",
    "## Stacks",
    "",
    ...getStacks().map((s) => `- [${s.data.name}](${u(`${routes.stacks}?stack=${s.id}`)}): ${s.data.description} ${s.data.priceAED} AED.`),
    "",
    `- [Build your own bracelet](${u(routes.build)}): pick a wrist size, drop in any of the ${getStones().length} stones bead by bead, add a gold-filled bead, from ${site.custom.baseAED} AED.`,
    "",
    "## Guides",
    "",
    `- [Size guide](${u(routes.sizeGuide)}): how to measure a wrist and choose S, M or L.`,
    `- [Cleanse and care](${u(routes.care)}): moonlight, selenite or smoke cleansing; which stones to keep out of water and sun.`,
    `- [FAQ](${u(routes.faq)}): wearing, cleansing, paying, delivery and exchanges.`,
    `- [Delivery](${u(routes.delivery)}): UAE delivery times, fee and cash on delivery.`,
    `- [Exchanges and returns](${u(routes.returns)}): 14-day size exchange and free re-stringing.`,
    `- [Contact](${u(routes.contact)}): email and Instagram.`,
    `- [About Crystal Basket](${u(routes.about)}): who makes the bracelets and how.`,
    `- [Privacy](${u(routes.privacy)})`,
    `- [Wellness disclaimer](${u(routes.disclaimer)})`,
    "",
    "## Frequently asked",
    "",
    ...[...productFaq, ...orderingFaq].map((f) => `- **${f.q}** ${f.a}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
