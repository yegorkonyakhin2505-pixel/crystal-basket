import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import type { z } from "zod";
import {
  IntentionSchema,
  ProductSchema,
  StackSchema,
  StoneSchema,
  type Entry,
  type Intention,
  type Product,
  type Stack,
  type Stone,
} from "./schemas";

/**
 * Content lives in packages/catalog/content. Resolve it by walking up from the
 * current working directory so the same code works from apps/web (Next build),
 * packages/catalog (vitest) and the repo root. Override with CATALOG_CONTENT_DIR.
 */
function resolveContentDir(): string {
  if (process.env.CATALOG_CONTENT_DIR) return process.env.CATALOG_CONTENT_DIR;
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "packages", "catalog", "content");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Catalog: could not locate packages/catalog/content from " + process.cwd());
}
const CONTENT_DIR = resolveContentDir();

/** Fail loudly with the file name and the field that broke. */
class CatalogError extends Error {
  constructor(file: string, issues: string) {
    super(`Catalog: ${file}\n${issues}`);
    this.name = "CatalogError";
  }
}

function loadCollection<S extends z.ZodTypeAny>(folder: string, schema: S): Entry<z.infer<S>>[] {
  const dir = join(CONTENT_DIR, folder);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((file) => {
      const raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        throw new CatalogError(
          `${folder}/${file}`,
          parsed.error.issues.map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n"),
        );
      }
      return { id: basename(file, ".json"), data: parsed.data };
    });
}

let cache: { intentions: Intention[]; stones: Stone[]; products: Product[]; stacks: Stack[] } | null = null;

/** Load and cross-validate every collection once per process. */
export function loadCatalog() {
  if (cache) return cache;
  const intentions = loadCollection("intentions", IntentionSchema).sort((a, b) => a.data.order - b.data.order);
  const stones = loadCollection("stones", StoneSchema).sort((a, b) => a.data.name.localeCompare(b.data.name));
  const products = loadCollection("products", ProductSchema);
  const stacks = loadCollection("stacks", StackSchema);

  const intentionIds = new Set(intentions.map((i) => i.id));
  const stoneIds = new Set(stones.map((s) => s.id));
  const productIds = new Set(products.map((p) => p.id));

  for (const p of products) {
    const refs = [p.data.intention, ...p.data.secondaryIntentions];
    for (const r of refs) if (!intentionIds.has(r)) throw new CatalogError(`products/${p.id}.json`, `  • intention "${r}" does not exist`);
    for (const s of p.data.stones) if (!stoneIds.has(s)) throw new CatalogError(`products/${p.id}.json`, `  • stone "${s}" does not exist`);
  }
  for (const s of stacks) {
    if (!intentionIds.has(s.data.intention)) throw new CatalogError(`stacks/${s.id}.json`, `  • intention "${s.data.intention}" does not exist`);
    for (const p of s.data.products) if (!productIds.has(p)) throw new CatalogError(`stacks/${s.id}.json`, `  • product "${p}" does not exist`);
  }

  cache = { intentions, stones, products, stacks };
  return cache;
}
