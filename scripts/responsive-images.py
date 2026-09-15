#!/usr/bin/env python3
"""Generate WebP width variants for every JPEG under apps/web/public/images and write the manifest
apps/web/src/lib/image-variants.json that components/Img.tsx reads.

Static export has no image optimiser, so this runs ahead of time. Re-run after adding or replacing a photo:

    python3 scripts/responsive-images.py

Variants are named <stem>-<width>.webp next to the original. Originals stay as the <img> fallback
and as the URLs used in structured data and the Shopify CSV.
"""
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "apps", "web", "public")
IMAGES = os.path.join(PUB, "images")
OUT = os.path.join(ROOT, "apps", "web", "src", "lib", "image-variants.json")
LADDER = [480, 800, 1200, 1600, 2000]
QUALITY = 78


def main():
    manifest = {}
    written = 0
    for dirpath, _, files in os.walk(IMAGES):
        for name in sorted(files):
            if not name.lower().endswith((".jpg", ".jpeg")):
                continue
            path = os.path.join(dirpath, name)
            stem = os.path.splitext(path)[0]
            with Image.open(path) as im:
                im = im.convert("RGB")
                w, h = im.size
                widths = [x for x in LADDER if x < w] + [w]
                widths = sorted(set(x for x in widths if x >= 480 or x == w))
                for tw in widths:
                    target = f"{stem}-{tw}.webp"
                    if os.path.exists(target) and os.path.getmtime(target) >= os.path.getmtime(path):
                        continue
                    th = round(h * tw / w)
                    im.resize((tw, th), Image.LANCZOS).save(target, "WEBP", quality=QUALITY, method=6)
                    written += 1
            url = "/" + os.path.relpath(path, PUB).replace(os.sep, "/")
            manifest[url] = {"w": w, "h": h, "webp": widths}
    with open(OUT, "w") as f:
        json.dump(dict(sorted(manifest.items())), f, indent=1)
        f.write("\n")
    print(f"{len(manifest)} images, {written} WebP files written, manifest {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
