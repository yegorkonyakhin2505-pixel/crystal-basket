import type { Metadata } from "next";
import { WRIST_SIZES } from "@/lib/sizes";
export const metadata: Metadata = { title: "Size guide" };
export default function SizeGuidePage() {
  return (
    <>
      <section className="container-x pt-12 md:pt-20 pb-10 max-w-3xl"><p className="label-caps mb-3">Size guide</p><h1 className="text-4xl md:text-[3.25rem]">Measure once. Wear it every day.</h1><p className="text-cb-muted mt-5">A bracelet should sit snug enough not to spin, loose enough to slide a finger under.</p></section>
      <section className="container-x pb-12 grid md:grid-cols-2 gap-px bg-cb-line border border-cb-line max-w-5xl">
        <div className="bg-white p-7"><p className="label-caps mb-4">How to measure</p><ol className="space-y-3 text-[14px] list-decimal list-inside"><li>Wrap a strip of paper or a soft tape snugly around your wrist, just below the wrist bone.</li><li>Mark where it overlaps and measure the length in centimetres.</li><li>Pick the size that lists your measurement below. Between sizes? Go up for 10mm beads and down for 6mm.</li></ol></div>
        <div className="bg-white p-7"><p className="label-caps mb-4">Sizes</p><table className="w-full text-[14px]"><thead><tr className="text-left label-caps"><th className="pb-2 font-medium">Size</th><th className="pb-2 font-medium">Bracelet</th><th className="pb-2 font-medium">Fits wrist</th></tr></thead><tbody className="divide-y divide-cb-line">{(Object.keys(WRIST_SIZES) as (keyof typeof WRIST_SIZES)[]).map((k) => <tr key={k}><td className="py-2.5 font-medium">{k}</td><td className="py-2.5">{WRIST_SIZES[k].cm} cm</td><td className="py-2.5">{WRIST_SIZES[k].fits}</td></tr>)}</tbody></table><p className="text-[12px] text-cb-muted mt-4">Need a custom length? Message us on WhatsApp with your wrist measurement and we will string it to size at no extra cost.</p></div>
      </section>
      <section className="container-x pb-20 max-w-5xl"><p className="label-caps mb-4">Which bead size?</p><div className="grid sm:grid-cols-3 gap-px bg-cb-line border border-cb-line">{[["6 mm", "Slim and light. Best for smaller wrists, layering three or four, and wearing under a cuff or watch."], ["8 mm", "The classic. Visible without being loud, works on every wrist, our most-ordered size."], ["10 mm", "Statement weight. Suits larger wrists, usually worn alone or with one 6mm."]].map(([t, s]) => <div key={t} className="bg-white p-6"><p className="font-display text-2xl">{t}</p><p className="text-[13px] text-cb-muted mt-2">{s}</p></div>)}</div></section>
    </>
  );
}
