"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BEAD_MM } from "@crystal-basket/catalog/schemas";
import { Button, cn } from "@/components/ui";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WRIST_SIZES, type WristSizeKey } from "@/lib/sizes";
import { routes } from "@/lib/paths";
import { flags } from "@/lib/site";
import { WishlistButton } from "./WishlistButton";
import { useCart } from "@/hooks/useCart";

interface Props {
  id: string; name: string; priceAED: number; compareAtAED?: number;
  sizes: WristSizeKey[]; inStock: boolean;
  stripePaymentLink?: string; freeDeliveryAED: number; deliveryCopy: string;
}

/** Price, wrist size, add to bag / WhatsApp. Every bracelet is 8 mm, so wrist size is the only choice. */
export function BuyBox(p: Props) {
  const [size, setSize] = useState<WristSizeKey>(p.sizes.includes("M") ? "M" : p.sizes[0]);
  const waUrl = useMemo(() => buildWhatsAppUrl([{ name: p.name, bead: BEAD_MM, size, priceAED: p.priceAED }]), [p.name, size, p.priceAED]);
  const cart = useCart();
  const stripeUrl = flags.cardCheckout && p.stripePaymentLink ? `${p.stripePaymentLink}${p.stripePaymentLink.includes("?") ? "&" : "?"}client_reference_id=${encodeURIComponent(`${BEAD_MM}mm-${size}`)}` : undefined;

  return (
    <div className="space-y-7">
      <div className="flex items-baseline gap-3">
        <span className="price text-[1.7rem]">{p.priceAED.toLocaleString()} AED</span>
        {p.compareAtAED && <span className="price text-cb-faint line-through text-base">{p.compareAtAED.toLocaleString()} AED</span>}
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span className="label-caps">Wrist size</span>
          <Link href={routes.sizeGuide} className="text-[12px] underline underline-offset-4 hover:text-cb-rose">Size guide</Link>
        </div>
        <div className="flex gap-2">
          {p.sizes.map((s) => {
            const on = size === s;
            return (
              <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={on} className={cn("flex-1 border py-3 px-3 text-left text-[13px] transition-colors", on ? "border-cb-ink bg-cb-ink text-white" : "border-cb-line hover:border-cb-ink")}>
                <span className="block">{s} · {WRIST_SIZES[s].cm} cm</span>
                <span className={cn("block text-[11px]", on ? "opacity-80" : "text-cb-muted")}>{WRIST_SIZES[s].fits}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[12px] text-cb-muted mt-2">{BEAD_MM} mm beads on 1 mm stretch cord. Between sizes? Go up.</p>
      </div>
      <div className="grid gap-2.5">
        {cart.enabled ? (
          <button type="button" onClick={() => cart.add([{ handle: p.id, size }])} disabled={cart.busy} className="inline-flex h-13 items-center justify-center bg-cb-ink text-white text-[13px] uppercase tracking-[0.14em] hover:bg-black transition-colors disabled:opacity-60">
            {cart.busy ? "Adding…" : `Add to bag · ${p.priceAED} AED`}
          </button>
        ) : stripeUrl ? (
          <a href={stripeUrl} target="_blank" rel="noopener" className="inline-flex h-13 items-center justify-center bg-cb-ink text-white text-[13px] uppercase tracking-[0.14em] hover:bg-black transition-colors">Buy now · {p.priceAED} AED</a>
        ) : (
          <Button size="lg" disabled title="Card checkout link not set yet">Card checkout · coming soon</Button>
        )}
        <a href={waUrl} target="_blank" rel="noopener" className="inline-flex h-13 items-center justify-center gap-2 border border-cb-ink text-[13px] uppercase tracking-[0.14em] hover:bg-cb-ink hover:text-white transition-colors">Order on WhatsApp</a>
        <div className="flex justify-center"><WishlistButton id={p.id} label /></div>
        {cart.error && <p className="text-[12px] text-cb-danger text-center">{cart.error}</p>}
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
