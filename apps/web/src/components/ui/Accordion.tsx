import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Native <details> accordion: zero JS, accessible, works in static export. `heading` renders the title
 * as a real h2/h3 inside <summary> (allowed by the HTML spec) so questions are part of the document outline.
 */
export function AccordionItem({ title, children, defaultOpen = false, className, heading }: { title: string; children: ReactNode; defaultOpen?: boolean; className?: string; heading?: "h2" | "h3" }) {
  const H = heading ?? "span";
  return (
    <details open={defaultOpen} className={cn("group border-b border-cb-line", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[14px] font-medium tracking-wide [&::-webkit-details-marker]:hidden">
        <H className="font-body text-[14px] font-medium tracking-wide leading-snug">{title}</H>
        <span aria-hidden className="ml-4 text-cb-muted transition-transform duration-300 group-open:rotate-45 text-xl leading-none">+</span>
      </summary>
      <div className="pb-5 text-[14px] leading-relaxed text-cb-muted">{children}</div>
    </details>
  );
}
