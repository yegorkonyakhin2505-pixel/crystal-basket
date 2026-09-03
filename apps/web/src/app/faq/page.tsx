import type { Metadata } from "next";
import { AccordionItem } from "@/components/ui";
import { orderingFaq, productFaq } from "@/lib/faq";
export const metadata: Metadata = { title: "FAQ" };
export default function FaqPage() {
  return (
    <>
      <section className="container-x pt-12 md:pt-20 pb-8 max-w-3xl"><p className="label-caps mb-3">FAQ</p><h1 className="text-4xl md:text-[3.25rem]">Things people ask us on WhatsApp.</h1></section>
      <section className="container-x pb-10 max-w-3xl"><p className="label-caps mb-2">Wearing & caring</p><div className="border-t border-cb-line">{productFaq.map((f) => <AccordionItem key={f.q} title={f.q}><p>{f.a}</p></AccordionItem>)}</div></section>
      <section className="container-x pb-20 max-w-3xl"><p className="label-caps mb-2">Ordering</p><div className="border-t border-cb-line">{orderingFaq.map((f) => <AccordionItem key={f.q} title={f.q}><p>{f.a}</p></AccordionItem>)}</div></section>
    </>
  );
}
