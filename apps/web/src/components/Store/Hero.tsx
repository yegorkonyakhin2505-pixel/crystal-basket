import { ButtonLink } from "@/components/ui";
import { routes, asset } from "@/lib/paths";

/** Full-bleed photo hero, title and two buttons centred over it (Swarovski homepage pattern). */
export function Hero({ image, eyebrow, title, subtitle, primary, secondary, align = "center" }: {
  image: string; eyebrow?: string; title: string; subtitle?: string;
  primary: { href: string; label: string }; secondary?: { href: string; label: string }; align?: "center" | "left";
}) {
  return (
    <section className="relative h-[72vh] min-h-[520px] max-h-[820px] overflow-hidden bg-cb-band">
      <img src={asset(image)} alt="" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" fetchPriority="high" />
      <div className={`absolute inset-0 ${align === "left" ? "bg-gradient-to-r from-white/85 via-white/40 to-transparent" : "bg-[radial-gradient(60%_70%_at_50%_55%,rgba(255,255,255,0.72),rgba(255,255,255,0)_70%)]"}`} />
      <div className={`container-x relative flex h-full flex-col justify-center ${align === "center" ? "items-center text-center" : "items-start text-left max-w-[52rem]"}`}>
        {eyebrow && <p className="label-caps mb-4">{eyebrow}</p>}
        <h1 className="text-cb-ink text-[2.75rem] leading-[1] sm:text-6xl lg:text-[4.75rem]">{title}</h1>
        {subtitle && <p className="mt-4 text-cb-ink/80 text-[17px] md:text-[19px] max-w-xl">{subtitle}</p>}
        <div className={`mt-8 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
          <ButtonLink href={primary.href} variant="primary" size="lg">{primary.label}</ButtonLink>
          {secondary && <ButtonLink href={secondary.href} variant="outline" size="lg" className="bg-white/70">{secondary.label}</ButtonLink>}
        </div>
      </div>
    </section>
  );
}
