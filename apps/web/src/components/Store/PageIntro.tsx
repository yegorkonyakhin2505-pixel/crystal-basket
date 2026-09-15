import type { ReactNode } from "react";
import { cn } from "@/components/ui";

/**
 * Header for guide and policy pages. The H1 says plainly what the page is (for search and AI answers);
 * the brand line below keeps the large display type the design uses.
 */
export function PageIntro({ heading, tagline, children, reviewed, className }: { heading: string; tagline?: string; children?: ReactNode; reviewed?: string | null; className?: string }) {
  return (
    <section className={cn("container-x pt-12 md:pt-20 pb-10 max-w-3xl", className)}>
      <h1 className="label-caps mb-3">{heading}</h1>
      {tagline && <p className="font-display text-4xl md:text-[3.25rem] leading-[1.08]">{tagline}</p>}
      {children && <div className="text-cb-muted mt-5 space-y-3">{children}</div>}
      {reviewed && <p className="text-[12px] text-cb-faint mt-4">Last reviewed {reviewed}</p>}
    </section>
  );
}
