import { createHash } from "node:crypto";
import {
  type CityRanking,
  type Formula,
  type Makler,
  type RankedRow,
  type Receipt,
  isStale,
  trustTier,
} from "./domain.ts";
import type { Bundle } from "./okf.ts";

export function formulaDigest(formula: Formula): string {
  return createHash("sha256").update(JSON.stringify(formula)).digest("hex");
}

function roundScore(value: number): number {
  return Number(value.toFixed(4));
}

function criterion(value: boolean): number {
  return value ? 1 : 0;
}

export function scoreMakler(
  makler: Makler,
  formula: Formula,
  asOf: Date,
): RankedRow["breakdown"] & { points: number } {
  const micromarket = criterion(
    makler.stadtteile.length >= 1 &&
      makler.stadtteile.length <= formula.micromarket_max_stadtteile,
  );
  const seller_special = criterion(makler.seller_special);
  const person = criterion(makler.unit === "person");
  const confirmation = criterion(
    !isStale(makler.stale_after, asOf) &&
      trustTier(makler.verified) === "human-reviewed" &&
      makler.sources.length > 0,
  );
  const weights = formula.weights;
  const points = roundScore(
    micromarket * weights.micromarket +
      seller_special * weights.seller_special +
      person * weights.person +
      confirmation * weights.confirmation,
  );
  return { micromarket, seller_special, person, confirmation, points };
}

export function rankCity(bundle: Bundle, city: string, asOf: Date): CityRanking {
  const formula = bundle.computation.formula;
  const eligible = bundle.makler.filter(
    (office) =>
      office.city === city &&
      office.status === "stable" &&
      !formula.ineligible_size_bands.includes(office.size_band),
  );

  const scored = eligible
    .map((office) => ({ office, breakdown: scoreMakler(office, formula, asOf) }))
    .sort((left, right) => {
      if (right.breakdown.points !== left.breakdown.points) {
        return right.breakdown.points - left.breakdown.points;
      }
      if (right.breakdown.confirmation !== left.breakdown.confirmation) {
        return right.breakdown.confirmation - left.breakdown.confirmation;
      }
      if (right.breakdown.person !== left.breakdown.person) {
        return right.breakdown.person - left.breakdown.person;
      }
      if (right.breakdown.micromarket !== left.breakdown.micromarket) {
        return right.breakdown.micromarket - left.breakdown.micromarket;
      }
      return left.office.slug.localeCompare(right.office.slug);
    });

  const rows: RankedRow[] = scored.map((item, index) => ({
    rank: index + 1,
    slug: item.office.slug,
    points: item.breakdown.points,
    breakdown: {
      micromarket: item.breakdown.micromarket,
      seller_special: item.breakdown.seller_special,
      person: item.breakdown.person,
      confirmation: item.breakdown.confirmation,
    },
  }));

  const receipt: Receipt = {
    city,
    as_of: asOf.toISOString(),
    formula_digest: formulaDigest(formula),
    ordered_slugs: rows.map((row) => row.slug),
    scores: rows.map((row) => row.points),
  };

  return {
    city,
    computation_file: bundle.computation.file,
    rows,
    receipt,
    attested: true,
  };
}

export function attestReceipt(
  bundle: Bundle,
  city: string,
  asOf: Date,
  claimed: Pick<Receipt, "formula_digest" | "ordered_slugs" | "scores">,
): boolean {
  const actual = rankCity(bundle, city, asOf);
  return (
    claimed.formula_digest === actual.receipt.formula_digest &&
    claimed.ordered_slugs.join("\n") === actual.receipt.ordered_slugs.join("\n") &&
    claimed.scores.join(",") === actual.receipt.scores.join(",")
  );
}

export function rankingSentence(): string {
  return "Der Rang ist die veröffentlichte Summe aus Ortskenntnis, Verkaufsspezialisierung, Person und Büro-Bestätigung.";
}

export function rankingWeightsSentence(formula: Formula): string {
  const percent = (weight: number): string => String(Math.round(weight * 100));
  const weights = formula.weights;
  return `Gewichte ${percent(weights.micromarket)}, ${percent(weights.seller_special)}, ${percent(weights.person)} und ${percent(weights.confirmation)}. Nicht käuflich. Bürogröße zählt nicht mit.`;
}
