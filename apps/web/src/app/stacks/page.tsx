import type { Metadata } from "next";
import Link from "next/link";
import { formatAED, getIntentions, getProduct, getProducts, getStacks, getStone, stackSubtotal } from "@crystal-basket/catalog";
import { ListingHero } from "@/components/Store/ListingHero";
import { StackBuilder } from "@/components/Store/StackBuilder";
import { SectionTitle } from "@/components/ui";
import { Img } from "@/components/Img";
import { productImage, stackImage } from "@/lib/images";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Stacks & sets", description: `Curated three-piece crystal bracelet stacks by intention, or build your own and save ${site.stackDiscountPct}%.` };

export default function StacksPage() {
  const stacks = getStacks();
  const intentions = getIntentions();
  const builder = getProducts().map((p) => ({
    id: p.id, name: p.data.name, intention: p.data.intention, intentionName: intentions.find((i) => i.id === p.data.intention)!.data.short,
    stones: p.data.stones.map((s) => getStone(s).data.name).join(" · "), priceAED: p.data.priceAED, image: productImage(p), palettes: p.data.stones.map((s) => getStone(s).data.palette),
  }));
  return (
    <>
      <ListingHero image="/images/stacks/stacks-wrist.jpg" crumbs={[["", "Stacks & sets"]]} title={`Three pieces. ${site.stackDiscountPct}% off.`} text="Start from a curated stack, or build your own below. Any three bracelets unlock the stack price." />
      <div className="grid md:grid-cols-3 gap-px bg-cb-line border-b border-cb-line">
        {stacks.map((s) => {
          const img = stackImage(s);
          const products = s.data.products.map(getProduct);
          return (
            <div key={s.id} className="bg-white p-6 md:p-8 flex flex-col">
              <div className="aspect-square bg-white overflow-hidden">{img ? <Img src={img} alt={s.data.name} /> : null}</div>
              <p className="label-caps mt-6">{intentions.find((i) => i.id === s.data.intention)!.data.short}</p>
              <p className="font-display text-[1.6rem] mt-1">{s.data.name}</p>
              <p className="text-[13px] text-cb-muted mt-2">{s.data.description}</p>
              <ul className="text-[13px] mt-4 space-y-1">{products.map((p) => <li key={p.id} className="flex justify-between"><Link href={routes.product(p.id)} className="hover:text-cb-rose">{p.data.name}</Link><span className="price text-[13px] text-cb-muted">{formatAED(p.data.priceAED)}</span></li>)}</ul>
              <div className="flex items-baseline gap-2 mt-5"><span className="price text-[1.4rem]">{formatAED(s.data.priceAED)}</span><span className="price text-[13px] text-cb-faint line-through">{formatAED(stackSubtotal(s))}</span></div>
              <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`${site.whatsappGreeting}\n• ${s.data.name} (${products.map((p) => p.data.name).join(", ")}) — ${s.data.priceAED} AED\nSizes: \nDelivery address:`)}`} target="_blank" rel="noopener" className="mt-5 inline-flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black">Order on WhatsApp</a>
            </div>
          );
        })}
      </div>
      <section className="bg-cb-band py-16"><div className="container-x"><SectionTitle eyebrow="Build your own" title="Pick any three" align="left" /><StackBuilder products={builder} intentions={intentions.map((i) => ({ id: i.id, name: i.data.short }))} discountPct={site.stackDiscountPct} /></div></section>
    </>
  );
}
