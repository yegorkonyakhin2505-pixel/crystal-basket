import type { Metadata } from "next";
import Link from "next/link";
import { getStones, productsForStone } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { routes } from "@/lib/paths";
export const metadata: Metadata = { title: "Stone library", description: "Meanings, chakras and zodiac signs for every stone we string." };
export default function StonesPage() {
  const stones = getStones();
  return (
    <>
      <ListingHero image="/images/about/studio.jpg" crumbs={[["", "Stones"]]} title="The stone library" text={`${stones.length} stones we trust enough to string. What each one is traditionally worn for, which chakra it belongs to, and which signs claim it.`} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-cb-line border-b border-cb-line">
        {stones.map((s) => (
          <Link key={s.id} href={routes.stone(s.id)} className="group bg-white p-6">
            <div className="aspect-square rounded-full mx-auto w-3/4 ring-1 ring-black/5 transition-transform duration-700 group-hover:scale-[1.04]" style={{ background: `radial-gradient(circle at 38% 32%, #ffffffaa 0%, transparent 18%), radial-gradient(circle at 40% 35%, ${s.data.palette[0]}, ${s.data.palette[1]})` }} />
            <p className="font-display text-[1.3rem] mt-6 text-center group-hover:text-cb-rose transition-colors">{s.data.name}</p>
            <p className="text-[12px] text-cb-muted text-center mt-1">{s.data.keywords.join(" · ")}</p>
            <p className="text-[11px] text-cb-faint text-center mt-2 uppercase tracking-[0.14em]">{productsForStone(s.id).length} bracelet{productsForStone(s.id).length === 1 ? "" : "s"}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
