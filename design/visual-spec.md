# Visual spec

Locked look for Maklerindex v1. The site is a projection of the OKF bundle. This file is the design contract for that projection.

## Winner

Bogen. Paper, serif names, brick DEMO stamp, ranked rows of people.

Sketches that lost:

- Raster (mono, yellow, hard offset buttons). Reads as a Hotelist clone and as a developer tool. Owners hiring a Büro do not live in that room.
- Stein (museum labels, copper hairlines). Calm, but the person disappears. Ranked rows need a face-sized mark and a Büro line, not a catalog caption.

Keep from Stein: more air on `/`, hairline rules, no yellow. Keep from Raster: nothing on the owner surface.

Hypothesis check: Hotelist energy is city URL, unpaid rank, independent discovery. That stays. The hotel grid, score badge, map, and monospace chrome do not.

## Who this is for

A German Eigentümer who will hire a listing agent. Calm, local, editorial. The person and the Büro are the unit. Rank is visible and not a product.

## Tokens

- `--paper`: `#f3eee4` (page)
- `--paper-2`: `#e9e1d2` (initials field, selected filter)
- `--ink`: `#1c1916` (text)
- `--ink-soft`: `#5c5348` (meta, Büro line)
- `--rule`: `#cfc4b0` (hairlines)
- `--brick`: `#8f3a2c` (DEMO stamp, outbound links only)
- `--pad`: `clamp(1.25rem, 4vw, 3.5rem)`
- `--measure`: `68rem`

Type:

- Display and names: Instrument Serif, 400.
- UI, meta, filters: Instrument Sans, 400 and 500.
- Rank numerals: Instrument Serif.
- Root size: 17px. Line height: 1.45.
- Home headline: `clamp(2.6rem, 8vw, 5.4rem)`, line-height 0.95, tracking `-0.03em`.
- City name: `clamp(2.4rem, 7vw, 4.4rem)`.
- Kickers: 0.72rem, uppercase, letter-spacing `0.16em`.

Space: stack in 0.5 / 1 / 1.4 / 2 / 2.75 / 3.5rem. A ranked row is 1.05rem vertical padding. Do not pack cards.

Motion: underline offset on outbound links. Filter chip background change. No page fade, no card lift, no parallax. Honor `prefers-reduced-motion`.

Radius: 0. No pills.

Shadow: none.

## Three screens

### Home `/`

Kicker: Für Eigentümer, nicht für Käufer.

Headline: Finde den Makler, nicht das Portal.

Ranking rule, one sentence, immediately under the headline:

Der Rang in einer Stadt folgt einer festen Formel. Er ist nicht käuflich, und die Bürogröße zählt nicht mit.

Why, one short paragraph, softer ink. Then one city link: Hannover. Subline: Eine Stadt, bezeugte Rangliste.

No search box. No listing teaser. No "Jetzt bewerten".

### City `/hannover`

City name as the title. Beside it, or under it on small screens: Rang nach bezeugter Formel. Größe ist ein Filter, kein Preis.

Filters: Boutique, Klein, Mittel. Default: all three on. Factory-scale offices are in the corpus and out of the ranked list.

Each row, in order: rank numeral, initials field, name plus DEMO stamp, Büro and Stadtteile, then trust plus size as quiet meta. The row is a person. It is not an Inserat.

Büro bestätigt is typeset meta, not a green badge. Unbestätigt is equally typeset. Headcount may appear as Boutique, 4 Personen. It must be visually quieter than the name.

### Profile `/hannover/<slug>`

Breadcrumb: Hannover, Rang n von m (or ohne Rang if the office is not ranked).

Large initials, name, DEMO stamp, Büro line, then Büro bestätigt and the date when human-reviewed.

Outbound only: Zur Website, Schreiben, Anrufen. Brick color. No form. A line under the facts: Kein Formular. Der Kontakt geht an das Büro.

Facts: Stadtteile, Größe as filter, Herkunft from sources.

## Trust in the UI

Owners see German, not OKF actor strings.

- `verified` contains `human:` becomes Büro bestätigt plus date
- no `verified` becomes Unbestätigt
- `status: deprecated` becomes Nicht mehr aktuell
- past `stale_after` becomes Prüfung überfällig
- demo field becomes a DEMO stamp on every surface

`generated.by` and `human:` ids stay in the markdown and in `llms.txt`. They do not appear on owner HTML.

## Not allowed

- Inter, Geist, Roboto, system-ui as the voice of the site
- Tailwind marketing layout, shadcn dashboard, purple or violet AI-SaaS
- Listing photo grid, map of objects, ImmoPunkte, star walls, review-count trophies
- Lead overlay, chat widget, "Kostenlos bewerten", SEM landing blocks
- Headcount as a large KPI
- Rank as a medal, ribbon, or buyable badge
- Real faces for DEMO records. Initials on paper-2 only
- Emoji
- Gradient, glass, drop shadow, 12px radius cards

## Mobile

Single column from 0 to 640px. Rank, initials, and name stack. Right-hand meta hides. Filters wrap. Sticky header stays. Tap targets on outbound links at least 44px high.
