# Ranking

Der Rang in einer Stadt folgt einer festen Formel. Er ist nicht käuflich, und die Bürogröße zählt nicht mit.

## Method

Published SAW. Weighted sum of scores already on `[0, 1]`. DEMATEL is offline weight work. TOPSIS is not the runtime. The site does not run a fuzzy engine.

The executable fence is `okf/computations/city-ranking.md`. Weights live only there. `src/ranking.ts` is the executor. `attestReceipt` is the attester. An agent must not invent Platz 1.

v1 fence (`city-ranking-saw-v1`):

- micromarket 0.25
- seller_special 0.20
- person 0.25
- confirmation 0.30
- `ineligible_size_bands`: `factory`

`years_in_city` and `independent` stay on the concept as display metadata. They are not terms in this fence.

## Literature

Cite papers in `docs/research/consensus-2026-08-25.md`, not in the UI chrome.

- Fang and Hayunga: spatial proximity and micromarket specialization, not license years or raw volume
- Johnson: person over firm
- Alfred: reputation is the selection driver, not review volume
- Beck: high activity is not quality. Faster sale, lower prices
- Shi and Xiao: no repeat-agency boost

## Signals

| Role | Signal |
| --- | --- |
| ON | micromarket / proximity (`stadtteile` count, capped) |
| ON | seller-side specialization |
| ON | person, not firm brand |
| ON | OKF sources plus Büro-Bestätigung |
| FILTER, not score | headcount, `size_band`. Boutique 1–5 is the default city view. `factory` is ineligible |
| CAP / shrink | raw stars, review volume. Absent from the formula. Parser rejects those keys |
| OFF | mandate density as quality |
| OFF | repeat-agency boost |
| OFF | pay-to-rank |
| OFF | IS24 listing count |

## Attestation

`attestReceipt` re-runs the computation for the same city and `as_of`. It compares `formula_digest`, `ordered_slugs`, and `scores`. Any difference is a failed verdict.
