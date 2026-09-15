import { execFileSync } from "node:child_process";

/**
 * Last commit date for one or more repo paths, used for sitemap <lastmod> and the visible
 * "Last reviewed" line. Build-time only (server components, sitemap route). Returns undefined when
 * git or history is unavailable, so callers simply omit the date instead of inventing one.
 * CI checks out with fetch-depth: 0 so real history exists.
 */
let root: string | null | undefined;
const cache = new Map<string, Date | undefined>();

function repoRoot(): string | null {
  if (root !== undefined) return root;
  try { root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { root = null; }
  return root;
}

export function lastCommitDate(...paths: string[]): Date | undefined {
  const key = paths.join("|");
  if (cache.has(key)) return cache.get(key);
  const r = repoRoot();
  let date: Date | undefined;
  if (r) {
    try {
      const out = execFileSync("git", ["-C", r, "log", "-1", "--format=%cI", "--", ...paths], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      date = out ? new Date(out) : undefined;
    } catch { date = undefined; }
  }
  cache.set(key, date);
  return date;
}

export const formatReviewed = (d: Date | undefined) => (d ? d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null);

/** Repo-relative source paths per route family. */
export const sources = {
  page: (route: string) => `apps/web/src/app/${route}`,
  product: (id: string) => [`packages/catalog/content/products/${id}.json`, `apps/web/public/images/products/${id}`],
  intention: (id: string) => [`packages/catalog/content/intentions/${id}.json`],
  stone: (id: string) => [`packages/catalog/content/stones/${id}.json`],
};
