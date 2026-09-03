import type { ReactNode } from "react";
import { cn } from "./cn";

/** Native <details> accordion: zero JS, accessible, works in static export. */
export function AccordionItem({ title, children, defaultOpen = false, className }: { title: string; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  return (
    <details open={defaultOpen} className={cn("group border-b border-cb-line", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[14px] font-medium tracking-wide [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="ml-4 text-cb-muted transition-transform duration-300 group-open:rotate-45 text-xl leading-none">+</span>
      </summary>
      <div className="pb-5 text-[14px] leading-relaxed text-cb-muted">{children}</div>
    </details>
  );
}
