# Visual spec

Locked look for Maklerindex v1. The site is a projection of the OKF bundle. This file is the design contract for that projection.

## Winner

Still v4. Dark ground, cinematic DEMO portraits, type sitting in the photograph. Rank as a quiet outline numeral. Contact as plain text. No chips, no pills, no outline buttons.

Bogen (cream paper, Instrument Serif, filter chips) is no longer the owner surface.

## Who this is for

A German Eigentümer who will hire a listing agent. The person is the unit. Rank is visible and not a product.

## Tokens

- `--ground`: `#070708`
- `--ink`: `#f4f1ea`
- `--ink-dim`: `rgba(244, 241, 234, 0.62)`
- `--ink-mute`: `rgba(244, 241, 234, 0.38)`
- `--bronze`: `#c4a574`
- `--bronze-quiet`: `rgba(196, 165, 116, 0.38)`
- `--pad`: `clamp(1.1rem, 3.2vw, 2.4rem)`

Type: Outfit, 300–700. Not Inter. Not Instrument Serif.

Header: 0.72rem, uppercase, letter-spacing `0.22em`.

Home headline: `clamp(2.05rem, 5.2vw, 4.4rem)`, two lines, line-height 0.95, tracking tight.

City name: `clamp(3rem, 10vw, 7.5rem)`.

Overprint rank: `min(42vw, 22rem)`, weight 300, fill `rgba(196, 165, 116, 0.18)`. City still numerals: transparent fill, 1px bronze stroke.

Radius: 0. No pills. No shadow. No glass. No neon. No WebGL.

Motion: none beyond underline offset on text links. Honor `prefers-reduced-motion`.

## Portraits

DEMO only. Seven synthetic faces in `design/portraits/`: katharina-brandt, jonas-ehlers, miriam-osei, henrik-baumann, leyla-aydin, tobias-frenzel, sofie-berger. Label them fictional. Do not scrape real Makler photos. Real portraits later only after claim.

Alt text states the face is synthetic and not a real person.

## Three screens

### Home `/`

Full-bleed photograph of rank 01. Header: MAKLERINDEX left, HANNOVER right.

Lower left, in the picture:

- Headline: Finde den Makler, nicht das Portal.
- One sentence: Platz 01 bekommt, wer im Stadtteil nachweislich verkauft. Nicht, wer dem Portal am meisten zahlt. Das ist die ganze Regel.
- Text link, bronze, not a button: HANNOVER ANSEHEN →

Huge quiet `01` overprinted on the right. Tiny caption: Demo-Daten · alle Personen fiktiv.

### City `/hannover`

Dark contact sheet. Header as on home.

Kicker: N PORTRÄTS · GEORDNET NACH VIER VERÖFFENTLICHTEN KRITERIEN · STAND: date.

Huge title: Hannover.

Row of overlapping stills, thin dashed bronze-quiet edge, outline rank numerals. Factory-scale offices stay out of this sheet. No filter buttons.

### Profile `/hannover/<slug>`

Full-bleed portrait. Header as on home.

Lower left:

- HANNOVER · RANG 01 VON 03
- Name, large
- Traits as plain text: Mikromarkt · Verkäuferseite · unabhängig · Büro bestätigt
- Contact: hostname underlined · Schreiben · Anrufen. No chips.

Huge quiet rank overprinted. Tiny caption: Demo-Daten · alle Personen fiktiv. Kein Formular. Der Kontakt geht an das Büro.

Unranked factory profiles: dark ground, no synthetic face, no overprint.

## Trust in the UI

Owners see German, not OKF actor strings.

- `human:` verified becomes Büro bestätigt
- no `verified` becomes Unbestätigt
- `human:` ids stay in YAML and `llms.txt`

## Not allowed

- Inter, Geist, Roboto as the voice of the site
- Bogen paper, filter chips, DEMO stamp as a rotated badge
- Tailwind marketing layout, shadcn, purple AI-SaaS
- Lead overlay, form, ads on rank
- Real faces for DEMO records
- Glass, neon, WebGL, drop shadow, 12px radius cards
- Emoji

## Mobile

Home and profile stay full-bleed. Type sits in the lower third. City stills scroll sideways. Outbound text links at least 44px high.
