# OKF

`okf/` is the only authored store. The site, `llms.txt`, and MCP read it. They do not keep a second corpus.

## Makler concept

Fields as in `src/domain.ts`. Producer extensions on the concept:

- identity: `given`, `family`, `buero`, `title`, `description`
- place: `city`, `stadtteile`
- size as filter: `size_band`, `headcount`
- display metadata, not score: `years_in_city`, `independent`, `since`
- rank inputs: `unit` (`person` or `firm`), `seller_special`
- trust: `sources`, `generated`, `verified`, `status`, `stale_after`
- contact: `outbound` (`website`, `email`, `phone`), `resource`
- `demo`

No stored `trust_score`. Ranking is computed by the Attested Computation. It is not a field on the Makler.

## Büro-Bestätigung

`verified` with a `human:` actor. Absence of `verified` means unverified. That absence is the statement.

## DEMO

Every DEMO office is labeled DEMO. Factory-scale offices may exist in the corpus. They receive no city rank.
