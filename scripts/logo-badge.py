#!/usr/bin/env python3
"""Rebuild the Crystal Basket badge (logo concept 05) as font-independent SVG.

Geometry was measured from docs/brand/logos/logo-05-circular-badge.png (1200 px)
and expressed in a 400-unit viewBox: two rings of 100 beads, one rose bead at
138° on the outer ring, a faceted crystal 44 × 80 units in the centre, the name
set in Cormorant Garamond 600 on arcs (glyphs converted to paths so the badge
renders identically in the header, the favicon and print).

Outputs:
  apps/web/src/components/Store/logo-badge-paths.ts   data used by LogoBadge.tsx
  apps/web/public/brand/logo-badge.svg                ink on transparent
  apps/web/public/brand/logo-badge-dark.svg           white on transparent
  apps/web/public/brand/logo-mark.svg                 rings + crystal only
  apps/web/public/favicon.svg                         mark, ink

Needs: pip install fonttools; the font file is fetched from Google Fonts on first run.
    python3 scripts/logo-badge.py
"""
import math, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"
FONT_PATH = os.path.join(ROOT, "docs", "brand", "fonts", "CormorantGaramond[wght].ttf")
WEIGHT = 700

C = 200.0                     # centre of the 400-unit viewBox
OUTER = (146.7, 4.5, 100)    # radius, bead radius, bead count
INNER = (131.0, 3.85, 100)
ROSE = (138.3, 147.0, 8.2)    # angle (deg, counter-clockwise from +x), distance, radius
ROSE_HEX = "#b98186"          # sampled from the original artwork
FONT_SIZE = 44.0              # cap height ≈ 27.5 units
TOP = ("CRYSTAL", 78.0, [155.5, 132.25, 110.75, 89.5, 68.75, 47.25, 24.25])     # baseline radius, glyph centres (deg)
BOTTOM = ("BASKET", 104.7, [220.5, 241.75, 261.25, 280.75, 300.25, 320.5])
CRYSTAL_STROKE = 2.2
# Crystal vertices (units from centre, y down). Outline + facet lines.
P_TOP, P_BOT = (0, -40), (0, 40)
UL, UR, LL, LR = (-22, -18), (22, -18), (-22, 18), (22, 18)
P1, P2, P3, P4 = (-10.4, -6.4), (5.8, -17.8), (-10.4, 13.2), (5.0, 17.7)
CRYSTAL_EDGES = [
    (P_TOP, UR), (UR, LR), (LR, P_BOT), (P_BOT, LL), (LL, UL), (UL, P_TOP),
    (P_TOP, P1), (P_TOP, P2), (P2, P1), (P1, UL), (P2, UR), (P1, P3), (P2, LR), (UR, P4), (P3, P4), (P4, P_BOT), (P3, LL), (P3, P_BOT), (P4, LR),
]


def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def ring(radius, bead_r, count, phase_deg, skip=None):
    out = []
    for k in range(count):
        a = math.radians(phase_deg + k * 360 / count)
        if skip is not None and k == skip:
            continue
        out.append(f'<circle cx="{fmt(C + radius * math.cos(a))}" cy="{fmt(C - radius * math.sin(a))}" r="{bead_r}"/>')
    return "".join(out)


def crystal_path():
    parts = []
    for (ax, ay), (bx, by) in CRYSTAL_EDGES:
        parts.append(f"M{fmt(C + ax)} {fmt(C + ay)}L{fmt(C + bx)} {fmt(C + by)}")
    return "".join(parts)


def load_font():
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    if not os.path.exists(FONT_PATH):
        os.makedirs(os.path.dirname(FONT_PATH), exist_ok=True)
        urllib.request.urlretrieve(FONT_URL, FONT_PATH)
    font = TTFont(FONT_PATH)
    return instancer.instantiateVariableFont(font, {"wght": WEIGHT})


def glyph_path(font, ch, matrix):
    """SVG path for one glyph after applying `matrix` (fontTools Transform) to font units."""
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.boundsPen import BoundsPen
    glyph_set = font.getGlyphSet()
    name = font.getBestCmap()[ord(ch)]
    bp = BoundsPen(glyph_set); glyph_set[name].draw(bp)
    pen = SVGPathPen(glyph_set)
    glyph_set[name].draw(TransformPen(pen, matrix))
    return pen.getCommands(), bp.bounds


def arc_text(font, word, baseline_r, centres, inward):
    """Glyphs centred on the given angles; `inward` = letter tops point to the centre (bottom word)."""
    from fontTools.misc.transform import Transform
    upm = font["head"].unitsPerEm
    s = FONT_SIZE / upm
    glyph_set = font.getGlyphSet(); cmap = font.getBestCmap()
    from fontTools.pens.boundsPen import BoundsPen
    paths = []
    for ch, deg in zip(word, centres):
        bp = BoundsPen(glyph_set); glyph_set[cmap[ord(ch)]].draw(bp)
        xmin, _, xmax, _ = bp.bounds
        ink_centre = (xmin + xmax) / 2 * s
        a = math.radians(deg)
        px, py = C + baseline_r * math.cos(a), C - baseline_r * math.sin(a)
        rot = (270 - deg) if inward else (90 - deg)
        # font units (y up) → scale → flip y → rotate → translate to the baseline point
        m = Transform().translate(px, py).rotate(math.radians(rot)).scale(s, -s).translate(-ink_centre / s, 0)
        d, _ = glyph_path(font, ch, m)
        paths.append(f'<path d="{d}"/>')
    return "".join(paths)


def build():
    font = load_font()
    rings = ring(*OUTER, phase_deg=ROSE[0], skip=0) + ring(*INNER, phase_deg=ROSE[0] + 1.8)
    ra = math.radians(ROSE[0])
    rose = {"cx": round(C + ROSE[1] * math.cos(ra), 2), "cy": round(C - ROSE[1] * math.sin(ra), 2), "r": ROSE[2]}
    top = arc_text(font, TOP[0], TOP[1], TOP[2], inward=False)
    bottom = arc_text(font, BOTTOM[0], BOTTOM[1], BOTTOM[2], inward=True)
    crystal = crystal_path()
    return rings, rose, top + bottom, crystal


def svg(rings, rose, text, crystal, ink, with_text=True, rose_hex=ROSE_HEX):
    body = f'<g fill="{ink}">{rings}</g><circle cx="{rose["cx"]}" cy="{rose["cy"]}" r="{rose["r"]}" fill="{rose_hex}"/>'
    body += f'<path d="{crystal}" fill="none" stroke="{ink}" stroke-width="{CRYSTAL_STROKE if with_text else CRYSTAL_STROKE * 1.6}" stroke-linejoin="round" stroke-linecap="round"/>'
    if with_text:
        body += f'<g fill="{ink}">{text}</g>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="Crystal Basket">{body}</svg>\n'


def main():
    rings, rose, text, crystal = build()
    ts = os.path.join(ROOT, "apps", "web", "src", "components", "Store", "logo-badge-paths.ts")
    with open(ts, "w") as f:
        f.write("// Generated by scripts/logo-badge.py — do not edit by hand.\n")
        f.write(f"export const RINGS = {rings!r};\n")
        f.write(f"export const ROSE = {{ cx: {rose['cx']}, cy: {rose['cy']}, r: {rose['r']} }};\n")
        f.write(f"export const CRYSTAL = {crystal!r};\n")
        f.write(f"export const CRYSTAL_STROKE = {CRYSTAL_STROKE};\n")
        f.write(f"export const TEXT = {text!r};\n")
    pub = os.path.join(ROOT, "apps", "web", "public")
    open(os.path.join(pub, "brand", "logo-badge.svg"), "w").write(svg(rings, rose, text, crystal, "#1a1a1a"))
    open(os.path.join(pub, "brand", "logo-badge-dark.svg"), "w").write(svg(rings, rose, text, crystal, "#ffffff"))
    open(os.path.join(pub, "brand", "logo-mark.svg"), "w").write(svg(rings, rose, text, crystal, "#1a1a1a", with_text=False))
    open(os.path.join(pub, "favicon.svg"), "w").write(svg(rings, rose, text, crystal, "#1a1a1a", with_text=False))
    print("logo assets written")


if __name__ == "__main__":
    sys.exit(main())
