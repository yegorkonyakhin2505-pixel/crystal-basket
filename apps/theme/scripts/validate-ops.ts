/**
 * Validates every document in lib/ops.ts against the Shopify Admin schema using the shopify-ai-toolkit's
 * validate.mjs (shopify.dev, no store auth needed). Usage: pnpm --filter theme exec tsx scripts/validate-ops.ts
 * Override the toolkit location with SHOPIFY_TOOLKIT_DIR.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { API_VERSION } from "./lib/shopify-cli";
import { ALL_OPS } from "./lib/ops";

const toolkit = process.env.SHOPIFY_TOOLKIT_DIR ?? join(process.env.HOME ?? "", ".claude/plugins/cache/claude-plugins-official/shopify-ai-toolkit/1.8.4/skills/shopify-admin");
const validator = join(toolkit, "scripts", "validate.mjs");
if (!existsSync(validator)) { console.error(`validate.mjs not found at ${validator} (set SHOPIFY_TOOLKIT_DIR)`); process.exit(2); }

let failed = 0;
for (const [name, doc] of Object.entries(ALL_OPS)) {
  try {
    const out = execFileSync("node", [validator, "--code", doc, "--api", "admin", "--version", API_VERSION, "--json", "--artifact-id", `cb-sync-${name}`, "--revision", "1", "--client-name", "claude-code"], { encoding: "utf8" });
    // {"success":true,"responses":[{"result":"success","resultDetail":"…"}],"resolvedVersion":"2026-07"}
    const parsed = JSON.parse(out.slice(out.indexOf("{"))) as { success?: boolean; responses?: { result: string; resultDetail?: string }[]; resolvedVersion?: string };
    const ok = parsed.success === true && (parsed.responses ?? []).every((r) => r.result === "success");
    console.log(`${ok ? "ok  " : "FAIL"} ${name}${parsed.resolvedVersion ? ` (${parsed.resolvedVersion})` : ""}`);
    if (!ok) { failed++; console.log((parsed.responses ?? []).map((r) => `  ${r.result}: ${r.resultDetail ?? ""}`).join("\n") || out.trim()); }
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}\n${String((e as { stdout?: string }).stdout ?? (e as Error).message).trim()}`);
  }
}
if (failed) { console.error(`\n${failed} operation(s) failed validation`); process.exit(1); }
console.log(`\nall ${Object.keys(ALL_OPS).length} operations valid for Admin API ${API_VERSION}`);
