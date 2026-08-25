import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadBundle, parseFormulaFromJson } from "./okf.ts";
import { attestReceipt, rankCity, rankingSentence, scoreMakler } from "./ranking.ts";
import { generate } from "./generate.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asOf = new Date("2026-08-25T12:00:00Z");

const validSaw = {
  kind: "city-ranking-saw-v1",
  method: "saw",
  weights: {
    micromarket: 0.25,
    seller_special: 0.20,
    person: 0.25,
    confirmation: 0.30,
  },
  micromarket_max_stadtteile: 3,
  ineligible_size_bands: ["factory"],
  forbidden_terms: [
    "review_volume",
    "stars",
    "mandate_density",
    "repeat_agency",
    "pay_to_rank",
    "listing_count",
    "license_years",
    "headcount",
  ],
};

test("Hannover rank is Lena, Nils, Mira and excludes the factory office", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const ranking = rankCity(bundle, "hannover", asOf);
  assert.deepEqual(ranking.receipt.ordered_slugs, [
    "lena-harms",
    "nils-ahlers",
    "mira-vogt",
  ]);
  assert.ok(!ranking.receipt.ordered_slugs.includes("hanseat-residenz"));
  assert.deepEqual(ranking.receipt.scores, [1, 1, 0.7]);
  assert.equal(attestReceipt(bundle, "hannover", asOf, ranking.receipt), true);
  const lena = ranking.rows[0];
  const mira = ranking.rows[2];
  assert.ok(lena);
  assert.ok(mira);
  assert.equal(lena.breakdown.confirmation, 1);
  assert.equal(mira.breakdown.confirmation, 0);
  assert.equal(mira.points, 0.7);
});

test("headcount is not a score input", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const lena = bundle.makler.find((item) => item.slug === "lena-harms");
  assert.ok(lena);
  const before = scoreMakler(lena, bundle.computation.formula, asOf);
  const mutated = { ...lena, headcount: 10_000 };
  const after = scoreMakler(mutated, bundle.computation.formula, asOf);
  assert.equal(after.points, before.points);
});

test("years_in_city is not a score input", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const lena = bundle.makler.find((item) => item.slug === "lena-harms");
  assert.ok(lena);
  const before = scoreMakler(lena, bundle.computation.formula, asOf);
  const mutated = { ...lena, years_in_city: 99 };
  const after = scoreMakler(mutated, bundle.computation.formula, asOf);
  assert.equal(after.points, before.points);
});

test("independence is not a score input", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const lena = bundle.makler.find((item) => item.slug === "lena-harms");
  assert.ok(lena);
  const before = scoreMakler(lena, bundle.computation.formula, asOf);
  const mutated = { ...lena, independent: false };
  const after = scoreMakler(mutated, bundle.computation.formula, asOf);
  assert.equal(after.points, before.points);
});

test("a fourth Stadtteil drops the micromarket criterion", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const lena = bundle.makler.find((item) => item.slug === "lena-harms");
  assert.ok(lena);
  const before = scoreMakler(lena, bundle.computation.formula, asOf);
  const mutated = {
    ...lena,
    stadtteile: [...lena.stadtteile, "Linden"],
  };
  const after = scoreMakler(mutated, bundle.computation.formula, asOf);
  assert.equal(before.micromarket, 1);
  assert.equal(after.micromarket, 0);
  assert.ok(after.points < before.points);
});

test("attester rejects a swapped first place", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const ranking = rankCity(bundle, "hannover", asOf);
  const forged = {
    ...ranking.receipt,
    ordered_slugs: ["mira-vogt", "lena-harms", "nils-ahlers"],
  };
  assert.equal(attestReceipt(bundle, "hannover", asOf, forged), false);
});

test("formula parser rejects forbidden terms and non-SAW methods", () => {
  const withStars = {
    ...validSaw,
    weights: { ...validSaw.weights, stars: 0.1 },
  };
  assert.throws(
    () => parseFormulaFromJson(withStars, "formula.md"),
    /forbidden formula key stars|unknown weight stars/,
  );
  const withHeadcount = { ...validSaw, headcount: 12 };
  assert.throws(
    () => parseFormulaFromJson(withHeadcount, "formula.md"),
    /forbidden formula key headcount|unknown formula key headcount/,
  );
  const topsis = { ...validSaw, method: "topsis" };
  assert.throws(
    () => parseFormulaFromJson(topsis, "formula.md"),
    /formula.method must be saw/,
  );
  const badSum = {
    ...validSaw,
    weights: { ...validSaw.weights, confirmation: 0.4 },
  };
  assert.throws(
    () => parseFormulaFromJson(badSum, "formula.md"),
    /SAW weights must sum to 1/,
  );
  const parsed = parseFormulaFromJson(validSaw, "formula.md");
  assert.equal(parsed.kind, "city-ranking-saw-v1");
  const weightSum =
    parsed.weights.micromarket +
    parsed.weights.seller_special +
    parsed.weights.person +
    parsed.weights.confirmation;
  assert.ok(Math.abs(weightSum - 1) < 1e-9);
});

test("generate writes the three owner routes, DEMO, weights, and llms.txt", async () => {
  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "maklerindex-"));
  await generate({ outputDirectory, asOf });
  const home = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  const city = await readFile(
    path.join(outputDirectory, "hannover", "index.html"),
    "utf8",
  );
  const profile = await readFile(
    path.join(outputDirectory, "hannover", "lena-harms", "index.html"),
    "utf8",
  );
  const llms = await readFile(path.join(outputDirectory, "llms.txt"), "utf8");
  const research = await readFile(
    path.join(outputDirectory, "docs", "research", "consensus-2026-08-25.md"),
    "utf8",
  );
  assert.match(home, /Finde den Makler, nicht das Portal/);
  assert.match(home, new RegExp(rankingSentence().replaceAll(".", "\\.")));
  assert.match(home, /Gewichte 25, 20, 25 und 30/);
  assert.match(home, /Sichtbar ist das Büro und die Person/);
  assert.doesNotMatch(home, /McMakler/);
  assert.doesNotMatch(home, /Vertriebsfabrik/);
  assert.match(city, /Lena Harms/);
  assert.match(city, /Mira Vogt/);
  assert.match(city, /Demo/);
  assert.match(city, /<button type="button" class="on" data-filter="boutique">/);
  assert.match(city, /<button type="button" data-filter="small">/);
  assert.match(city, /<button type="button" data-filter="mid">/);
  assert.match(city, /apply\(\);/);
  assert.match(city, /Größe filtert\. Review-Zahl und Auftragslast heben niemanden/);
  assert.doesNotMatch(city, /Hanseat Residenz/);
  assert.match(profile, /Büro bestätigt/);
  assert.match(profile, /Kein Formular/);
  assert.match(llms, /# Maklerindex/);
  assert.match(llms, /human-reviewed/);
  assert.match(llms, /unverified/);
  assert.match(llms, /Published SAW/);
  assert.match(research, /Fang, L\./);
  assert.doesNotMatch(home, /Inter/);
  const ownerHtml = `${home}\n${city}\n${profile}`;
  assert.doesNotMatch(ownerHtml, /Fang|Hayunga|Turnbull|Dombrow|Dabholkar|Yelowitz|Owusu|DEMATEL|TOPSIS|\bSAW\b/);
});
