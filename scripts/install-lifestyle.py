#!/usr/bin/env python3
"""Install a downloaded on-wrist photo as a product's second image.

    python3 scripts/install-lifestyle.py <slug> <path-to-image>

Resizes/crops to 900x1200 (3:4, matches the product-page tile), saves as
apps/web/public/images/products/<slug>/lifestyle.jpg and makes it images[1]
in the product JSON (replacing any earlier detail.jpg crop).
"""
import json, os, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main(slug, src):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im = ImageOps.fit(im, (900, 1200), Image.LANCZOS, centering=(0.5, 0.5))
    out_dir = os.path.join(ROOT, "apps", "web", "public", "images", "products", slug)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "lifestyle.jpg")
    im.save(out, quality=88, optimize=True, progressive=True)
    detail = os.path.join(out_dir, "detail.jpg")
    if os.path.exists(detail):
        os.remove(detail)
    f = os.path.join(ROOT, "packages", "catalog", "content", "products", f"{slug}.json")
    d = json.load(open(f))
    d["images"] = [d["images"][0], "lifestyle.jpg"]
    json.dump(d, open(f, "w"), indent=2, ensure_ascii=False)
    open(f, "a").write("\n")
    print(f"{slug}: lifestyle.jpg {os.path.getsize(out)} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
