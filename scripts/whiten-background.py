#!/usr/bin/env python3
"""Turn an off-white or grey studio background into pure white without touching the product.

    python3 scripts/whiten-background.py <image.jpg> [...]

Flood-fills the background from the image border and from the centre (the hole of a bracelet),
with a colour tolerance, feathers the mask edge, and composites white behind the product.
Soft cast shadows are kept because they are darker than the tolerance."""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

def whiten(path, tol=16.0):
    im = Image.open(path).convert("RGB"); a = np.asarray(im).astype(np.int16); h, w, _ = a.shape
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    if bg.min() >= 250: return False
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    near = dist < tol
    mask = np.zeros((h, w), dtype=bool)
    seeds = [(0, x) for x in range(0, w, 4)] + [(h - 1, x) for x in range(0, w, 4)] + [(y, 0) for y in range(0, h, 4)] + [(y, w - 1) for y in range(0, h, 4)] + [(h // 2, w // 2)]
    q = deque([s for s in seeds if near[s]])
    for s in q: mask[s] = True
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not mask[ny, nx]:
                mask[ny, nx] = True; q.append((ny, nx))
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    mf = np.asarray(m).astype(np.float32)[..., None] / 255.0
    # lift the remaining background-tinted pixels near the product edge too: rescale so bg -> white
    lifted = np.clip(a.astype(np.float32) + (255 - bg), 0, 255)
    out = a.astype(np.float32) * (1 - mf) + lifted * mf
    Image.fromarray(out.astype(np.uint8)).save(path, quality=92, optimize=True)
    return True

if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(p, "whitened" if whiten(p) else "already white")
