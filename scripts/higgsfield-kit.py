#!/usr/bin/env python3
"""
Build the Higgsfield promo-video kit: ONE paste-ready prompt plus the numbered reference photos it
names ("image 1" ... "image 6"), and docs/marketing/higgsfield-promo.md with the same content.

    python3 scripts/higgsfield-kit.py [output_dir]     # default ~/Desktop/crystal-basket-higgsfield

Rerun after real product photos replace the AI placeholders.
"""
import shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "apps/web/public/images/products"
OUT = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path.home() / "Desktop/crystal-basket-higgsfield"

# Order matters: the prompt refers to these by number. Sold-out pieces (Devotion, Aurora) stay out.
REFERENCES = [
    ("the-shield", "main.jpg"),
    ("the-alchemist", "main.jpg"),
    ("the-guardian", "main.jpg"),
    ("the-tender-heart", "main.jpg"),
    ("the-seven", "main.jpg"),
    ("the-still-mind", "main.jpg"),
]
STYLE_REFERENCE = ("the-alchemist", "lifestyle.jpg")  # optional 7th image: light, linen, skin look

PROMPT = """15-second vertical 9:16 jewellery commercial for Crystal Basket, a Dubai brand of hand-strung 8 mm natural gemstone bracelets. Quiet luxury, warm natural light, 35mm film look, shallow depth of field, real skin texture, natural short nails. Calm but quick editing with one continuous rhythm.

Every bracelet must match its reference photo exactly: same stone colours, same bead pattern, same number of gold beads, round polished 8 mm beads on clear stretch cord. Image 1, The Shield: all glossy jet-black obsidian, no gold. Image 2, The Alchemist: honey-yellow citrine alternating with metallic pyrite, two small gold spacers. Image 3, The Guardian: matte black alternating with silver hematite, one gold bead. Image 4, The Tender Heart: pale pink rose quartz, one tiny gold spacer. Image 5, The Seven: matte black with seven coloured beads in a row, red, orange, yellow, green, blue, purple, clear. Image 6, The Still Mind: purple amethyst, one gold bead.

0-2s: top-down macro, two hands tip a small ceramic dish and the citrine and pyrite beads from image 2 roll onto cream linen.
2-4s: extreme close-up, fingertips slide an amethyst bead from image 6 onto clear cord beside a row of amethyst.
4-6s: the finished rose quartz bracelet from image 4 is laid on a white selenite plate on a sunlit windowsill; the hands lift away.
6-7.5s: chest-height close-up, face out of frame, a man in a white linen shirt takes one slow breath and rolls the obsidian bracelet from image 1 onto his wrist.
7.5-13s: side-on tracking shot at wrist height of someone walking along a warm Dubai street at golden hour, sandstone walls, palm shadows. Match-cut about every second on the forward arm swing, identical framing and motion, but a different person and bracelet each cut: man in white linen with image 1, woman in cream knit with image 2, man in charcoal t-shirt with image 3, woman in white blouse with image 4, man in olive overshirt with image 5, woman in beige linen dress with image 6. Mixed skin tones.
13-15s: a relaxed woman's hand rests on a pale stone cafe table beside a glass of karak tea, wearing the bracelets from images 6, 4 and 2 stacked; it holds still, with calm empty space in the top third.

Grounded and gently spiritual, never mystical: no glow, sparkles, auras, floating crystals or magic effects. No text, no logos, no subtitles. Soft ambient music with a light oud pulse and subtle bead clicks."""

NEGATIVE = ("extra fingers, warped hands, melting or morphing beads, beads changing colour, wrong bead pattern, extra gold beads, "
            "extra bracelets, other jewellery, glitter, glowing light, neon, fantasy, text, captions, watermark, logo")

HOWTO = f"""CRYSTAL BASKET PROMO VIDEO: HOW TO USE THIS FOLDER
=================================================

1. In Higgsfield, open a VIDEO model that accepts reference images. Pick the one that allows the most
   images and the longest duration your plan has.
2. Attach the photos in the "references" folder IN NUMBER ORDER (1 to 6). The prompt calls them
   "image 1" to "image 6". If the model allows a 7th image, also attach 7-optional-style-look.jpg.
   If it allows fewer than 6, attach as many as it takes, in order; the prompt also describes each
   bracelet in words.
3. Open PROMPT.txt, copy everything, paste it once. Vertical 9:16, longest length available, best quality.
4. If there is a negative prompt box, paste this line:
   {NEGATIVE}
5. Generate 2 or 3 versions and keep the one where the bracelets look most like the reference photos.

Afterwards, in CapCut: put the logo from "logo-for-end-card" over the empty space in the last shot,
then "crystalbasket.store". Optional quiet captions: "Natural stone." "Strung by hand in Dubai."
"Worn for what you need." Never say heal or cure.

If one generation gets the beads wrong: the more bracelets in a single video, the more the AI drifts.
Cut the walking part down to three bracelets, or make each shot as its own clip from the same photos.
"""

def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    refs = OUT / "references"
    refs.mkdir(parents=True)
    names = []
    for n, (slug, file) in enumerate(REFERENCES, start=1):
        name = f"{n}-{slug}.jpg"
        shutil.copy(PRODUCTS / slug / file, refs / name)
        names.append(name)
    shutil.copy(PRODUCTS / STYLE_REFERENCE[0] / STYLE_REFERENCE[1], refs / "7-optional-style-look.jpg")
    (OUT / "PROMPT.txt").write_text(PROMPT + "\n")
    (OUT / "HOW-TO.txt").write_text(HOWTO)
    logo = OUT / "logo-for-end-card"
    logo.mkdir()
    for f in ["crystal-basket-logo-2000-transparent.png", "crystal-basket-logo-2000-ivory.png"]:
        shutil.copy(ROOT / "docs/brand/export" / f, logo / f)
    home = str(Path.home())
    md = ["# Crystal Basket promo video — Higgsfield", "",
          f"_Generated by `scripts/higgsfield-kit.py` into `{str(OUT).replace(home, '~')}`. Rerun after real product photos land._", "",
          "## Attach, in this order", "", *[f"{i}. `references/{n}` (from `apps/web/public/images/products/{s}/{f}`)" for i, (n, (s, f)) in enumerate(zip(names, REFERENCES), start=1)],
          f"7. Optional: `references/7-optional-style-look.jpg` (from `{STYLE_REFERENCE[0]}/{STYLE_REFERENCE[1]}`)", "",
          "## Prompt (paste once)", "", "```text", PROMPT, "```", "", "## Negative prompt (optional box)", "", "```text", NEGATIVE, "```", "",
          "## How to use", "", "```text", HOWTO.strip(), "```", ""]
    (ROOT / "docs/marketing/higgsfield-promo.md").write_text("\n".join(md))
    print(f"Kit written to {OUT} · prompt {len(PROMPT)} characters")

if __name__ == "__main__":
    build()
