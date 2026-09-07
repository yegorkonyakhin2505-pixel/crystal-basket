import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getIntentions, getProducts, getStacks, getStones, loadCatalog, relatedProducts, stackSubtotal } from "./index";

describe("catalog content", () => {
  it("loads and cross-validates every collection", () => {
    const c = loadCatalog();
    expect(c.intentions.length).toBe(8);
    expect(c.stones.length).toBeGreaterThanOrEqual(16);
    expect(c.products.length).toBeGreaterThanOrEqual(12);
    expect(c.stacks.length).toBeGreaterThanOrEqual(3);
  });

  it("every intention has at least one product, primary or secondary", () => {
    const ids = new Set(getProducts().flatMap((p) => [p.data.intention, ...p.data.secondaryIntentions]));
    for (const i of getIntentions()) expect(ids.has(i.id), `intention ${i.id} has no products`).toBe(true);
  });

  it("every referenced image file exists under apps/web/public", () => {
    const pub = fileURLToPath(new URL("../../../apps/web/public/images/", import.meta.url));
    for (const p of getProducts()) for (const f of p.data.images) expect(existsSync(`${pub}products/${p.id}/${f}`), `${p.id}/${f} missing`).toBe(true);
    for (const i of getIntentions()) if (i.data.image) expect(existsSync(`${pub}intentions/${i.data.image}`), `${i.id} image missing`).toBe(true);
    for (const s of getStacks()) if (s.data.image) expect(existsSync(`${pub}stacks/${s.data.image}`), `${s.id} image missing`).toBe(true);
  });

  it("every stone is used by at least one product", () => {
    const used = new Set(getProducts().flatMap((p) => p.data.stones));
    for (const s of getStones()) expect(used.has(s.id), `stone ${s.id} unused`).toBe(true);
  });

  it("stack prices are below the sum of their parts", () => {
    for (const s of getStacks()) expect(s.data.priceAED).toBeLessThan(stackSubtotal(s));
  });

  it("related products never include the product itself", () => {
    for (const p of getProducts()) expect(relatedProducts(p).map((r) => r.id)).not.toContain(p.id);
  });
});
