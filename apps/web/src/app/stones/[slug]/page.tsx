import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStones, productsForStone } from "@crystal-basket/catalog";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { ListingHero } from "@/components/Store/ListingHero";
import { SectionTitle } from "@/components/ui";
import { routes } from "@/lib/paths";

type Params = { slug: string };
export function generateStaticParams(): Params[] { return getStones().map((s) => ({ slug: s.id })); }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params; const s = getStones().find((x) => x.id === slug); if (!s) return {};
  return { title: `${s.data.name} bracelet meaning`, description: s.data.description };
}
export default async function StonePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const stone = getStones().find((x) => x.id === slug);
  if (!stone) notFound();
  const d = stone.data;
  const facts: [string, string][] = [
    ["Worn for", d.keywords.join(", ")], ["Chakra", d.chakra.join(", ")], ["Zodiac", d.zodiac.join(", ")], ["Colour", d.color],
    ["Water", d.waterSafe ? "Brief rinse is fine" : "Keep dry. Cleanse with smoke, selenite or moonlight"],
    ["Sun", d.sunSafe ? "Short sun charge is fine" : "Fades in sunlight. Charge under the moon"],
  ];
  return (
    <>
      <ListingHero palette={d.palette} crumbs={[[routes.stones, "Stones"], ["", d.name]]} title={d.name} text={d.description} />
      <section className="container-x py-12 grid md:grid-cols-[1fr_1.4fr] gap-10 items-start">
        <div className="aspect-square rounded-full ring-1 ring-black/5 max-w-sm" style={{ background: `radial-gradient(circle at 38% 32%, #ffffffaa 0%, transparent 18%), radial-gradient(circle at 40% 35%, ${d.palette[0]}, ${d.palette[1]})` }} />
        <dl className="divide-y divide-cb-line border-y border-cb-line">
          {facts.map(([k, v]) => <div key={k} className="grid grid-cols-[120px_1fr] gap-4 py-3 text-[14px]"><dt className="text-cb-muted">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>
      <section className="pb-16"><div className="container-x"><SectionTitle eyebrow="Bracelets" title={`Bracelets with ${d.name}`} /></div><ProductGrid products={productsForStone(stone.id)} /></section>
    </>
  );
}
