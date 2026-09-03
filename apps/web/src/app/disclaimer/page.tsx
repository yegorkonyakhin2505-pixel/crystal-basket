import type { Metadata } from "next";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Wellness disclaimer" };
export default function DisclaimerPage() {
  return (
    <section className="container-x pt-12 md:pt-20 pb-20 max-w-3xl">
      <p className="label-caps mb-3">Legal</p><h1 className="text-4xl md:text-[3rem]">Wellness disclaimer</h1>
      <div className="text-cb-muted mt-6 space-y-4 text-[14px]">
        <p>Crystal properties described on this website reflect traditional and metaphysical beliefs and are provided for informational and inspirational purposes only.</p>
        <p>{site.name} products are not medical devices. They are not intended to diagnose, treat, cure or prevent any disease or condition, physical or mental. Nothing on this site is a substitute for professional medical, psychological, legal or financial advice.</p>
        <p>Individual experiences vary and no specific outcome is guaranteed.</p>
        <p>All stones are natural. Colour, banding, inclusions and flash vary from piece to piece and from the photographs shown. This variation is a characteristic of natural stone, not a defect.</p>
        <p>Bracelets contain small parts. Keep away from children under three years of age.</p>
      </div>
    </section>
  );
}
