import Link from "next/link";
import { getIntentions, productsForIntention } from "@crystal-basket/catalog";
import { routes } from "@/lib/paths";
import { intentionImage } from "@/lib/images";
import { Img } from "@/components/Img";

/** Swarovski-style 4-column photo tiles on the beige band with a caption underneath. */
export function CategoryGrid({ limit }: { limit?: number }) {
  const intentions = limit ? getIntentions().slice(0, limit) : getIntentions();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
      {intentions.map((i, idx) => {
        const img = intentionImage(i);
        return (
          <Link key={i.id} href={routes.intention(i.id)} className="group block reveal" style={{ transitionDelay: `${(idx % 4) * 60}ms` }}>
            <div className="aspect-[3/4] overflow-hidden bg-cb-band-2">
              {img ? (
                <Img src={img} alt={`${i.data.name} bracelets`} className="transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]" />
              ) : (
                <div className="h-full w-full" style={{ background: `radial-gradient(80% 60% at 70% 20%, ${i.data.palette[0]}66, transparent 70%), radial-gradient(70% 50% at 20% 90%, ${i.data.palette[1]}44, transparent 70%)` }} />
              )}
            </div>
            <p className="py-3 text-center text-[15px] tracking-wide group-hover:text-cb-rose transition-colors">{i.data.short}</p>
            <p className="-mt-3 pb-3 text-center text-[11px] text-cb-muted">{productsForIntention(i.id, true).length} bracelets</p>
          </Link>
        );
      })}
    </div>
  );
}
