import { ButtonLink } from "@/components/ui";
import { Img } from "@/components/Img";
import { asset } from "@/lib/paths";

/**
 * Full-bleed photo hero (Swarovski homepage pattern). `headingOnEyebrow` makes the small eyebrow the page H1
 * (plain words for search) while the large line stays as display type.
 */
export function Hero({ image, alt, eyebrow, title, subtitle, primary, secondary, align = "center", headingOnEyebrow = false }: {
  image: string; alt: string; eyebrow?: string; title: string; subtitle?: string; headingOnEyebrow?: boolean;
  primary: { href: string; label: string }; secondary?: { href: string; label: string }; align?: "center" | "left";
}) {
  const Eyebrow = headingOnEyebrow ? "h1" : "p";
  const Title = headingOnEyebrow ? "p" : "h1";
  return (
    <section className="relative h-[72vh] min-h-[520px] max-h-[820px] overflow-hidden bg-cb-band">
      <div className="absolute inset-0">
        <Img src={asset(image)} alt={alt} sizes="100vw" loading="eager" fetchPriority="high" className="object-[65%_center]" />
      </div>
      <div className={`absolute inset-0 ${align === "left" ? "bg-gradient-to-r from-white/85 via-white/40 to-transparent" : "bg-[radial-gradient(60%_70%_at_50%_55%,var(--cb-bg)_0%,transparent_70%)] opacity-75"}`} />
      <div className={`container-x relative flex h-full flex-col justify-center ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
        <div className={`flex flex-col ${align === "center" ? "items-center" : "items-start max-w-[52rem]"}`}>
        {eyebrow && <Eyebrow className="label-caps mb-4">{eyebrow}</Eyebrow>}
        <Title className="font-display text-cb-ink text-[2.75rem] leading-[1] sm:text-6xl lg:text-[4.75rem]">{title}</Title>
        {subtitle && <p className="mt-4 text-cb-ink/80 text-[17px] md:text-[19px] max-w-xl">{subtitle}</p>}
        <div className={`mt-8 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
          <ButtonLink href={primary.href} variant="primary" size="lg">{primary.label}</ButtonLink>
          {secondary && <ButtonLink href={secondary.href} variant="outline" size="lg" className="bg-white/70">{secondary.label}</ButtonLink>}
        </div>
        </div>
      </div>
    </section>
  );
}
