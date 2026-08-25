---
type: Reference
title: Executor for city ranking
description: Run instructions for the sanctioned city ranking.
tags: [executor]
generated: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
verified: { by: human:melvin-voigtlaender, at: 2026-08-25T10:00:00Z }
status: stable
stale_after: 2027-02-25T00:00:00Z
---

# Run

`src/ranking.ts` reads the JSON fence in `/computations/city-ranking.md`, filters out `factory`, scores the remaining offices, and returns a receipt. Site generation and MCP both call this module. They do not carry a second formula.
