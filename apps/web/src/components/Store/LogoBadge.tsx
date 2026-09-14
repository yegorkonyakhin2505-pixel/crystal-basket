/**
 * Crystal Basket badge (logo concept 05, palette 18 chosen 2026-09-15): ivory bead rings,
 * crystal and lettering on a dusty-rose disc with one gold bead. Geometry measured from the
 * approved artwork; glyphs are Cormorant Garamond outlines so it renders identically everywhere.
 * Regenerate the paths with `python3 scripts/logo-badge.py`. `mono` draws it in currentColor without the disc.
 */
import { cn } from "@/components/ui/cn";
import { CRYSTAL, CRYSTAL_STROKE, DISC_R, RINGS, ROSE, TEXT } from "./logo-badge-paths";

export function LogoBadge({ className, withText = true, mono = false, title = "Crystal Basket" }: { className?: string; withText?: boolean; mono?: boolean; title?: string }) {
  const ink = mono ? "fill-current" : "fill-cb-cream";
  return (
    <svg viewBox="0 0 400 400" className={cn("block", className)} role="img" aria-label={title}>
      {!mono && <circle cx={200} cy={200} r={DISC_R} className="fill-cb-rose" />}
      <g className={ink} dangerouslySetInnerHTML={{ __html: RINGS }} />
      <circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} className="fill-cb-gold" />
      <path d={CRYSTAL} fill="none" stroke={mono ? "currentColor" : "var(--cb-cream)"} strokeWidth={withText ? CRYSTAL_STROKE : CRYSTAL_STROKE * 1.6} strokeLinejoin="round" strokeLinecap="round" />
      {withText && <g className={ink} dangerouslySetInnerHTML={{ __html: TEXT }} />}
    </svg>
  );
}
