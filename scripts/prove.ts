import assert from "node:assert/strict";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "../src/generate.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function contentType(file: string): string {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (file.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  assert.equal(response.status, 200, url);
  return response.text();
}

const { outputDirectory, ranked } = await generate({
  asOf: new Date("2026-08-25T12:00:00Z"),
});

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  let relative = decodeURIComponent(url.pathname);
  if (relative.endsWith("/")) relative += "index.html";
  const file = path.join(outputDirectory, relative);
  if (!file.startsWith(outputDirectory) || !existsSync(file) || statSync(file).isDirectory()) {
    response.writeHead(404);
    response.end("not found");
    return;
  }
  response.writeHead(200, { "content-type": contentType(file) });
  createReadStream(file).pipe(response);
});

await new Promise<void>((resolve) => server.listen(4173, "127.0.0.1", resolve));

try {
  const home = await fetchText("http://127.0.0.1:4173/");
  const city = await fetchText("http://127.0.0.1:4173/hannover/");
  const profile = await fetchText("http://127.0.0.1:4173/hannover/lena-harms/");
  const llms = await fetchText("http://127.0.0.1:4173/llms.txt");
  const okf = await fetchText("http://127.0.0.1:4173/okf/makler/lena-harms.md");

  assert.match(home, /Finde den Makler, nicht das Portal/);
  assert.match(home, /Der Rang in einer Stadt folgt einer festen Formel/);
  assert.match(home, /Instrument Serif/);
  assert.doesNotMatch(home, /\bInter\b/);
  assert.match(city, /Lena Harms/);
  assert.match(city, /Demo/);
  assert.doesNotMatch(city, /Hanseat Residenz/);
  assert.match(profile, /Büro bestätigt/);
  assert.match(profile, /Kein Formular/);
  assert.match(llms, /Attested Computation/);
  assert.match(okf, /verified: \{ by: human:lena-harms-demo/);
  assert.deepEqual(ranked, ["lena-harms", "nils-ahlers", "mira-vogt"]);
  process.stdout.write("prove ok: /, /hannover/, /hannover/lena-harms/, llms.txt, okf markdown\n");
} finally {
  server.close();
}
