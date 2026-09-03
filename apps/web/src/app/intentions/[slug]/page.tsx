import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntentions, getStones, productsForIntention, getProducts } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { SectionTitle } from "@/components/ui";
import { routes } from "@/lib/paths";

type Params = { slug: string };
export function generateStaticParams(): Params[] { return getIntentions().map((i) => ({ slug: i.id })); }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params; const i = getIntentions().find((x) => x.id === slug); if (!i) return {};
  return { title: `${i.data.name} bracelets`, description: `${i.data.tagline} ${i.data.description}` };
}
export default async function IntentionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const intention = getIntentions().find((x) => x.id === slug);
  if (!intention) notFound();
  const primary = productsForIntention(intention.id);
  const secondary = getProducts().filter((p) => p.data.secondaryIntentions.includes(intention.id));
  const stoneIds = new Set(primary.flatMap((p) => p.data.stones));
  const stones = getStones().filter((s) => stoneIds.has(s.id));
  const others = getIntentions().filter((i) => i.id !== intention.id);
  return (
    <>
      <ListingHero image={intention.data.image ? `/images/intentions/${intention.data.image}` : null} palette={intention.data.palette} crumbs={[[routes.intentions, "Intentions"], ["", intention.data.name]]} title={intention.data.name} text={`${intention.data.tagline} ${intention.data.description}`} />
      <div className="bg-cb-band border-b border-cb-line">
        <div className="container-x flex flex-wrap items-center gap-2 py-3 text-[13px]">
          <span className="text-cb-muted mr-2">Stones:</span>
          {stones.map((s) => <Link key={s.id} href={routes.stone(s.id)} className="inline-flex items-center gap-2 bg-white border border-cb-line px-3 py-1 hover:border-cb-ink"><span className="h-2.5 w-2.5 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${s.data.palette[0]}, ${s.data.palette[1]})` }} />{s.data.name}</Link>)}
          <span className="ml-auto text-cb-muted">Chakra: {intention.data.chakra.join(", ")}</span>
        </div>
      </div>
      <ProductGrid products={primary} eagerFirst={4} />
      {secondary.length > 0 && (
        <section className="pt-16"><div className="container-x"><SectionTitle eyebrow="Also worn for this" title="Related pieces" /></div><ProductGrid products={secondary} /></section>
      )}
      <section className="container-x py-12 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-cb-muted mr-2">Other intentions:</span>
        {others.map((o) => <Link key={o.id} href={routes.intention(o.id)} className="border border-cb-line px-3 py-1.5 hover:border-cb-ink">{o.data.short}</Link>)}
      </section>
    </>
  );
}
