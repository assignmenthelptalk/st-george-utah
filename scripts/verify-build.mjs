#!/usr/bin/env node
/**
 * verify-build.mjs: checks the built site (dist/) against the owner's rules.
 *   npm run build && npm run verify
 * Fails (exit 1) on any structural error. Open [NEEDS DATA] markers are
 * reported but do not fail the check (they are tracked in LAUNCH-CHECKLIST.md).
 *
 * Two levels of checking:
 *   Always:        one H1, a title and meta description, no broken internal
 *                  links, no orphan pages, a link back to the homepage.
 *   Content mode:  only when src/data/pages/ exists (a site built with
 *                  npm run import-content). Adds, for the imported pages: one or
 *                  two homepage links in the content with one anchored on the
 *                  brand name, a hero paragraph with at most one link and none
 *                  to #estimate, and no downward links in the homepage body.
 *                  The boilerplate's own legacy pages are exempt from these.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const cfgSrc = fs.readFileSync(path.join(root, "src", "site.config.ts"), "utf8");
const BRAND = (cfgSrc.match(/^\s{2}businessName:\s*"([^"]+)"/m) || [])[1];

// Routes that come from imported content (src/data/pages/*.md frontmatter slugs).
const pagesDir = path.join(root, "src", "data", "pages");
const contentRoutes = new Set(
  fs.existsSync(pagesDir)
    ? fs
        .readdirSync(pagesDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => (fs.readFileSync(path.join(pagesDir, f), "utf8").match(/^slug: "([^"]+)"/m) || [])[1])
        .filter(Boolean)
    : [],
);
const CONTENT_MODE = contentRoutes.size > 0;
// About, Contact and thank-you are not imported, so they never match contentRoutes.

const htmlFiles = walk(dist).filter((f) => f.endsWith(".html"));
const routeOf = (file) => {
  const rel = path.relative(dist, file).replace(/\\/g, "/");
  if (rel === "404.html") return "/404.html";
  return "/" + rel.replace(/index\.html$/, "");
};
const routes = new Set(htmlFiles.map(routeOf));
const pages = htmlFiles.map((file) => ({ file, route: routeOf(file), html: fs.readFileSync(file, "utf8") }));

const errors = [];
const notes = [];
const inbound = new Map();

const hrefs = (html) => [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1]);
const section = (html, tag) => (html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [, ""])[1];

for (const { route, html } of pages) {
  if (route === "/404.html") continue;

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) errors.push(`${route}: ${h1s} H1 tags (expected 1)`);

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  if (!title.trim()) errors.push(`${route}: missing <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${route}: missing meta description`);

  // Structured data: every JSON-LD block parses, there is exactly one business block, and nothing unconfirmed
  // (a placeholder phone number) is published.
  const ld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const parsed = [];
  for (const block of ld) {
    try { parsed.push(JSON.parse(block)); } catch { errors.push(`${route}: a JSON-LD block is not valid JSON`); }
  }
  const business = parsed.filter((b) => b["@type"] === "HomeAndConstructionBusiness");
  if (route !== "/404.html" && business.length !== 1) errors.push(`${route}: ${business.length} business schema blocks (expected 1)`);
  if (business.some((b) => b.telephone && /000-0000/.test(b.telephone))) errors.push(`${route}: placeholder phone number published in schema`);
  for (const b of parsed) {
    if (b["@type"] === "FAQPage" && !(b.mainEntity || []).every((q) => q.name && q.acceptedAnswer?.text)) errors.push(`${route}: FAQPage has an empty question or answer`);
    if (b["@type"] === "FAQPage" && /\[(NEEDS DATA|VERIFY)/.test(JSON.stringify(b))) errors.push(`${route}: a marker leaked into FAQPage schema`);
  }

  for (const href of hrefs(html)) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const target = href.split("#")[0].split("?")[0];
    if (!target) continue;
    const normalized = target.endsWith("/") ? target : target + "/";
    if (!routes.has(normalized) && !routes.has(target)) errors.push(`${route}: broken internal link ${href}`);
    inbound.set(normalized, (inbound.get(normalized) || 0) + 1);
  }

  // every inner page links back to the homepage
  if (route !== "/" && route !== "/thank-you/") {
    if (!hrefs(html).some((h) => h === "/" || h === "/#estimate")) errors.push(`${route}: no link back to the homepage`);
  }

  // Content links to "/" (breadcrumbs excluded): 1 or 2 per inner content page, at
  // least one anchored on the brand name (Henderson-style backlink pair).
  if (CONTENT_MODE && contentRoutes.has(route) && route !== "/") {
    const main = section(html, "main").replace(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/, "");
    const anchors = [...main.matchAll(/<a\b[^>]*\bhref="\/"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
    if (anchors.length < 1 || anchors.length > 2) errors.push(`${route}: ${anchors.length} homepage links in content (expected 1-2): ${JSON.stringify(anchors)}`);
    if (!anchors.some((a) => a.includes(BRAND))) errors.push(`${route}: no homepage link anchored on "${BRAND}"`);
  }

  // Hero opening paragraph on content pages: at most one link, and never the estimate anchor.
  if (CONTENT_MODE && contentRoutes.has(route) && route !== "/") {
    const opening = (html.match(/<div class="page-hero-opening[^>]*>([\s\S]*?)<\/div>/) || [, ""])[1];
    const openingLinks = [...opening.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => m[1]);
    if (openingLinks.length > 1) errors.push(`${route}: ${openingLinks.length} links in the hero paragraph (expected at most 1): ${JSON.stringify(openingLinks)}`);
    if (openingLinks.some((h) => h.includes("#estimate"))) errors.push(`${route}: hero paragraph still links to #estimate`);
  }

  const gaps = (html.match(/class="data-gap"/g) || []).length;
  if (gaps) notes.push(`${route}: ${gaps} open marker(s)`);
}

// homepage body must not link to service, guide or location pages
const home = pages.find((p) => p.route === "/");
if (CONTENT_MODE && contentRoutes.has("/") && home) {
  const body = section(home.html, "main");
  const down = hrefs(body).filter((h) => !/^(https?:|mailto:|tel:|#)/.test(h) && h !== "/");
  if (down.length) errors.push(`/: homepage body links down to ${[...new Set(down)].join(", ")}`);
}

// no orphans
for (const route of routes) {
  if (["/", "/404.html", "/thank-you/"].includes(route)) continue; // thank-you is reached by the form redirect
  if (!inbound.get(route)) errors.push(`${route}: orphan page (no inbound internal link)`);
}

const sitemap = fs.existsSync(path.join(dist, "sitemap-0.xml"));
console.log(`Pages checked: ${pages.length}`);
console.log(`Sitemap generated: ${sitemap ? "yes" : "NO"}`);
console.log(`Pages with open markers: ${notes.length}`);
if (errors.length) {
  console.log(`\nFAILED: ${errors.length} error(s)`);
  errors.forEach((e) => console.log(" - " + e));
  process.exit(1);
}
console.log(
  "\nPASSED: one H1 per page, no broken links, no orphans" +
    (CONTENT_MODE
      ? `, plus content-mode rules for ${contentRoutes.size} imported pages (homepage body has no downward links, 1-2 brand-anchored homepage links per inner page, single link in the hero paragraph).`
      : ". Content-mode rules skipped (no src/data/pages)."),
);
