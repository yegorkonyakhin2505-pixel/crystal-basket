import Link from "next/link";
import { formatAED, getIntention, stonesForProduct, type Product } from "@crystal-basket/catalog";
import { routes } from "@/lib/paths";
import { productImage } from "@/lib/images";
import { Img } from "@/components/Img";
import { Badge } from "@/components/ui";
import { WishlistButton } from "./WishlistButton";
import { BeadRing } from "./BeadRing";

/**
 * Swarovski-style tile: white, tall, product centred on white, heart top-right,
 * name / spec line / price below. Grid borders come from the parent (1px cb-line).
 */
export function ProductTile({ product, eager = false }: { product: Product; eager?: boolean }) {
  const d = product.data;
  const stones = stonesForProduct(product);
  const intention = getIntention(d.intention);
  const img = productImage(product);
  const badge = d.isNew ? "New" : d.bestseller ? "Bestseller" : null;
  const spec = [stones.map((s) => s.data.name).join(", "), `${d.defaultBead}mm`, d.goldAccent ? "14k gold-filled accent" : null].filter(Boolean).join(", ");
  return (
    <Link href={routes.product(product.id)} className="group relative block bg-white p-5 md:p-7 h-full border-r border-b border-cb-line" data-intention={d.intention} data-stones={d.stones.join(" ")} data-style={d.style} data-bead={d.beadSizes.join(" ")} data-price={d.priceAED} data-gold={d.goldAccent ? "1" : "0"}>
      <div className="absolute right-4 top-4 z-10"><WishlistButton id={product.id} /></div>
      {badge && <Badge tone="neutral" className="absolute left-5 top-5 z-10">{badge}</Badge>}
      <div className="aspect-square overflow-hidden bg-white">
        <div className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]">
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
  );
}
