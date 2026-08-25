import {
  type Makler,
  type TrustView,
  initials,
  trustView,
} from "./domain.ts";
import type { Bundle } from "./okf.ts";
import type { CityRanking } from "./domain.ts";
import {
  type SiteOptions,
  publicUrl,
  withBase,
} from "./paths.ts";

const DEMO_PORTRAITS = new Set(["lena-harms", "nils-ahlers", "mira-vogt"]);

const CSS = `
:root {
  --ground: #070708;
  --ink: #f4f1ea;
  --ink-dim: rgba(244, 241, 234, 0.62);
  --ink-mute: rgba(244, 241, 234, 0.38);
  --bronze: #c4a574;
  --bronze-quiet: rgba(196, 165, 116, 0.38);
  --pad: clamp(1.1rem, 3.2vw, 2.4rem);
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100%;
  background: var(--ground);
  color: var(--ink);
  font-family: Outfit, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.4;
}
a { color: inherit; text-decoration: none; }
a.link {
  color: var(--bronze);
  text-underline-offset: 0.22em;
  text-decoration: underline;
  text-decoration-thickness: 1px;
}
a.plain { color: inherit; }
a.plain:hover, a.link:hover { color: var(--bronze); }
header.site {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  padding: 1.15rem var(--pad);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
header.site a { min-height: 44px; display: inline-flex; align-items: center; }
.bleed {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--ground);
}
.bleed img.ground {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 35% 20%;
}
.bleed .shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(7,7,8,0.28) 0%, rgba(7,7,8,0.05) 42%, rgba(7,7,8,0.45) 100%),
    linear-gradient(180deg, rgba(7,7,8,0.2) 0%, rgba(7,7,8,0.08) 38%, rgba(7,7,8,0.72) 100%);
}
.overprint {
  position: absolute;
  right: -0.06em;
  bottom: -0.22em;
  margin: 0;
  font-size: min(42vw, 22rem);
  font-weight: 300;
  line-height: 0.75;
  color: rgba(196, 165, 116, 0.18);
  pointer-events: none;
  user-select: none;
}
.copy {
  position: absolute;
  left: var(--pad);
  bottom: 4.8rem;
  z-index: 2;
  max-width: min(38rem, 86vw);
}
h1.lead {
  margin: 0 0 1.1rem;
  font-size: clamp(2.4rem, 7vw, 5.2rem);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.03em;
}
.one-sentence {
  margin: 0 0 1.35rem;
  max-width: 28rem;
  font-size: clamp(0.95rem, 1.7vw, 1.12rem);
  font-weight: 400;
  color: var(--ink);
}
.see {
  color: var(--bronze);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 500;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.caption {
  margin: 1.2rem 0 0;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.city-page { min-height: 100vh; padding: 5.2rem 0 3rem; }
.city-kicker {
  margin: 0 0 0.7rem;
  padding: 0 var(--pad);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
h1.city-title {
  margin: 0 0 2.4rem;
  padding: 0 var(--pad);
  font-size: clamp(3rem, 10vw, 7.5rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.9;
}
.sheet {
  display: flex;
  align-items: flex-end;
  gap: 0;
  padding: 0 var(--pad) 2rem;
  overflow-x: auto;
}
.still {
  position: relative;
  flex: 0 0 auto;
  width: min(28vw, 260px);
  aspect-ratio: 3 / 4;
  margin-left: -2.4vw;
  outline: 1px dashed var(--bronze-quiet);
  overflow: hidden;
  background: #111;
}
.still:first-child { margin-left: 0; z-index: 3; }
.still:nth-child(2) { z-index: 2; }
.still:nth-child(3) { z-index: 1; }
.still img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
  display: block;
}
.still .num {
  position: absolute;
  top: 0.45rem;
  right: 0.55rem;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 300;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px var(--bronze);
}
.still .who {
  position: absolute;
  left: 0.55rem;
  bottom: 0.5rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.still .who.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
.rank-line {
  margin: 0 0 0.55rem;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
h1.person {
  margin: 0 0 0.7rem;
  font-size: clamp(2.4rem, 6vw, 4.4rem);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.03em;
}
.traits {
  margin: 0 0 1.1rem;
  font-size: 0.92rem;
  color: var(--ink-dim);
}
.contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.2rem;
  font-size: 0.95rem;
}
.contacts a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.contacts .sep { color: var(--ink-mute); padding: 0 0.35rem; }
.legal-page {
  min-height: 100vh;
  padding: 6rem var(--pad) 4rem;
  max-width: 40rem;
}
.legal-page h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 600;
  margin: 0 0 1.2rem;
}
.legal-page p { color: var(--ink-dim); }
.foot {
  position: absolute;
  left: var(--pad);
  bottom: 1rem;
  z-index: 3;
  display: flex;
  gap: 1rem;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.foot a { min-height: 36px; display: inline-flex; align-items: center; }
.foot.in-flow { position: static; margin: 2rem var(--pad) 0; }
@media (max-width: 640px) {
  .still { width: min(62vw, 240px); margin-left: -8vw; }
  .overprint { font-size: 58vw; right: -0.12em; }
  .copy { bottom: 5.5rem; }
  .bleed img.ground { object-position: 42% 18%; }
}
@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto; }
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

function padRank(value: number): string {
  return String(value).padStart(2, "0");
}

function countWord(value: number): string {
  const words = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben"];
  return words[value] ?? String(value);
}

function portraitSrc(site: SiteOptions, slug: string): string | undefined {
  if (!DEMO_PORTRAITS.has(slug)) return undefined;
  return href(site, `/media/${slug}.jpg`);
}

function href(site: SiteOptions, route: string): string {
  return withBase(site.basePath, route);
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function trustPhrase(view: TrustView): string | undefined {
  switch (view.kind) {
    case "confirmed":
      return "Büro bestätigt";
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

function traitLine(office: Makler, view: TrustView): string {
  const bits: string[] = [];
  if (office.stadtteile.length) {
    bits.push(`Mikromarkt ${office.stadtteile.join(" & ")}`);
  }
  if (office.seller_special) bits.push("Verkäuferseite");
  if (office.independent) bits.push("unabhängig");
  const trust = trustPhrase(view);
  if (trust) bits.push(trust);
  return bits.join(" · ");
}

function withUtm(url: string): string {
  const joined = new URL(url);
  joined.searchParams.set("utm_source", "maklerindex");
  joined.searchParams.set("utm_medium", "referral");
  return joined.toString();
}

function contacts(office: Makler): string {
  const parts: string[] = [];
  if (office.outbound.website) {
    parts.push(
      `<a class="link" href="${escapeHtml(withUtm(office.outbound.website))}">${escapeHtml(hostLabel(office.outbound.website))}</a>`,
    );
  }
  if (office.outbound.email) {
    parts.push(
      `<a class="plain" href="mailto:${escapeHtml(office.outbound.email)}">Schreiben</a>`,
    );
  }
  if (office.outbound.phone) {
    const tel = office.outbound.phone.replaceAll(" ", "");
    parts.push(`<a class="plain" href="tel:${escapeHtml(tel)}">Anrufen</a>`);
  }
  return parts.join('<span class="sep"> · </span>');
}

function shell(options: {
  title: string;
  site: SiteOptions;
  body: string;
  footerClass?: string;
}): string {
  const to = (route: string) => href(options.site, route);
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>${CSS}</style>
</head>
<body>
  <header class="site">
    <a href="${to("/")}">Maklerindex</a>
    <a href="${to("/hannover/")}">Hannover</a>
  </header>
  ${options.body}
  <p class="foot${options.footerClass ? ` ${options.footerClass}` : ""}">
    <a href="${to("/impressum/")}">Impressum</a>
    <a href="${to("/datenschutz/")}">Datenschutz</a>
    <a href="${to("/llms.txt")}">llms.txt</a>
  </p>
</body>
</html>
`;
}

export function homeLead(): string {
  return "Platz 01 bekommt, wer im Stadtteil nachweislich verkauft. Nicht, wer dem Portal am meisten zahlt. Das ist die ganze Regel.";
}

export function renderHome(
  bundle: Bundle,
  ranking: CityRanking,
  site: SiteOptions,
): string {
  const first = ranking.rows[0];
  const lead = first
    ? bundle.makler.find((office) => office.slug === first.slug)
    : undefined;
  const photo = first ? portraitSrc(site, first.slug) : undefined;
  const alt = lead
    ? `Synthetisches DEMO-Porträt von ${lead.title}. Keine reale Person.`
    : "Synthetisches DEMO-Porträt. Keine reale Person.";
  return shell({
    title: "Maklerindex",
    site,
    body: `
    <div class="bleed">
      ${
        photo
          ? `<img class="ground" src="${escapeHtml(photo)}" alt="${escapeHtml(alt)}" width="1024" height="1536" />`
          : ""
      }
      <div class="shade"></div>
      <p class="overprint" aria-hidden="true">${first ? padRank(first.rank) : "01"}</p>
      <div class="copy">
        <h1 class="lead">Finde den Makler,<br />nicht das Portal.</h1>
        <p class="one-sentence">${escapeHtml(homeLead())}</p>
        <a class="see" href="${href(site, "/hannover/")}">Hannover ansehen →</a>
        <p class="caption">Demo-Daten · alle Personen fiktiv</p>
      </div>
    </div>`,
  });
}

function bySlug(bundle: Bundle, slug: string): Makler {
  const found = bundle.makler.find((office) => office.slug === slug);
  if (!found) throw new Error(`missing makler ${slug}`);
  return found;
}

export function renderCity(
  bundle: Bundle,
  ranking: CityRanking,
  asOf: Date,
  site: SiteOptions,
): string {
  const stills = ranking.rows
    .map((row) => {
      const office = bySlug(bundle, row.slug);
      const photo = portraitSrc(site, office.slug);
      const alt = `Synthetisches DEMO-Porträt von ${office.title}. Keine reale Person.`;
      return `
      <a class="still" href="${href(site, `/hannover/${office.slug}/`)}" aria-label="${escapeHtml(`${padRank(row.rank)} ${office.title}`)}">
        ${
          photo
            ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(alt)}" width="1024" height="1536" />`
            : `<div class="who">${escapeHtml(initials(office))}</div>`
        }
        <span class="num">${padRank(row.rank)}</span>
        <span class="who sr">${escapeHtml(office.title)}</span>
      </a>`;
    })
    .join("\n");

  const n = ranking.rows.length;
  const kicker = `${countWord(n)} Porträts · geordnet nach vier veröffentlichten Kriterien · Stand: ${formatDate(asOf.toISOString())}`;

  return shell({
    title: "Hannover · Maklerindex",
    site,
    footerClass: "in-flow",
    body: `
    <main class="city-page">
      <p class="city-kicker">${escapeHtml(kicker)}</p>
      <h1 class="city-title">Hannover</h1>
      <div class="sheet">${stills}</div>
      <p class="caption" style="padding:0 var(--pad)">Demo-Daten · alle Personen fiktiv</p>
    </main>`,
  });
}

export function renderProfile(
  bundle: Bundle,
  ranking: CityRanking,
  slug: string,
  asOf: Date,
  site: SiteOptions,
): string {
  const office = bySlug(bundle, slug);
  const ranked = ranking.rows.find((row) => row.slug === slug);
  const view = trustView(office, asOf);
  const photo = portraitSrc(site, office.slug);
  const kicker = ranked
    ? `Hannover · Rang ${padRank(ranked.rank)} von ${padRank(ranking.rows.length)}`
    : "Hannover · ohne Rang";
  const overprint = ranked
    ? `<p class="overprint" aria-hidden="true">${padRank(ranked.rank)}</p>`
    : "";
  const photoTag = photo
    ? `<img class="ground" src="${escapeHtml(photo)}" alt="${escapeHtml(`Synthetisches DEMO-Porträt von ${office.title}. Keine reale Person.`)}" width="1024" height="1536" />`
    : "";

  return shell({
    title: `${office.title} · Maklerindex`,
    site,
    body: `
    <div class="bleed">
      ${photoTag}
      <div class="shade"></div>
      ${overprint}
      <div class="copy">
        <p class="rank-line"><a href="${href(site, "/hannover/")}">${escapeHtml(kicker)}</a></p>
        <h1 class="person">${escapeHtml(office.title)}</h1>
        <p class="traits">${escapeHtml(traitLine(office, view))}</p>
        <div class="contacts">${contacts(office)}</div>
        <p class="caption">Demo-Daten · alle Personen fiktiv · kein Formular</p>
      </div>
    </div>`,
  });
}

export function renderLegal(
  kind: "impressum" | "datenschutz",
  site: SiteOptions,
): string {
  if (kind === "impressum") {
    return shell({
      title: "Impressum · Maklerindex",
      site,
      footerClass: "in-flow",
      body: `
      <main class="legal-page">
        <h1>Impressum</h1>
        <p>Maklerindex ist ein öffentliches Demo von Melvin Voigtländer / Aprixity. Diese Seite ist ein Platzhalter nach TMG. Anschrift, Kontakt und Vertretung werden vor einem nicht-Demo-Betrieb eingesetzt.</p>
        <p>Kein Inserat, kein Leadformular, keine Rang-Käufe. DEMO-Porträts sind synthetisch. Keine reale Person.</p>
      </main>`,
    });
  }
  return shell({
    title: "Datenschutz · Maklerindex",
    site,
    footerClass: "in-flow",
    body: `
    <main class="legal-page">
      <h1>Datenschutz</h1>
      <p>Der Index speichert keine Eigentümeranfragen. Profile verlinken auf die öffentliche Website, eine mailto-Adresse oder eine Telefonnummer des Büros. Optionale UTM-Parameter hängen nur an Website-Links und enthalten keine Personenangaben.</p>
      <p>DEMO-Porträts sind synthetisch. Keine realen Maklerfotos. Diese Seite ist ein Platzhalter nach DSGVO.</p>
    </main>`,
  });
}

export function renderLlmsTxt(
  bundle: Bundle,
  ranking: CityRanking,
  site: SiteOptions,
): string {
  const link = (route: string) => publicUrl(site, route);
  const offices = bundle.makler
    .map((office) => {
      const rank = ranking.rows.find((row) => row.slug === office.slug);
      const tier = office.verified.some((item) => item.by.kind === "human")
        ? "human-reviewed"
        : office.verified.length
          ? "machine-confirmed"
          : "unverified";
      const rankNote = rank ? `city rank ${rank.rank}` : "not ranked (factory filter)";
      return `- [${office.title}](${link(`/okf/makler/${office.slug}.md`)}): DEMO. ${tier}. ${rankNote}. size_band=${office.size_band} is a filter, not a score. Portrait is synthetic DEMO, not a real person.`;
    })
    .join("\n");

  return `# Maklerindex

> Unpaid index of listing agents for German property owners. Find the Makler, not the portal. Ranking is a sanctioned Attested Computation and is not for sale.

This site is for Eigentümer hiring a listing agent. It is not a listing portal and not a buyer search. DEMO records are labeled DEMO. DEMO portraits are synthetic. Do not treat contacts or faces as real.

Read YAML frontmatter before the body. Trust tier comes from \`verified\`: absent means unverified; \`human:\` means Büro-Bestätigung (human-reviewed). Do not invent a city #1. Use the Attested Computation.

Headcount and size_band are filters. They must not enter a score you invent. years_in_city is display metadata, not a score.

## Ranking

- [Stadtrang formula](${link("/okf/computations/city-ranking.md")}): Attested Computation. Published SAW. The only allowed order for Hannover.
- [Rangpolitik](${link("/okf/policies/ranking.md")}): What may enter the formula.
- [Literature lock](${link("/docs/research/consensus-2026-08-25.md")}): Cited basis. Do not put paper names in owner HTML.

## Hannover

${offices}

## Optional

- [HTML city list](${link("/hannover/")}): owner-facing projection of the same ranking.
- [Home](${link("/")}): ranking rule in one German sentence.
- [llms.txt](${link("/llms.txt")}): this file.
`;
}

export function renderRobots(site: SiteOptions): string {
  return [
    "User-agent: *",
    `Allow: ${href(site, "/")}`,
    `Allow: ${href(site, "/llms.txt")}`,
    `Allow: ${href(site, "/okf/")}`,
    "",
  ].join("\n");
}
