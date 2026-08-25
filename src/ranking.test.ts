import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadBundle, parseFormulaFromJson } from "./okf.ts";
import { attestReceipt, rankCity, scoreMakler } from "./ranking.ts";
import { generate } from "./generate.ts";
import { homeLead } from "./site.ts";

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

test("Hannover rank is seven DEMO offices and excludes the factory office", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const ranking = rankCity(bundle, "hannover", asOf);
  assert.deepEqual(ranking.receipt.ordered_slugs, [
    "katharina-brandt",
    "jonas-ehlers",
    "miriam-osei",
    "henrik-baumann",
    "leyla-aydin",
    "tobias-frenzel",
    "sofie-berger",
  ]);
  assert.ok(!ranking.receipt.ordered_slugs.includes("hanseat-residenz"));
  assert.deepEqual(ranking.receipt.scores, [1, 0.8, 0.75, 0.7, 0.55, 0.5, 0.45]);
  assert.equal(attestReceipt(bundle, "hannover", asOf, ranking.receipt), true);
  const first = ranking.rows[0];
  const fourth = ranking.rows[3];
  assert.ok(first);
  assert.ok(fourth);
  assert.equal(first.breakdown.confirmation, 1);
  assert.equal(fourth.breakdown.confirmation, 0);
  assert.equal(fourth.points, 0.7);
});

test("headcount is not a score input", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const katharina = bundle.makler.find((item) => item.slug === "katharina-brandt");
  assert.ok(katharina);
  const before = scoreMakler(katharina, bundle.computation.formula, asOf);
  const mutated = { ...katharina, headcount: 10_000 };
  const after = scoreMakler(mutated, bundle.computation.formula, asOf);
  assert.equal(after.points, before.points);
});

test("years_in_city is not a score input", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const katharina = bundle.makler.find((item) => item.slug === "katharina-brandt");
  assert.ok(katharina);
  const before = scoreMakler(katharina, bundle.computation.formula, asOf);
  const mutated = { ...katharina, years_in_city: 99 };
  const after = scoreMakler(mutated, bundle.computation.formula, asOf);
  assert.equal(after.points, before.points);
});

test("independence is not a score input", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const katharina = bundle.makler.find((item) => item.slug === "katharina-brandt");
  assert.ok(katharina);
  const before = scoreMakler(katharina, bundle.computation.formula, asOf);
  const mutated = { ...katharina, independent: false };
  const after = scoreMakler(mutated, bundle.computation.formula, asOf);
  assert.equal(after.points, before.points);
});

test("a fourth Stadtteil drops the micromarket criterion", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const katharina = bundle.makler.find((item) => item.slug === "katharina-brandt");
  assert.ok(katharina);
  const before = scoreMakler(katharina, bundle.computation.formula, asOf);
  const mutated = {
    ...katharina,
    stadtteile: [...katharina.stadtteile, "Linden", "Ricklingen"],
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
    ordered_slugs: ["sofie-berger", "katharina-brandt", "jonas-ehlers"],
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
  await generate({ outputDirectory, asOf, basePath: "", origin: "" });
  const home = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  const city = await readFile(
    path.join(outputDirectory, "hannover", "index.html"),
    "utf8",
  );
  const profile = await readFile(
    path.join(outputDirectory, "hannover", "katharina-brandt", "index.html"),
    "utf8",
  );
  const llms = await readFile(path.join(outputDirectory, "llms.txt"), "utf8");
  const robots = await readFile(path.join(outputDirectory, "robots.txt"), "utf8");
  const research = await readFile(
    path.join(outputDirectory, "docs", "research", "consensus-2026-08-25.md"),
    "utf8",
  );
  assert.match(home, /Finde den Makler,/);
  assert.match(home, /nicht das Portal/);
  assert.match(home, new RegExp(homeLead().replaceAll(".", "\\.")));
  assert.match(home, /Hannover ansehen/);
  assert.match(home, /Demo-Daten/);
  assert.match(home, /Outfit/);
  assert.doesNotMatch(home, /McMakler/);
  assert.doesNotMatch(home, /Vertriebsfabrik/);
  assert.doesNotMatch(home, /<form/i);
  assert.doesNotMatch(home, /<button/i);
  assert.doesNotMatch(home, /Instrument Serif/);
  assert.ok(
    existsSync(path.join(outputDirectory, "media", "katharina-brandt.jpg")),
    "DEMO portrait must ship with the site",
  );
  assert.match(city, /Katharina Brandt/);
  assert.match(city, /Sofie Berger/);
  assert.match(city, /Demo-Daten|fiktiv/);
  assert.doesNotMatch(city, /<button/i);
  assert.doesNotMatch(city, /Hanseat Residenz/);
  assert.match(profile, /Büro bestätigt/);
  assert.match(profile, /Kein Formular\. Der Kontakt geht an das Büro\./);
  assert.match(city, /Demo/);
  assert.match(profile, /Schreiben/);
  assert.match(profile, /Anrufen/);
  assert.doesNotMatch(profile, /<form/i);
  assert.doesNotMatch(profile, /<button/i);
  assert.match(profile, /00000/);
  assert.match(llms, /# Maklerindex/);
  assert.match(llms, /human-reviewed/);
  assert.match(llms, /unverified/);
  assert.match(llms, /Published SAW/);
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \/llms\.txt/);
  assert.match(research, /Fang, L\./);
  assert.doesNotMatch(home, /\bInter\b/);
  const ownerHtml = `${home}\n${city}\n${profile}`;
  assert.doesNotMatch(ownerHtml, /Fang|Hayunga|Turnbull|Dombrow|Dabholkar|Yelowitz|Owusu|DEMATEL|TOPSIS|\bSAW\b/);
});

test("Pages base path prefixes owner links and robots", async () => {
  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "maklerindex-pages-"));
  await generate({
    outputDirectory,
    asOf,
    basePath: "/maklerindex",
    origin: "https://melvinanalytics.github.io",
  });
  const home = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  const robots = await readFile(path.join(outputDirectory, "robots.txt"), "utf8");
  const llms = await readFile(path.join(outputDirectory, "llms.txt"), "utf8");
  assert.match(home, /href="\/maklerindex\/hannover\/"/);
  assert.match(home, /href="\/maklerindex\/llms\.txt"/);
  assert.doesNotMatch(home, /href="\/hannover\/"/);
  assert.match(robots, /Allow: \/maklerindex\//);
  assert.match(robots, /Allow: \/maklerindex\/llms\.txt/);
  assert.match(llms, /https:\/\/melvinanalytics\.github\.io\/maklerindex\/llms\.txt/);
});
