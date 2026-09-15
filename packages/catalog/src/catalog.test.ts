import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getIntentions, getProduct, getProducts, getStacks, getStones, inStockFirst, loadCatalog, relatedProducts, stackForProduct, stackSubtotal } from "./index";

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

  it("curated stacks only contain in-stock pieces", () => {
    for (const s of getStacks()) for (const id of s.data.products) expect(getProduct(id).data.inStock, `${s.id} contains sold-out ${id}`).toBe(true);
  });

  it("stack prices are below the sum of their parts", () => {
    for (const s of getStacks()) expect(s.data.priceAED).toBeLessThan(stackSubtotal(s));
  });

  it("related products never include the product itself", () => {
    for (const p of getProducts()) expect(relatedProducts(p).map((r) => r.id)).not.toContain(p.id);
  });

  it("stack prices match the advertised stack discount", () => {
    // site.stackDiscountPct is 15; a curated stack costs the sum of its parts less 15%, rounded to the dirham.
    for (const s of getStacks()) expect(s.data.priceAED, s.id).toBe(Math.round(stackSubtotal(s) * 0.85));
  });
});

describe("search content", () => {
  it("product SEO titles and descriptions are unique", () => {
    const titles = getProducts().map((p) => p.data.seoTitle);
    const descriptions = getProducts().map((p) => p.data.seoDescription);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("intention definitions and stone passages are quotable length (40-120 words)", () => {
    const words = (t: string) => t.trim().split(/\s+/).length;
    for (const i of getIntentions()) expect(words(i.data.definition), `${i.id} definition`).toBeGreaterThanOrEqual(40);
    for (const s of getStones()) {
      expect(words(s.data.wornFor), `${s.id} wornFor`).toBeGreaterThanOrEqual(40);
      expect(words(s.data.wornFor), `${s.id} wornFor`).toBeLessThanOrEqual(120);
    }
  });

  it("copy never makes medical claims", () => {
    const banned = /\b(cures?|heals?|treats? (anxiety|depression|illness|disease)|prevents? (anxiety|illness|disease)|diagnos\w*|anxiety relief|insomnia)\b/i;
    const texts = [
      ...getProducts().flatMap((p) => [p.data.promise, p.data.body, p.data.seoDescription]),
      ...getStones().flatMap((s) => [s.data.description, s.data.wornFor, s.data.wristWhy]),
      ...getIntentions().flatMap((i) => [i.data.description, i.data.definition, i.data.seoDescription, ...i.data.faq.flatMap((f) => [f.q, f.a])]),
    ];
    for (const t of texts) expect(t, t).not.toMatch(banned);
  });

  it("stone pairings are mutual-safe: no stone pairs with itself", () => {
    for (const s of getStones()) expect(s.data.pairsWith, s.id).not.toContain(s.id);
  });

  it("inStockFirst never puts a sold-out piece ahead of an in-stock one", () => {
    const sorted = inStockFirst(getProducts());
    const firstSoldOut = sorted.findIndex((p) => !p.data.inStock);
    if (firstSoldOut >= 0) expect(sorted.slice(firstSoldOut).every((p) => !p.data.inStock)).toBe(true);
  });

  it("every stack product resolves back to its stack", () => {
    for (const s of getStacks()) for (const id of s.data.products) expect(stackForProduct(getProduct(id))?.id).toBe(s.id);
  });
});
