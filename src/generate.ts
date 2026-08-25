import { existsSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadBundle } from "./okf.ts";
import { siteOptions, withBase } from "./paths.ts";
import { rankCity } from "./ranking.ts";
import {
  renderCity,
  renderHome,
  renderLegal,
  renderLlmsTxt,
  renderProfile,
  renderRobots,
} from "./site.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function generate(options?: {
  bundleRoot?: string;
  outputDirectory?: string;
  asOf?: Date;
  basePath?: string;
  origin?: string;
}): Promise<{ outputDirectory: string; ranked: string[] }> {
  const bundleRoot = options?.bundleRoot ?? path.join(repoRoot, "okf");
  const outputDirectory = options?.outputDirectory ?? path.join(repoRoot, "dist");
  const asOf = options?.asOf ?? new Date("2026-08-25T12:00:00Z");
  const site = siteOptions({
    basePath: options?.basePath,
    origin: options?.origin,
  });

  const bundle = await loadBundle(bundleRoot);
  const ranking = rankCity(bundle, "hannover", asOf);
  if (!ranking.attested) {
    throw new Error("city ranking failed attestation");
  }

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(path.join(outputDirectory, "hannover"), { recursive: true });
  await mkdir(path.join(outputDirectory, "impressum"), { recursive: true });
  await mkdir(path.join(outputDirectory, "datenschutz"), { recursive: true });

  await writeFile(path.join(outputDirectory, "index.html"), renderHome(bundle, ranking, site));
  await writeFile(
    path.join(outputDirectory, "hannover", "index.html"),
    renderCity(bundle, ranking, asOf, site),
  );
  for (const office of bundle.makler.filter((item) => item.city === "hannover")) {
    const dir = path.join(outputDirectory, "hannover", office.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, "index.html"),
      renderProfile(bundle, ranking, office.slug, asOf, site),
    );
  }
  await writeFile(
    path.join(outputDirectory, "impressum", "index.html"),
    renderLegal("impressum", site),
  );
  await writeFile(
    path.join(outputDirectory, "datenschutz", "index.html"),
    renderLegal("datenschutz", site),
  );
  await writeFile(
    path.join(outputDirectory, "llms.txt"),
    renderLlmsTxt(bundle, ranking, site),
  );
  await writeFile(path.join(outputDirectory, "robots.txt"), renderRobots(site));
  await writeFile(path.join(outputDirectory, ".nojekyll"), "");
  await writeFile(
    path.join(outputDirectory, "ranking.json"),
    `${JSON.stringify(ranking.receipt, null, 2)}\n`,
  );
  await cp(bundleRoot, path.join(outputDirectory, "okf"), { recursive: true });
  await mkdir(path.join(outputDirectory, "media"), { recursive: true });
  const portraits = ["lena-harms.jpg", "nils-ahlers.jpg", "mira-vogt.jpg"];
  for (const file of portraits) {
    const src = path.join(repoRoot, "design", "portraits", file);
    if (!existsSync(src)) {
      throw new Error(`missing DEMO portrait ${file}`);
    }
    await cp(src, path.join(outputDirectory, "media", file));
  }
  await mkdir(path.join(outputDirectory, "docs", "research"), { recursive: true });
  await cp(
    path.join(repoRoot, "docs", "research"),
    path.join(outputDirectory, "docs", "research"),
    { recursive: true },
  );
  await writeFile(
    path.join(outputDirectory, "okf", "index.html"),
    `<!doctype html><meta charset="utf-8" /><title>OKF</title><pre>See <a href="${withBase(site.basePath, "/okf/index.md")}">index.md</a> and the markdown tree.</pre>`,
  );

  return { outputDirectory, ranked: ranking.receipt.ordered_slugs };
}

const invoked = process.argv[1]?.includes("generate.ts") ?? false;
if (invoked) {
  const result = await generate();
  process.stdout.write(`wrote ${result.outputDirectory}\n${result.ranked.join("\n")}\n`);
}
