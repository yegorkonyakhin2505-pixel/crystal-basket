import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntention, getProduct, getProducts, relatedProducts, stonesForProduct } from "@crystal-basket/catalog";
import { Img } from "@/components/Img";
import { BuyBox } from "@/components/Store/BuyBox";
import { BeadRing } from "@/components/Store/BeadRing";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { AccordionItem, Badge, SectionTitle } from "@/components/ui";
import { productImage } from "@/lib/images";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { beadCount } from "@/lib/sizes";
import { productFaq } from "@/lib/faq";

type Params = { slug: string };
export function generateStaticParams(): Params[] { return getProducts().map((p) => ({ slug: p.id })); }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProducts().find((x) => x.id === slug);
  if (!p) return {};
  return { title: `${p.data.name} · ${p.data.subtitle}`, description: `${p.data.promise} ${p.data.body}` };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProducts().find((x) => x.id === slug);
  if (!product) notFound();
  const d = product.data;
  const stones = stonesForProduct(product);
  const intention = getIntention(d.intention);
  const secondary = d.secondaryIntentions.map(getIntention);
  const img = productImage(product);
  const related = relatedProducts(product, 4);
  const chakras = [...new Set(stones.flatMap((s) => s.data.chakra))];
  const zodiac = [...new Set(stones.flatMap((s) => s.data.zodiac))];
  const noWater = stones.some((s) => !s.data.waterSafe);
  const noSun = stones.some((s) => !s.data.sunSafe);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: `${d.name} — ${d.subtitle}`, description: `${d.promise} ${d.body}`,
    brand: { "@type": "Brand", name: site.name }, material: stones.map((s) => s.data.name).join(", "),
    offers: { "@type": "Offer", priceCurrency: "AED", price: d.priceAED, availability: d.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="container-x pt-5 text-[13px] text-cb-muted" aria-label="Breadcrumb">
        <Link href={routes.home} className="hover:text-cb-ink">Home</Link> | <Link href={routes.shop} className="hover:text-cb-ink">Bracelets</Link> | <Link href={routes.intention(intention.id)} className="hover:text-cb-ink">{intention.data.name}</Link> | <span className="text-cb-ink">{d.name}</span>
      </nav>

      <section className="container-x pt-6 pb-16 grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-16">
        <div className="grid gap-2">
          <div className="aspect-square bg-white border border-cb-line overflow-hidden">
            {img ? <Img src={img} alt={`${d.name} — ${d.subtitle}`} loading="eager" /> : <BeadRing palettes={stones.map((s) => s.data.palette)} gold={d.goldAccent} />}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {intention.data.image && <div className="aspect-[3/4] bg-cb-band overflow-hidden"><Img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/intentions/${intention.data.image}`} alt={`${intention.data.name} on the wrist`} /></div>}
            <div className="aspect-[3/4] bg-cb-band p-6 flex flex-col justify-end">
              <p className="label-caps mb-2">{d.triad.join(" · ")}</p>
              <p className="font-display text-[1.5rem] leading-snug italic">“{d.affirmation}”</p>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 self-start">
          <p className="label-caps mb-3">{intention.data.name}</p>
          <h1 className="text-4xl md:text-[3rem]">{d.name}</h1>
          <p className="text-cb-muted mt-2 text-[14px]">{d.subtitle}</p>
          <p className="font-display text-[1.35rem] mt-5 italic">{d.promise}</p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            <Badge tone="ink">{intention.data.short}</Badge>
            {secondary.map((s) => <Badge key={s.id}>{s.data.short}</Badge>)}
            {d.goldAccent && <Badge>14k gold-filled accent</Badge>}
            <Badge className="capitalize">{d.style}</Badge>
          </div>
          <div className="hairline my-7" />
          <BuyBox id={product.id} name={d.name} priceAED={d.priceAED} compareAtAED={d.compareAtAED} beadSizes={d.beadSizes} defaultBead={d.defaultBead} sizes={d.sizes} inStock={d.inStock} stripePaymentLink={d.stripePaymentLink} freeDeliveryAED={site.freeDeliveryAED} deliveryCopy={site.deliveryCopy} />
          <div className="mt-8">
            <AccordionItem title="The piece" defaultOpen><p>{d.body}</p></AccordionItem>
            <AccordionItem title="Stones in this bracelet">
              <ul className="space-y-3">
                {stones.map((s) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="mt-1 h-5 w-5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: `radial-gradient(circle at 35% 30%, ${s.data.palette[0]}, ${s.data.palette[1]})` }} />
                    <span><Link href={routes.stone(s.id)} className="text-cb-ink underline underline-offset-4 hover:text-cb-rose">{s.data.name}</Link> — {s.data.keywords.join(", ")}. {s.data.description}</span>
                  </li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem title="Materials & dimensions">
              <dl className="grid grid-cols-[130px_1fr] gap-y-1.5 gap-x-3">
                <dt>Stones</dt><dd className="text-cb-ink">{stones.map((s) => s.data.name).join(", ")}. Natural, undyed, A-grade.</dd>
                <dt>Bead sizes</dt><dd className="text-cb-ink">{d.beadSizes.map((b) => `${b} mm`).join(" / ")}</dd>
                <dt>Lengths</dt><dd className="text-cb-ink">S 16 cm · M 18 cm · L 20 cm</dd>
                <dt>Beads per piece</dt><dd className="text-cb-ink">approx. {beadCount(d.defaultBead, 16)} (S) · {beadCount(d.defaultBead, 18)} (M) · {beadCount(d.defaultBead, 20)} (L) at {d.defaultBead} mm</dd>
                <dt>Cord</dt><dd className="text-cb-ink">1 mm premium stretch cord, double-knotted</dd>
                {d.goldAccent && <><dt>Accent</dt><dd className="text-cb-ink">14k gold-filled bead or spacer</dd></>}
                <dt>Chakra</dt><dd className="text-cb-ink">{chakras.join(", ")}</dd>
                <dt>Zodiac</dt><dd className="text-cb-ink">{zodiac.join(", ")}</dd>
              </dl>
            </AccordionItem>
            <AccordionItem title="What’s in the box"><ul className="space-y-1">{d.includes.map((i) => <li key={i}>· {i}</li>)}</ul></AccordionItem>
            <AccordionItem title="Activate, cleanse & care">
              <ol className="space-y-1.5 mb-3 list-decimal list-inside text-cb-ink">
                <li>Hold it in both hands and take three slow breaths.</li>
                <li>Say the intention out loud, three times: “{d.affirmation}”</li>
                <li>Wear it on the wrist that feels right. Left to receive, right to project.</li>
              </ol>
              <p>Cleanse on arrival and about once a month: overnight in moonlight, on a selenite plate, or with smoke.{noWater ? " Keep this one dry: one of its stones does not like water." : " A quick rinse in plain water is fine."}{noSun && " Avoid long sun: one of these stones fades in sunlight."} <Link href={routes.care} className="underline underline-offset-4">Full care guide</Link>.</p>
            </AccordionItem>
            <AccordionItem title="Delivery & returns"><p>{site.deliveryCopy} Free over {site.freeDeliveryAED} AED. Cash on delivery available. Wrong size? Swap it within 14 days, unworn, and we cover the courier once.</p></AccordionItem>
          </div>
          <p className="text-[11px] text-cb-faint mt-5">Natural stone varies: colour, banding and flash differ from the picture. Crystal meanings reflect traditional beliefs and are not medical advice. <Link href={routes.disclaimer} className="underline">Disclaimer</Link>.</p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-x"><SectionTitle eyebrow="Complete the stack" title="Worn well together" /></div>
        <ProductGrid products={related} />
      </section>

      <section className="container-x pb-16 md:pb-24 max-w-3xl">
        <SectionTitle eyebrow="Questions" title="Things people ask us" />
        <div className="border-t border-cb-line">{productFaq.map((f) => <AccordionItem key={f.q} title={f.q}><p>{f.a}</p></AccordionItem>)}</div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: productFaq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) }} />
      </section>
    </>
  );
}
