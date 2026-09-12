import Link from "next/link";
import { BEAD_MM, formatAED, getIntention, stonesForProduct, type Product } from "@crystal-basket/catalog";
import { routes } from "@/lib/paths";
import { productImage } from "@/lib/images";
import { Img } from "@/components/Img";
import { Badge, cn } from "@/components/ui";
import { WishlistButton } from "./WishlistButton";
import { BeadRing } from "./BeadRing";

/**
 * Swarovski-style tile: white, tall, product centred on white, heart top-right,
 * name / spec line / price below. Grid borders come from the parent (1px cb-line).
 * The heart sits beside the link, not inside it, so the markup stays valid.
 * data-* attributes feed the static FilterBar.
 */
export function ProductTile({ product, eager = false }: { product: Product; eager?: boolean }) {
  const d = product.data;
  const stones = stonesForProduct(product);
  const intention = getIntention(d.intention);
  const img = productImage(product);
  const badge = !d.inStock ? "Sold out" : d.isNew ? "New" : d.bestseller ? "Bestseller" : null;
  const stoneLine = stones.length > 3 ? `${stones.length} stones` : stones.map((s) => s.data.name).join(", ");
  const spec = [stoneLine, `${BEAD_MM}mm`, d.goldAccent ? "14k gold-filled accent" : null].filter(Boolean).join(", ");
  return (
    <div className="group relative h-full bg-white border-r border-b border-cb-line" data-intention={d.intention} data-stones={d.stones.join(" ")} data-style={d.style} data-price={d.priceAED} data-gold={d.goldAccent ? "1" : "0"} data-new={d.isNew ? "1" : "0"} data-stock={d.inStock ? "1" : "0"}>
      <div className="absolute right-4 top-4 z-10"><WishlistButton id={product.id} /></div>
      {badge && <Badge tone={d.inStock ? "neutral" : "ink"} className="absolute left-5 top-5 z-10">{badge}</Badge>}
      <Link href={routes.product(product.id)} className="block h-full p-5 md:p-7">
        <div className={cn("aspect-square overflow-hidden bg-white", !d.inStock && "opacity-60")}>
          <div className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            {img ? <Img src={img} alt={`${d.name} — ${d.subtitle}`} loading={eager ? "eager" : "lazy"} /> : <BeadRing palettes={stones.map((s) => s.data.palette)} gold={d.goldAccent} />}
          </div>
        </div>
        <div className="pt-6 space-y-2">
          <p className="font-display text-[1.35rem] leading-tight">{d.name}</p>
          <p className="text-[12px] text-cb-muted leading-snug line-clamp-1">{spec}</p>
          <p className="text-[11px] text-cb-rose uppercase tracking-[0.14em]">{intention.data.short}</p>
          <p className="price pt-1">{formatAED(d.priceAED)}</p>
        </div>
      </Link>
    </div>
  );
}
