import { describe, expect, it } from "vitest";
import { getIntentions, getProducts, getStacks, getStones, loadCatalog, relatedProducts, stackSubtotal } from "./index";

describe("catalog content", () => {
  it("loads and cross-validates every collection", () => {
    const c = loadCatalog();
    expect(c.intentions.length).toBe(8);
    expect(c.stones.length).toBeGreaterThanOrEqual(16);
    expect(c.products.length).toBeGreaterThanOrEqual(14);
    expect(c.stacks.length).toBeGreaterThanOrEqual(3);
  });

  it("every intention has at least one primary product", () => {
    const ids = new Set(getProducts().map((p) => p.data.intention));
    for (const i of getIntentions()) expect(ids.has(i.id), `intention ${i.id} has no products`).toBe(true);
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
