---
type: Policy
title: Rangpolitik
description: Was in den Stadtrang eingeht, und was ausdrücklich nicht.
tags: [ranking, policy]
generated: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
verified: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
status: stable
stale_after: 2027-02-25T00:00:00Z
sources:
  - id: product
    resource: https://github.com/Melvinanalytics/maklerindex
    title: Maklerindex repository
    author: human:melvin-voigtlaender
    last_modified: 2026-08-25
---

# Rangpolitik

Der Stadtrang ist nicht käuflich. Keine Anzeige, keine Leadgebühr, kein Pay-for-placement.

## Darf in die Formel

- Büro-Bestätigung: mindestens ein `verified.by` mit Präfix `human:`
- Jahre vor Ort in der Stadt, gedeckelt
- Unabhängigkeit des Büros

## Darf nicht in die Formel

- Headcount und `size_band` (nur Filter; `factory` ist nicht rangfähig)
- Review-Zahl, Inseratezahl, Portal-Sichtbarkeit
- Geld

Die ausführbare Form steht in [Stadtrang](/computations/city-ranking.md).
