import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/Store/PageIntro";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { breadcrumbLd, ld } from "@/lib/schema";
import { formatReviewed, lastCommitDate, sources } from "@/lib/git-date";

const description = `Crystal Basket delivers across the UAE in 1 to 2 working days. Delivery is ${site.deliveryFeeAED} AED, free over ${site.freeDeliveryAED} AED, with card payment or cash on delivery.`;
export const metadata: Metadata = { title: "Delivery in the UAE", description, openGraph: { title: "Delivery in the UAE", description } };

const rows: [string, string][] = [
  ["Where", "Every emirate in the UAE. We do not ship outside the UAE yet."],
  ["How fast", "Most orders arrive the next working day, all within 1 to 2 working days of the order."],
  ["Cost", `${site.deliveryFeeAED} AED per order, free on orders over ${site.freeDeliveryAED} AED.`],
  ["Payment", "Card at the secure Shopify checkout, or cash on delivery."],
  ["Packaging", "Linen pouch with a meaning card, ready to give."],
];

export default function DeliveryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Delivery", routes.delivery]])) }} />
      <PageIntro heading="Delivery in the UAE" tagline="Strung in Dubai, at your door tomorrow." reviewed={formatReviewed(lastCommitDate(sources.page("delivery"), "apps/web/src/lib/site.ts"))}>
        <p>{description} Shopify emails your order confirmation as soon as you place the order, and the courier contacts you on the day of delivery.</p>
      </PageIntro>
      <section className="container-x pb-12 max-w-3xl">
        <h2 className="text-3xl md:text-[2.25rem] mb-5">How much is delivery and how long does it take?</h2>
        <div className="overflow-x-auto border border-cb-line">
          <table className="w-full text-[14px]">
            <caption className="sr-only">Delivery details</caption>
            <tbody className="divide-y divide-cb-line">{rows.map(([k, v]) => <tr key={k}><th scope="row" className="w-[34%] px-4 py-3 text-left font-normal text-cb-muted align-top">{k}</th><td className="px-4 py-3">{v}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="container-x pb-20 max-w-3xl space-y-8">
        <div>
          <h2 className="text-3xl md:text-[2.25rem]">Can I pay cash on delivery?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">Yes. Choose cash on delivery at checkout and pay the courier when the bracelet arrives. Card payments are taken at the same checkout. Discount codes and the {site.stackDiscountPct}% stack discount apply either way.</p>
        </div>
        <div>
          <h2 className="text-3xl md:text-[2.25rem]">What if the size is wrong?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">Exchange it for another size within 14 days. <Link href={routes.returns} className="text-cb-ink underline underline-offset-4">Exchanges and returns</Link> explains how, and the <Link href={routes.sizeGuide} className="text-cb-ink underline underline-offset-4">size guide</Link> helps you choose first.</p>
        </div>
      </section>
    </>
  );
}
