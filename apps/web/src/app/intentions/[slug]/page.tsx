import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntentions, getProducts, getStacks, getStone, inStockFirst, productsForIntention } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { SectionTitle } from "@/components/ui";
import { routes } from "@/lib/paths";
import { intentionImage, productImage, stoneImage } from "@/lib/images";
import { site } from "@/lib/site";
import { breadcrumbLd, collectionPageLd, ld } from "@/lib/schema";

const WRIST = { left: "left wrist", right: "right wrist", either: "either wrist" } as const;

type Params = { slug: string };
export function generateStaticParams(): Params[] { return getIntentions().map((i) => ({ slug: i.id })); }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params; const i = getIntentions().find((x) => x.id === slug); if (!i) return {};
  const img = intentionImage(i);
  const title = `${i.data.short} Crystal Bracelets in Dubai`;
  return { title, description: i.data.seoDescription, openGraph: { title, description: i.data.seoDescription, images: img ? [{ url: img }] : undefined } };
}

export default async function IntentionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const intention = getIntentions().find((x) => x.id === slug);
  if (!intention) notFound();
  const d = intention.data;
  const own = productsForIntention(intention.id);
  const alsoWorn = getProducts().filter((p) => p.data.secondaryIntentions.includes(intention.id));
  // An intention with no piece of its own (e.g. sleep) shows the pieces also worn for it as the main grid.
  const primary = inStockFirst(own.length ? own : alsoWorn);
  const secondary = inStockFirst(own.length ? alsoWorn : []);
  const stones = d.stones.map(getStone);
  const stack = getStacks().find((s) => s.data.intention === intention.id);
  const others = getIntentions().filter((i) => i.id !== intention.id);
  const heading = `${d.name} bracelets`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Intentions", routes.intentions], [d.name, routes.intention(intention.id)]])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(collectionPageLd(heading, routes.intention(intention.id), d.seoDescription, primary.map((p) => ({ name: p.data.name, path: routes.product(p.id), image: productImage(p) })))) }} />
      <ListingHero image={d.image ? `/images/intentions/${d.image}` : null} alt={`${d.name} crystal bracelet on a wrist`} palette={d.palette} crumbs={[[routes.intentions, "Intentions"], ["", d.name]]} title={heading} text={`${d.tagline} ${d.description}`} />
      <div className="bg-cb-band">
        <div className="container-x flex flex-wrap items-center gap-2 py-3 text-[13px]">
          <span className="text-cb-muted mr-2">Stones:</span>
          {stones.map((s) => <Link key={s.id} href={routes.stone(s.id)} prefetch={false} className="inline-flex items-center gap-2 bg-white border border-cb-line px-3 py-1 hover:border-cb-ink">{stoneImage(s) ? <img src={stoneImage(s)!} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-black/5" loading="lazy" /> : <span className="h-2.5 w-2.5 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${s.data.palette[0]}, ${s.data.palette[1]})` }} />}{s.data.name}</Link>)}
          <span className="ml-auto text-cb-muted">Chakra: {d.chakra.join(", ")}</span>
        </div>
      </div>
      <ProductGrid products={primary} eagerFirst={2} />
      {secondary.length > 0 && (
        <section className="pt-16"><div className="container-x"><SectionTitle eyebrow="Also worn for this" title="Related pieces" /></div><ProductGrid products={secondary} /></section>
      )}

      <section className="container-x pt-16 md:pt-24 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16">
        <div className="max-w-2xl">
          <p className="label-caps mb-3">Guide</p>
          <h2 className="text-3xl md:text-[2.5rem]">What is a {d.short.toLowerCase()} crystal bracelet?</h2>
          <p className="text-cb-muted mt-4 leading-relaxed">{d.definition}</p>
          <h3 className="font-display text-2xl mt-8">Which wrist?</h3>
          <p className="text-cb-muted mt-2 leading-relaxed">Tradition puts {d.short.toLowerCase()} stones on the {WRIST[d.wrist]}: the left side receives and the right side projects. Wear it wherever it feels comfortable; there is no rule worth stressing over.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-[13px]">
            {stack && <Link href={`${routes.stacks}?stack=${stack.id}#build`} className="border border-cb-ink px-4 py-2.5 uppercase tracking-[0.12em] text-[11px] hover:bg-cb-ink hover:text-white transition-colors">Shop {stack.data.name}, {site.stackDiscountPct}% off</Link>}
            <Link href={routes.sizeGuide} className="border border-cb-line px-4 py-2.5 uppercase tracking-[0.12em] text-[11px] hover:border-cb-ink">Size guide</Link>
            <Link href={routes.care} className="border border-cb-line px-4 py-2.5 uppercase tracking-[0.12em] text-[11px] hover:border-cb-ink">Cleanse & care</Link>
          </div>
        </div>
        <div>
          <div className="overflow-x-auto border border-cb-line">
            <table className="w-full min-w-[440px] text-[14px]">
              <caption className="sr-only">Stones traditionally worn for {d.name.toLowerCase()}</caption>
              <thead className="bg-cb-band text-left"><tr>{["Stone", "Traditionally worn for", "Water"].map((h) => <th key={h} scope="col" className="px-4 py-3 label-caps font-medium">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-cb-line">
                {stones.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="px-4 py-3 text-left font-normal"><Link href={routes.stone(s.id)} prefetch={false} className="underline underline-offset-4 hover:text-cb-rose">{s.data.name}</Link></th>
                    <td className="px-4 py-3">{s.data.keywords.join(", ")}</td>
                    <td className="px-4 py-3">{s.data.waterSafe ? "Brief rinse" : "Keep dry"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 border-t border-cb-line">
            {d.faq.map((f) => (
              <div key={f.q} className="border-b border-cb-line py-5">
                <h3 className="font-body text-[15px] font-medium">{f.q}</h3>
                <p className="text-[14px] text-cb-muted mt-2 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-cb-faint mt-4">Crystal meanings describe traditional beliefs, not medical advice. <Link href={routes.disclaimer} className="underline">Disclaimer</Link>.</p>
        </div>
      </section>

      <section className="container-x py-12 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-cb-muted mr-2">Other intentions:</span>
        {others.map((o) => <Link key={o.id} href={routes.intention(o.id)} prefetch={false} className="border border-cb-line px-3 py-1.5 hover:border-cb-ink">{o.data.short}</Link>)}
      </section>
    </>
  );
}
