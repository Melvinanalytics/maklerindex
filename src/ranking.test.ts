import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadBundle } from "./okf.ts";
import { attestReceipt, rankCity, scoreMakler } from "./ranking.ts";
import { generate } from "./generate.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asOf = new Date("2026-08-25T12:00:00Z");

test("Hannover rank is Lena, Nils, Mira and excludes the factory office", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const ranking = rankCity(bundle, "hannover", asOf);
  assert.deepEqual(ranking.receipt.ordered_slugs, [
    "lena-harms",
    "nils-ahlers",
    "mira-vogt",
  ]);
  assert.ok(!ranking.receipt.ordered_slugs.includes("hanseat-residenz"));
  assert.equal(
    attestReceipt(bundle, "hannover", asOf, ranking.receipt),
    true,
  );
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

test("attester rejects a swapped first place", async () => {
  const bundle = await loadBundle(path.join(repoRoot, "okf"));
  const ranking = rankCity(bundle, "hannover", asOf);
  const forged = {
    ...ranking.receipt,
    ordered_slugs: ["mira-vogt", "lena-harms", "nils-ahlers"],
  };
  assert.equal(attestReceipt(bundle, "hannover", asOf, forged), false);
});

test("generate writes the three owner routes, DEMO, and llms.txt", async () => {
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
  assert.match(home, /Finde den Makler, nicht das Portal/);
  assert.match(
    home,
    /Der Rang in einer Stadt folgt einer festen Formel/,
  );
  assert.match(city, /Lena Harms/);
  assert.match(city, /Demo/);
  assert.doesNotMatch(city, /Hanseat Residenz/);
  assert.match(profile, /Büro bestätigt/);
  assert.match(profile, /Kein Formular/);
  assert.match(llms, /# Maklerindex/);
  assert.match(llms, /human-reviewed/);
  assert.match(llms, /unverified/);
  assert.doesNotMatch(home, /Inter/);
});
