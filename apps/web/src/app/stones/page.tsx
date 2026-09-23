import type { Metadata } from "next";
import Link from "next/link";
import { getStones, productsForStone } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { routes } from "@/lib/paths";
import { Img } from "@/components/Img";
import { stoneImage } from "@/lib/images";
import { breadcrumbLd, collectionPageLd, ld } from "@/lib/schema";

export const metadata: Metadata = { title: "Crystal Meanings: The Stone Library", description: "Meanings, chakras, best wrist and care for the 16 natural stones in our bracelets, from amethyst and rose quartz to black tourmaline and tiger's eye." };

const WRIST = { left: "Left", right: "Right", either: "Either" } as const;

export default function StonesPage() {
  const stones = getStones();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Stones", routes.stones]])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(collectionPageLd("Crystal meanings", routes.stones, "The natural stones Crystal Basket strings, and what each is traditionally worn for.", stones.map((s) => ({ name: s.data.name, path: routes.stone(s.id) })))) }} />
      <ListingHero image="/images/about/studio.jpg" alt="Gemstone beads on the studio table" crumbs={[["", "Stones"]]} title="Crystal meanings" text={`${stones.length} stones we trust enough to string. What each one is traditionally worn for, which chakra it belongs to, which wrist to wear it on and how to look after it.`} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-l border-cb-line">
        {stones.map((s) => (
          <Link key={s.id} href={routes.stone(s.id)} prefetch={false} className="group bg-white p-6 border-r border-b border-cb-line">
            {stoneImage(s) ? (
              <div className="aspect-square mx-auto w-3/5 transition-transform duration-700 group-hover:scale-[1.04]"><Img src={stoneImage(s)!} alt={`${s.data.name} tumbled stone`} sizes="(min-width: 1024px) 15vw, 30vw" /></div>
            ) : (
              <div className="aspect-square rounded-full mx-auto w-3/4 ring-1 ring-black/5 transition-transform duration-700 group-hover:scale-[1.04]" style={{ background: `radial-gradient(circle at 38% 32%, rgb(255 255 255 / 0.67) 0%, transparent 18%), radial-gradient(circle at 40% 35%, ${s.data.palette[0]}, ${s.data.palette[1]})` }} />
            )}
            <p className="font-display text-[1.3rem] mt-6 text-center group-hover:text-cb-rose transition-colors">{s.data.name}</p>
            <p className="text-[12px] text-cb-muted text-center mt-1">{s.data.keywords.join(" · ")}</p>
            <p className="text-[11px] text-cb-faint text-center mt-2 uppercase tracking-[0.14em]">{productsForStone(s.id).length} bracelet{productsForStone(s.id).length === 1 ? "" : "s"}</p>
          </Link>
        ))}
      </div>
      <section className="container-x py-16 md:py-20">
        <h2 className="text-3xl md:text-[2.5rem] mb-6">{stones.length} stones at a glance</h2>
        <div className="overflow-x-auto border border-cb-line">
          <table className="w-full min-w-[720px] text-[14px]">
            <caption className="sr-only">Crystal meanings, chakras, wrist and care for each stone</caption>
            <thead className="bg-cb-band text-left">
              <tr>{["Stone", "Traditionally worn for", "Chakra", "Wrist", "Water", "Sun", "Mohs"].map((h) => <th key={h} scope="col" className="px-4 py-3 label-caps font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-cb-line">
              {stones.map((s) => (
                <tr key={s.id}>
                  <th scope="row" className="px-4 py-3 text-left font-normal"><Link href={routes.stone(s.id)} prefetch={false} className="underline underline-offset-4 hover:text-cb-rose">{s.data.name}</Link></th>
                  <td className="px-4 py-3">{s.data.keywords.join(", ")}</td>
                  <td className="px-4 py-3">{s.data.chakra.join(", ")}</td>
                  <td className="px-4 py-3">{WRIST[s.data.wrist]}</td>
                  <td className="px-4 py-3">{s.data.waterSafe ? "Brief rinse" : "Keep dry"}</td>
                  <td className="px-4 py-3">{s.data.sunSafe ? "Fine" : "Fades"}</td>
                  <td className="px-4 py-3 tabular-nums">{s.data.mohs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-cb-faint mt-3">Crystal meanings describe traditional beliefs, not medical advice. <Link href={routes.care} className="underline underline-offset-4">How to cleanse and care for each stone</Link>.</p>
      </section>
    </>
  );
}
