# Maklerindex

Finde den Makler, nicht das Portal. An unpaid index of listing agents for German property owners. Not a listing portal. Not a buyer search. Ranking is not for sale.

Live site: https://melvinanalytics.github.io/maklerindex/

GitHub Pages, from `main`, project path `/maklerindex/`. The three owner screens are `/`, `/hannover/`, and `/hannover/lena-harms/`.

The product is the OKF v0.2 bundle in `okf/`. The site, `llms.txt`, and the MCP server are projections of that bundle. `robots.txt` and `llms.txt` are written into `dist/` on generate. They are not repo-only files.

## How to run

You need Node 22 and pnpm.

```sh
pnpm install
pnpm generate
pnpm dev
```

`pnpm generate` reads `okf/`, runs the sanctioned city ranking, and writes `dist/`. `pnpm dev` does the same, then serves `dist/` at http://127.0.0.1:4173.

Open these routes:

- http://127.0.0.1:4173/
- http://127.0.0.1:4173/hannover/
- http://127.0.0.1:4173/hannover/lena-harms/

Every DEMO office is labeled DEMO. Contacts use `example.invalid`. There is no form.

## How to check

```sh
pnpm test
pnpm prove
```

`pnpm prove` generates, serves `dist/`, and fetches the three owner routes plus `/llms.txt`, `/robots.txt`, and a source markdown file.

On GitHub, `ci.yml` runs install, `pnpm test`, generate, and prove on every PR and on `main`. `pages.yml` deploys `dist/` to GitHub Pages from `main` with `BASE_PATH=/maklerindex`.

## How to ask a model

Point the model at http://127.0.0.1:4173/llms.txt or at `okf/`. Trust lives in YAML frontmatter. No `verified` key means unverified. A `human:` actor in `verified` is Büro-Bestätigung. The city order must come from `okf/computations/city-ranking.md`. An agent must not invent Platz 1.

```sh
pnpm mcp
```

Tools: `list_cities`, `rank_city`, `get_makler`.

## Ranking rule

Der Rang ist die veröffentlichte Summe aus Ortskenntnis, Verkaufsspezialisierung, Person und Büro-Bestätigung.

Gewichte 25, 20, 25 und 30. Nicht käuflich. Bürogröße zählt nicht mit.

The executable form is published SAW in `okf/computations/city-ranking.md`. The cited papers live in `docs/research/consensus-2026-08-25.md`, not in the HTML chrome. `size_band: factory` is ineligible. Headcount is a filter, never a score. `years_in_city` is display metadata.

Visual contract: `design/visual-spec.md`. Architecture: `design/architecture.md`.

License: MIT (`LICENSE`). Impressum and Datenschutz pages are placeholders. DEMO offices are labeled DEMO. Contacts use `example.invalid`. There is no form.
