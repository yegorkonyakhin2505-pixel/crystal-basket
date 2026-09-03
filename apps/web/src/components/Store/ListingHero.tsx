import Link from "next/link";
import { asset, routes } from "@/lib/paths";

/** Listing page header à la Swarovski: photo band with breadcrumb, H1 and intro overlaid on the left. */
export function ListingHero({ image, crumbs, title, text, palette }: { image?: string | null; crumbs: [string, string][]; title: string; text?: string; palette?: [string, string] }) {
  return (
    <section className="relative min-h-[300px] md:min-h-[380px] overflow-hidden bg-cb-band">
      {image ? (
        <img src={asset(image)} alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
      ) : palette ? (
        <div className="absolute inset-0" style={{ background: `radial-gradient(70% 70% at 80% 20%, ${palette[0]}55, transparent 70%), radial-gradient(60% 60% at 20% 100%, ${palette[1]}33, transparent 70%)` }} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
      <div className="container-x relative py-14 md:py-20 max-w-[42rem] mr-auto">
        <nav className="text-[13px] text-cb-muted mb-4" aria-label="Breadcrumb">
          <Link href={routes.home} className="hover:text-cb-ink">Home</Link>
          {crumbs.map(([href, label]) => (<span key={href}> | {href ? <Link href={href} className="hover:text-cb-ink">{label}</Link> : <span className="text-cb-ink">{label}</span>}</span>))}
        </nav>
        <h1 className="text-4xl md:text-[3.25rem]">{title}</h1>
        {text && <p className="mt-3 text-[14px] text-cb-muted max-w-xl">{text}</p>}
      </div>
    </section>
  );
}
