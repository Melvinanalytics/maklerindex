import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  type Computation,
  type Formula,
  type Makler,
  type Outbound,
  type SizeBand,
  type Source,
  type Stamp,
  type Status,
  parseActor,
} from "./domain.ts";

export interface Bundle {
  root: string;
  makler: Makler[];
  computation: Computation;
}

interface FrontmatterFile {
  file: string;
  data: Record<string, unknown>;
  body: string;
}

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function asRecord(value: unknown, file: string, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(file, `${field} must be a mapping`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, file: string, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(file, `${field} must be a non-empty string`);
  }
  return value;
}

function optionalString(value: unknown, file: string, field: string): string | undefined {
  if (value === undefined) return undefined;
  return asString(value, file, field);
}

function asNumber(value: unknown, file: string, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(file, `${field} must be a number`);
  }
  return value;
}

function asBoolean(value: unknown, file: string, field: string): boolean {
  if (typeof value !== "boolean") fail(file, `${field} must be a boolean`);
  return value;
}

function asStringList(value: unknown, file: string, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(file, `${field} must be a list of strings`);
  }
  return value;
}

function parseStamp(value: unknown, file: string, field: string): Stamp {
  const row = asRecord(value, file, field);
  return {
    by: parseActor(asString(row.by, file, `${field}.by`)),
    at: asString(row.at, file, `${field}.at`),
  };
}

function parseVerified(value: unknown, file: string): Stamp[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) {
    return value.map((item, index) => parseStamp(item, file, `verified[${index}]`));
  }
  return [parseStamp(value, file, "verified")];
}

function parseSources(value: unknown, file: string): Source[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail(file, "sources must be a non-empty list");
  }
  return value.map((item, index) => {
    const row = asRecord(item, file, `sources[${index}]`);
    return {
      id: optionalString(row.id, file, `sources[${index}].id`),
      resource: asString(row.resource, file, `sources[${index}].resource`),
      title: optionalString(row.title, file, `sources[${index}].title`),
      author: optionalString(row.author, file, `sources[${index}].author`),
      last_modified: optionalString(
        row.last_modified,
        file,
        `sources[${index}].last_modified`,
      ),
    };
  });
}

function parseStatus(value: unknown, file: string): Status {
  const status = optionalString(value, file, "status") ?? "stable";
  if (status !== "draft" && status !== "stable" && status !== "deprecated") {
    fail(file, "status must be draft, stable, or deprecated");
  }
  return status;
}

function parseSizeBand(value: unknown, file: string): SizeBand {
  const band = asString(value, file, "size_band");
  if (
    band !== "boutique" &&
    band !== "small" &&
    band !== "mid" &&
    band !== "factory"
  ) {
    fail(file, "size_band must be boutique, small, mid, or factory");
  }
  return band;
}

function parseOutbound(value: unknown, file: string): Outbound {
  if (value === undefined) return {};
  const row = asRecord(value, file, "outbound");
  return {
    website: optionalString(row.website, file, "outbound.website"),
    email: optionalString(row.email, file, "outbound.email"),
    phone: optionalString(row.phone, file, "outbound.phone"),
  };
}

function assertDemoContact(makler: Makler): void {
  if (!makler.demo) return;
  const urls = [
    makler.resource,
    makler.outbound.website,
    makler.outbound.email,
  ].filter((item): item is string => Boolean(item));
  for (const url of urls) {
    if (!url.includes("example.invalid")) {
      fail(makler.file, "DEMO contacts must use the example.invalid host");
    }
  }
  if (makler.outbound.phone && !makler.outbound.phone.includes("00000")) {
    fail(makler.file, "DEMO phone numbers must be obviously fake");
  }
}

function parseMakler(doc: FrontmatterFile): Makler {
  const { data, file, body } = doc;
  if (data.type !== "Makler") fail(file, "type must be Makler");
  const makler: Makler = {
    type: "Makler",
    slug: path.basename(file, ".md"),
    file,
    title: asString(data.title, file, "title"),
    description: asString(data.description, file, "description"),
    resource: optionalString(data.resource, file, "resource"),
    tags: Array.isArray(data.tags) ? asStringList(data.tags, file, "tags") : [],
    sources: parseSources(data.sources, file),
    generated: data.generated
      ? parseStamp(data.generated, file, "generated")
      : undefined,
    verified: parseVerified(data.verified, file),
    status: parseStatus(data.status, file),
    stale_after: optionalString(data.stale_after, file, "stale_after"),
    body,
    demo: asBoolean(data.demo, file, "demo"),
    given: asString(data.given, file, "given"),
    family: asString(data.family, file, "family"),
    buero: asString(data.buero, file, "buero"),
    city: asString(data.city, file, "city"),
    stadtteile: asStringList(data.stadtteile, file, "stadtteile"),
    size_band: parseSizeBand(data.size_band, file),
    headcount: asNumber(data.headcount, file, "headcount"),
    years_in_city: asNumber(data.years_in_city, file, "years_in_city"),
    independent: asBoolean(data.independent, file, "independent"),
    since: data.since === undefined ? undefined : asNumber(data.since, file, "since"),
    outbound: parseOutbound(data.outbound, file),
  };
  assertDemoContact(makler);
  return makler;
}

function parseFormula(body: string, file: string): Formula {
  const match = body.match(/```json\n([\s\S]*?)\n```/);
  if (!match?.[1]) fail(file, "Attested Computation needs a json fence");
  const raw: unknown = JSON.parse(match[1]);
  const row = asRecord(raw, file, "formula");
  const ineligible = asStringList(
    row.ineligible_size_bands,
    file,
    "ineligible_size_bands",
  );
  for (const band of ineligible) {
    if (
      band !== "boutique" &&
      band !== "small" &&
      band !== "mid" &&
      band !== "factory"
    ) {
      fail(file, `unknown size band ${band}`);
    }
  }
  const formula: Formula = {
    kind: "city-ranking-v1",
    office_confirmation_points: asNumber(
      row.office_confirmation_points,
      file,
      "office_confirmation_points",
    ),
    points_per_local_year: asNumber(
      row.points_per_local_year,
      file,
      "points_per_local_year",
    ),
    local_years_cap: asNumber(row.local_years_cap, file, "local_years_cap"),
    independence_points: asNumber(
      row.independence_points,
      file,
      "independence_points",
    ),
    ineligible_size_bands: ineligible as SizeBand[],
  };
  if (formula.kind !== "city-ranking-v1" && row.kind !== "city-ranking-v1") {
    fail(file, "formula.kind must be city-ranking-v1");
  }
  return formula;
}

function parseComputation(doc: FrontmatterFile): Computation {
  const { data, file, body } = doc;
  if (data.type !== "Attested Computation") {
    fail(file, "type must be Attested Computation");
  }
  return {
    type: "Attested Computation",
    slug: path.basename(file, ".md"),
    file,
    title: asString(data.title, file, "title"),
    description: asString(data.description, file, "description"),
    generated: data.generated
      ? parseStamp(data.generated, file, "generated")
      : undefined,
    verified: parseVerified(data.verified, file),
    status: parseStatus(data.status, file),
    stale_after: optionalString(data.stale_after, file, "stale_after"),
    runtime: asString(data.runtime, file, "runtime"),
    formula: parseFormula(body, file),
    body,
  };
}

export function parseMarkdown(raw: string, file: string): FrontmatterFile {
  if (!raw.startsWith("---\n") && !raw.startsWith("---\r\n")) {
    fail(file, "missing YAML frontmatter");
  }
  const rest = raw.slice(4);
  const end = rest.search(/\n---\r?\n/);
  if (end === -1) fail(file, "unterminated YAML frontmatter");
  const yamlText = rest.slice(0, end);
  const body = rest.slice(end).replace(/^\n---\r?\n/, "");
  const data: unknown = parseYaml(yamlText);
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    fail(file, "frontmatter must be a mapping");
  }
  return { file, data: data as Record<string, unknown>, body: body.replace(/^\n/, "") };
}

async function walkMarkdown(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (entry.name.endsWith(".md")) out.push(full);
    }
  }
  await walk(root);
  return out.sort();
}

export async function loadBundle(root: string): Promise<Bundle> {
  const files = await walkMarkdown(root);
  const makler: Makler[] = [];
  let computation: Computation | undefined;
  for (const file of files) {
    const name = path.basename(file);
    if (name === "index.md" || name === "log.md") continue;
    const raw = await readFile(file, "utf8");
    const doc = parseMarkdown(raw, path.relative(root, file));
    const type = doc.data.type;
    if (type === "Makler") {
      makler.push(parseMakler(doc));
    } else if (type === "Attested Computation") {
      if (computation) fail(doc.file, "only one Attested Computation is allowed in v1");
      computation = parseComputation(doc);
    }
  }
  if (!computation) {
    throw new Error("bundle has no Attested Computation");
  }
  const slugs = new Set<string>();
  for (const office of makler) {
    if (slugs.has(office.slug)) fail(office.file, "duplicate slug");
    slugs.add(office.slug);
  }
  return { root, makler, computation };
}
