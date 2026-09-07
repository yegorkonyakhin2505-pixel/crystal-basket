import type { Metadata } from "next";
import { BEAD_MM } from "@crystal-basket/catalog";
import { WRIST_SIZES, beadCount } from "@/lib/sizes";
export const metadata: Metadata = { title: "Size guide", description: "Measure your wrist in two steps and pick S, M or L. Custom lengths strung at no extra cost." };
export default function SizeGuidePage() {
  return (
    <>
      <section className="container-x pt-12 md:pt-20 pb-10 max-w-3xl"><p className="label-caps mb-3">Size guide</p><h1 className="text-4xl md:text-[3.25rem]">Measure once. Wear it every day.</h1><p className="text-cb-muted mt-5">A bracelet should sit snug enough not to spin, loose enough to slide a finger under.</p></section>
      <section className="container-x pb-12 grid md:grid-cols-2 gap-px bg-cb-line border border-cb-line max-w-5xl">
        <div className="bg-white p-7"><p className="label-caps mb-4">How to measure</p><ol className="space-y-3 text-[14px] list-decimal list-inside"><li>Wrap a strip of paper or a soft tape snugly around your wrist, just below the wrist bone.</li><li>Mark where it overlaps and measure the length in centimetres.</li><li>Pick the size that lists your measurement below. Between sizes? Go up: an 8 mm bracelet sits better slightly loose than tight.</li></ol></div>
        <div className="bg-white p-7"><p className="label-caps mb-4">Sizes</p><table className="w-full text-[14px]"><caption className="sr-only">Wrist sizes</caption><thead><tr className="text-left label-caps"><th scope="col" className="pb-2 font-medium">Size</th><th scope="col" className="pb-2 font-medium">Bracelet</th><th scope="col" className="pb-2 font-medium">Fits wrist</th></tr></thead><tbody className="divide-y divide-cb-line">{(Object.keys(WRIST_SIZES) as (keyof typeof WRIST_SIZES)[]).map((k) => <tr key={k}><td className="py-2.5 font-medium">{k}</td><td className="py-2.5">{WRIST_SIZES[k].cm} cm</td><td className="py-2.5">{WRIST_SIZES[k].fits}</td></tr>)}</tbody></table><p className="text-[12px] text-cb-muted mt-4">Need a custom length? Message us on WhatsApp with your wrist measurement and we will string it to size at no extra cost.</p></div>
      </section>
      <section className="container-x pb-20 max-w-5xl"><div className="bg-white border border-cb-line p-7 md:flex md:items-baseline md:gap-8"><p className="font-display text-2xl shrink-0">{BEAD_MM} mm beads, on every piece</p><p className="text-[13px] text-cb-muted mt-2 md:mt-0">The classic size: visible without being loud, comfortable on every wrist and made to stack. Roughly {beadCount(BEAD_MM, 16)} beads on a size S, {beadCount(BEAD_MM, 18)} on an M and {beadCount(BEAD_MM, 20)} on an L.</p></div></section>
    </>
  );
}
