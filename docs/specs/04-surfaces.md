# Surfaces

Three projections of `okf/`. No owner-lead store. No contact form.

## Site

Static HTML from `pnpm generate`. Owner routes `/`, `/hannover/`, `/hannover/<slug>/`. Outbound website, mailto, tel. UTM on website links only. `llms.txt` and `robots.txt` are written into `dist/`.

GitHub Pages from `main`, project path `/maklerindex/`. Live URL: https://melvinanalytics.github.io/maklerindex/

## llms.txt

Machine entry. Trust in YAML `verified`. Rank only from the Attested Computation. Headcount is a filter.

## MCP

stdio. Tools: `list_cities`, `rank_city`, `get_makler`. Same load path as generate. No second formula.

## CI

`.github/workflows/ci.yml`: install, `pnpm test`, generate, `pnpm prove` on pull request and on `main`.

`.github/workflows/pages.yml`: generate with Pages `BASE_PATH` and deploy `dist/` from `main`.
