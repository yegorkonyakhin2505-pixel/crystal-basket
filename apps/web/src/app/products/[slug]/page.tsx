import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BEAD_MM, getIntention, getProduct, getProducts, relatedProducts, stackForProduct, stonesForProduct } from "@crystal-basket/catalog";
import { Img } from "@/components/Img";
import { BuyBox } from "@/components/Store/BuyBox";
import { BeadRing } from "@/components/Store/BeadRing";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { AccordionItem, Badge, SectionTitle } from "@/components/ui";
import { intentionImage, productImage, stoneImage } from "@/lib/images";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { WRIST_SIZES, beadCount } from "@/lib/sizes";
import { breadcrumbLd, ld, productLd } from "@/lib/schema";

const list = (names: string[]) => names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
const WRIST = {
  left: "the left wrist, the receiving side",
  right: "the right wrist, the projecting side",
  either: "either wrist, since its stones are traditionally worn on both sides",
} as const;

type Params = { slug: string };
export function generateStaticParams(): Params[] { return getProducts().map((p) => ({ slug: p.id })); }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProducts().find((x) => x.id === slug);
  if (!p) return {};
  const img = productImage(p);
  // "Citrine & Pyrite Bracelet, The Alchemist · Crystal Basket" when it fits in about 60 characters; the descriptive phrase alone otherwise.
  const withName = `${p.data.seoTitle}, ${p.data.name}`;
  const title = withName.length <= 45 ? withName : p.data.seoTitle;
  return { title, description: p.data.seoDescription, openGraph: { title, description: p.data.seoDescription, images: img ? [{ url: img, width: 1200, height: 1200 }] : undefined } };
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
  const detail = productImage(product, 1);
  const related = relatedProducts(product, 4);
  const stack = stackForProduct(product);
  const stackMates = stack ? stack.data.products.filter((id) => id !== product.id).map(getProduct) : [];
  const chakras = [...new Set(stones.flatMap((s) => s.data.chakra))];
  const zodiac = stones.some((s) => s.data.zodiac.includes("All signs")) ? ["All signs"] : [...new Set(stones.flatMap((s) => s.data.zodiac))];
  const stoneNames = stones.map((s) => s.data.name);
  const noWater = stones.filter((s) => !s.data.waterSafe).map((s) => s.data.name);
  const noSun = stones.filter((s) => !s.data.sunSafe).map((s) => s.data.name);
  const images = [img, detail].filter((x): x is string => Boolean(x));

  // Three questions specific to this piece. The general ones live once, on /faq/.
  const faq: { q: string; a: string }[] = [
    {
      q: `Which wrist do you wear ${d.name} on?`,
      a: `${d.name} is a ${intention.data.short.toLowerCase()} bracelet, and tradition puts ${intention.data.short.toLowerCase()} stones on ${WRIST[intention.data.wrist]}. That is a custom, not a rule: wear ${list(stoneNames).toLowerCase()} wherever it feels comfortable, and keep it off the hand you write with if the beads catch on the desk.`,
    },
    {
      q: `Can ${d.name} get wet or sit in the sun?`,
      a: `Take it off before showers, swimming and the gym, because water and soap wear out stretch cord on every bracelet. ${noWater.length ? `${list(noWater)} should stay dry altogether.` : `A brief rinse in plain water is fine when you cleanse ${list(stoneNames).toLowerCase()}.`} ${noSun.length ? `Keep it out of long direct sun too, which fades ${list(noSun).toLowerCase()}.` : "Its stones are sun safe, so a spell on a bright windowsill does no harm."}`,
    },
    stack
      ? {
          q: `What does ${d.name} stack with?`,
          a: `${d.name} is part of ${stack.data.name}, worn with ${list(stackMates.map((m) => m.data.name))}. All three are ${BEAD_MM} mm, so they sit evenly on one wrist, and any three bracelets bought together are ${site.stackDiscountPct}% off at checkout. You can also swap in any other piece in the stack builder.`,
        }
      : {
          q: `What does ${d.name} stack with?`,
          a: `Every Crystal Basket bracelet is ${BEAD_MM} mm, so ${d.name} sits evenly beside any of them. ${related[0] && related[1] ? `${related[0].data.name} and ${related[1].data.name} are the closest match in stones and intention.` : ""} Any three bracelets bought together are ${site.stackDiscountPct}% off at checkout, and the stack builder shows them side by side first.`,
        },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(productLd(product, stones, images, `${d.promise} ${d.body}`)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Bracelets", routes.shop], [intention.data.name, routes.intention(intention.id)], [d.name, routes.product(product.id)]])) }} />
      <nav className="container-x pt-5 text-[13px] text-cb-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li><Link href={routes.home} className="hover:text-cb-ink">Home</Link></li>
          <li className="flex gap-x-2"><span aria-hidden>|</span><Link href={routes.shop} className="hover:text-cb-ink">Bracelets</Link></li>
          <li className="flex gap-x-2"><span aria-hidden>|</span><Link href={routes.intention(intention.id)} className="hover:text-cb-ink">{intention.data.name}</Link></li>
          <li className="flex gap-x-2"><span aria-hidden>|</span><span className="text-cb-ink" aria-current="page">{d.name}</span></li>
        </ol>
      </nav>

      {/* Mobile order: photo, buy box, then the detail photo. Desktop: photos left, sticky buy box right. */}
      <section className="container-x pt-6 pb-16 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-x-16 lg:gap-y-2 [grid-template-areas:'main'_'info'_'more'] lg:[grid-template-areas:'main_info'_'more_info'] lg:grid-rows-[auto_1fr]">
        <div className="[grid-area:main] aspect-square bg-white border border-cb-line overflow-hidden">
          {img ? <Img src={img} alt={`${d.name}, ${d.seoTitle.toLowerCase()}`} sizes="(min-width: 1024px) 55vw, 100vw" loading="eager" fetchPriority="high" /> : <BeadRing palettes={stones.map((s) => s.data.palette)} gold={d.goldAccent} />}
        </div>
        <div className="[grid-area:more] grid grid-cols-2 gap-2 self-start">
          {(detail ?? intentionImage(intention)) && <div className="aspect-[3/4] bg-cb-band overflow-hidden"><Img src={(detail ?? intentionImage(intention))!} alt={detail ? `${d.name} worn on the wrist` : `${intention.data.name} bracelets on the wrist`} sizes="(min-width: 1024px) 28vw, 50vw" /></div>}
          <div className="aspect-[3/4] bg-cb-band p-6 flex flex-col justify-end">
            <p className="label-caps mb-2">{d.triad.join(" · ")}</p>
            <p className="font-display text-[1.5rem] leading-snug italic">“{d.affirmation}”</p>
          </div>
        </div>

        <div id="buy" className="[grid-area:info] lg:sticky lg:top-28 self-start">
          <p className="label-caps mb-3">{intention.data.name}</p>
          <h1 className="text-4xl md:text-[3rem]">{d.name}<span className="block font-body text-[14px] text-cb-muted mt-2 tracking-normal leading-normal">{d.seoTitle}</span></h1>
          <p className="font-display text-[1.35rem] mt-5 italic">{d.promise}</p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {d.leavingSoon && <Badge tone="rose">Leaving soon</Badge>}
            <Badge tone="ink">{intention.data.short}</Badge>
            {secondary.map((s) => <Badge key={s.id}>{s.data.short}</Badge>)}
            {d.goldAccent && <Badge>14k gold-filled accent</Badge>}
            <Badge>{d.style}</Badge>
          </div>
          {d.leavingSoon && (
            <p className="mt-4 text-[13px] text-cb-rose">Leaving soon. A one-off piece from the studio, separate from our regular line: once these sell out we will not restring it.</p>
          )}
          {stack && (
            <p className="mt-4 text-[13px] text-cb-muted">Part of <Link href={`${routes.stacks}?stack=${stack.id}#build`} className="text-cb-ink underline underline-offset-4 hover:text-cb-rose">{stack.data.name}</Link>, {site.stackDiscountPct}% off as a set of three.</p>
          )}
          <div className="hairline my-7" />
          <BuyBox id={product.id} name={d.name} priceAED={d.priceAED} compareAtAED={d.compareAtAED} sizes={d.sizes} inStock={d.inStock} stripePaymentLink={d.stripePaymentLink} freeDeliveryAED={site.freeDeliveryAED} deliveryFeeAED={site.deliveryFeeAED} deliveryCopy={site.deliveryCopy} />
          <div className="mt-8">
            <AccordionItem title="The piece" defaultOpen><p>{d.body}</p></AccordionItem>
            <AccordionItem title="Stones in this bracelet">
              <ul className="space-y-3">
                {stones.map((s) => (
                  <li key={s.id} className="flex gap-3">
                    {stoneImage(s) ? <img src={stoneImage(s)!} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/5" loading="lazy" /> : <span className="mt-1 h-5 w-5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: `radial-gradient(circle at 35% 30%, ${s.data.palette[0]}, ${s.data.palette[1]})` }} />}
                    <span><Link href={routes.stone(s.id)} prefetch={false} className="text-cb-ink underline underline-offset-4 hover:text-cb-rose">{s.data.name}</Link>: {s.data.keywords.join(", ")}. {s.data.description}</span>
                  </li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem title="Materials & dimensions">
              <dl className="grid grid-cols-[130px_1fr] gap-y-1.5 gap-x-3">
                <dt>Stones</dt><dd className="text-cb-ink">{stoneNames.join(", ")}. Natural and undyed.</dd>
                <dt>Bead size</dt><dd className="text-cb-ink">{BEAD_MM} mm, our classic size</dd>
                <dt>Lengths</dt><dd className="text-cb-ink">{d.sizes.map((k) => `${k} ${WRIST_SIZES[k].cm} cm`).join(" · ")}</dd>
                <dt>Beads per piece</dt><dd className="text-cb-ink">approx. {beadCount(BEAD_MM, 16)} (S) · {beadCount(BEAD_MM, 18)} (M) · {beadCount(BEAD_MM, 20)} (L)</dd>
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
              <p>Cleanse on arrival and about once a month: overnight in moonlight, on a selenite plate, or with smoke.{noWater.length ? ` Keep this one dry: ${list(noWater)} ${noWater.length > 1 ? "do" : "does"} not like water.` : " A quick rinse in plain water is fine."}{noSun.length ? ` Avoid long sun: ${list(noSun)} fade${noSun.length > 1 ? "" : "s"} in sunlight.` : ""} <Link href={routes.care} className="underline underline-offset-4">Full care guide</Link>.</p>
            </AccordionItem>
            <AccordionItem title="Delivery & returns">
              <p>{site.deliveryCopy} Delivery is {site.deliveryFeeAED} AED, free over {site.freeDeliveryAED} AED, and cash on delivery is available. Wrong size? Exchange it within 14 days, unworn, and we cover the courier once. <Link href={routes.delivery} className="underline underline-offset-4">Delivery</Link> · <Link href={routes.returns} className="underline underline-offset-4">Exchanges & returns</Link>.</p>
            </AccordionItem>
          </div>
          <p className="text-[11px] text-cb-faint mt-5">Natural stone varies: colour, banding and flash differ from the picture. Crystal meanings reflect traditional beliefs and are not medical advice. <Link href={routes.disclaimer} className="underline">Disclaimer</Link>.</p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-16 md:pb-24">
          <div className="container-x"><SectionTitle eyebrow="Complete the stack" title="Worn well together" /></div>
          <ProductGrid products={related} />
        </section>
      )}

      <section className="container-x pb-16 md:pb-24 max-w-3xl">
        <SectionTitle eyebrow="Questions" title={`About ${d.name}`} />
        <div className="border-t border-cb-line">{faq.map((f) => <AccordionItem key={f.q} title={f.q} heading="h3"><p>{f.a}</p></AccordionItem>)}</div>
        <p className="mt-5 text-[13px] text-cb-muted">Sizing, cleansing, delivery and exchanges: <Link href={routes.faq} className="text-cb-ink underline underline-offset-4 hover:text-cb-rose">all questions</Link>.</p>
      </section>
    </>
  );
}
