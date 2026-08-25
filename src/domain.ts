export type SizeBand = "boutique" | "small" | "mid" | "factory";
export type Status = "draft" | "stable" | "deprecated";
export type TrustTier = "unverified" | "machine-confirmed" | "human-reviewed";

export type Actor =
  | { kind: "human"; id: string }
  | { kind: "agent"; id: string }
  | { kind: "process"; id: string };

export interface Stamp {
  by: Actor;
  at: string;
}

export interface Source {
  id?: string;
  resource: string;
  title?: string;
  author?: string;
  last_modified?: string;
}

export interface Outbound {
  website?: string;
  email?: string;
  phone?: string;
}

export interface Makler {
  type: "Makler";
  slug: string;
  file: string;
  title: string;
  description: string;
  resource?: string;
  tags: string[];
  sources: Source[];
  generated?: Stamp;
  verified: Stamp[];
  status: Status;
  stale_after?: string;
  body: string;
  demo: boolean;
  given: string;
  family: string;
  buero: string;
  city: string;
  stadtteile: string[];
  size_band: SizeBand;
  headcount: number;
  years_in_city: number;
  independent: boolean;
  since?: number;
  outbound: Outbound;
}

export interface Formula {
  kind: "city-ranking-v1";
  office_confirmation_points: number;
  points_per_local_year: number;
  local_years_cap: number;
  independence_points: number;
  ineligible_size_bands: SizeBand[];
}

export interface Computation {
  type: "Attested Computation";
  slug: string;
  file: string;
  title: string;
  description: string;
  generated?: Stamp;
  verified: Stamp[];
  status: Status;
  stale_after?: string;
  runtime: string;
  formula: Formula;
  body: string;
}

export interface RankedRow {
  rank: number;
  slug: string;
  points: number;
  breakdown: {
    confirmation: number;
    local_years: number;
    independence: number;
  };
}

export interface Receipt {
  city: string;
  as_of: string;
  formula_digest: string;
  ordered_slugs: string[];
  scores: number[];
}

export interface CityRanking {
  city: string;
  computation_file: string;
  rows: RankedRow[];
  receipt: Receipt;
  attested: boolean;
}

export type TrustView =
  | { kind: "confirmed"; at: string }
  | { kind: "unverified" }
  | { kind: "stale"; at?: string }
  | { kind: "deprecated" };

export function parseActor(raw: string): Actor {
  if (raw.startsWith("human:")) {
    return { kind: "human", id: raw.slice("human:".length) };
  }
  if (raw.startsWith("process:")) {
    return { kind: "process", id: raw.slice("process:".length) };
  }
  return { kind: "agent", id: raw };
}

export function formatActor(actor: Actor): string {
  if (actor.kind === "human") return `human:${actor.id}`;
  if (actor.kind === "process") return `process:${actor.id}`;
  return actor.id;
}

export function trustTier(verified: Stamp[]): TrustTier {
  if (verified.length === 0) return "unverified";
  if (verified.some((item) => item.by.kind === "human")) return "human-reviewed";
  return "machine-confirmed";
}

export function isStale(staleAfter: string | undefined, asOf: Date): boolean {
  if (!staleAfter) return false;
  return asOf.getTime() >= Date.parse(staleAfter);
}

export function trustView(makler: Makler, asOf: Date): TrustView {
  if (makler.status === "deprecated") return { kind: "deprecated" };
  if (isStale(makler.stale_after, asOf)) {
    const latest = makler.verified.at(-1);
    return { kind: "stale", at: latest?.at };
  }
  const humans = makler.verified.filter((item) => item.by.kind === "human");
  const latest = humans.at(-1);
  if (latest) return { kind: "confirmed", at: latest.at };
  return { kind: "unverified" };
}

export function initials(makler: Makler): string {
  const first = makler.given.trim().charAt(0);
  const last = makler.family.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function sizeLabel(band: SizeBand): string {
  switch (band) {
    case "boutique":
      return "Boutique";
    case "small":
      return "Klein";
    case "mid":
      return "Mittel";
    case "factory":
      return "Fabrik";
    default: {
      const _x: never = band;
      return _x;
    }
  }
}
