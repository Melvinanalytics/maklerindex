# Literature lock for the city ranking

Consensus date: 2026-08-25.

This file is the cited basis of the attested computation in `okf/computations/city-ranking.md`. The owner screens do not name papers. The formula does not grow extra inputs to look more scientific.

v1 ranks listing agents for German Eigentümer. It does not rank buyer-side search. It does not rank portals.

## What owners are choosing

The literature on agency selection and on brokerage outcomes splits into three categories. Those are the only categories v1 scores or shows as quality.

**Local expertise.** Spatial proximity to the subject home, and specialization in a tight micromarket, beat license tenure and raw transaction volume. Fang and Hayunga (2024, first public 2023-12-04) jointly test local market knowledge, license period, and recent volume for listing and selling agents. The price effect that matters is distance to the agent’s recent micromarket and how tight that micromarket is. License years are a small price effect. Volume is insignificant or economically trivial. Time on market barely moves. Turnbull and Dombrow (2007) separate listing specialists from selling specialists. Listing-side concentration raises seller prices. Scale of listing or selling activity tends to lower price or lengthen marketing time. v1 therefore scores a small Stadtteil set and a seller-side mark, and it does not score years-in-city or mandate count.

**Person over firm.** Johnson, Nourse, and Day (1988) find that the individual agent matters more than the firm when a household picks representation. Alfred, Badu, and Mensah (2015) find reputation is the dominant selection driver in their Kumasi survey. Reputation in that paper is not review count. v1 scores a person unit, not a brand unit. It treats Büro-Bestätigung plus OKF sources as the reputation proxy that an attested file can carry. It does not ingest stars.

**Process and outcome.** Dabholkar and Overby (2006) study service to home sellers. Communication and results are the attributes sellers care about. High activity is not a quality proxy for those sellers. Beck, Scott, and Yelowitz (2022) show that more active listing agents sell faster at lower prices. Listing agents in the most active quintile are associated with an 8 percent lower transaction price and 14 fewer days on market. Shi and Xiao (Journal of Real Estate Research 47(1), 2025; online 2024) find that hiring the same agency that sold the owner the house produces a 1.1 to 1.4 percent return discount against hiring a different agency. v1 does not boost mandate density, listing volume, or repeat-agency relationships.

## Signals

| Role | Signal | v1 field |
| --- | --- | --- |
| ON, scored | Micromarket / spatial concentration | `stadtteile` length in `[1, micromarket_max_stadtteile]` |
| ON, scored | Seller-side specialization | `seller_special` |
| ON, scored | Person, not firm brand | `unit: person` |
| ON, scored | Reputation without review count | human `verified` plus non-empty `sources`, not stale |
| FILTER, not scored | Headcount / boutique scale | `size_band`, `headcount`. Default owner view is boutique (1–5). `factory` is ineligible for a city rank. |
| CAP / shrink | Raw stars and review volume | Absent from the formula. The parser rejects those keys if they appear as weights. |
| OFF | Mandate density as quality | No field. |
| OFF | Repeat-agency boost | No field. |
| OFF | Pay-to-rank | Policy plus no commercial term in the JSON. |
| OFF | Portal listing count | No field. |

`years_in_city` and `independent` stay on the concept as display metadata. They are not score inputs. License years lost to micromarket knowledge in Fang and Hayunga. Independence is not one of the three owner-choice categories.

Do not add rank inputs beyond this table.

## Method

Brokerage MCDM papers often chain DEMATEL (weights from criterion influence) into TOPSIS (distance to an ideal). That chain is offline method work. It is not a fuzzy engine in the site, and it is not a second formula an LLM may invent.

v1 runtime is published SAW: a weighted sum of scores already on `[0, 1]`. The four criteria are binary, so there is no min-max pass at generate time. Weights live in the Attested Computation JSON and are printed on `/` as 25, 20, 25, and 30. Changing a weight is a bundle edit, not a model call.

| Criterion | Weight | Why this share |
| --- | --- | --- |
| Micromarket | 0.25 | Local knowledge is the expertise that moves price. |
| Seller special | 0.20 | Listing-side specialization is the seller-relevant split. |
| Person | 0.25 | The household picks the agent ahead of the firm. |
| Confirmation | 0.30 | Reputation dominates selection, encoded as Büro-Bestätigung and sources, not as a star wall. |

These weights are a product lock informed by the categories above. This repository does not contain a DEMATEL matrix. Do not back-solve one into the site.

TOPSIS is rejected for runtime because it needs an ideal and an anti-ideal as extra state, and because owners cannot read it as one German sentence. SAW is the method that can stay an Attested Computation: one JSON fence, one digest, one ordered list.

Tie-break after the sum: confirmation, then person, then micromarket, then slug. Not years. Not headcount.

## Mapping to the attested JSON

`kind` is `city-ranking-saw-v1`. `method` is `saw`. `src/ranking.ts` is the only executor. Site generation and MCP call that module. They do not carry a second formula.

Hannover DEMO scoring under this lock:

- Lena Harms: three Stadtteile, seller-special, person, confirmed. Sum 1.0.
- Nils Ahlers: one Stadtteil, seller-special, person, confirmed. Sum 1.0. Slug after Lena.
- Mira Vogt: micromarket, seller-special, person, no confirmation. Sum 0.70. Present in the attested list. Hidden on `/hannover/` until the Klein filter is on.
- Factory band: in the corpus, out of the rank.

## References

Fang, L., and Hayunga, D. K. (2024). The impact of real estate agents’ expertise on house prices and TOM. *Real Estate Economics* 52(1), 45–72. First published 2023-12-04. https://doi.org/10.1111/1540-6229.12466

Turnbull, G. K., and Dombrow, J. (2007). Individual agents, firms, and the real estate brokerage process. *Journal of Real Estate Finance and Economics* 35(1), 57–76. https://doi.org/10.1007/s11146-007-9025-y

Johnson, J. M., Nourse, H. O., and Day, E. (1988). Factors related to the selection of a real estate agency or agent. *Journal of Real Estate Research* 3(2), 109–118.

Owusu, A., Badu, A. K., and Mensah, N. O. (2015). Factors influencing real estate agents selection: a survey of real estate customers in Kumasi Metropolis, Ghana. *Journal of Investment and Management* 4(2). https://doi.org/10.11648/j.jim.20150402.12

Dabholkar, P. A., and Overby, J. W. (2006). An investigation of real estate agent service to home sellers. *The Service Industries Journal* 26(5), 557–579. https://doi.org/10.1080/02642060600722882

Beck, J., Scott, F., and Yelowitz, A. (2022). The impact of real estate agent specialization and activity level on market outcomes. *Journal of Housing Research* 31(2), 163–180. https://doi.org/10.1080/10527001.2021.2016340

Shi, S., and Xiao, J. (2025). Agency choice and financial consequences: evidence from the Sydney housing market. *Journal of Real Estate Research* 47(1), 78–102. Online 2024-01-10. https://doi.org/10.1080/08965803.2023.2295136
