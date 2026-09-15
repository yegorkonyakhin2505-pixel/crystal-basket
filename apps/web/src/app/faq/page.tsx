import type { Metadata } from "next";
import Link from "next/link";
import { AccordionItem } from "@/components/ui";
import { PageIntro } from "@/components/Store/PageIntro";
import { orderingFaq, productFaq, type QA } from "@/lib/faq";
import { faqPageLd, ld } from "@/lib/schema";
import { formatReviewed, lastCommitDate, sources } from "@/lib/git-date";

const description = "Crystal bracelet questions answered: which wrist, how to cleanse, sleeping in it, real stones, stacking, paying, UAE delivery and size exchanges.";
export const metadata: Metadata = { title: "Crystal Bracelet FAQ", description, openGraph: { title: "Crystal Bracelet FAQ", description } };

function Group({ title, items }: { title: string; items: QA[] }) {
  return (
    <section className="container-x pb-10 max-w-3xl">
      <h2 className="label-caps mb-2">{title}</h2>
      <div className="border-t border-cb-line">
        {items.map((f) => (
          <AccordionItem key={f.q} title={f.q} heading="h3">
            <p>{f.a}</p>
            {f.link && <p className="mt-2"><Link href={f.link[0]} className="text-cb-ink underline underline-offset-4 hover:text-cb-rose">{f.link[1]}</Link></p>}
          </AccordionItem>
        ))}
      </div>
    </section>
  );
}

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqPageLd([...productFaq, ...orderingFaq])) }} />
      <PageIntro heading="Crystal bracelet FAQ" tagline="Things people ask us." reviewed={formatReviewed(lastCommitDate(sources.page("faq"), "apps/web/src/lib/faq.ts"))} />
      <Group title="Wearing & caring" items={productFaq} />
      <div className="pb-10"><Group title="Ordering & delivery" items={orderingFaq} /></div>
    </>
  );
}
