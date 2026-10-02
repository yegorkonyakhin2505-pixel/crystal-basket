/**
 * Thin wrapper around `shopify store execute` (Shopify CLI 4.x) so the sync script can run Admin GraphQL
 * through the CLI's stored store session instead of managing tokens itself.
 *
 * - query + variables go through temp files (--query-file / --variable-file) so no payload touches the shell;
 * - the response is read from --output-file (stdout is a fallback);
 * - THROTTLED responses are retried with backoff;
 * - nothing that looks like a token is ever printed.
 *
 * Auth: `shopify store auth --store <store> --scopes <scopes>` once (interactive, opens the browser).
 */
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const STORE = process.env.SHOPIFY_STORE ?? "utx8rj-t3.myshopify.com";
export const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-07";
export const SHOPIFY_BIN = process.env.SHOPIFY_BIN ?? "/Users/yegor/.local/node-runtime/node-v22.17.0-darwin-arm64/bin/shopify";
export const SCOPES = [
  "read_products", "write_products",
  "read_metaobject_definitions", "write_metaobject_definitions",
  "read_metaobjects", "write_metaobjects",
  "read_content", "write_content",
  "read_online_store_navigation", "write_online_store_navigation",
  "read_files", "write_files",
  "read_publications", "write_publications",
];

const AGENT_ENV = {
  SHOPIFY_CLI_AGENT_INFO: "n:claude-code|v:none|p:anthropic|m:claude-fable-5-1",
  SHOPIFY_CLI_AGENT_IDS: "s:2e991180-26e8-43cd-a374-332377a30d3d",
};

export interface GqlError { message: string; extensions?: { code?: string; [k: string]: unknown }; path?: (string | number)[] }
export interface UserError { field?: string[] | null; message: string; code?: string | null }

export class GraphQLRequestError extends Error {
  constructor(message: string, public readonly errors: GqlError[]) { super(message); this.name = "GraphQLRequestError"; }
}
export class UserErrorsError extends Error {
  constructor(label: string, public readonly userErrors: UserError[]) {
    super(`${label}: ${userErrors.map((e) => `${(e.field ?? []).join(".") || "-"}: ${e.message}${e.code ? ` [${e.code}]` : ""}`).join("; ")}`);
    this.name = "UserErrorsError";
  }
}

export const stats = { queries: 0, mutations: 0, retries: 0 };

/** Strip anything that looks like a credential before it reaches a log line. */
export function scrub(text: string): string {
  return text
    .replace(/shp(at|ua|ca|ss|pa)_[A-Za-z0-9]+/g, "shp**_[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .replace(/X-Shopify-Access-Token:\s*\S+/gi, "X-Shopify-Access-Token: [redacted]");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Pull the outermost JSON object out of noisy CLI text. */
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON in CLI output");
  return JSON.parse(text.slice(start, end + 1));
}

function run(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(SHOPIFY_BIN, args, { env: { ...process.env, ...AGENT_ENV }, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(new Error(scrub(String(stderr || err.message))), { stdout: String(stdout), stderr: String(stderr) }));
      else resolve({ stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

export interface ExecOptions { label?: string }

/**
 * Execute one GraphQL document. Mutations are detected from the document and sent with --allow-mutations.
 * Returns the `data` object. Throws GraphQLRequestError for top-level errors (after retrying throttles).
 */
export async function gql<T = Record<string, unknown>>(query: string, variables: Record<string, unknown> = {}, opts: ExecOptions = {}): Promise<T> {
  const isMutation = /^\s*mutation\b/i.test(query);
  const dir = mkdtempSync(join(tmpdir(), "cb-sync-"));
  const qFile = join(dir, "op.graphql"), vFile = join(dir, "vars.json"), oFile = join(dir, "out.json");
  writeFileSync(qFile, query);
  writeFileSync(vFile, JSON.stringify(variables));
  const args = ["store", "execute", "--store", STORE, "--json", "--no-color", "--version", API_VERSION, "--query-file", qFile, "--variable-file", vFile, "--output-file", oFile];
  if (isMutation) args.push("--allow-mutations");
  try {
    for (let attempt = 1; ; attempt++) {
      let stdout = "";
      try {
        ({ stdout } = await run(args));
      } catch (e) {
        const msg = (e as Error).message;
        if (/throttl/i.test(msg) && attempt < 6) { stats.retries++; await sleep(1500 * attempt); continue; }
        if (/No stored app authentication|store auth/i.test(msg)) {
          throw new Error(`Not authenticated for ${STORE}. Run:\n  shopify store auth --store ${STORE} --scopes ${SCOPES.join(",")}`);
        }
        throw new Error(`shopify store execute failed${opts.label ? ` (${opts.label})` : ""}: ${msg}`);
      }
      const raw = existsSync(oFile) ? readFileSync(oFile, "utf8") : stdout;
      const parsed = extractJson(raw) as { data?: T; errors?: GqlError[] } & Record<string, unknown>;
      const errors = parsed.errors ?? [];
      if (errors.length) {
        const throttled = errors.some((er) => er.extensions?.code === "THROTTLED" || /throttled/i.test(er.message));
        if (throttled && attempt < 6) { stats.retries++; await sleep(1500 * attempt); continue; }
        throw new GraphQLRequestError(`${opts.label ?? (isMutation ? "mutation" : "query")}: ${errors.map((er) => scrub(er.message)).join("; ")}`, errors);
      }
      if (isMutation) stats.mutations++; else stats.queries++;
      return (parsed.data ?? (parsed as unknown)) as T;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Throw when a mutation payload carries userErrors. */
export function assertNoUserErrors(label: string, payload: { userErrors?: UserError[] } | null | undefined): void {
  const errs = payload?.userErrors ?? [];
  if (errs.length) throw new UserErrorsError(label, errs);
}
