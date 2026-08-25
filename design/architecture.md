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

OKF bundle on disk is the only authored store. `src/okf.ts` parses markdown plus YAML at that boundary. `src/ranking.ts` executes and attests the formula in `okf/computations/city-ranking.md`. `src/generate.ts` writes HTML that follows `design/visual-spec.md` (still v4: dark ground, DEMO portraits, type in the photograph), copies the bundle to `dist/okf/`, and writes `llms.txt`. `src/mcp.ts` is a thin stdio adapter over the same functions.

Custom frontmatter on a Makler concept carries office signals (`size_band`, `headcount`, `years_in_city`, `independent`, `unit`, `seller_special`, `stadtteile`, `demo`). Those keys are producer extensions. OKF allows them. Size band is a filter type. It is not a field on the scoring input. `years_in_city` is display metadata.

Formula, stored only in the Attested Computation body, is published SAW. Cited basis: `docs/research/consensus-2026-08-25.md`.

- micromarket 0.25 if Stadtteil count is between 1 and 3
- seller_special 0.20 if the office is marked seller-side
- person 0.25 if `unit` is person
- confirmation 0.30 if human-reviewed, not stale, and sources exist
- Factory `size_band` is ineligible for a city rank
- Tie-break: confirmation, person, micromarket, then slug
- Review volume, mandate density, repeat-agency, listing count, license years, and headcount have no term
- DEMATEL and TOPSIS stay off the runtime path

## Synthesis decision

Base: candidate 1, static generation from the bundle. Graft: serve the source markdown at `/okf/` so agents fetch the corpus, not only HTML (the useful part of candidate 2). Candidate 2 had not finished writing; the shape was specified as serve-markdown-as-site with in-process ranking. That lost because this repo asked for generate-then-render, and a static `dist/` is what `pnpm generate` can prove.

Rejected from candidate 1: tagging every signal as `size-band:2-5` instead of frontmatter. Agents should filter trust and size from YAML keys. Also rejected: branding every string type. The domain stays a handful of unions.

## Tradeoffs accepted

- We accept a full rebuild of `dist/` on each generate in exchange for no database.
- We accept factory offices in the corpus and out of the ranked list in exchange for never letting volume win.
- We accept DEMO `.invalid` contacts in exchange for shipping a labeled corpus without real phones.
- We accept GitHub Pages at `/maklerindex/` instead of a custom domain or an app host.

## Alternatives considered

- Next.js plus a database. Fat app. Ranking would drift from the bundle.
- Astro content collections as the source of truth. The HTML framework would own the product. OKF would be an export.
- Serving raw markdown with no generate step. Fine for agents, poor for the owner screens this spec locks.
- Origin or Vercel as the public host. The site is static. GitHub Actions already has the tree.

## Next implementation step

Merge to `main` so Pages can serve `/maklerindex/`. Keep the SAW fence, the parser reject list, and the owner sentence in lockstep when the literature lock changes.
