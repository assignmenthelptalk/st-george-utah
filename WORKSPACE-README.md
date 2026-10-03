# Water Softener CITY_NAME STATE_ABBR — Workspace

## Boilerplate build status (informational — not per-city data)
This section tracks what the *template itself* contains, independent of any
city. Update it when the boilerplate gains or loses a component; do not fill
in per-city data here — that's the rest of this file, below.

| Component | Status |
|---|---|
| Keystatic CMS | ❌ REMOVED — phone-call-based rank-and-rent model, site.config.ts edited directly, see PROVISION.md "CMS — No Keystatic" |
| Output mode | Static (`output: "static"`, `@astrojs/vercel`, zero serverless functions) |
| Full design system (global.css) | ✅ commit 3b6e9cf |
| Layout.astro (utility bar + Services-dropdown nav + minimal footer) | ✅ synced from Henderson structural improvements |
| Homepage (10 sections: hero, services grid, GPG data, 2 alternating image-text, CityMap placeholder, service areas, why-choose-us, FAQ accordion, slim CTA bar) | ✅ synced from Henderson structural improvements |
| New pages: repair, about, contact | ✅ created this pass |
| Brand pattern | ✅ updated 2026-09-26 — renamed from "Water Softeners of [City]" to "[City] Water Softener" everywhere (Layout.astro title composition, nav logo via `site.businessName`, footer, every page's brand-link mention), ported from the Albuquerque site's explicit rename. PROVISION.md's Meta Title / Inner Page H1 / Opening Paragraph Pattern sections updated to match |
| Homepage H1/title/hero structure | ✅ updated 2026-09-26, ported from Albuquerque: H1 now "[City] Water Softener - Expert Water Softener Services in [City], [State]"; new `<h3 class="hero-subheading">` (accent color, italic) directly below it; homepage `<title>` now uses `Layout.astro`'s `fullTitle` prop to render "[City] Water Softener \| Expert Water Softener Services in [City]" instead of the standard 3-part composition; the old separate "Brand IS opening paragraph" section below the hero is gone — both opening paragraphs (brand claim, then GPG data) now live inside the hero itself, after the H3 and before the CTA buttons |
| About page (services grid, differentiators, audience list, team section, 4-step process with coded SVG icons, Key Facts table, FAQ) | ✅ added 2026-09-26, ported from the Albuquerque site's About page rewrite. Founder names/founding year/customer/project counts are new `site.config.ts` fields (`founderNames`, `foundedYear`, `customersServed`, `projectsDelivered`) — SCREAMING_SNAKE_CASE placeholders, never invented text, see PROVISION.md Step 3. The 5 body images (before/after, team-working, homeowner, founders, water-closeup) use the same `placehold.co` fallback pattern as every other unphotographed section on the boilerplate |
| 6 expansion pages (salt-based-installation, salt-free-installation, water-softener-sizing, new-construction-installation, control-head-repair, free-water-test) | ✅ added 2026-09-23, ported from the Minneapolis site build — linked contextually from installation/repair/water-quality, not in main nav/footer |
| PageHero.astro (split inner-page hero: breadcrumbs, H1, opening paragraph, CTAs left; real photo or GPG stat-card right) | ✅ added 2026-09-24, wired into all 21 inner pages, replacing the old single-column `.page-header` + placeholder-image-section pattern. No real photography exists on the boilerplate, so every page renders the GPG stat-card fallback — a per-city task is to add real photos and pass them via the `image` prop, same as Tampa did |
| Opening paragraph pattern (Glendale Elite: Brand IS on homepage, Brand OFFERS inside the hero on inner pages) | ✅ updated 2026-09-24 — superseded the old separate `.page-opening` section below the header; now lives inside `PageHero`'s `opening` slot, brand name underlined and linked to `/`. Homepage still uses the older separate-section placement (`.page-opening` under the hero) — syncing it into the homepage hero itself is a separate, not-yet-requested task |
| QuoteForm.astro | ✅ commit 3b6e9cf, updated to use businessEmail |
| Breadcrumbs.astro | ✅ commit 3b6e9cf |
| LocalSchema.astro | ✅ (unchanged, already matched Henderson) |
| GPGSlider.astro | ✅ commit d084265 |
| GPGSliderMini.astro | ✅ commit d084265 |
| SystemTour.astro | ✅ commit d084265 |
| CLAUDE.md | ✅ (pre-existing, unchanged) |
| BRAND-GUIDE.md | ✅ (pre-existing, unchanged) |
| PROVISION.md (Step 5b added, Keystatic step removed, CMS section added) | ✅ this pass |
| HendersonMap.astro | ❌ city-specific, not copied — use CityMap.astro, build per city (needs real pin coordinates) |
| InstallationProcess.astro | ❌ city-specific — build per city (needs local copy) |
| Testimonials.astro | ❌ city-specific — build per city (needs local placeholder copy) |

**Next action**: Ready to provision the next city. The boilerplate now
ships 22 fixed pages (up from 16) — see PROVISION.md Step 5 for the full
list and Step 5c for the QDP-gated service-area pages that extend a city
toward the Core 30 target (`local-gbp-core30` skill in Local-SEO-Toolkit).

GPGSlider/GPGSliderMini/SystemTour all read city data from `site.config.ts`
automatically (city, gpgLow/gpgHigh, gpgLabel, waterSource, waterAuthority) —
no manual editing needed beyond filling in the config. See PROVISION.md
Step 5b for where to add each one.

## Site identity
- Domain:           DOMAIN_NAME
- City:             CITY_NAME, STATE_ABBR
- GPG:              GPG_LOW-GPG_HIGH (GPG_LABEL)
- Water source:     WATER_SOURCE
- Water authority:  WATER_AUTHORITY
- Primary keyword:  PRIMARY_KEYWORD (SEARCH_VOL vol/mo)
- GitHub repo:      assignmenthelptalk/REPO_NAME
- Vercel project:   REPO_NAME
- Vercel URL:       https://REPO_NAME.vercel.app
- Live domain:      https://DOMAIN_NAME

## Folder structure
- Local-SEO-Toolkit/
    data/BUSINESS_ID/topical-map.md        ← topical map
    data/BUSINESS_ID/briefs/               ← EAV briefs per page
    data/BUSINESS_ID/quality-report-*.json ← quality gate reports
- waterSoftenerProjects/REPO_NAME/
    src/site.config.ts                     ← city config (only file changed per city)
    src/pages/                             ← all page files (no CMS layer)
    dist/                                  ← built static HTML (after npm run build)

## Page status
| Page                           | Written | Score | Ship-ready |
|--------------------------------|---------|-------|------------|
| homepage                       | ⏳      | —     | —          |
| water-quality                  | ⏳      | —     | —          |
| hard-water                     | ⏳      | —     | —          |
| installation                   | ⏳      | —     | —          |
| comparison                     | ⏳      | —     | —          |
| faq                            | ⏳      | —     | —          |
| neighbourhood                  | ⏳      | —     | —          |
| repair                         | ⏳      | —     | —          |
| about                          | ⏳      | —     | —          |
| contact                        | ⏳      | —     | —          |
| quote                          | ⏳      | —     | —          |
| products                       | ⏳      | —     | —          |
| whole-home-filtration          | ⏳      | —     | —          |
| reverse-osmosis                | ⏳      | —     | —          |
| resin-bed-replacement          | ⏳      | —     | —          |
| brine-tank-cleaning            | ⏳      | —     | —          |
| salt-based-installation        | ⏳      | —     | —          |
| salt-free-installation         | ⏳      | —     | —          |
| water-softener-sizing          | ⏳      | —     | —          |
| new-construction-installation  | ⏳      | —     | —          |
| control-head-repair            | ⏳      | —     | —          |
| free-water-test                | ⏳      | —     | —          |

22 pages total (excludes `thank-you` and the QDP-gated `[serviceArea]`
dynamic route — see PROVISION.md Step 5c). All start ⏳ in a freshly cloned
site; update this table after every write and score session.
✅ = done | 🔄 = in progress | ⏳ = not started | ❌ = blocked

## Quality gate (last run: never)
Score threshold: 80/100
Run: cd C:\Users\lenevo\Local-SEO-Toolkit
     npm run score-built-site -- --business BUSINESS_ID --dist [site-path]\dist

## Current task
Keystatic removed, Henderson structural improvements synced (utility bar,
Services-dropdown nav, minimal single-row footer, 10-section homepage,
repair/about/contact pages), 6 expansion pages added (2026-09-23, ported
from Minneapolis). As of 2026-09-24, all 21 inner pages migrated to
`PageHero.astro` (split layout, opening paragraph in-hero, underlined
brand link, GPG stat-card fallback in place of real photography) and the
old `.page-header` + placeholder-image-section pattern removed entirely.
Static output confirmed via a clean build (0 errors/warnings/hints, 23
pages, dist/ not dist/client/). Not yet committed — pending review.
Ready to provision the next city once committed.

## Local data
- Neighbourhoods:  NEIGHBOURHOOD_1, NEIGHBOURHOOD_2, NEIGHBOURHOOD_3
- ZIP codes:       ZIP_1, ZIP_2, ZIP_3
- County:          COUNTY_NAME
- Population:      POPULATION

## SpringWell affiliate links
- /follow/softener/ — salt-based softener (wired into homepage + comparison)
- /follow/combo/    — softener + filtration combo
- /follow/ro/       — reverse osmosis system

## Provisioning checklist
Mirrors PROVISION.md step-for-step, in the same order — check PROVISION.md
itself if a step here needs more detail than fits on one line.

- [ ] Step 1 — GitHub repo created (`gh repo create`)
- [ ] Step 2 — Boilerplate copied into the repo + `npm install`
- [ ] Step 3 — `src/site.config.ts` filled in with real city data
- [ ] Step 4 — ~~Keystatic~~ REMOVED — no CMS step, see PROVISION.md "CMS — No Keystatic"
- [ ] Step 5 — Content written for all 22 pages (see Page status table above)
- [ ] Step 6 — `npm run build` — 0 errors, 0 warnings confirmed
- [ ] Step 6b — All 22 pages scored 80+ via the quality gate
- [ ] Step 7 — Deployed to Vercel (static output, no environment variables needed)
- [ ] Step 8 — Custom domain added (Vercel dashboard + Namecheap DNS)
- [ ] Step 9 — Google Search Console property added, sitemap submitted
- [ ] Step 10 — Citations submitted (Google Business Profile, Yelp, BBB, Angi, HomeAdvisor, Bing Places, Apple Maps, Foursquare, Manta, Hotfrog)

## Notes
_Add any city-specific notes, open data gaps, or decisions made here._

- **2026-09-24 — all 21 inner pages migrated to `PageHero.astro`.**
  `PageHero.astro` existed in the boilerplate from an earlier pass but was
  never wired into any page — every inner page still used the old
  single-column `.page-header` section plus a separate
  `.page-header-image-section` pointing at a `placehold.co` placeholder
  image. This pass replaced that pattern on all 21 inner pages with
  `<PageHero breadcrumbs={...} heading={...} primaryCta={...}
  secondaryCta={...}>`, moved each page's existing opening paragraph
  (Glendale Elite "Brand OFFERS" pattern) into the hero via a named
  `opening` slot, and dropped the `subheading` prop entirely (removed
  from `PageHero.astro` and every call site) so hero content now runs H1
  straight into the opening paragraph. No `image` prop is passed on any
  page, since the boilerplate has no real photography — every hero
  renders the GPG stat-card fallback; a per-city task when provisioning
  is to generate real header photos and pass them via `image`, same as
  the Tampa site did. `.brand-link` inside the hero is styled white with
  a permanent underline (not the default blue/no-underline used
  elsewhere) since the hero has a dark gradient background. Six pages
  (control-head-repair, free-water-test, new-construction-installation,
  salt-based-installation, salt-free-installation, water-softener-sizing)
  had their opening paragraph further down the page body rather than
  immediately after the header — caught and fixed a duplication bug
  where the first migration pass copied that text into the hero slot but
  left the original paragraph in place; both copies are now correctly
  merged into one. Also fixed an orphaned empty `<div class="container">`
  left behind in `quote.astro` by the migration (`quote.astro` has two
  sibling `.container` divs inside its second section — one for the
  moved paragraph, since removed, and one for the `.quote-grid` form
  layout). `npm run build` confirms 0 errors/0 warnings/0 hints, 23
  pages. The homepage was **not** touched in this pass — it still uses
  the older layout (opening paragraph in a separate section below the
  hero, not inside it); Tampa's homepage was restructured to move its
  opening paragraph into the hero itself, but syncing that specific
  change to the boilerplate homepage was not part of this pass.

- **2026-09-23 — boilerplate expanded from 16 to 22 fixed pages.** Ported
  6 pages from the Minneapolis site build after validating they contain no
  hardcoded city data: `salt-based-installation`, `salt-free-installation`,
  `water-softener-sizing`, `new-construction-installation` (linked from
  `installation.astro`'s new "Installation Options" section),
  `control-head-repair` (linked from `repair/index.astro`), and
  `free-water-test` (linked from `water-quality.astro`). None are in the
  main nav or footer, matching the existing `brine-tank-cleaning`
  precedent — reachable via contextual links + sitemap only. `npm run
  build` confirmed 0 errors, 0 warnings, 23 pages (22 content + thank-you).
  `Layout.astro` was intentionally left untouched (Minneapolis's copy has
  since diverged with a per-city Leaflet map link and `site.businessName`
  usage that are out of scope for this pass — a separate task if this
  boilerplate should pick those up too). This is the fixed-page half of
  the portfolio's Core 30 target; see PROVISION.md Step 5c for the
  QDP-gated service-area pages that make up the rest, and the
  `local-gbp-core30` skill in Local-SEO-Toolkit for the planning workflow
  behind the 30 figure.
