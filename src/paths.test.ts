import assert from "node:assert/strict";
import test from "node:test";
import { publicUrl, siteOptions, withBase } from "./paths.ts";

test("withBase is a no-op at the site root", () => {
  assert.equal(withBase("", "/"), "/");
  assert.equal(withBase("", "/hannover/"), "/hannover/");
  assert.equal(withBase("", "/llms.txt"), "/llms.txt");
});

test("withBase prefixes the GitHub Pages project path", () => {
  assert.equal(withBase("/maklerindex", "/"), "/maklerindex/");
  assert.equal(withBase("/maklerindex/", "/hannover/"), "/maklerindex/hannover/");
  assert.equal(withBase("maklerindex", "/llms.txt"), "/maklerindex/llms.txt");
});

test("publicUrl joins origin and base path", () => {
  const site = siteOptions({
    basePath: "/maklerindex",
    origin: "https://melvinanalytics.github.io",
  });
  assert.equal(
    publicUrl(site, "/"),
    "https://melvinanalytics.github.io/maklerindex/",
  );
  assert.equal(
    publicUrl(site, "/okf/computations/city-ranking.md"),
    "https://melvinanalytics.github.io/maklerindex/okf/computations/city-ranking.md",
  );
});
