---
type: Reference
title: Attester for city ranking
description: Deterministic check that a ranking receipt matches the sanctioned formula.
tags: [attester]
generated: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
verified: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
status: stable
stale_after: 2027-02-25T00:00:00Z
---

# Check

Re-run `src/ranking.ts` on the same city and the same `as_of`. Compare `formula_digest`, `ordered_slugs`, and `scores`. Any difference is a failed verdict. This check is code, not an LLM.
