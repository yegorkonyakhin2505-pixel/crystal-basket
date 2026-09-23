import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIntentions, getStone, getStones, productsForStone } from "@crystal-basket/catalog";
import { ProductGrid } from "@/components/Store/ProductGrid";
import { ListingHero } from "@/components/Store/ListingHero";
import { SectionTitle } from "@/components/ui";
import { routes } from "@/lib/paths";
import { productImage, stoneImage } from "@/lib/images";
import { Img } from "@/components/Img";
import { breadcrumbLd, ld, stonePageLd } from "@/lib/schema";

const WRIST = { left: "Left wrist", right: "Right wrist", either: "Either wrist" } as const;
const trim = (s: string, max = 155) => (s.length <= max ? s : `${s.slice(0, s.lastIndexOf(" ", max - 1))}…`);

type Params = { slug: string };
export function generateStaticParams(): Params[] { return getStones().map((s) => ({ slug: s.id })); }

function describe(name: string, keywords: string[]) {
  return trim(`${name} bracelet meaning: traditionally worn for ${keywords.join(", ").toLowerCase()}. Chakra, which wrist, how to cleanse it, and ${name.toLowerCase()} bracelets hand-strung in Dubai.`);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params; const s = getStones().find((x) => x.id === slug); if (!s) return {};
  const title = `${s.data.name} Bracelet Meaning, Chakra & Care`;
  const description = describe(s.data.name, s.data.keywords);
  const first = productsForStone(s.id)[0];
  const img = stoneImage(s) ?? (first ? productImage(first) : null);
  return { title, description, openGraph: { title, description, images: img ? [{ url: img, width: 1200, height: 1200 }] : undefined } };
}

export default async function StonePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const stone = getStones().find((x) => x.id === slug);
  if (!stone) notFound();
  const d = stone.data;
  const products = productsForStone(stone.id);
  const lower = d.name.toLowerCase();
  const heading = `${d.name} bracelet meaning`;
  // Intentions this stone is traditionally worn for, from the curated intention lists.
  const intentions = getIntentions().filter((i) => i.data.stones.includes(stone.id));
  const pairs = d.pairsWith.map(getStone);
  const cleanse = [
    `Cleanse ${lower} when it arrives and about once a month: overnight in moonlight, on a selenite plate for a few hours, or in palo santo, sage or oud smoke.`,
    d.waterSafe ? "A brief rinse in plain water is fine; dry it straight away so the cord lasts." : (d.waterNote ?? `Keep ${lower} out of water.`),
    d.sunSafe ? "It is sun safe, so a short spell on a bright windowsill does no harm." : `Keep it out of long direct sun, which fades the colour of ${lower}.`,
  ].join(" ");
  const facts: [string, string][] = [
    ["Traditionally worn for", d.keywords.join(", ")],
    ["Chakra", d.chakra.join(", ")],
    ["Zodiac", d.zodiac.join(", ")],
    ["Colour", d.color],
    ["Hardness (Mohs)", d.mohs],
    ["Commonly found in", d.foundIn],
    ["Best worn on", WRIST[d.wrist]],
    ["Water", d.waterSafe ? "Brief rinse is fine" : "Keep dry"],
    ["Sun", d.sunSafe ? "Short sun is fine" : "Fades in long sun"],
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Stones", routes.stones], [d.name, routes.stone(stone.id)]])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(stonePageLd(stone, heading, describe(d.name, d.keywords), products.map((p) => ({ name: p.data.name, path: routes.product(p.id), image: productImage(p) })), stoneImage(stone))) }} />
      <ListingHero palette={d.palette} crumbs={[[routes.stones, "Stones"], ["", d.name]]} title={heading} text={d.description} />

      <section className="container-x py-12 md:py-16 grid grid-cols-1 md:grid-cols-[minmax(0,280px)_1fr] gap-8 md:gap-14 items-start">
        {stoneImage(stone) ? (
          <div className="aspect-square w-48 md:w-full max-w-[280px]"><Img src={stoneImage(stone)!} alt={`${d.name} tumbled stone`} sizes="280px" loading="eager" /></div>
        ) : (
          <div aria-hidden className="aspect-square rounded-full ring-1 ring-black/5 w-40 md:w-full max-w-[280px]" style={{ background: `radial-gradient(circle at 38% 32%, rgb(255 255 255 / 0.67) 0%, transparent 18%), radial-gradient(circle at 40% 35%, ${d.palette[0]}, ${d.palette[1]})` }} />
        )}
        <div className="overflow-x-auto border border-cb-line">
          <table className="w-full text-[14px]">
            <caption className="sr-only">{d.name} at a glance</caption>
            <tbody className="divide-y divide-cb-line">
              {facts.map(([k, v]) => <tr key={k}><th scope="row" className="w-[42%] md:w-[34%] px-4 py-3 text-left font-normal text-cb-muted align-top">{k}</th><td className="px-4 py-3">{v}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <article className="container-x pb-12 max-w-3xl space-y-10">
        <section>
          <h2 className="text-3xl md:text-[2.25rem]">What is a {lower} bracelet worn for?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">{d.wornFor}</p>
          {intentions.length > 0 && (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-cb-muted">Shop by intention:</span>
              {intentions.map((i) => <Link key={i.id} href={routes.intention(i.id)} prefetch={false} className="border border-cb-line px-3 py-1 hover:border-cb-ink">{i.data.short}</Link>)}
            </p>
          )}
        </section>
        <section>
          <h2 className="text-3xl md:text-[2.25rem]">What is {lower}?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">{d.mineral} It measures {d.mohs} on the Mohs hardness scale and is commonly found in {d.foundIn}. Every Crystal Basket bead is natural and undyed, so colour and pattern vary from bead to bead.</p>
        </section>
        <section>
          <h2 className="text-3xl md:text-[2.25rem]">Which wrist do you wear {lower} on?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">{d.wristWhy}</p>
        </section>
        <section>
          <h2 className="text-3xl md:text-[2.25rem]">How do you cleanse a {lower} bracelet?</h2>
          <p className="text-cb-muted mt-3 leading-relaxed">{cleanse} <Link href={routes.care} className="underline underline-offset-4 hover:text-cb-rose">Full cleanse and care guide</Link>.</p>
        </section>
        {pairs.length > 0 && (
          <section>
            <h2 className="text-3xl md:text-[2.25rem]">What does {lower} pair well with?</h2>
            <p className="text-cb-muted mt-3 leading-relaxed">{d.name} is often worn beside {pairs.map((p) => p.data.name.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}. Every bracelet is 8 mm, so any of them stack evenly on the same wrist.</p>
            <p className="mt-4 flex flex-wrap gap-2 text-[13px]">
              {pairs.map((p) => <Link key={p.id} href={routes.stone(p.id)} prefetch={false} className="inline-flex items-center gap-2 border border-cb-line px-3 py-1 hover:border-cb-ink">{stoneImage(p) ? <img src={stoneImage(p)!} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-black/5" loading="lazy" /> : <span className="h-2.5 w-2.5 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${p.data.palette[0]}, ${p.data.palette[1]})` }} />}{p.data.name}</Link>)}
            </p>
          </section>
        )}
        <p className="text-[11px] text-cb-faint">Crystal meanings describe traditional beliefs, not medical advice. <Link href={routes.disclaimer} className="underline">Disclaimer</Link>.</p>
      </article>

      <section className="pb-16"><div className="container-x"><SectionTitle eyebrow="Bracelets" title={`Bracelets with ${d.name}`} /></div><ProductGrid products={products} empty={`No bracelet uses ${d.name} on its own yet. It appears in our chakra and mixed pieces.`} /></section>
    </>
  );
}
