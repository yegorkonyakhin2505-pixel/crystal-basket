import type { Metadata } from "next";
import { Img } from "@/components/Img";
import { asset } from "@/lib/paths";
import { site } from "@/lib/site";
const description = "About Crystal Basket, a small Dubai studio stringing natural, undyed 8 mm crystal bracelets by hand, cleansed on selenite before they ship across the UAE.";
export const metadata: Metadata = { title: "About Crystal Basket, Dubai", description, openGraph: { title: "About Crystal Basket, Dubai", description } };
const steps: [string, string][] = [
  ["Sourced", "Whole strands from graders we know, not marketplace lots. Every strand is checked bead by bead for dye, glass and glue."],
  ["Strung", "Each bracelet is strung by hand on 1mm premium stretch cord, double-knotted and hidden inside a bead."],
  ["Cleansed", "Finished pieces rest on a selenite slab for 48 hours before they are packed."],
  ["Packed", "Linen pouch, a printed meaning and affirmation card, and a cleanse-and-care card. Ready to gift."],
];
export default function AboutPage() {
  return (
    <>
      <section className="container-x pt-12 md:pt-20 grid lg:grid-cols-2 gap-10 items-center">
        <div><h1 className="label-caps mb-3">About Crystal Basket, Dubai</h1><p className="font-display text-4xl md:text-[3.25rem] leading-[1.08]">A basket of stones on a kitchen table.</p><p className="text-cb-muted mt-6 text-[16px]">{site.name} started in {site.city} with a bowl of loose beads and a few friends who kept asking for “the calm one”. It is still a small studio. Every bracelet is chosen, strung and cleansed by one pair of hands, and every stone is natural and undyed.</p><p className="text-cb-muted mt-4">We do not promise the stones will change your life. We promise they are real, they are strung to last, and they will remind you of the intention you set when you put them on.</p></div>
        <div className="aspect-[4/3] overflow-hidden"><Img src={asset("/images/about/studio.jpg")} alt="Stringing gemstone beads at the studio table" /></div>
      </section>
      <section className="container-x pt-16"><h2 className="text-3xl md:text-[2.25rem]">How is each bracelet made?</h2></section>
      <section className="container-x pt-6 pb-16 grid md:grid-cols-4 gap-px bg-cb-line border border-cb-line">
        {steps.map(([t, s], i) => <div key={t} className="bg-white p-7"><span className="font-display text-3xl text-cb-gold">0{i + 1}</span><h3 className="font-display text-[1.4rem] mt-2">{t}</h3><p className="text-[13px] text-cb-muted mt-2">{s}</p></div>)}
      </section>
      <section className="container-x pb-20 max-w-3xl"><h2 className="label-caps mb-3">What’s next</h2><p className="text-cb-muted">Bracelets first. Raw crystals, tumbled stones, clusters and towers are coming to the basket next, organised by the same eight intentions.</p></section>
    </>
  );
}
