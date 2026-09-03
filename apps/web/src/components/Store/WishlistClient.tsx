"use client";
import Link from "next/link";
import { useMemo } from "react";
import { ButtonLink } from "@/components/ui";
import { useWishlist } from "@/hooks/useWishlist";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { routes } from "@/lib/paths";
import { WishlistButton } from "./WishlistButton";

interface Item { id: string; name: string; stones: string; priceAED: number; image: string | null }
export function WishlistClient({ items }: { items: Item[] }) {
  const { ids } = useWishlist();
  const saved = items.filter((i) => ids.includes(i.id));
  const waUrl = useMemo(() => buildWhatsAppUrl(saved.map((s) => ({ name: s.name, priceAED: s.priceAED }))), [saved]);
  if (saved.length === 0) return <div className="border border-cb-line p-12 text-center"><p className="font-display text-2xl">Nothing saved yet.</p><p className="text-cb-muted text-[14px] mt-2 mb-6">Tap the heart on any bracelet to keep it here.</p><ButtonLink href={routes.shop} variant="outline">Browse bracelets</ButtonLink></div>;
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-cb-line border border-cb-line">
        {saved.map((s) => (
          <div key={s.id} className="relative bg-white p-5"><div className="absolute right-3 top-3"><WishlistButton id={s.id} /></div>
            <Link href={routes.product(s.id)} className="block"><div className="aspect-square overflow-hidden">{s.image && <img src={s.image} alt={s.name} className="h-full w-full object-cover" />}</div><p className="font-display text-[1.3rem] mt-4">{s.name}</p><p className="text-[12px] text-cb-muted">{s.stones}</p><p className="price mt-1">{s.priceAED} AED</p></Link>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><a href={waUrl} target="_blank" rel="noopener" className="inline-flex h-12 px-8 items-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black">Order all on WhatsApp</a><ButtonLink href={routes.shop} variant="outline" size="lg">Keep browsing</ButtonLink></div>
    </>
  );
}
