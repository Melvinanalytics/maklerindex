# Architecture

## Problem

Maklerindex has to help German owners hire a listing agent without becoming a portal or a lead shop. The ranking cannot be invented by an LLM and cannot be bought. Google OKF v0.2 is the product. HTML, `llms.txt`, and MCP are projections.

## Usage

```sh
pnpm install
pnpm generate
pnpm dev
```

`pnpm generate` loads `okf/`, validates concepts, runs the sanctioned city ranking, writes `dist/`. `pnpm dev` serves `dist/`. `pnpm mcp` answers `list_cities`, `rank_city`, and `get_makler` from the same load path.

An owner opens `/`, reads the ranking rule, opens `/hannover`, opens `/hannover/lena-harms`, follows an outbound link. An LLM reads `/llms.txt`, then `/okf/makler/*.md`, and filters on `verified` before the body.

## Shape

OKF bundle on disk is the only authored store. `src/okf.ts` parses markdown plus YAML at that boundary. `src/ranking.ts` executes and attests the formula in `okf/computations/city-ranking.md`. `src/generate.ts` writes HTML that follows `design/visual-spec.md`, copies the bundle to `dist/okf/`, and writes `llms.txt`. `src/mcp.ts` is a thin stdio adapter over the same functions.

Custom frontmatter on a Makler concept carries office signals (`size_band`, `headcount`, `years_in_city`, `independent`, `stadtteile`, `demo`). Those keys are producer extensions. OKF allows them. Size band is a filter type. It is not a field on the scoring input.

Formula, stored only in the Attested Computation body:

- 50 points if the concept is human-reviewed and not stale (Büro-Bestätigung)
- 2 points per year in the city, cap 15
- 20 points if `independent: true`
- Factory `size_band` is ineligible for a city rank
- Tie-break: confirmation, years, independence, then slug
- Review volume and headcount have no term

## Synthesis decision

Base: candidate 1, static generation from the bundle. Graft: serve the source markdown at `/okf/` so agents fetch the corpus, not only HTML (the useful part of candidate 2). Candidate 2 had not finished writing; the shape was specified as serve-markdown-as-site with in-process ranking. That lost because this repo asked for generate-then-render, and a static `dist/` is what `pnpm generate` can prove.

Rejected from candidate 1: tagging every signal as `size-band:2-5` instead of frontmatter. Agents should filter trust and size from YAML keys. Also rejected: branding every string type. The domain stays a handful of unions.

## Tradeoffs accepted

- We accept a full rebuild of `dist/` on each generate in exchange for no database.
- We accept factory offices in the corpus and out of the ranked list in exchange for never letting volume win.
- We accept DEMO `.invalid` contacts in exchange for shipping a labeled corpus without real phones.

## Alternatives considered

- Next.js plus a database. Fat app. Ranking would drift from the bundle.
- Astro content collections as the source of truth. The HTML framework would own the product. OKF would be an export.
- Serving raw markdown with no generate step. Fine for agents, poor for the owner screens this spec locks.

## Next implementation step

Corpus fixtures, then parse and ranking tests, then HTML against the visual spec.
