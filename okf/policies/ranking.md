---
type: Policy
title: Rangpolitik
description: Was in den Stadtrang eingeht, und was ausdrücklich nicht.
tags: [ranking, policy]
generated: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
verified: { by: human:melvin-voigtlaender, at: 2026-08-25T11:30:00Z }
status: stable
stale_after: 2027-02-25T00:00:00Z
sources:
  - id: product
    resource: https://github.com/Melvinanalytics/maklerindex
    title: Maklerindex repository
    author: human:melvin-voigtlaender
    last_modified: 2026-08-25
  - id: ranking-spec
    resource: /docs/specs/02-ranking.md
    title: Ranking spec
    last_modified: 2026-08-25
  - id: consensus-2026-08-25
    resource: /docs/research/consensus-2026-08-25.md
    title: Literature lock for city ranking (Consensus 2026-08-25)
    author: human:melvin-voigtlaender
    last_modified: 2026-08-25
---

# Rangpolitik

Der Stadtrang ist nicht käuflich. Keine Anzeige, keine Leadgebühr, kein Pay-for-placement.

Die gesperrte Spezifikation steht in `docs/specs/02-ranking.md`. Die begründende Literatur steht in `docs/research/consensus-2026-08-25.md`. Auf `/` stehen nur die Summe und die Gewichte.

## Darf in die Formel

- Ortskenntnis als enger micromarket (`stadtteile`, gedeckelt)
- Verkaufsspezialisierung (`seller_special`)
- Person statt Firmenmarke (`unit: person`)
- Büro-Bestätigung plus OKF-Quellen (`verified` mit `human:`, nicht stale)

## Filter, kein Rang

- Headcount und `size_band`. Boutique ist die Voreinstellung der Stadtansicht. `factory` ist nicht rangfähig.

## Darf nicht in die Formel

- Review-Zahl, Sterne, Auftragslast, Wiederholungsmandat, Inseratezahl, Portal-Sichtbarkeit
- Lizenzjahre und `years_in_city` als Punkte
- Geld

Die ausführbare Form steht in [Stadtrang](/computations/city-ranking.md).
