import type { Metadata } from "next";
import Link from "next/link";
import { BEAD_MM } from "@crystal-basket/catalog";
import { PageIntro } from "@/components/Store/PageIntro";
import { WRIST_SIZES, beadCount } from "@/lib/sizes";
import { contactChannel } from "@/lib/contact";
import { routes } from "@/lib/paths";
import { formatReviewed, lastCommitDate, sources } from "@/lib/git-date";

const description = "How to measure your wrist for a crystal bracelet in two steps, then pick S, M or L. Every bracelet is 8 mm, and custom lengths are strung at no extra cost.";
export const metadata: Metadata = { title: "Crystal Bracelet Size Guide", description, openGraph: { title: "Crystal Bracelet Size Guide", description } };

export default function SizeGuidePage() {
  const keys = Object.keys(WRIST_SIZES) as (keyof typeof WRIST_SIZES)[];
  return (
    <>
      <PageIntro heading="Crystal bracelet size guide" tagline="Measure once. Wear it every day." reviewed={formatReviewed(lastCommitDate(sources.page("size-guide"), "apps/web/src/lib/sizes.ts"))}>
        <p>A crystal bracelet should sit snug enough not to spin and loose enough to slide a finger under. Measure your wrist just below the wrist bone, then choose the size whose range includes your measurement. Between two sizes, go up: an {BEAD_MM} mm bracelet sits better slightly loose than tight.</p>
      </PageIntro>
      <section className="container-x pb-12 grid md:grid-cols-2 gap-px bg-cb-line border border-cb-line max-w-5xl">
        <div className="bg-white p-7"><h2 className="label-caps mb-4">How do I measure my wrist?</h2><ol className="space-y-3 text-[14px] list-decimal list-inside"><li>Wrap a strip of paper or a soft tape snugly around your wrist, just below the wrist bone.</li><li>Mark where it overlaps and measure the length in centimetres.</li><li>Pick the size that lists your measurement below. Between sizes? Go up.</li></ol></div>
        <div className="bg-white p-7"><h2 className="label-caps mb-4">Which size am I?</h2><table className="w-full text-[14px]"><caption className="sr-only">Wrist sizes</caption><thead><tr className="text-left label-caps"><th scope="col" className="pb-2 font-medium">Size</th><th scope="col" className="pb-2 font-medium">Bracelet</th><th scope="col" className="pb-2 font-medium">Fits wrist</th></tr></thead><tbody className="divide-y divide-cb-line">{keys.map((k) => <tr key={k}><th scope="row" className="py-2.5 text-left font-medium">{k}</th><td className="py-2.5">{WRIST_SIZES[k].cm} cm</td><td className="py-2.5">{WRIST_SIZES[k].fits}</td></tr>)}</tbody></table><p className="text-[12px] text-cb-muted mt-4">Need a custom length? Send us your wrist measurement by <Link href={routes.contact} className="underline underline-offset-4">{contactChannel}</Link> and we will string it to size at no extra cost.</p></div>
      </section>
      <section className="container-x pb-20 max-w-5xl"><div className="bg-white border border-cb-line p-7 md:flex md:items-baseline md:gap-8"><h2 className="font-display text-2xl shrink-0">{BEAD_MM} mm beads, on every piece</h2><p className="text-[13px] text-cb-muted mt-2 md:mt-0">The classic size: visible without being loud, comfortable on every wrist and made to stack. Roughly {beadCount(BEAD_MM, 16)} beads on a size S, {beadCount(BEAD_MM, 18)} on an M and {beadCount(BEAD_MM, 20)} on an L. Wrong size after all? <Link href={routes.returns} className="underline underline-offset-4">Exchange it within 14 days</Link>.</p></div></section>
    </>
  );
}
