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

export function scoreMakler(
  makler: Makler,
  formula: Formula,
  asOf: Date,
): RankedRow["breakdown"] & { points: number } {
  const confirmation =
    !isStale(makler.stale_after, asOf) &&
    trustTier(makler.verified) === "human-reviewed"
      ? formula.office_confirmation_points
      : 0;
  const years = Math.min(Math.max(makler.years_in_city, 0), formula.local_years_cap);
  const local_years = years * formula.points_per_local_year;
  const independence = makler.independent ? formula.independence_points : 0;
  return {
    confirmation,
    local_years,
    independence,
    points: confirmation + local_years + independence,
  };
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
      if (right.breakdown.local_years !== left.breakdown.local_years) {
        return right.breakdown.local_years - left.breakdown.local_years;
      }
      if (right.breakdown.independence !== left.breakdown.independence) {
        return right.breakdown.independence - left.breakdown.independence;
      }
      return left.office.slug.localeCompare(right.office.slug);
    });

  const rows: RankedRow[] = scored.map((item, index) => ({
    rank: index + 1,
    slug: item.office.slug,
    points: item.breakdown.points,
    breakdown: {
      confirmation: item.breakdown.confirmation,
      local_years: item.breakdown.local_years,
      independence: item.breakdown.independence,
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
  return "Der Rang in einer Stadt folgt einer festen Formel. Er ist nicht käuflich, und die Bürogröße zählt nicht mit.";
}
