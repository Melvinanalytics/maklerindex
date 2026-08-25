import assert from "node:assert/strict";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { generate } from "../src/generate.ts";
import { normalizeBasePath } from "../src/paths.ts";

const basePath = normalizeBasePath(process.env.BASE_PATH);
const origin = `http://127.0.0.1:4173${basePath}`;

function contentType(file: string): string {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (file.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

function toFile(pathname: string): string {
  let relative = decodeURIComponent(pathname);
  if (basePath && (relative === basePath || relative.startsWith(`${basePath}/`))) {
    relative = relative.slice(basePath.length) || "/";
  }
  if (relative.endsWith("/")) relative += "index.html";
  return relative;
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
  const relative = toFile(url.pathname);
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
  const home = await fetchText(`${origin}/`);
  const city = await fetchText(`${origin}/hannover/`);
  const profile = await fetchText(`${origin}/hannover/lena-harms/`);
  const llms = await fetchText(`${origin}/llms.txt`);
  const robots = await fetchText(`${origin}/robots.txt`);
  const okf = await fetchText(`${origin}/okf/makler/lena-harms.md`);

  assert.match(home, /Finde den Makler, nicht das Portal/);
  assert.match(home, /Der Rang ist die veröffentlichte Summe/);
  assert.match(home, /Gewichte 25, 20, 25 und 30/);
  assert.match(home, /Instrument Serif/);
  assert.doesNotMatch(home, /\bInter\b/);
  assert.doesNotMatch(home, /McMakler/);
  assert.doesNotMatch(home, /<form/i);
  assert.match(city, /Lena Harms/);
  assert.match(city, /Demo/);
  assert.match(city, /Größe filtert/);
  assert.doesNotMatch(city, /Hanseat Residenz/);
  assert.match(profile, /Büro bestätigt/);
  assert.match(profile, /Kein Formular/);
  assert.doesNotMatch(profile, /<form/i);
  assert.match(llms, /Attested Computation/);
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /llms\.txt/);
  const research = await fetchText(
    `${origin}/docs/research/consensus-2026-08-25.md`,
  );
  assert.match(research, /published SAW/);
  assert.match(okf, /verified: \{ by: human:lena-harms-demo/);
  assert.deepEqual(ranked, ["lena-harms", "nils-ahlers", "mira-vogt"]);
  process.stdout.write(
    `prove ok: ${basePath || ""}/, /hannover/, /hannover/lena-harms/, llms.txt, robots.txt, okf markdown\n`,
  );
} finally {
  server.close();
}
