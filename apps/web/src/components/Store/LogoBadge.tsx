/**
 * Crystal Basket badge (logo concept 05), geometry measured from the approved artwork.
 * Two rings of 100 beads, one rose bead, a faceted crystal and the name set in
 * Cormorant Garamond converted to outlines, so it renders identically everywhere.
 * Ink follows currentColor; regenerate the paths with `python3 scripts/logo-badge.py`.
 */
import { cn } from "@/components/ui/cn";
import { CRYSTAL, CRYSTAL_STROKE, RINGS, ROSE, TEXT } from "./logo-badge-paths";

export function LogoBadge({ className, withText = true, title = "Crystal Basket" }: { className?: string; withText?: boolean; title?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={cn("block", className)} role="img" aria-label={title}>
      <g fill="currentColor" dangerouslySetInnerHTML={{ __html: RINGS }} />
      <circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} className="fill-cb-rose" />
      <path d={CRYSTAL} fill="none" stroke="currentColor" strokeWidth={withText ? CRYSTAL_STROKE : CRYSTAL_STROKE * 1.6} strokeLinejoin="round" strokeLinecap="round" />
      {withText && <g fill="currentColor" dangerouslySetInnerHTML={{ __html: TEXT }} />}
    </svg>
  );
}
