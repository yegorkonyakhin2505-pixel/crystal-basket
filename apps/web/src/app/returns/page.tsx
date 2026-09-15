import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/Store/PageIntro";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { contactChannel } from "@/lib/contact";
import { breadcrumbLd, ld } from "@/lib/schema";
import { formatReviewed, lastCommitDate, sources } from "@/lib/git-date";

const description = "Exchange a Crystal Basket bracelet for another size within 14 days of delivery, unworn and in its pouch. We cover the courier once, and restring any bracelet free for life.";
export const metadata: Metadata = { title: "Exchanges & Returns", description, openGraph: { title: "Exchanges & Returns", description } };

const steps: [string, string][] = [
  ["Tell us", `Send us an ${contactChannel} within 14 days of delivery with your order name and the size you need.`],
  ["Send it back", "Keep the bracelet unworn and in its linen pouch. We arrange the courier collection and cover it once."],
  ["Get the new size", "We string the new size and send it out as soon as the original arrives back with us."],
];

export default function ReturnsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Exchanges & returns", routes.returns]])) }} />
      <PageIntro heading="Exchanges and returns" tagline="The wrong size is an easy fix." reviewed={formatReviewed(lastCommitDate(sources.page("returns")))}>
        <p>{description}</p>
      </PageIntro>
      <section className="container-x pb-12 max-w-5xl">
        <h2 className="text-3xl md:text-[2.25rem] mb-5">How do I exchange a bracelet?</h2>
        <ol className="grid md:grid-cols-3 gap-px bg-cb-line border border-cb-line">
          {steps.map(([t, s], i) => <li key={t} className="bg-white p-6"><span className="font-display text-3xl text-cb-gold">0{i + 1}</span><h3 className="font-display text-[1.4rem] mt-2">{t}</h3><p className="text-[13px] text-cb-muted mt-2">{s}</p></li>)}
        </ol>
      </section>
      <section className="container-x pb-20 max-w-3xl space-y-8">
        <div>
          <h2 className="text-3xl md:text-[2.25rem]">Can I return a bracelet for a refund?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">Our standard policy is an exchange for another size. If a bracelet arrives damaged or is not what you ordered, tell us straight away with a photo and we will put it right. Any other refund request is handled case by case, so <Link href={routes.contact} className="text-cb-ink underline underline-offset-4">get in touch</Link> and we will talk it through.</p>
        </div>
        <div>
          <h2 className="text-3xl md:text-[2.25rem]">What if the cord breaks later?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">Stretch cord is a wear part. We restring any {site.name} bracelet on fresh cord for free, for life. Send us your order name and we will arrange it.</p>
        </div>
      </section>
    </>
  );
}
