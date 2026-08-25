---
type: Attested Computation
title: Stadtrang
description: Einzige zulässige Sortierung der Büros in einer Stadt. Veröffentlichtes SAW.
tags: [ranking, hannover]
generated: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
verified: { by: human:melvin-voigtlaender, at: 2026-08-25T11:30:00Z }
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
  - id: consensus-2026-08-25
    resource: /docs/research/consensus-2026-08-25.md
    title: Literature lock for city ranking (Consensus 2026-08-25)
    author: human:melvin-voigtlaender
    last_modified: 2026-08-25
---

# Computation

Die Laufzeit darf nur den Parameter `city` binden. Methode ist SAW, gewichtete Summe von Werten auf `[0, 1]`. Gewichte stehen nur in diesem Block. Die Literatur dazu liegt in `docs/research/consensus-2026-08-25.md`, nicht in der HTML-Oberfläche.

Kriterien, bereits binär:

- `micromarket`: 1, wenn die Zahl der Stadtteile zwischen 1 und `micromarket_max_stadtteile` liegt
- `seller_special`: 1, wenn `seller_special: true`
- `person`: 1, wenn `unit: person`
- `confirmation`: 1, wenn human-reviewed, nicht stale, und `sources` nicht leer sind

```json
{
  "kind": "city-ranking-saw-v1",
  "method": "saw",
  "weights": {
    "micromarket": 0.25,
    "seller_special": 0.20,
    "person": 0.25,
    "confirmation": 0.30
  },
  "micromarket_max_stadtteile": 3,
  "ineligible_size_bands": ["factory"],
  "forbidden_terms": ["review_volume", "stars", "mandate_density", "repeat_agency", "pay_to_rank", "listing_count", "license_years", "headcount"]
}
```

# Receipt

`ordered_slugs` ist die Rangliste. Weicht ein Agent davon ab, ist die Ausgabe nicht bezeugt.
