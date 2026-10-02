/**
 * Catalog -> Shopify migration for the Crystal Basket theme (see apps/theme/ARCHITECTURE.md).
 *
 *   pnpm --filter theme exec tsx scripts/sync-shopify.ts <step> [--dry-run] [--handle=<id>]
 *   steps: check | definitions | files | metaobjects | products | pages | redirects | all
 *
 * `all` runs definitions -> files -> metaobjects -> products -> pages (redirects stay explicit: they only make
 * sense once crystalbasket.store points at Shopify). Every step is idempotent: it reads what exists, creates what
 * is missing and re-applies values, so it can be re-run after editing packages/catalog/content.
 * `--dry-run` prints the plan without talking to Shopify at all.
 *
 * Runs through `shopify store execute` (lib/shopify-cli.ts); authenticate once with
 *   shopify store auth --store utx8rj-t3.myshopify.com --scopes <see lib/shopify-cli.ts SCOPES>
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog, type Intention, type Product, type Stack, type Stone } from "@crystal-basket/catalog";
import { API_VERSION, SCOPES, STORE, assertNoUserErrors, gql, stats, type UserError } from "./lib/shopify-cli";
import * as ops from "./lib/ops";

// ------------------------------------------------------------------ setup
const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");
const webImages = join(repo, "apps", "web", "public", "images");
const STATE_FILE = join(here, ".sync-state.json");
/** Where the images are served from today (GitHub Pages). fileCreate fetches them from here. */
const IMAGE_BASE = (process.env.CB_IMAGE_BASE ?? "https://crystalbasket.store").replace(/\/$/, "");
const NS = "crystal";
/** Metaobject pages render at /pages/<urlHandle>/<entry-handle> (Shopify's documented pattern). */
const URL_HANDLE = { stone: process.env.CB_STONE_URL_HANDLE ?? "stones", intention: process.env.CB_INTENTION_URL_HANDLE ?? "intentions" } as const;

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const step = argv.find((a) => !a.startsWith("--")) ?? "help";
const DRY = flags.has("--dry-run");
const ONLY = argv.find((a) => a.startsWith("--handle="))?.slice("--handle=".length);

interface State {
  definitions: Record<string, string>;
  metafieldDefinitions: Record<string, string>;
  files: Record<string, { id: string; url?: string }>;
  metaobjects: Record<string, Record<string, string>>;
  products: Record<string, string>;
  pages: Record<string, string>;
  urlHandles: Record<string, string>;
}
const state: State = existsSync(STATE_FILE)
  ? { definitions: {}, metafieldDefinitions: {}, files: {}, metaobjects: {}, products: {}, pages: {}, urlHandles: {}, ...JSON.parse(readFileSync(STATE_FILE, "utf8")) }
  : { definitions: {}, metafieldDefinitions: {}, files: {}, metaobjects: {}, products: {}, pages: {}, urlHandles: {} };
const saveState = () => { if (!DRY) { mkdirSync(dirname(STATE_FILE), { recursive: true }); writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n"); } };

const log = (...a: unknown[]) => console.log(...a);
const plan = (what: string, detail?: unknown) => console.log(`${DRY ? "[dry-run] would" : "→"} ${what}${detail !== undefined ? " " + (typeof detail === "string" ? detail : JSON.stringify(detail)) : ""}`);
const oneLine = (s: string | undefined) => (s ?? "").replace(/\s*\n+\s*/g, " ").trim();
const json = (v: unknown) => JSON.stringify(v);

/** gql that becomes a no-op in --dry-run (queries return empty data, mutations are only logged). */
async function call<T>(doc: string, variables: Record<string, unknown>, label: string, empty: T): Promise<T> {
  if (DRY) { if (/^\s*mutation/i.test(doc)) plan(label, variables); return empty; }
  return gql<T>(doc, variables, { label });
}

const catalog = loadCatalog();
const filterHandle = <T extends { id: string }>(list: T[]) => (ONLY ? list.filter((x) => x.id === ONLY) : list);

// ------------------------------------------------------------------ definitions
type Validation = { name: string; value: string };
interface FieldSpec { key: string; name: string; type: string; required?: boolean; validations?: (ids: Record<string, string>) => Validation[] | null }
const choices = (opts: string[]): Validation => ({ name: "choices", value: json(opts) });
const imageOnly: Validation = { name: "file_type_options", value: json(["Image"]) };
const refTo = (type: string) => (ids: Record<string, string>): Validation[] | null => (ids[type] ? [{ name: "metaobject_definition_id", value: ids[type] }] : null);
const f = (key: string, name: string, type: string, extra: Partial<FieldSpec> = {}): FieldSpec => ({ key, name, type, ...extra });

const STONE_FIELDS: FieldSpec[] = [
  f("name", "Name", "single_line_text_field", { required: true }),
  f("keywords", "Traditionally worn for", "list.single_line_text_field"),
  f("chakra", "Chakra", "list.single_line_text_field"),
  f("zodiac", "Zodiac", "list.single_line_text_field"),
  f("color", "Colour", "single_line_text_field"),
  f("palette_1", "Palette: light", "color"),
  f("palette_2", "Palette: dark", "color"),
  f("description", "Description", "multi_line_text_field"),
  f("water_safe", "Water safe", "boolean"),
  f("sun_safe", "Sun safe", "boolean"),
  f("tier", "Price tier", "single_line_text_field", { validations: () => [choices(["classic", "select", "rare"])] }),
  f("mineral", "What is it (mineral)", "multi_line_text_field"),
  f("mohs", "Mohs hardness", "single_line_text_field"),
  f("found_in", "Commonly found in", "single_line_text_field"),
  f("worn_for", "What is it worn for (passage)", "multi_line_text_field"),
  f("wrist", "Best worn on", "single_line_text_field", { validations: () => [choices(["left", "right", "either"])] }),
  f("wrist_why", "Why that wrist", "multi_line_text_field"),
  f("water_note", "Water care note", "multi_line_text_field"),
  f("pairs_with", "Pairs with", "list.metaobject_reference", { validations: refTo("stone") }),
  f("image", "Tumbled stone photo", "file_reference", { validations: () => [imageOnly] }),
  f("bead", "Bead sprite (builder)", "file_reference", { validations: () => [imageOnly] }),
];
const INTENTION_FIELDS: FieldSpec[] = [
  f("name", "Name", "single_line_text_field", { required: true }),
  f("short", "Short name", "single_line_text_field"),
  f("tagline", "Tagline", "single_line_text_field"),
  f("triad", "Triad (three words)", "list.single_line_text_field"),
  f("description", "Description", "multi_line_text_field"),
  f("chakra", "Chakra", "list.single_line_text_field"),
  f("palette_1", "Palette: light", "color"),
  f("palette_2", "Palette: dark", "color"),
  f("sort_order", "Sort order", "number_integer"),
  f("image", "Tile photo", "file_reference", { validations: () => [imageOnly] }),
  f("seo_description", "SEO description", "single_line_text_field"),
  f("definition", "What is a … bracelet (definition)", "multi_line_text_field"),
  f("wrist", "Best worn on", "single_line_text_field", { validations: () => [choices(["left", "right", "either"])] }),
  f("stones", "Stones traditionally worn for it", "list.metaobject_reference", { validations: refTo("stone") }),
  f("faq", "FAQ (JSON [{q,a}])", "json"),
];
const STACK_FIELDS: FieldSpec[] = [
  f("name", "Name", "single_line_text_field", { required: true }),
  f("intention", "Intention", "metaobject_reference", { validations: refTo("intention") }),
  f("products", "Bracelets (three)", "list.product_reference"),
  f("price_aed", "Stack price (AED)", "number_integer"),
  f("description", "Description", "multi_line_text_field"),
  f("featured", "Featured on the home page", "boolean"),
  f("image", "Stack photo", "file_reference", { validations: () => [imageOnly] }),
];
interface DefSpec { type: string; name: string; description: string; fields: FieldSpec[]; urlHandle?: string }
const DEFINITIONS: DefSpec[] = [
  { type: "stone", name: "Stone", description: "A natural stone in the Crystal Basket bracelets: meaning, chakra, care, photos.", fields: STONE_FIELDS, urlHandle: URL_HANDLE.stone },
  { type: "intention", name: "Intention", description: "A shopping intention (calm, protection…) with its curated stones and guide copy.", fields: INTENTION_FIELDS, urlHandle: URL_HANDLE.intention },
  { type: "stack", name: "Stack", description: "A curated set of three bracelets sold at the stack price.", fields: STACK_FIELDS },
];

interface ExistingDef { id: string; type: string; fieldDefinitions: { key: string }[]; capabilities?: { publishable?: { enabled: boolean }; onlineStore?: { enabled: boolean; data?: { urlHandle: string } | null } }; access?: { storefront: string } }

function fieldInput(spec: FieldSpec, ids: Record<string, string>) {
  const validations = spec.validations ? spec.validations(ids) : [];
  if (validations === null) return null; // depends on a definition that does not exist yet
  return { key: spec.key, name: spec.name, type: spec.type, required: spec.required ?? false, ...(validations.length ? { validations } : {}) };
}

async function ensureDefinition(spec: DefSpec, ids: Record<string, string>): Promise<ExistingDef | null> {
  const data = await call<{ metaobjectDefinitionByType: ExistingDef | null }>(ops.Q_DEFINITION_BY_TYPE, { type: spec.type }, `definition ${spec.type}`, { metaobjectDefinitionByType: null });
  let existing = data.metaobjectDefinitionByType;
  const capabilities = spec.urlHandle
    ? { publishable: { enabled: true }, onlineStore: { enabled: true, data: { urlHandle: spec.urlHandle, createRedirects: false } } }
    : { publishable: { enabled: true } };
  if (!existing) {
    const fieldDefinitions = spec.fields.map((s) => fieldInput(s, ids)).filter((x): x is NonNullable<typeof x> => x !== null);
    // displayNameKey (not displayNameField) is the 2026-07 input name; validated with scripts/validate-ops.ts + literal shapes.
    const definition = { type: spec.type, name: spec.name, description: spec.description, displayNameKey: "name", access: { storefront: "PUBLIC_READ" }, capabilities, fieldDefinitions };
    const res = await call<{ metaobjectDefinitionCreate: { metaobjectDefinition: { id: string } | null; userErrors: UserError[] } }>(ops.M_DEFINITION_CREATE, { definition }, `create definition ${spec.type} (${fieldDefinitions.length} fields)`, { metaobjectDefinitionCreate: { metaobjectDefinition: { id: `gid://dry/${spec.type}` }, userErrors: [] } });
    assertNoUserErrors(`metaobjectDefinitionCreate ${spec.type}`, res.metaobjectDefinitionCreate);
    existing = { id: res.metaobjectDefinitionCreate.metaobjectDefinition!.id, type: spec.type, fieldDefinitions: fieldDefinitions.map((x) => ({ key: x.key })), capabilities: { publishable: { enabled: true }, onlineStore: spec.urlHandle ? { enabled: true, data: { urlHandle: spec.urlHandle } } : { enabled: false } } };
    log(`  created metaobject definition ${spec.type} → ${existing.id}`);
  } else {
    log(`  definition ${spec.type} exists → ${existing.id}`);
  }
  ids[spec.type] = existing.id;
  state.definitions[spec.type] = existing.id;
  if (existing.capabilities?.onlineStore?.data?.urlHandle) state.urlHandles[spec.type] = existing.capabilities.onlineStore.data.urlHandle;
  else if (spec.urlHandle) state.urlHandles[spec.type] = spec.urlHandle;
  return existing;
}

/** Add any spec field the definition is missing (also resolves self-references after creation) and fix capabilities. */
async function completeDefinition(spec: DefSpec, existing: ExistingDef, ids: Record<string, string>) {
  const have = new Set(existing.fieldDefinitions.map((x) => x.key));
  const create = spec.fields.filter((s) => !have.has(s.key)).map((s) => fieldInput(s, ids)).filter((x): x is NonNullable<typeof x> => x !== null);
  const definition: Record<string, unknown> = {};
  if (create.length) definition.fieldDefinitions = create.map((c) => ({ create: c }));
  const wantOnline = Boolean(spec.urlHandle);
  const caps = existing.capabilities ?? {};
  const capUpdate: Record<string, unknown> = {};
  if (!caps.publishable?.enabled) capUpdate.publishable = { enabled: true };
  if (wantOnline && !caps.onlineStore?.enabled) capUpdate.onlineStore = { enabled: true, data: { urlHandle: spec.urlHandle, createRedirects: false } };
  if (Object.keys(capUpdate).length) definition.capabilities = capUpdate;
  if (existing.access && existing.access.storefront !== "PUBLIC_READ") definition.access = { storefront: "PUBLIC_READ" };
  if (!Object.keys(definition).length) return;
  const res = await call<{ metaobjectDefinitionUpdate: { userErrors: UserError[] } }>(ops.M_DEFINITION_UPDATE, { id: existing.id, definition }, `update definition ${spec.type}: +${create.map((c) => c.key).join(",") || "capabilities"}`, { metaobjectDefinitionUpdate: { userErrors: [] } });
  assertNoUserErrors(`metaobjectDefinitionUpdate ${spec.type}`, res.metaobjectDefinitionUpdate);
  for (const c of create) existing.fieldDefinitions.push({ key: c.key });
  log(`  updated definition ${spec.type}${create.length ? `: added ${create.map((c) => c.key).join(", ")}` : ""}${Object.keys(capUpdate).length ? " (capabilities)" : ""}`);
}

interface MetafieldSpec { key: string; name: string; type: string; validations?: (ids: Record<string, string>) => Validation[] }
const PRODUCT_METAFIELDS: MetafieldSpec[] = [
  { key: "intention", name: "Intention", type: "metaobject_reference", validations: (ids) => [{ name: "metaobject_definition_id", value: ids.intention }] },
  { key: "secondary_intentions", name: "Also worn for", type: "list.metaobject_reference", validations: (ids) => [{ name: "metaobject_definition_id", value: ids.intention }] },
  { key: "stones", name: "Stones", type: "list.metaobject_reference", validations: (ids) => [{ name: "metaobject_definition_id", value: ids.stone }] },
  { key: "subtitle", name: "Subtitle", type: "single_line_text_field" },
  { key: "gold_accent", name: "Gold-filled accent", type: "boolean" },
  { key: "style", name: "Style", type: "single_line_text_field", validations: () => [choices(["unisex", "women", "men"])] },
  { key: "triad", name: "Triad (three words)", type: "list.single_line_text_field" },
  { key: "promise", name: "Promise (one line)", type: "single_line_text_field" },
  { key: "body", name: "The piece (body copy)", type: "multi_line_text_field" },
  { key: "affirmation", name: "Affirmation", type: "single_line_text_field" },
  { key: "includes", name: "What's in the box", type: "list.single_line_text_field" },
  { key: "featured", name: "Featured", type: "boolean" },
  { key: "bestseller", name: "Bestseller", type: "boolean" },
  { key: "is_new", name: "New in", type: "boolean" },
  { key: "leaving_soon", name: "Leaving soon", type: "boolean" },
  { key: "seo_title", name: "SEO title (descriptive)", type: "single_line_text_field" },
  { key: "seo_description", name: "SEO description", type: "single_line_text_field" },
];

async function stepDefinitions() {
  log(`\n== definitions (Admin API ${API_VERSION}, store ${STORE})`);
  const ids: Record<string, string> = { ...state.definitions };
  const existing: Record<string, ExistingDef> = {};
  for (const spec of DEFINITIONS) { const d = await ensureDefinition(spec, ids); if (d) existing[spec.type] = d; }
  // second pass: fields that reference definitions created in the first pass (stone.pairs_with, intention.stones, stack.intention)
  for (const spec of DEFINITIONS) if (existing[spec.type]) await completeDefinition(spec, existing[spec.type], ids);
  saveState();

  log(`\n-- product metafield definitions (namespace ${NS})`);
  const have = await call<{ metafieldDefinitions: { nodes: { id: string; key: string; pinnedPosition: number | null }[] } }>(ops.Q_METAFIELD_DEFINITIONS, { ownerType: "PRODUCT", namespace: NS }, "metafield definitions", { metafieldDefinitions: { nodes: [] } });
  const byKey = new Map(have.metafieldDefinitions.nodes.map((n) => [n.key, n]));
  for (const spec of PRODUCT_METAFIELDS) {
    const got = byKey.get(spec.key);
    if (got) {
      state.metafieldDefinitions[spec.key] = got.id;
      if (got.pinnedPosition == null) {
        const r = await call<{ metafieldDefinitionPin: { userErrors: UserError[] } }>(ops.M_METAFIELD_DEFINITION_PIN, { definitionId: got.id }, `pin cb.${spec.key}`, { metafieldDefinitionPin: { userErrors: [] } });
        assertNoUserErrors(`metafieldDefinitionPin ${spec.key}`, r.metafieldDefinitionPin);
      }
      log(`  cb.${spec.key} exists`);
      continue;
    }
    const validations = spec.validations ? spec.validations(ids) : [];
    if (validations.some((v) => !v.value)) { log(`  skip cb.${spec.key}: referenced definition not created yet (re-run definitions)`); continue; }
    const definition = { name: spec.name, namespace: NS, key: spec.key, type: spec.type, ownerType: "PRODUCT", pin: true, access: { storefront: "PUBLIC_READ" }, ...(validations.length ? { validations } : {}) };
    const r = await call<{ metafieldDefinitionCreate: { createdDefinition: { id: string } | null; userErrors: UserError[] } }>(ops.M_METAFIELD_DEFINITION_CREATE, { definition }, `create product metafield cb.${spec.key} (${spec.type})`, { metafieldDefinitionCreate: { createdDefinition: { id: `gid://dry/mf/${spec.key}` }, userErrors: [] } });
    assertNoUserErrors(`metafieldDefinitionCreate cb.${spec.key}`, r.metafieldDefinitionCreate);
    state.metafieldDefinitions[spec.key] = r.metafieldDefinitionCreate.createdDefinition!.id;
    log(`  created cb.${spec.key}`);
  }
  saveState();
}

// ------------------------------------------------------------------ files
interface FileJob { filename: string; source: string; alt: string }
function fileJobs(): FileJob[] {
  const jobs: FileJob[] = [];
  const push = (localRel: string, filename: string, alt: string) => {
    if (!existsSync(join(webImages, localRel))) { log(`  (no local file ${localRel}, skipped)`); return; }
    jobs.push({ filename, source: `${IMAGE_BASE}/images/${localRel}`, alt });
  };
  for (const s of catalog.stones) {
    if (s.data.image) push(`stones/${s.data.image}`, `stone-${s.id}${extname(s.data.image)}`, `${s.data.name} tumbled stone`);
    push(`beads/${s.id}.png`, `bead-${s.id}.png`, `${s.data.name} bead`);
  }
  push("beads/gold.png", "bead-gold.png", "14k gold-filled bead");
  for (const i of catalog.intentions) if (i.data.image) push(`intentions/${i.data.image}`, `intention-${i.id}${extname(i.data.image)}`, `${i.data.name} bracelets on a wrist`);
  for (const st of catalog.stacks) if (st.data.image) push(`stacks/${st.data.image}`, `stack-${st.id}${extname(st.data.image)}`, `${st.data.name}: ${st.data.products.map((p) => catalog.products.find((x) => x.id === p)?.data.name ?? p).join(", ")}`);
  // site photos, so theme settings can reference shopify://shop_images/<filename> later
  push("hero/hero-1.jpg", "site-hero-1.jpg", "Natural crystal bracelet on a wrist, hand-strung by Crystal Basket in Dubai");
  push("hero/hero-2.jpg", "site-hero-2.jpg", "Crystal bracelets stacked on a wrist");
  push("about/studio.jpg", "site-studio.jpg", "Stringing gemstone beads at the studio table");
  push("build/teaser.jpg", "site-build-teaser.jpg", "A half-strung bracelet beside dishes of loose beads");
  push("stacks/stacks-wrist.jpg", "site-stacks-wrist.jpg", "Three crystal bracelets stacked on a wrist");
  return jobs;
}
const basenameOfUrl = (url: string) => { try { return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? ""); } catch { return ""; } };

interface PageInfo { hasNextPage: boolean; endCursor: string | null }
interface FilesPage { files: { nodes: { id: string; fileStatus: string; image?: { url: string } | null; url?: string }[]; pageInfo: PageInfo } }
interface MetaobjectsPage { metaobjects: { nodes: { id: string; handle: string }[]; pageInfo: PageInfo } }

async function listImageFiles(): Promise<Map<string, { id: string; url: string; status: string }>> {
  const map = new Map<string, { id: string; url: string; status: string }>();
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const data: FilesPage = await call<FilesPage>(ops.Q_FILES, { query: "media_type:IMAGE", after }, "list files", { files: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } });
    for (const n of data.files.nodes) {
      const url = n.image?.url ?? n.url ?? "";
      const base = basenameOfUrl(url);
      if (base) map.set(base, { id: n.id, url, status: n.fileStatus });
    }
    if (!data.files.pageInfo.hasNextPage) break;
    after = data.files.pageInfo.endCursor;
  }
  return map;
}

async function stepFiles() {
  log(`\n== files (sources on ${IMAGE_BASE})`);
  const jobs = fileJobs();
  const existing = await listImageFiles();
  const missing: FileJob[] = [];
  for (const j of jobs) {
    const got = existing.get(j.filename);
    if (got) { state.files[j.filename] = { id: got.id, url: got.url }; log(`  ${j.filename} exists (${got.status})`); }
    else missing.push(j);
  }
  if (missing.length) {
    const files = missing.map((j) => ({ originalSource: j.source, filename: j.filename, alt: j.alt, contentType: "IMAGE", duplicateResolutionMode: "REPLACE" }));
    const res = await call<{ fileCreate: { files: { id: string; fileStatus: string }[] | null; userErrors: UserError[] } }>(ops.M_FILE_CREATE, { files }, `fileCreate ${missing.length} image(s): ${missing.map((m) => m.filename).join(", ")}`, { fileCreate: { files: missing.map((m) => ({ id: `gid://dry/file/${m.filename}`, fileStatus: "READY" })), userErrors: [] } });
    assertNoUserErrors("fileCreate", res.fileCreate);
    const created = res.fileCreate.files ?? [];
    created.forEach((fl, i) => { state.files[missing[i].filename] = { id: fl.id }; });
    log(`  created ${created.length} file(s); waiting for processing…`);
    if (!DRY) {
      const ids = created.map((c) => c.id);
      for (let tries = 0; tries < 45 && ids.length; tries++) {
        await new Promise((r) => setTimeout(r, 2000));
        const st = await gql<{ nodes: ({ id: string; fileStatus: string; image?: { url: string } | null; url?: string } | null)[] }>(ops.Q_FILE_STATUS, { ids }, { label: "file status" });
        const pending = st.nodes.filter((n) => n && n.fileStatus !== "READY" && n.fileStatus !== "FAILED");
        for (const n of st.nodes) {
          if (!n) continue;
          const name = Object.keys(state.files).find((k) => state.files[k].id === n.id);
          if (name && n.fileStatus === "READY") state.files[name].url = n.image?.url ?? n.url;
          if (n.fileStatus === "FAILED") log(`  ! ${name ?? n.id} FAILED to process`);
        }
        if (!pending.length) break;
        log(`  ${pending.length} still processing…`);
      }
    }
  } else log("  nothing to upload");
  saveState();
}

// ------------------------------------------------------------------ metaobjects
const fileId = (filename: string | undefined) => (filename && state.files[filename]?.id) || undefined;

async function existingMetaobjects(type: string): Promise<Record<string, string>> {
  const map: Record<string, string> = { ...(state.metaobjects[type] ?? {}) };
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const data: MetaobjectsPage = await call<MetaobjectsPage>(ops.Q_METAOBJECTS, { type, after }, `list ${type}`, { metaobjects: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } });
    for (const n of data.metaobjects.nodes) map[n.handle] = n.id;
    if (!data.metaobjects.pageInfo.hasNextPage) break;
    after = data.metaobjects.pageInfo.endCursor;
  }
  return map;
}

async function upsert(type: string, handle: string, fields: Record<string, string | undefined>): Promise<string> {
  const list = Object.entries(fields).filter(([, v]) => v !== undefined && v !== "").map(([key, value]) => ({ key, value: value as string }));
  const res = await call<{ metaobjectUpsert: { metaobject: { id: string; handle: string } | null; userErrors: UserError[] } }>(
    ops.M_METAOBJECT_UPSERT,
    { handle: { type, handle }, metaobject: { fields: list, capabilities: { publishable: { status: "ACTIVE" } } } },
    `upsert ${type}/${handle} (${list.map((x) => x.key).join(",")})`,
    { metaobjectUpsert: { metaobject: { id: `gid://dry/${type}/${handle}`, handle }, userErrors: [] } },
  );
  assertNoUserErrors(`metaobjectUpsert ${type}/${handle}`, res.metaobjectUpsert);
  const id = res.metaobjectUpsert.metaobject!.id;
  (state.metaobjects[type] ??= {})[handle] = id;
  return id;
}

const stoneFields = (s: Stone): Record<string, string | undefined> => ({
  name: s.data.name,
  keywords: json(s.data.keywords), chakra: json(s.data.chakra), zodiac: json(s.data.zodiac),
  color: oneLine(s.data.color), palette_1: s.data.palette[0], palette_2: s.data.palette[1],
  description: s.data.description, water_safe: String(s.data.waterSafe), sun_safe: String(s.data.sunSafe), tier: s.data.tier,
  mineral: s.data.mineral, mohs: oneLine(s.data.mohs), found_in: oneLine(s.data.foundIn), worn_for: s.data.wornFor,
  wrist: s.data.wrist, wrist_why: s.data.wristWhy, water_note: s.data.waterNote,
  image: fileId(s.data.image ? `stone-${s.id}${extname(s.data.image)}` : undefined),
  bead: fileId(`bead-${s.id}.png`),
});
const intentionFields = (i: Intention, stoneIds: Record<string, string>): Record<string, string | undefined> => ({
  name: i.data.name, short: i.data.short, tagline: oneLine(i.data.tagline), triad: json(i.data.triad), description: i.data.description,
  chakra: json(i.data.chakra), palette_1: i.data.palette[0], palette_2: i.data.palette[1], sort_order: String(i.data.order),
  image: fileId(i.data.image ? `intention-${i.id}${extname(i.data.image)}` : undefined),
  seo_description: oneLine(i.data.seoDescription), definition: i.data.definition, wrist: i.data.wrist,
  stones: json(i.data.stones.map((id) => stoneIds[id]).filter(Boolean)), faq: json(i.data.faq),
});
const stackFields = (st: Stack, intentionIds: Record<string, string>, productIds: Record<string, string>): Record<string, string | undefined> => ({
  name: st.data.name, intention: intentionIds[st.data.intention], products: json(st.data.products.map((p) => productIds[p]).filter(Boolean)),
  price_aed: String(st.data.priceAED), description: st.data.description, featured: String(st.data.featured),
  image: fileId(st.data.image ? `stack-${st.id}${extname(st.data.image)}` : undefined),
});

async function productId(handle: string): Promise<string | undefined> {
  if (state.products[handle]) return state.products[handle];
  const data = await call<{ products: { nodes: { id: string; handle: string }[] } }>(ops.Q_PRODUCT_BY_HANDLE, { query: `handle:${handle}` }, `product ${handle}`, { products: { nodes: [{ id: `gid://dry/product/${handle}`, handle }] } });
  const node = data.products.nodes.find((n) => n.handle === handle);
  if (node) state.products[handle] = node.id;
  return node?.id;
}

async function stepMetaobjects() {
  log(`\n== metaobjects`);
  if (!DRY && (!state.definitions.stone || !state.definitions.intention || !state.definitions.stack)) throw new Error("Run `definitions` first");
  const stoneIds = await existingMetaobjects("stone");
  log(`-- stones (${catalog.stones.length})`);
  for (const s of filterHandle(catalog.stones)) stoneIds[s.id] = await upsert("stone", s.id, stoneFields(s));
  for (const s of filterHandle(catalog.stones)) {
    const refs = s.data.pairsWith.map((id) => stoneIds[id]).filter(Boolean);
    await upsert("stone", s.id, { pairs_with: json(refs) });
  }
  saveState();
  log(`-- intentions (${catalog.intentions.length})`);
  const intentionIds = await existingMetaobjects("intention");
  for (const i of filterHandle(catalog.intentions)) intentionIds[i.id] = await upsert("intention", i.id, intentionFields(i, stoneIds));
  saveState();
  log(`-- stacks (${catalog.stacks.length})`);
  const productIds: Record<string, string> = {};
  for (const st of catalog.stacks) for (const p of st.data.products) { const id = await productId(p); if (id) productIds[p] = id; else log(`  ! product ${p} not found in Shopify`); }
  await existingMetaobjects("stack");
  for (const st of filterHandle(catalog.stacks)) await upsert("stack", st.id, stackFields(st, intentionIds, productIds));
  saveState();
}

// ------------------------------------------------------------------ products
const seoFor = (p: Product) => {
  const withName = `${p.data.seoTitle}, ${p.data.name}`;
  return { title: withName.length <= 45 ? withName : p.data.seoTitle, description: p.data.seoDescription };
};

async function stepProducts() {
  log(`\n== products (${catalog.products.length})`);
  const stoneIds = DRY ? {} : await existingMetaobjects("stone");
  const intentionIds = DRY ? {} : await existingMetaobjects("intention");
  const ref = (map: Record<string, string>, id: string) => map[id] ?? `gid://dry/${id}`;
  for (const p of filterHandle(catalog.products)) {
    const data = await call<{ products: { nodes: { id: string; handle: string; tags: string[]; seo: { title: string | null; description: string | null } }[] } }>(ops.Q_PRODUCT_BY_HANDLE, { query: `handle:${p.id}` }, `product ${p.id}`, { products: { nodes: [{ id: `gid://dry/product/${p.id}`, handle: p.id, tags: [], seo: { title: null, description: null } }] } });
    const node = data.products.nodes.find((n) => n.handle === p.id);
    if (!node) { log(`  ! ${p.id}: not in Shopify (import the product CSV first), skipped`); continue; }
    state.products[p.id] = node.id;
    const d = p.data;
    const values: [string, string, string][] = [
      ["intention", "metaobject_reference", ref(intentionIds, d.intention)],
      ["secondary_intentions", "list.metaobject_reference", json(d.secondaryIntentions.map((i) => ref(intentionIds, i)))],
      ["stones", "list.metaobject_reference", json(d.stones.map((s) => ref(stoneIds, s)))],
      ["subtitle", "single_line_text_field", oneLine(d.subtitle)],
      ["gold_accent", "boolean", String(d.goldAccent)],
      ["style", "single_line_text_field", d.style],
      ["triad", "list.single_line_text_field", json(d.triad)],
      ["promise", "single_line_text_field", oneLine(d.promise)],
      ["body", "multi_line_text_field", d.body],
      ["affirmation", "single_line_text_field", oneLine(d.affirmation)],
      ["includes", "list.single_line_text_field", json(d.includes)],
      ["featured", "boolean", String(d.featured)],
      ["bestseller", "boolean", String(d.bestseller)],
      ["is_new", "boolean", String(d.isNew)],
      ["leaving_soon", "boolean", String(d.leavingSoon)],
      ["seo_title", "single_line_text_field", oneLine(d.seoTitle)],
      ["seo_description", "single_line_text_field", oneLine(d.seoDescription)],
    ];
    const metafields = values.map(([key, type, value]) => ({ ownerId: node.id, namespace: NS, key, type, value }));
    const mf = await call<{ metafieldsSet: { userErrors: UserError[] } }>(ops.M_METAFIELDS_SET, { metafields }, `metafieldsSet ${p.id} (${metafields.length} fields)`, { metafieldsSet: { userErrors: [] } });
    assertNoUserErrors(`metafieldsSet ${p.id}`, mf.metafieldsSet);
    const seo = seoFor(p);
    const tags = Array.from(new Set([...(node.tags ?? []), ...d.tags]));
    if (node.seo.title !== seo.title || node.seo.description !== seo.description || tags.length !== (node.tags ?? []).length) {
      const up = await call<{ productUpdate: { userErrors: UserError[] } }>(ops.M_PRODUCT_UPDATE, { product: { id: node.id, seo, tags } }, `productUpdate ${p.id} seo "${seo.title}"`, { productUpdate: { userErrors: [] } });
      assertNoUserErrors(`productUpdate ${p.id}`, up.productUpdate);
    }
    log(`  ${p.id}: ${metafields.length} metafields, seo "${seo.title}"`);
  }
  saveState();
}

// ------------------------------------------------------------------ pages
interface PageSpec { handle: string; title: string; description?: string }
const stoneCount = catalog.stones.length;
const PAGES: PageSpec[] = [
  { handle: "about", title: "About Crystal Basket, Dubai", description: "About Crystal Basket, a small Dubai studio stringing natural, undyed 8 mm crystal bracelets by hand, cleansed on selenite before they ship across the UAE." },
  { handle: "care", title: "How to Cleanse a Crystal Bracelet", description: "How to cleanse and care for a crystal bracelet: moonlight, selenite and smoke, how often to do it, and which stones to keep out of water and sun." },
  { handle: "faq", title: "Crystal Bracelet FAQ", description: "Crystal bracelet questions answered: which wrist, how to cleanse, sleeping in it, real stones, stacking, paying, UAE delivery and size exchanges." },
  { handle: "size-guide", title: "Crystal Bracelet Size Guide", description: "How to measure your wrist for a crystal bracelet in two steps, then pick S, M or L. Every bracelet is 8 mm, and custom lengths are strung at no extra cost." },
  { handle: "disclaimer", title: "Wellness disclaimer", description: "Crystal meanings on this site reflect traditional beliefs. Our bracelets are jewellery, not medical devices." },
  { handle: "delivery", title: "Delivery in the UAE", description: "Crystal Basket delivers across the UAE in 1 to 2 working days. Delivery is 25 AED, free over 250 AED, with card payment or cash on delivery." },
  { handle: "returns", title: "Exchanges & Returns", description: "Exchange a Crystal Basket bracelet for another size within 14 days of delivery, unworn and in its pouch. We cover the courier once, and restring any bracelet free for life." },
  { handle: "contact", title: "Contact Crystal Basket", description: "Contact Crystal Basket, a crystal bracelet studio in Dubai: email hello@crystalbasket.store or message @crystal.basket on Instagram about orders, sizing and custom lengths." },
  { handle: "privacy", title: "Privacy", description: "What Crystal Basket collects when you browse and order: order details handled by Shopify, card payments processed by Stripe, and a wishlist and bag kept in your own browser." },
  { handle: "wishlist", title: "Wishlist" },
  { handle: "stacks", title: "Crystal Bracelet Stacks & Sets", description: "Three-piece crystal bracelet stacks for protection, calm and abundance, or build your own from any three bracelets and save 15%. Hand-strung in Dubai." },
  { handle: "build", title: "Build Your Own Crystal Bracelet", description: `Design your own crystal bracelet bead by bead: choose a wrist size, drop in any of our ${stoneCount} natural stones, add a gold-filled bead, and we string it to order in Dubai from 75 AED.` },
  { handle: "intentions", title: "Crystal Bracelets by Intention", description: "Protection, love, abundance, calm, confidence, focus, grounding and sleep: find the crystal bracelet traditionally worn for what you need more of." },
  { handle: "stones", title: "Crystal Meanings: The Stone Library", description: "Meanings, chakras, best wrist and care for the 16 natural stones in our bracelets, from amethyst and rose quartz to black tourmaline and tiger's eye." },
];

async function stepPages() {
  log(`\n== pages (${PAGES.length})`);
  for (const pg of PAGES) {
    if (ONLY && ONLY !== pg.handle) continue;
    const data = await call<{ pages: { nodes: { id: string; handle: string; title: string; templateSuffix: string | null; isPublished: boolean }[] } }>(ops.Q_PAGE_BY_HANDLE, { query: `handle:${pg.handle}` }, `page ${pg.handle}`, { pages: { nodes: [] } });
    const node = data.pages.nodes.find((n) => n.handle === pg.handle);
    // SEO title/description live in the global.title_tag / global.description_tag metafields, which the admin's SEO fields read.
    const metafields = [
      { namespace: "global", key: "title_tag", type: "single_line_text_field", value: pg.title },
      ...(pg.description ? [{ namespace: "global", key: "description_tag", type: "single_line_text_field", value: pg.description }] : []),
    ];
    const page = { title: pg.title, handle: pg.handle, templateSuffix: pg.handle, isPublished: true, metafields };
    if (node) {
      const r = await call<{ pageUpdate: { page: { id: string } | null; userErrors: UserError[] } }>(ops.M_PAGE_UPDATE, { id: node.id, page }, `pageUpdate ${pg.handle} (template page.${pg.handle})`, { pageUpdate: { page: { id: node.id }, userErrors: [] } });
      assertNoUserErrors(`pageUpdate ${pg.handle}`, r.pageUpdate);
      state.pages[pg.handle] = node.id;
      log(`  updated /pages/${pg.handle}`);
    } else {
      const r = await call<{ pageCreate: { page: { id: string } | null; userErrors: UserError[] } }>(ops.M_PAGE_CREATE, { page: { ...page, body: "" } }, `pageCreate ${pg.handle} "${pg.title}" (template page.${pg.handle})`, { pageCreate: { page: { id: `gid://dry/page/${pg.handle}` }, userErrors: [] } });
      assertNoUserErrors(`pageCreate ${pg.handle}`, r.pageCreate);
      state.pages[pg.handle] = r.pageCreate.page!.id;
      log(`  created /pages/${pg.handle}`);
    }
  }
  saveState();
}

// ------------------------------------------------------------------ redirects
function redirectPlan(): { path: string; target: string }[] {
  const stones = state.urlHandles.stone ?? URL_HANDLE.stone;
  const intentions = state.urlHandles.intention ?? URL_HANDLE.intention;
  const pairs: [string, string][] = [
    ["/shop", "/collections/all"],
    ...["stacks", "build", "intentions", "stones", "about", "size-guide", "care", "faq", "disclaimer", "delivery", "returns", "contact", "privacy", "wishlist"].map((h) => [`/${h}`, `/pages/${h}`] as [string, string]),
    ...catalog.intentions.map((i) => [`/intentions/${i.id}`, `/pages/${intentions}/${i.id}`] as [string, string]),
    ...catalog.stones.map((s) => [`/stones/${s.id}`, `/pages/${stones}/${s.id}`] as [string, string]),
  ];
  // the old site used trailing slashes; register both spellings
  return pairs.flatMap(([path, target]) => [{ path: `${path}/`, target }, { path, target }]);
}

async function stepRedirects() {
  log(`\n== redirects (old crystalbasket.store paths → Shopify)`);
  for (const r of redirectPlan()) {
    const data = await call<{ urlRedirects: { nodes: { id: string; path: string; target: string }[] } }>(ops.Q_REDIRECTS, { query: `path:${r.path}` }, `redirect ${r.path}`, { urlRedirects: { nodes: [] } });
    const got = data.urlRedirects.nodes.find((n) => n.path === r.path);
    if (got && got.target === r.target) { log(`  ${r.path} → ${r.target} exists`); continue; }
    if (got) {
      const u = await call<{ urlRedirectUpdate: { userErrors: UserError[] } }>(ops.M_REDIRECT_UPDATE, { id: got.id, urlRedirect: r }, `urlRedirectUpdate ${r.path} → ${r.target}`, { urlRedirectUpdate: { userErrors: [] } });
      assertNoUserErrors(`urlRedirectUpdate ${r.path}`, u.urlRedirectUpdate);
      log(`  updated ${r.path} → ${r.target}`);
    } else {
      const c = await call<{ urlRedirectCreate: { userErrors: UserError[] } }>(ops.M_REDIRECT_CREATE, { urlRedirect: r }, `urlRedirectCreate ${r.path} → ${r.target}`, { urlRedirectCreate: { userErrors: [] } });
      assertNoUserErrors(`urlRedirectCreate ${r.path}`, c.urlRedirectCreate);
      log(`  created ${r.path} → ${r.target}`);
    }
  }
}

// ------------------------------------------------------------------ main
async function stepCheck() {
  log(`== check (store ${STORE}, Admin API ${API_VERSION})`);
  const data = await call<{ shop: { name: string; myshopifyDomain: string; primaryDomain: { host: string } } }>(ops.Q_SHOP, {}, "shop", { shop: { name: "(dry-run)", myshopifyDomain: STORE, primaryDomain: { host: "-" } } });
  log(`  shop: ${data.shop.name} (${data.shop.myshopifyDomain}, primary ${data.shop.primaryDomain.host})`);
  log(`  catalog: ${catalog.products.length} products, ${catalog.stones.length} stones, ${catalog.intentions.length} intentions, ${catalog.stacks.length} stacks`);
  log(`  scopes needed: ${SCOPES.join(",")}`);
}

const STEPS: Record<string, () => Promise<void>> = { check: stepCheck, definitions: stepDefinitions, files: stepFiles, metaobjects: stepMetaobjects, products: stepProducts, pages: stepPages, redirects: stepRedirects };

async function main() {
  if (step === "help" || !(step in STEPS || step === "all")) {
    console.log(`usage: tsx scripts/sync-shopify.ts <${Object.keys(STEPS).join("|")}|all> [--dry-run] [--handle=<catalog id>]\n` +
      `  all = definitions, files, metaobjects, products, pages (redirects are run explicitly)\n` +
      `  env: SHOPIFY_STORE, SHOPIFY_API_VERSION, SHOPIFY_BIN, CB_IMAGE_BASE, CB_STONE_URL_HANDLE, CB_INTENTION_URL_HANDLE`);
    process.exit(step === "help" ? 0 : 1);
  }
  const order = step === "all" ? ["definitions", "files", "metaobjects", "products", "pages"] : [step];
  if (DRY) log(`[dry-run] no requests will be sent to ${STORE}`);
  for (const s of order) await STEPS[s]();
  log(`\ndone: ${stats.queries} queries, ${stats.mutations} mutations, ${stats.retries} retries${DRY ? " (dry-run)" : ""}`);
}

main().catch((e) => { console.error(`\n✗ ${(e as Error).message}`); process.exit(1); });
