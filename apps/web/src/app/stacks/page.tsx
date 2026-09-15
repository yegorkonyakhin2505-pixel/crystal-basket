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
import { breadcrumbLd, collectionPageLd, ld } from "@/lib/schema";

const description = `Three-piece crystal bracelet stacks for protection, calm and abundance, or build your own from any three bracelets and save ${site.stackDiscountPct}%. Hand-strung in Dubai.`;
export const metadata: Metadata = { title: "Crystal Bracelet Stacks & Sets", description, openGraph: { title: "Crystal Bracelet Stacks & Sets", description } };

export default function StacksPage() {
  const stacks = getStacks();
  const intentions = getIntentions();
  const builder = getProducts().map((p) => ({
    id: p.id, name: p.data.name, intention: p.data.intention, intentionName: intentions.find((i) => i.id === p.data.intention)!.data.short,
    stones: p.data.stones.map((s) => getStone(s).data.name).join(" · "), priceAED: p.data.priceAED, image: productImage(p), palettes: p.data.stones.map((s) => getStone(s).data.palette), inStock: p.data.inStock,
  }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Stacks & sets", routes.stacks]])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(collectionPageLd("Crystal bracelet stacks", routes.stacks, description, stacks.map((s) => ({ name: s.data.name, path: `${routes.stacks}?stack=${s.id}`, image: stackImage(s) })))) }} />
      <ListingHero image="/images/stacks/stacks-wrist.jpg" alt="Three crystal bracelets stacked on one wrist" crumbs={[["", "Stacks & sets"]]} title="Crystal bracelet stacks" text={`Three bracelets, ${site.stackDiscountPct}% off. Start from a curated stack, or build your own below: any three bracelets unlock the stack price at checkout. Every piece is 8 mm, so any three sit evenly on one wrist.`} />
      <div className="grid md:grid-cols-3 gap-px bg-cb-line border-b border-cb-line">
        {stacks.map((s) => {
          const img = stackImage(s);
          const products = s.data.products.map(getProduct);
          const intention = intentions.find((i) => i.id === s.data.intention)!;
          return (
            <div key={s.id} className="bg-white p-6 md:p-8 flex flex-col">
              <div className="aspect-square bg-white overflow-hidden">{img ? <Img src={img} alt={`${s.data.name}: ${products.map((p) => p.data.name).join(", ")}`} sizes="(min-width: 768px) 33vw, 100vw" /> : null}</div>
              <p className="label-caps mt-6"><Link href={routes.intention(intention.id)} prefetch={false} className="hover:text-cb-rose">{intention.data.short}</Link></p>
              <h2 className="font-display text-[1.6rem] mt-1">{s.data.name}</h2>
              <p className="text-[13px] text-cb-muted mt-2">{s.data.description}</p>
              <ul className="text-[13px] mt-4 space-y-1">{products.map((p) => <li key={p.id} className="flex justify-between"><Link href={routes.product(p.id)} className="hover:text-cb-rose">{p.data.name}</Link><span className="price text-[13px] text-cb-muted">{formatAED(p.data.priceAED)}</span></li>)}</ul>
              <div className="flex items-baseline gap-2 mt-5"><span className="price text-[1.4rem]">{formatAED(s.data.priceAED)}</span><span className="price text-[13px] text-cb-faint line-through">{formatAED(stackSubtotal(s))}</span></div>
              <a href={`?stack=${s.id}#build`} className="mt-auto pt-5"><span className="flex h-12 items-center justify-center bg-cb-ink text-white text-[12px] uppercase tracking-[0.14em] hover:bg-black">Choose sizes and add to bag</span></a>
            </div>
          );
        })}
      </div>
      <section id="build" className="bg-cb-band py-16 scroll-mt-24">
        <div className="container-x">
          <SectionTitle eyebrow="Build your own" title="Pick any three" align="left" />
          <StackBuilder products={builder} intentions={intentions.map((i) => ({ id: i.id, name: i.data.short }))} discountPct={site.stackDiscountPct} presets={stacks.map((s) => ({ id: s.id, products: s.data.products }))} />
        </div>
      </section>
    </>
  );
}
