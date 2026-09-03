"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, cn } from "@/components/ui";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WRIST_SIZES, type WristSizeKey } from "@/lib/sizes";
import { routes } from "@/lib/paths";
import { flags } from "@/lib/site";
import { WishlistButton } from "./WishlistButton";

interface Props {
  id: string; name: string; priceAED: number; compareAtAED?: number;
  beadSizes: number[]; defaultBead: number; sizes: WristSizeKey[]; inStock: boolean;
  stripePaymentLink?: string; freeDeliveryAED: number; deliveryCopy: string;
}

export function BuyBox(p: Props) {
  const [bead, setBead] = useState(p.defaultBead);
  const [size, setSize] = useState<WristSizeKey>(p.sizes.includes("M") ? "M" : p.sizes[0]);
  const waUrl = useMemo(() => buildWhatsAppUrl([{ name: p.name, bead, size, priceAED: p.priceAED }]), [p.name, bead, size, p.priceAED]);
  const stripeUrl = flags.cardCheckout && p.stripePaymentLink ? `${p.stripePaymentLink}${p.stripePaymentLink.includes("?") ? "&" : "?"}client_reference_id=${encodeURIComponent(`${bead}mm-${size}`)}` : undefined;
  const opt = (on: boolean) => cn("flex-1 border py-3 text-[13px] text-center transition-colors", on ? "border-cb-ink bg-cb-ink text-white" : "border-cb-line hover:border-cb-ink");

  return (
    <div className="space-y-7">
      <div className="flex items-baseline gap-3">
        <span className="price text-[1.7rem]">{p.priceAED.toLocaleString()} AED</span>
        {p.compareAtAED && <span className="price text-cb-faint line-through text-base">{p.compareAtAED.toLocaleString()} AED</span>}
      </div>
      <div>
        <div className="flex justify-between mb-2"><span className="label-caps">Bead size</span><span className="text-[12px] text-cb-muted">{bead === 6 ? "Slim, stacks well" : bead === 8 ? "Classic, most popular" : "Statement"}</span></div>
        <div className="flex gap-2">{p.beadSizes.map((b) => <button key={b} type="button" onClick={() => setBead(b)} aria-pressed={bead === b} className={opt(bead === b)}>{b} mm</button>)}</div>
      </div>
      <div>
        <div className="flex justify-between mb-2"><span className="label-caps">Wrist size</span><Link href={routes.sizeGuide} className="text-[12px] underline underline-offset-4 hover:text-cb-rose">Size guide</Link></div>
        <div className="flex gap-2">
          {p.sizes.map((s) => (
            <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={size === s} className={cn(opt(size === s), "text-left px-3")}>
              <span className="block">{s} · {WRIST_SIZES[s].cm} cm</span>
              <span className={cn("block text-[11px]", size === s ? "opacity-80" : "text-cb-muted")}>{WRIST_SIZES[s].fits}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2.5">
        {stripeUrl ? (
          <a href={stripeUrl} target="_blank" rel="noopener" className="inline-flex h-13 items-center justify-center bg-cb-ink text-white text-[13px] uppercase tracking-[0.14em] hover:bg-black transition-colors">Buy now · {p.priceAED} AED</a>
        ) : (
          <Button size="lg" disabled title="Card checkout link not set yet">Card checkout · coming soon</Button>
        )}
        <a href={waUrl} target="_blank" rel="noopener" className="inline-flex h-13 items-center justify-center gap-2 border border-cb-ink text-[13px] uppercase tracking-[0.14em] hover:bg-cb-ink hover:text-white transition-colors">Order on WhatsApp</a>
        <div className="flex justify-center"><WishlistButton id={p.id} label /></div>
        {!p.inStock && <p className="text-[12px] text-cb-muted text-center">Currently made to order. Message us for the wait time.</p>}
      </div>
      <ul className="text-[12px] text-cb-muted space-y-1.5 border-t border-cb-line pt-5">
        <li>· {p.deliveryCopy} Free over {p.freeDeliveryAED} AED.</li>
        <li>· Cash on delivery across the UAE</li>
        <li>· Free re-string if the cord ever gives</li>
      </ul>
    </div>
  );
}
