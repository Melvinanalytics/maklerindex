# Maklerindex

Finde den Makler, nicht das Portal. An unpaid index of listing agents for German property owners. Not a listing portal. Not a buyer search. Ranking is not for sale.

The product is the OKF v0.2 bundle in `okf/`. The site, `llms.txt`, and the MCP server are projections of that bundle.

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

`pnpm prove` generates, serves `dist/`, and fetches the three owner routes plus `/llms.txt` and a source markdown file.

## How to ask a model

Point the model at http://127.0.0.1:4173/llms.txt or at `okf/`. Trust lives in YAML frontmatter. No `verified` key means unverified. A `human:` actor in `verified` is Büro-Bestätigung. The city order must come from `okf/computations/city-ranking.md`. An agent must not invent Platz 1.

```sh
pnpm mcp
```

Tools: `list_cities`, `rank_city`, `get_makler`.

## Ranking rule

Der Rang in einer Stadt folgt einer festen Formel. Er ist nicht käuflich, und die Bürogröße zählt nicht mit.

Points: Büro-Bestätigung 50, years in the city 2 each (cap 15), independence 20. `size_band: factory` is ineligible. Headcount is a filter, never a score. The formula is only in the Attested Computation body.

Visual contract: `design/visual-spec.md`. Architecture: `design/architecture.md`.

License: MIT. Impressum and Datenschutz pages are placeholders.
