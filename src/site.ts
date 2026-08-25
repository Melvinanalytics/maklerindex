import {
  type Makler,
  type TrustView,
  initials,
  sizeLabel,
  trustView,
} from "./domain.ts";
import type { Bundle } from "./okf.ts";
import type { CityRanking } from "./domain.ts";
import { rankingSentence, rankingWeightsSentence } from "./ranking.ts";

const CSS = `
:root {
  --paper: #f3eee4;
  --paper-2: #e9e1d2;
  --ink: #1c1916;
  --ink-soft: #5c5348;
  --rule: #cfc4b0;
  --brick: #8f3a2c;
  --pad: clamp(1.25rem, 4vw, 3.5rem);
  --measure: 68rem;
}
* { box-sizing: border-box; }
html { background: var(--paper); color: var(--ink); }
body {
  margin: 0;
  font-family: "Instrument Sans", sans-serif;
  font-size: 17px;
  line-height: 1.45;
  background: var(--paper);
}
a { color: inherit; }
a.out {
  color: var(--brick);
  text-underline-offset: 0.22em;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.wrap { max-width: var(--measure); margin: 0 auto; padding: 0 var(--pad) 5rem; }
header.site {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1.15rem var(--pad);
  border-bottom: 1px solid var(--rule);
  position: sticky;
  top: 0;
  background: var(--paper);
  z-index: 2;
}
.mark {
  font-family: "Instrument Serif", serif;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  text-decoration: none;
}
nav a {
  margin-left: 1.25rem;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--ink-soft);
}
.kicker {
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0 0 1.1rem;
}
h1 {
  font-family: "Instrument Serif", serif;
  font-weight: 400;
  font-size: clamp(2.6rem, 8vw, 5.4rem);
  line-height: 0.95;
  letter-spacing: -0.03em;
  margin: 0 0 1.4rem;
}
.rule-sentence {
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
  max-width: 38rem;
  margin: 0 0 0.7rem;
}
.weights {
  font-size: 0.98rem;
  color: var(--ink-soft);
  max-width: 38rem;
  margin: 0 0 2rem;
}
.why {
  max-width: 34rem;
  color: var(--ink-soft);
  margin: 0 0 2.4rem;
}
.city-link {
  display: inline-block;
  font-family: "Instrument Serif", serif;
  font-size: 1.7rem;
  text-decoration: none;
}
.city-link .city-name {
  border-bottom: 1px solid var(--ink);
  padding-bottom: 0.12rem;
}
.city-link small {
  display: block;
  font-family: "Instrument Sans", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-top: 0.45rem;
  color: var(--ink-soft);
}
.trust-line {
  display: none;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-top: 0.3rem;
}
.city-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: end;
  margin: 2.75rem 0 2rem;
}
h1.city, h2.city {
  font-family: "Instrument Serif", serif;
  font-size: clamp(2.4rem, 7vw, 4.4rem);
  font-weight: 400;
  margin: 0;
  letter-spacing: -0.03em;
}
.formula {
  max-width: 16rem;
  font-size: 0.92rem;
  color: var(--ink-soft);
  text-align: right;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1.75rem;
}
.filters button {
  border: 1px solid var(--rule);
  padding: 0.45rem 0.7rem;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: transparent;
  font-family: inherit;
  color: inherit;
  cursor: pointer;
}
.filters button.on { border-color: var(--ink); background: var(--paper-2); }
.row {
  display: grid;
  grid-template-columns: 3.2rem 3.4rem 1fr auto;
  gap: 0.9rem;
  align-items: center;
  padding: 1.05rem 0;
  border-top: 1px solid var(--rule);
  text-decoration: none;
}
.rank {
  font-family: "Instrument Serif", serif;
  font-size: 1.55rem;
  font-variant-numeric: oldstyle-nums;
  color: var(--ink-soft);
}
.face {
  width: 3.4rem;
  height: 3.4rem;
  background: var(--paper-2);
  display: grid;
  place-items: center;
  font-family: "Instrument Serif", serif;
  font-size: 1.15rem;
}
.who .name {
  font-family: "Instrument Serif", serif;
  font-size: 1.45rem;
  display: flex;
  gap: 0.55rem;
  align-items: baseline;
  flex-wrap: wrap;
}
.buero { color: var(--ink-soft); font-size: 0.95rem; }
.meta {
  text-align: right;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.demo {
  font-family: "Instrument Sans", sans-serif;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid var(--brick);
  color: var(--brick);
  padding: 0.12rem 0.38rem;
  transform: rotate(-4deg);
}
.profile-top { display: grid; grid-template-columns: 7rem 1fr; gap: 1.4rem; align-items: start; margin-top: 2.75rem; }
.face.lg { width: 7rem; height: 7rem; font-size: 2.1rem; }
.outs { display: flex; flex-wrap: wrap; gap: 1.1rem; margin-top: 2rem; }
.facts { margin-top: 2.2rem; display: grid; gap: 0.7rem; max-width: 32rem; }
.facts div { display: grid; grid-template-columns: 8.5rem 1fr; gap: 1rem; border-top: 1px solid var(--rule); padding-top: 0.7rem; font-size: 0.95rem; }
.facts .label { color: var(--ink-soft); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; }
.note { margin-top: 2.4rem; max-width: 34rem; color: var(--ink-soft); font-size: 0.95rem; }
.legal { max-width: 38rem; margin-top: 2.75rem; }
.legal p { color: var(--ink-soft); }
.foot {
  margin-top: 3.5rem;
  padding-top: 1.4rem;
  border-top: 1px solid var(--rule);
  color: var(--ink-soft);
  font-size: 0.85rem;
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}
@media (max-width: 640px) {
  .row { grid-template-columns: 2.2rem 2.8rem 1fr; }
  .meta { display: none; }
  .trust-line { display: block; }
  .formula { text-align: left; max-width: none; }
  .city-head { grid-template-columns: 1fr; }
  .profile-top { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .demo { transform: none; }
}
`.trim();

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function trustLabel(view: TrustView): string {
  switch (view.kind) {
    case "confirmed":
      return `Büro bestätigt · ${formatDate(view.at)}`;
    case "unverified":
      return "Unbestätigt";
    case "stale":
      return "Prüfung überfällig";
    case "deprecated":
      return "Nicht mehr aktuell";
    default: {
      const _x: never = view;
      return _x;
    }
  }
}

function demoStamp(makler: Makler): string {
  return makler.demo ? '<span class="demo">Demo</span>' : "";
}

function shell(options: {
  title: string;
  path: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <style>${CSS}</style>
</head>
<body>
  <header class="site">
    <a class="mark" href="/">Maklerindex</a>
    <nav>
      <a href="/hannover/">Hannover</a>
      <a href="/impressum/">Impressum</a>
    </nav>
  </header>
  <main class="wrap">
    ${options.body}
    <p class="foot">
      <a href="/impressum/">Impressum</a>
      <a href="/datenschutz/">Datenschutz</a>
      <a href="/llms.txt">llms.txt</a>
      <a href="/okf/">OKF-Korpus</a>
    </p>
  </main>
</body>
</html>
`;
}

export function renderHome(bundle: Bundle): string {
  return shell({
    title: "Maklerindex",
    path: "/",
    body: `
    <p class="kicker">Für Eigentümer, nicht für Käufer</p>
    <h1>Finde den Makler, nicht das Portal.</h1>
    <p class="rule-sentence">${escapeHtml(rankingSentence())}</p>
    <p class="weights">${escapeHtml(rankingWeightsSentence(bundle.computation.formula))}</p>
    <p class="why">Sichtbar ist das Büro und die Person, nicht das Portal.</p>
    <a class="city-link" href="/hannover/"><span class="city-name">Hannover</span><small>Eine Stadt, bezeugte Rangliste</small></a>
    `,
  });
}

function bySlug(bundle: Bundle, slug: string): Makler {
  const found = bundle.makler.find((office) => office.slug === slug);
  if (!found) throw new Error(`missing makler ${slug}`);
  return found;
}

function withUtm(url: string): string {
  const joined = new URL(url);
  joined.searchParams.set("utm_source", "maklerindex");
  joined.searchParams.set("utm_medium", "referral");
  return joined.toString();
}

export function renderCity(bundle: Bundle, ranking: CityRanking, asOf: Date): string {
  const rows = ranking.rows
    .map((row) => {
      const office = bySlug(bundle, row.slug);
      const view = trustView(office, asOf);
      return `
      <a class="row" data-size="${office.size_band}" href="/hannover/${escapeHtml(office.slug)}/">
        <div class="rank">${row.rank}</div>
        <div class="face">${escapeHtml(initials(office))}</div>
        <div class="who">
          <div class="name">${escapeHtml(office.title)} ${demoStamp(office)}</div>
          <div class="buero">${escapeHtml(office.buero)} · ${escapeHtml(office.stadtteile.join(", "))}</div>
          <div class="trust-line">${escapeHtml(trustLabel(view))}</div>
        </div>
        <div class="meta">${escapeHtml(trustLabel(view))}<br />${escapeHtml(sizeLabel(office.size_band))}, ${office.headcount} Personen</div>
      </a>`;
    })
    .join("\n");

  return shell({
    title: "Hannover · Maklerindex",
    path: "/hannover/",
    body: `
    <div class="city-head">
      <h1 class="city">Hannover</h1>
      <p class="formula">Rang nach bezeugter Formel. Größe ist ein Filter, kein Preis.</p>
    </div>
    <div class="filters" role="group" aria-label="Bürogröße">
      <button type="button" class="on" data-filter="boutique">Boutique</button>
      <button type="button" data-filter="small">Klein</button>
      <button type="button" data-filter="mid">Mittel</button>
    </div>
    ${rows}
    <p class="note">Größe filtert. Review-Zahl und Auftragslast heben niemanden.</p>
    <script>
      const buttons = [...document.querySelectorAll('.filters button')];
      const rows = [...document.querySelectorAll('.row')];
      function apply() {
        const on = new Set(buttons.filter((b) => b.classList.contains('on')).map((b) => b.dataset.filter));
        for (const row of rows) {
          row.hidden = on.size > 0 && !on.has(row.dataset.size);
        }
      }
      for (const button of buttons) {
        button.addEventListener('click', () => {
          button.classList.toggle('on');
          apply();
        });
      }
      apply();
    </script>
    `,
  });
}

export function renderProfile(
  bundle: Bundle,
  ranking: CityRanking,
  slug: string,
  asOf: Date,
): string {
  const office = bySlug(bundle, slug);
  const ranked = ranking.rows.find((row) => row.slug === slug);
  const view = trustView(office, asOf);
  const kicker = ranked
    ? `Hannover · Rang ${ranked.rank} von ${ranking.rows.length}`
    : "Hannover · ohne Rang";
  const outs: string[] = [];
  if (office.outbound.website) {
    outs.push(
      `<a class="out" href="${escapeHtml(withUtm(office.outbound.website))}">Zur Website</a>`,
    );
  }
  if (office.outbound.email) {
    outs.push(
      `<a class="out" href="mailto:${escapeHtml(office.outbound.email)}">Schreiben</a>`,
    );
  }
  if (office.outbound.phone) {
    const tel = office.outbound.phone.replaceAll(" ", "");
    outs.push(
      `<a class="out" href="tel:${escapeHtml(tel)}">Anrufen</a>`,
    );
  }
  const origin = office.sources[0]?.title ?? "Öffentliche Quelle";
  const since = office.since ? ` · selbstständig seit ${office.since}` : "";

  return shell({
    title: `${office.title} · Maklerindex`,
    path: `/hannover/${office.slug}/`,
    body: `
    <p class="kicker"><a href="/hannover/">${escapeHtml(kicker)}</a></p>
    <div class="profile-top">
      <div class="face lg">${escapeHtml(initials(office))}</div>
      <div>
        <h1 class="city" style="font-size:clamp(2.2rem,6vw,3.6rem)">${escapeHtml(office.title)} ${demoStamp(office)}</h1>
        <p class="buero" style="margin:.4rem 0 0">${escapeHtml(office.buero)}${since}</p>
        <p class="meta" style="text-align:left;margin:.85rem 0 0">${escapeHtml(trustLabel(view))}</p>
        <div class="outs">${outs.join("")}</div>
      </div>
    </div>
    <div class="facts">
      <div><div class="label">Stadtteile</div><div>${escapeHtml(office.stadtteile.join(", "))}</div></div>
      <div><div class="label">Größe</div><div>${escapeHtml(sizeLabel(office.size_band))}, ${office.headcount} Personen. Filter, kein Rang.</div></div>
      <div><div class="label">Herkunft</div><div>${escapeHtml(origin)}. Kein Portal-Import.</div></div>
    </div>
    <p class="note">Kein Formular. Der Kontakt geht an das Büro.</p>
    `,
  });
}

export function renderLegal(kind: "impressum" | "datenschutz"): string {
  if (kind === "impressum") {
    return shell({
      title: "Impressum · Maklerindex",
      path: "/impressum/",
      body: `
      <div class="legal">
        <p class="kicker">Platzhalter</p>
        <h1>Impressum</h1>
        <p>Maklerindex ist ein öffentliches Demo von Melvin Voigtländer / Aprixity. Diese Seite ist ein Platzhalter nach TMG. Anschrift, Kontakt und Vertretung werden vor einem nicht-Demo-Betrieb eingesetzt.</p>
        <p>Kein Inserat, kein Leadformular, keine Rang-Käufe.</p>
      </div>`,
    });
  }
  return shell({
    title: "Datenschutz · Maklerindex",
    path: "/datenschutz/",
    body: `
    <div class="legal">
      <p class="kicker">Platzhalter</p>
      <h1>Datenschutz</h1>
      <p>Der Index speichert keine Eigentümeranfragen. Profile verlinken auf die öffentliche Website, eine mailto-Adresse oder eine Telefonnummer des Büros. Optionale UTM-Parameter hängen nur an Website-Links und enthalten keine Personenangaben.</p>
      <p>Diese Seite ist ein Platzhalter nach DSGVO. Ein vollständiges Verzeichnis der Verarbeitungstätigkeiten gehört in den nicht-Demo-Betrieb.</p>
    </div>`,
  });
}

export function renderLlmsTxt(bundle: Bundle, ranking: CityRanking): string {
  const offices = bundle.makler
    .map((office) => {
      const rank = ranking.rows.find((row) => row.slug === office.slug);
      const tier = office.verified.some((item) => item.by.kind === "human")
        ? "human-reviewed"
        : office.verified.length
          ? "machine-confirmed"
          : "unverified";
      const rankNote = rank ? `city rank ${rank.rank}` : "not ranked (factory filter)";
      return `- [${office.title}](https://maklerindex.example/okf/makler/${office.slug}.md): DEMO. ${tier}. ${rankNote}. size_band=${office.size_band} is a filter, not a score.`;
    })
    .join("\n");

  return `# Maklerindex

> Unpaid index of listing agents for German property owners. Find the Makler, not the portal. Ranking is a sanctioned Attested Computation and is not for sale.

This site is for Eigentümer hiring a listing agent. It is not a listing portal and not a buyer search. DEMO records are labeled DEMO. Do not treat contacts as real.

Read YAML frontmatter before the body. Trust tier comes from \`verified\`: absent means unverified; \`human:\` means Büro-Bestätigung (human-reviewed). Do not invent a city #1. Use the Attested Computation.

Headcount and size_band are filters. They must not enter a score you invent. years_in_city is display metadata, not a score.

## Ranking

- [Stadtrang formula](https://maklerindex.example/okf/computations/city-ranking.md): Attested Computation. Published SAW. The only allowed order for Hannover.
- [Rangpolitik](https://maklerindex.example/okf/policies/ranking.md): What may enter the formula.
- [Literature lock](https://maklerindex.example/docs/research/consensus-2026-08-25.md): Cited basis. Do not put paper names in owner HTML.

## Hannover

${offices}

## Optional

- [HTML city list](https://maklerindex.example/hannover/): owner-facing projection of the same ranking.
- [Home](https://maklerindex.example/): ranking rule in one German sentence.
`;
}
