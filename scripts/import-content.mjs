#!/usr/bin/env node
/**
 * import-content.mjs
 * ------------------
 * Turns the written pages from the Local-SEO-Toolkit project into site content:
 *   src/data/pages/*.md    markdown + frontmatter (one file per page)
 *   src/data/nav.json      navigation / footer links for pages that exist
 *   LAUNCH-CHECKLIST.md    every [NEEDS DATA] / [VERIFY] marker per page
 *
 * Source of truth for copy stays in the Local-SEO-Toolkit project; edit there and re-run:
 *   npm run import-content
 *
 * Where it reads from (first match wins):
 *   CONTENT_SOURCE=<path>                       an explicit strategy folder
 *   $LOCAL_SEO_TOOLKIT/data/<domain-name>       toolkit location from the environment
 *   ../../Local-SEO-Toolkit/data/<domain-name>  sibling of the waterSoftenerProjects folder
 * <domain-name> is the domain in src/site.config.ts without its extension
 * (lubbockelitewatersoftener.com -> lubbockelitewatersoftener). If no such folder exists the importer uses
 * data/<package name> instead.
 *
 * The strategy folder needs written-content/*.md and a topical-map.json shaped
 * like the water softener preset (see templates/content-site/README.md). Fill in
 * src/site.config.ts first: the importer refuses to run on placeholder values.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const OUT_PAGES = path.join(root, "src", "data", "pages");
const OUT_NAV = path.join(root, "src", "data", "nav.json");
const IMAGE_DIR = path.join(root, "src", "assets", "images");
const OUT_CHECKLIST = path.join(root, "LAUNCH-CHECKLIST.md");

const MARKER_RE = /\[(?:NEEDS DATA|VERIFY)[^\]]*\]/g;
// Names of the two header menus, in hub order (softener pages first, everything else second).
const MENU_LABELS = ["Services", "Other Services"];

// Brand and place names come from site.config.ts (single source of truth).
const cfgSrc = fs.readFileSync(path.join(root, "src", "site.config.ts"), "utf8");
const cfgVal = (key) => (cfgSrc.match(new RegExp(`^\\s{2}${key}:\\s*"([^"]+)"`, "m")) || [])[1];
const BRAND = cfgVal("businessName");
const CITY = cfgVal("city");
const STATE = cfgVal("stateAbbr");
const COUNTY = cfgVal("county");
const DOMAIN = (cfgSrc.match(/const domain = "([^"]+)"/) || [])[1];
if (!BRAND || !CITY || !STATE || !COUNTY || !DOMAIN) throw new Error("site.config.ts: brand, city, state, county or domain not found");
if ([BRAND, CITY, STATE, COUNTY, DOMAIN].some((v) => /_NAME|_ABBR|NAME$/.test(v))) {
  throw new Error("src/site.config.ts still has placeholder values (CITY_NAME, DOMAIN_NAME ...). Fill it in before importing content.");
}

const TOOLKIT = process.env.LOCAL_SEO_TOOLKIT || path.resolve(root, "..", "..", "Local-SEO-Toolkit");
// The strategy folder is named after the domain. A site whose live domain differs from its folder name (New Braunfels:
// www.watersoftenernewbraunfelstx.com, folder newbraunfelselitewatersoftener) falls back to the folder named after the project.
const domainFolder = path.join(TOOLKIT, "data", DOMAIN.replace(/\.[a-z.]+$/i, ""));
const projectName = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).name;
const SOURCE = process.env.CONTENT_SOURCE || (fs.existsSync(domainFolder) ? domainFolder : path.join(TOOLKIT, "data", projectName));
if (!fs.existsSync(path.join(SOURCE, "topical-map.json"))) {
  throw new Error(`No topical-map.json in ${SOURCE}. Set CONTENT_SOURCE or LOCAL_SEO_TOOLKIT, or build the topical map first.`);
}

const map = JSON.parse(fs.readFileSync(path.join(SOURCE, "topical-map.json"), "utf8"));
for (const key of ["pages", "guides", "geo"]) {
  if (!map[key]) throw new Error(`topical-map.json is missing "${key}" (see templates/content-site/README.md for the expected shape)`);
}
const GUIDE_HUB = map.guides.hub?.slug || "/water-softener-guides/";
const GEO_HUB = map.geo.hub?.slug || "/service-areas/";
const guideParent = new Map(map.guides.articles.map((g) => [g.slug, g.parent_service]));
const parentBySlug = new Map();
const typeBySlug = new Map();
parentBySlug.set(GUIDE_HUB, "/");
parentBySlug.set(GEO_HUB, "/");
typeBySlug.set(GUIDE_HUB, "guide-hub");
typeBySlug.set(GEO_HUB, "geo-hub");
for (const p of map.pages) {
  parentBySlug.set(p.slug, p.parent || "/");
  typeBySlug.set(p.slug, p.type);
}
for (const g of map.guides.articles) {
  parentBySlug.set(g.slug, GUIDE_HUB);
  typeBySlug.set(g.slug, "guide");
}
for (const g of map.geo.pages) {
  parentBySlug.set(g.slug, GEO_HUB);
  typeBySlug.set(g.slug, "geo");
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const markers = (s) => s.replace(MARKER_RE, (m) => `<mark class="data-gap">${m}</mark>`);

// FAQ extraction for FAQPage schema: the heading containing "Frequently Asked" opens the section, every deeper
// heading is a question and the text under it is the answer. Markers, links and formatting are stripped.
function extractFaq(md) {
  const plain = (s) =>
    s.replace(/\[(NEEDS DATA|VERIFY)[^\]]*\]/g, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const out = [];
  let level = 0, q = null, a = [];
  const flush = () => { const text = plain(a.join(" ")); if (q && text) out.push({ q, a: text }); q = null; a = []; };
  for (const line of md.split("\n")) {
    const h = line.match(/^(#{2,6})\s+(.*)$/);
    if (!level) { if (h && /Frequently Asked/i.test(h[2])) level = h[1].length; continue; }
    if (h) { flush(); if (h[1].length <= level) break; q = plain(h[2]); continue; }
    if (/^---\s*$/.test(line)) { flush(); break; }
    const bold = line.match(/^\*\*(.+\?)\*\*\s*$/); // a question written as a bold line
    if (bold) { flush(); q = plain(bold[1]); continue; }
    if (q && line.trim() && !/^<!--/.test(line)) a.push(line.trim().replace(/^[-*]\s+/, ""));
  }
  flush();
  return out;
}
// FAQ display: the section extractFaq() reads (for the schema) is also rendered as click-to-open rows
// (<details>), so visitors scan the questions and open only the answers they want. The heading keeps its text;
// on inner pages it is promoted from H3 to H2 so it gets the same navy band as the other section headings.
function accordionFaq(md) {
  const lines = md.split("\n");
  const i = lines.findIndex((l) => /^#{2,3}\s+.*Frequently Asked/i.test(l));
  if (i < 0) return md;
  const level = lines[i].match(/^(#+)/)[1].length;
  let j = i + 1;
  while (j < lines.length) {
    const h = lines[j].match(/^(#{1,6})\s/);
    if (h && h[1].length <= level) break;
    j++;
  }
  const intro = [], items = [];
  let cur = null;
  for (const line of lines.slice(i + 1, j)) {
    const hq = line.match(/^(#{2,6})\s+(.*)$/);
    const bold = line.match(/^\*\*(.+\?)\*\*\s*$/);
    if (hq && hq[1].length > level) { cur = { q: hq[2].trim(), a: [] }; items.push(cur); continue; }
    if (bold) { cur = { q: bold[1].trim(), a: [] }; items.push(cur); continue; }
    if (cur) cur.a.push(line); else intro.push(line);
  }
  if (!items.length) return md;
  const heading = lines[i].replace(/^#+/, "##");
  const rows = items.map((it) => `<details class="faq-item">\n<summary>${esc(it.q)}</summary>\n\n${it.a.join("\n").trim()}\n\n</details>`).join("\n\n");
  const introText = intro.join("\n").trim();
  return [...lines.slice(0, i), heading, "", ...(introText ? [introText, ""] : []), `<div class="faq-list">\n\n${rows}\n\n</div>`, "", ...lines.slice(j)].join("\n");
}
const inlineHtml = (md) =>
  markers(esc(md))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const stripInline = (md) =>
  md.replace(MARKER_RE, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function draftDescription(openingMd) {
  const text = stripInline(openingMd);
  if (text.length <= 155) return text;
  const cut = text.slice(0, 152);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "") + "...";
}

/**
 * Homepage backlinks, modelled on the Henderson site: every inner page carries
 * exactly two links to "/" inside its content.
 *   1. Opening paragraph: the exact brand name as the anchor (hub, service and
 *      hub-style pages). Guides and town pages keep their keyword anchor
 *      ("water softener {City} {ST}") for variety.
 *   2. A closing "brand backlink" paragraph before the final call to action,
 *      anchored on brand + state, followed by a sentence saying what the page
 *      offers.
 * Any other homepage links in the body become plain text so the pair stays
 * natural (header logo, "Home" nav and breadcrumbs also link home).
 */
const lc = (s) => s.toLowerCase().replace(/&/g, "and").replace(/\buv\b/g, "UV");
// Inner-page H1s may end with " | Trusted Local Specialists". Breadcrumbs, menu labels and the
// closing backlink phrase are built from the H1 without it.
const stripSuffix = (h1) => h1.replace(/ \| Trusted Local Specialists$/, "");

function backlinkPhrase(slug, type, h1) {
  h1 = stripSuffix(h1);
  if (type === "geo") return h1.replace(/^Water Softener Installation & Service in /, "water softener installation and service in ");
  if (type === "guide") {
    const parent = guideParent.get(slug) || "/water-softener-installation/";
    return parent.replace(/^\/|\/$/g, "").replace(/-/g, " ").replace("salt free", "salt-free");
  }
  if (type === "geo-hub" || type === "guide-hub") return "water softener installation, replacement, repair and water testing";
  return lc(crumbOf(h1));
}
function applyHomeBacklinks({ slug, type, h1, openingMd, body }) {
  let opening = openingMd;
  const openingHasHomeLink = /\[[^\]]+\]\(\/\)/.test(opening);
  if (!openingHasHomeLink && type !== "geo" && type !== "guide") {
    opening = opening.replace(BRAND, `[${BRAND}](/)`); // first plain mention becomes the anchor
  }
  let text = body.replace(/\[([^\]]+)\]\(\/\)/g, "$1"); // demote stray homepage links
  const phrase = backlinkPhrase(slug, type, h1);
  const tail = type === "geo" ? `and serves homes and businesses across ${COUNTY}.` : `for homes and businesses across ${CITY} and ${COUNTY}.`;
  const paragraph = `[${BRAND} ${STATE}](/) provides ${phrase} ${tail}`;
  const cta = text.lastIndexOf("\n## Get Your Free Estimate");
  text = cta === -1 ? `${text}\n\n${paragraph}` : `${text.slice(0, cta)}\n\n${paragraph}\n${text.slice(cta)}`;
  return { openingMd: opening, body: text };
}

const slugToFile = (slug) => (slug === "/" ? "home" : slug.replace(/^\/|\/$/g, "").replace(/\//g, "--"));
const rx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const crumbOf = (h1) =>
  stripSuffix(h1)
    .replace(new RegExp(` in ${rx(CITY)}, ${rx(STATE)}$`), "")
    .replace(new RegExp(` Around ${rx(CITY)}, ${rx(STATE)}$`), "")
    .replace(new RegExp(`^${rx(CITY)} ${rx(STATE)} `), "")
    .trim();

fs.rmSync(OUT_PAGES, { recursive: true, force: true });
fs.mkdirSync(OUT_PAGES, { recursive: true });

const files = fs.readdirSync(path.join(SOURCE, "written-content")).filter((f) => f.endsWith(".md"));
const pages = [];

// Pages written so far. A link to a page that is not written yet is shown as plain text, so the site never
// links to a missing page; writing the page and re-running the import restores the link.
const writtenSlugs = new Set(
  files
    .map((f) => {
      const header = fs.readFileSync(path.join(SOURCE, "written-content", f), "utf8").match(/^<!--([\s\S]*?)-->/)?.[1] || "";
      return (header.match(/Slug:\s*(\S+)/) || header.match(/Page:\s*(\/\S*)/) || [])[1];
    })
    .filter(Boolean),
);
const ALWAYS_PRESENT = new Set(["/", "/about/", "/contact/", "/thank-you/"]);
const demoted = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(SOURCE, "written-content", file), "utf8").replace(/\r\n/g, "\n");
  const head = raw.match(/^<!--([\s\S]*?)-->/);
  if (!head) throw new Error(`${file}: missing header comment`);
  const meta = head[1];
  const slugMatch = meta.match(/Slug:\s*(\S+)/) || meta.match(/Page:\s*(\/\S*)/);
  if (!slugMatch) throw new Error(`${file}: no slug in header`);
  const slug = slugMatch[1];
  const titleTag = (meta.match(/Title tag:\s*(.+)/) || [])[1]?.trim();
  const metaDescRaw = (meta.match(/Meta description:\s*(.+)/) || [])[1]?.trim() || "";

  let body = raw.slice(head[0].length);

  // Image comments. The first one is the page's lead image (rendered by the template
  // after the hero); later ones become inline markdown images. A file that is not in
  // src/assets/images yet (the code-built diagrams) is skipped and reported.
  const images = [];
  let leadImage = null;
  // Card images: when the real image file exists, the card's placeholder image is dropped so only the photo shows.
  body = body.replace(/(<!--\s*image:\s*([^|]+?)\s*\|[^>]*?-->)\s*\n!\[[^\]]*\]\((?:https:\/\/placehold\.co[^)]*|\/placeholders\/[^)]*)\)/g, (m, comment, file) =>
    fs.existsSync(path.join(IMAGE_DIR, file.trim())) ? comment : m);
  body = body.replace(/<!--\s*image:\s*([^|]+)\|\s*alt:\s*([\s\S]*?)-->/g, (_, f, a) => {
    const file = f.trim();
    const alt = a.trim().replace(/\s+/g, " ").replace(/[\[\]]/g, "");
    const exists = fs.existsSync(path.join(IMAGE_DIR, file));
    images.push({ file, alt, exists });
    if (!exists) return "";
    if (!images.slice(0, -1).length) {
      leadImage = { file, alt };
      return "";
    }
    return `\n\n![${alt}](../../assets/images/${file})\n\n`;
  });
  body = body.replace(/<!--[\s\S]*?-->/g, "");

  // Internal author note at the end of a page ("*Page type: ...*" or "*Word count: ... | Page type: ...*").
  // It is for the writer, never for the site, so it is stripped before rendering.
  const noteMatch = body.match(/^\*((?:Page type|Word count):[^\n]*)\*\s*$/m);
  body = body.replace(/^\*(?:Page type|Word count):[^\n]*\*\s*$/m, "");

  const lines = body.split("\n");
  const cleaned = [];
  for (const line of lines) {
    if (/^---\s*$/.test(line)) continue;
    if (/^## (MAIN CONTENT|SUPPLEMENTARY CONTENT)\s*$/.test(line)) continue;
    cleaned.push(line.replace(/^## \[CONTEXTUAL BORDER\]\s*/, "## "));
  }
  body = cleaned.join("\n").trim();
  // trust-layer callouts render as blockquotes
  body = body.replace(/^(\*\*(?:Not a good fit if\.\.\.|What owners tell us:)\*\*)/gm, "> $1");

  const h1Match = body.match(/^# (.+)$/m);
  if (!h1Match) throw new Error(`${file}: no H1`);
  const h1 = h1Match[1].trim();
  body = body.replace(/^# .+\n+/, "");

  // opening paragraph = first block of text after the H1
  const openEnd = body.indexOf("\n\n");
  let openingMd = (openEnd === -1 ? body : body.slice(0, openEnd)).trim();
  body = (openEnd === -1 ? "" : body.slice(openEnd)).trim();

  const isHome = slug === "/";
  let formHeading = "";
  let formIntro = "";
  if (isHome) {
    body = body.replace(/^\[Get a Free Estimate\]\(#estimate\)\s*/m, "");
    // lift the lead-form section out; the template renders the real form
    const formSection = body.match(/^## (Get Your Free [^\n]*Estimate[^\n]*)\n+([^\n]+)\n[\s\S]*?(?=^## |^<div)/m);
    if (formSection) {
      formHeading = formSection[1].trim();
      formIntro = formSection[2].trim();
      body = body.replace(formSection[0], "");
    }
  } else {
    body = body.replace(/\(\/#estimate\)/g, "(#estimate)");
    // The hero opening paragraph keeps a single link (the homepage backlink); the
    // "Request a free estimate" sentence stays as text and the hero buttons carry the CTA.
    openingMd = openingMd.replace(/\[([^\]]+)\]\(\/#estimate\)/g, "$1");
    ({ openingMd, body } = applyHomeBacklinks({ slug, type: typeBySlug.get(slug) || "page", h1, openingMd, body }));
  }
  const demote = (md) =>
    md.replace(/(?<!!)\[([^\]]+)\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g, (m, label, href) => {
      if (writtenSlugs.has(href) || ALWAYS_PRESENT.has(href)) return m;
      demoted.push({ from: slug, to: href });
      return label;
    });
  openingMd = demote(openingMd);
  body = demote(body);

  const description =
    metaDescRaw && !/NEEDS|VERIFY/.test(metaDescRaw) ? metaDescRaw : draftDescription(openingMd);
  const metaDraft = !(metaDescRaw && !/NEEDS|VERIFY/.test(metaDescRaw));

  const allMarkers = [...(openingMd + "\n" + body + "\n" + formIntro).matchAll(MARKER_RE)].map((m) => m[0]);
  const parentSlug = isHome ? null : parentBySlug.get(slug) ?? "/";

  const fm = {
    title: h1,
    seoTitle: titleTag || h1,
    description,
    metaDraft,
    slug,
    pageType: isHome ? "home" : typeBySlug.get(slug) || "page",
    parentSlug,
    crumb: crumbOf(h1),
    openingHtml: isHome ? inlineHtml(openingMd) : inlineHtml(openingMd).replace(/href="\/#estimate"/g, 'href="#estimate"'),
    formHeading,
    formIntro,
    leadImage,
    images,
    faq: extractFaq(body),
    markerCount: allMarkers.length,
  };
  const yaml = Object.entries(fm).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n");
  const out = `---\n${yaml}\n---\n\n${markers(accordionFaq(body))}\n`;
  fs.writeFileSync(path.join(OUT_PAGES, `${slugToFile(slug)}.md`), out);
  pages.push({ slug, file: slugToFile(slug), h1, crumb: fm.crumb, type: fm.pageType, metaDraft, markers: allMarkers, note: noteMatch?.[1], missingImages: images.filter((i) => !i.exists).map((i) => i.file) });
}

// ---- navigation ------------------------------------------------------------
const built = new Set(pages.map((p) => p.slug));
const has = (slug) => built.has(slug);
const link = (slug) => ({ href: slug, label: pages.find((p) => p.slug === slug).crumb });
const hubs = map.pages.filter((p) => p.type === "hub" && has(p.slug)).map((p) => link(p.slug));
const services = map.pages.filter((p) => p.type !== "hub" && has(p.slug)).map((p) => ({ ...link(p.slug), parent: p.parent }));
const nav = {
  menuLabels: MENU_LABELS,
  hubs,
  services,
  guideHub: has(GUIDE_HUB) ? link(GUIDE_HUB) : null,
  geoHub: has(GEO_HUB) ? link(GEO_HUB) : null,
};
fs.writeFileSync(OUT_NAV, JSON.stringify(nav, null, 2) + "\n");

// ---- service-areas map -----------------------------------------------------
// The strategy folder's map-points.json lists the city centre and one point per location page.
// Only points whose page was imported are kept, so a pin never links to a missing page.
const OUT_MAP = path.join(root, "src", "data", "map-points.json");
const mapSrc = path.join(SOURCE, "map-points.json");
let mapOut = { source: "", center: null, points: [] };
let mapNote = "none (add map-points.json to the strategy folder)";
if (fs.existsSync(mapSrc)) {
  const raw = JSON.parse(fs.readFileSync(mapSrc, "utf8"));
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  if (!raw.center || !num(raw.center.lat) || !num(raw.center.lng)) throw new Error("map-points.json needs center { name, lat, lng }");
  const points = (raw.points || []).filter((p) => built.has(p.slug));
  for (const p of points) if (!num(p.lat) || !num(p.lng)) throw new Error(`map-points.json: bad coordinates for ${p.slug}`);
  const skipped = (raw.points || []).length - points.length;
  mapOut = { source: raw.source || "", center: raw.center, points };
  mapNote = `${points.length} pins${skipped ? `, ${skipped} skipped (page not built yet)` : ""}${points.some((p) => p.approx) ? ", some approximate" : ""}`;
}
fs.writeFileSync(OUT_MAP, JSON.stringify(mapOut, null, 2) + "\n");

// ---- homepage neighbourhood map ---------------------------------------------
// The strategy folder's neighbourhood-map.json (pins + hardness report text) becomes src/data/neighbourhoods.json,
// which src/components/NeighbourhoodMap.astro reads. The map sits directly below the "Why Is <City> Water So Hard?"
// section, so the homepage copy is split there: home.md keeps everything up to and including that section and
// src/data/home-after.md (outside src/data/pages, so it is not a routed page) holds the rest. Without a
// neighbourhood-map.json nothing is split and the component renders nothing.
const OUT_HOODS = path.join(root, "src", "data", "neighbourhoods.json");
const OUT_HOME_AFTER = path.join(root, "src", "data", "home-after.md");
const hoodSrc = path.join(SOURCE, "neighbourhood-map.json");
let hoodNote = "none (add neighbourhood-map.json to the strategy folder)";
let hoodOut = { hardness: null, issues: [], neighbourhoods: [] };
if (fs.existsSync(hoodSrc)) {
  const raw = JSON.parse(fs.readFileSync(hoodSrc, "utf8"));
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  for (const h of raw.neighbourhoods || []) if (!h.name || !num(h.lat) || !num(h.lng)) throw new Error(`neighbourhood-map.json: bad entry ${JSON.stringify(h)}`);
  for (const k of ["value", "unit", "label", "short", "intro", "reportNote", "footnote"]) if (!raw.hardness?.[k]) throw new Error(`neighbourhood-map.json needs hardness.${k}`);
  hoodOut = { hardness: raw.hardness, issues: raw.issues || [], neighbourhoods: raw.neighbourhoods || [] };
  hoodNote = `${hoodOut.neighbourhoods.length} pins`;
}
fs.writeFileSync(OUT_HOODS, JSON.stringify(hoodOut, null, 2) + "\n");

let homeAfter = "---\nsplit: false\n---\n";
const homeFile = path.join(OUT_PAGES, `${slugToFile("/")}.md`);
if (hoodOut.neighbourhoods.length && fs.existsSync(homeFile)) {
  const homeMd = fs.readFileSync(homeFile, "utf8");
  const hard = homeMd.match(/^## [^\n]*Water So Hard\?[^\n]*$/m);
  const next = hard && homeMd.indexOf("\n## ", hard.index + hard[0].length);
  if (hard && next > -1) {
    fs.writeFileSync(homeFile, homeMd.slice(0, next).trimEnd() + "\n");
    homeAfter = "---\nsplit: true\n---\n\n" + homeMd.slice(next + 1).replaceAll("../../assets/", "../assets/"); // home-after.md sits one folder above the pages
  } else {
    hoodNote += ' (not shown: no "Why Is ... Water So Hard?" section followed by another section on the homepage)';
  }
}
fs.writeFileSync(OUT_HOME_AFTER, homeAfter);

// ---- launch checklist ------------------------------------------------------
const total = pages.reduce((n, p) => n + p.markers.length, 0);
// The service-areas map image is replaced by the interactive map once it has pins.
const missingImages = [...new Set(pages.flatMap((p) => p.missingImages))].filter((f) => !(mapOut.points.length && /service-areas/.test(f)));
const rows = pages
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map((p) => {
    const m = p.markers.length ? p.markers.map((x) => `  - ${x}`).join("\n") : "  - (none)";
    return `### ${p.slug}\n- Meta description: ${p.metaDraft ? "DRAFT, needs final wording" : "final"}\n- Open markers: ${p.markers.length}\n${m}`;
  })
  .join("\n\n");
const checklist = `# Launch checklist (generated ${new Date().toISOString().slice(0, 10)})

Generated by \`npm run import-content\` from ${SOURCE}.
Do not publish while any item below is open. Markers show on the site as highlighted text.

## Site-wide
- [ ] Replace the placeholder phone number in src/site.config.ts
- [ ] Set businessEmail in src/site.config.ts (the quote form stays disabled until then)
- [ ] Confirm the exact ${CITY} hardness figure from the city's own water report and update gpgLow/gpgHigh
- [ ] Licence number and class for whoever installs (check what ${STATE} requires before the word "licensed" appears anywhere)
- [ ] Warranty, guarantee, same-day policy, years in business, price ranges, real reviews
- [ ] Photos: generated images are stand-ins. Swap in real ${CITY} job photos as they come in, keeping the file names (scripts/prepare-images.mjs converts new batches)
- [ ] Homepage neighbourhood map: ${hoodNote}. Confirm each pin's coordinates and the hardness report text
- [ ] Service-areas map: ${mapNote}. Confirm each pin's coordinates (neighbourhood pins are approximate unless verified)
- [ ] Form replies: the Contact page, Thank-you page and service pages promise a reply within 24 hours. Before launch set businessEmail and the phone number, and confirm who receives the forms and that 24 hours can be met (or change the wording)
- [ ] Pages not written yet: ${demoted.length} link(s) are shown as plain text until the target page exists (${[...new Set(demoted.map((d) => d.to))].join(", ") || "none"}). Write the page, re-run the import and the link comes back
- [ ] Build the images still missing (code-made diagrams, listed here): ${missingImages.length ? missingImages.join(", ") : "none"}
- [ ] Final meta descriptions for every page marked DRAFT
- [ ] Write or decide the remaining location pages (see the strategy folder's reports/)

## Totals
- Pages built: ${pages.length}
- Open markers: ${total}
- Draft meta descriptions: ${pages.filter((p) => p.metaDraft).length}

## Per page
${rows}
`;
fs.writeFileSync(OUT_CHECKLIST, checklist);

console.log(`Imported ${pages.length} pages, ${total} open markers.`);
const byType = pages.reduce((a, p) => ((a[p.type] = (a[p.type] || 0) + 1), a), {});
console.log(byType);
