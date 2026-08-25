---
type: Attested Computation
title: Stadtrang
description: Einzige zulässige Sortierung der Büros in einer Stadt.
tags: [ranking, hannover]
generated: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
verified: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
status: stable
stale_after: 2027-02-25T00:00:00Z
runtime: javascript
parameters:
  - { name: city, type: string, required: true }
executor:
  resource: /references/executors/city-rank.md
  receipt: [city, as_of, formula_digest, ordered_slugs, scores]
attester:
  resource: /references/attesters/city-rank.md
sources:
  - id: ranking-policy
    resource: /policies/ranking.md
    title: Rangpolitik Maklerindex
    author: human:melvin-voigtlaender
    last_modified: 2026-08-25
---

# Computation

Die Laufzeit darf nur den Parameter `city` binden. Gewichte stehen nur in diesem Block.

```json
{
  "kind": "city-ranking-v1",
  "office_confirmation_points": 50,
  "points_per_local_year": 2,
  "local_years_cap": 15,
  "independence_points": 20,
  "ineligible_size_bands": ["factory"]
}
```

# Receipt

`ordered_slugs` ist die Rangliste. Weicht ein Agent davon ab, ist die Ausgabe nicht bezeugt.
