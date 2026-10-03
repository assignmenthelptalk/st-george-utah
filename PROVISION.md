# How to Provision a New City Site

This boilerplate is never deployed itself. Every live city site is created by
cloning this repo, filling in `src/site.config.ts`, and deploying the result.

## Environment

This is a local-development workflow — there is no VPS or staging server:

```
local laptop (Claude Code, npm run build) → GitHub → Vercel (auto-deploy on push)
```

You write and build code locally, push to a per-city GitHub repo, and Vercel
deploys on every push to `main`. Nothing else is involved.

## Prerequisites

- Node.js 18+
- GitHub CLI (`gh`) — install from https://cli.github.com/ if not already
  present, then run `gh auth login`. If you'd rather not install it, create
  the repo on github.com instead and `git remote add origin <url>` manually,
  substituting for Step 1 below.
- Vercel CLI (`npm i -g vercel`), logged in via `vercel login`
- Access to the `assignmenthelptalk` GitHub account

## Steps

### Step 1 — Create the GitHub repo

```bash
gh repo create watersoftener[CITY][STATE] --private --clone
cd watersoftener[CITY][STATE]
```

### Step 2 — Copy the boilerplate

```bash
cp -r ../water-softener-boilerplate/. .
npm install
```

### Step 3 — Update site.config.ts

Open `src/site.config.ts` and replace every `SCREAMING_SNAKE_CASE`
placeholder with real data for the city:

- `city`, `state`, `stateAbbr`, `domain`
- `gpgLow`, `gpgHigh`, `gpgLabel`
- `waterSource`, `waterAuthority`
- `primaryKeyword`, `searchVol`, `metaDescription`
- `population`, `county`
- `neighbourhoods` (array of 3+ real suburbs)
- `zipCodes` (array of 3+ real ZIP codes)
- `businessName` — **choose the format based on domain availability, not
  preference.** This is the single source of truth for the brand string
  used everywhere on the site (nav, footer, meta titles, homepage H1,
  every page's opening paragraph, schema). Two accepted formats:
    - `"[City] Water Softener"` — use when this domain, e.g.
      `[city]watersoftener.com`, is available. **Prefer this when both
      are available.**
    - `"Water Softeners of [City]"` — fallback when the city-first
      domain is taken but `watersoftenerof[city].com` (or similar) is
      available instead.
  Check actual domain availability before picking one — do not guess.
  Never mix formats within one site, and never invent a third format.
- `phoneNumber`, `businessEmail`, `address` (the tenant's real business
  identity — see "CMS — No Keystatic" below; these can also be left as
  their placeholder values until a tenant actually signs)
- `founderNames`, `foundedYear`, `customersServed`, `projectsDelivered`
  (shown on the About page's Key Facts table and team section — real,
  verified figures only; never invent a founder name or a statistic. If
  used illustratively before a tenant signs, label the figure as such
  rather than presenting it as a genuine, unverified statistic)

### Step 4 — ~~Switch Keystatic to GitHub mode~~ REMOVED

Keystatic has been removed from this boilerplate entirely. There is no CMS
step anymore — site identity fields are edited directly in
`site.config.ts` in Step 3 above. See "CMS — No Keystatic" below for the
ongoing workflow once a site is live.

### Step 5 — Write city content

Ask Claude Code:

> Using the values in site.config.ts, write real water softener content
> for all 22 pages. Every page needs the city name, GPG hardness figure,
> water source, and a local hook. No placeholder text in the final output.

The 22 fixed pages are: home, water quality, hard water, installation,
comparison, FAQ, neighbourhoods, quote, products, repair, resin bed
replacement, brine tank cleaning, whole home filtration, reverse osmosis,
about, contact, plus 6 expansion pages added 2026-09-23 —
salt-based-installation, salt-free-installation, water-softener-sizing,
and new-construction-installation (linked from `installation.astro`),
control-head-repair (linked from `repair/index.astro`), and
free-water-test (linked from `water-quality.astro`). None of the 6 are in
the main nav or footer — they're linked contextually from their parent
page and reachable via the sitemap, same as `brine-tank-cleaning`.

**Reaching Core 30:** 22 fixed pages plus up to ~8 QDP-verified service-area
pages (Step 5c below) is this portfolio's Core 30 target — see the
`local-gbp-core30` skill in Local-SEO-Toolkit for the full GBP-category and
page-architecture planning workflow behind that number. Do not pad the
service-area count to hit 30 with pages that fail the QDP test in Step 5c;
a smaller, all-QDP-passing set beats a padded one.

### Step 5b — Adapt interactive components

Three interactive components exist in the boilerplate and are ready to use
on any city page. They read from site.config.ts automatically — no manual
data entry needed beyond filling in the config.

**GPGSlider.astro** — add to water-quality.astro
Reads gpgLow, gpgHigh, gpgLabel, waterSource, waterAuthority, city from
site.config.ts. Default slider value centres on the city's GPG range.
Import and add after the water hardness data section:
```astro
import GPGSlider from '../components/GPGSlider.astro'
<GPGSlider />
```

**GPGSliderMini.astro** — add to comparison.astro
Compact version contextualising the product comparison at the city's
specific hardness level. Import and add before the product cards section.

**SystemTour.astro** — add to installation.astro
Four-step ion exchange process tour. Content is generic — applies to any
city. Import and add after the installation cost section.

**City-specific components to build per city (not in boilerplate):**
- Neighbourhood hardness map (requires city-specific pin coordinates) — see
  the City Map section below, a template exists at `CityMap.astro`
- Installation process section (requires city-specific copy)
- Testimonials section (requires city-specific placeholder copy)

Build these during Step 5 using the Henderson versions as reference.

#### City Map (city-specific — build per city)

The neighbourhood hardness map is a city-specific component because it requires
real GPS coordinates for each neighbourhood — these cannot be genericised.
`src/components/CityMap.astro` is a template with every interaction pattern
(zoom lock, bounds lock, reset button, hover tooltips) already implemented —
copy it rather than building the map from scratch.

**Steps to build the city map:**

1. Copy `src/components/CityMap.astro` to `src/components/[City]Map.astro`
   Example: `src/components/MinneapolisMap.astro`

2. Find the city centre coordinates using OpenStreetMap:
   Go to https://www.openstreetmap.org → search for the city
   Right-click the city centre → "Show address" → copy lat/lng

3. Fill in the MAP_CONFIG constants near the top of the `<script>` block:
   ```
   CITY_LAT / CITY_LNG        ← city centre coordinates
   zoom:     12                 ← leave at 12 unless city is very large/small
   minZoom:  11                 ← prevents zooming out to wider metro
   maxZoom:  14
   BOUNDS_SOUTH / BOUNDS_WEST  ← southwest corner of the service area
   BOUNDS_NORTH / BOUNDS_EAST  ← northeast corner of the service area
   ```
   Find the bounding box: https://boundingbox.klokantech.com → search city →
   copy the CSV coordinates into the four `BOUNDS_*` constants.

4. Find neighbourhood coordinates — for each neighbourhood in
   `site.config.ts`'s `neighbourhoods` array:
   Go to https://www.openstreetmap.org → search "[neighbourhood name] [city]"
   Right-click the neighbourhood centre → "Show address" → copy lat/lng

5. Fill in the `neighbourhoods` array in the script — one entry per
   neighbourhood:
   - `name`:     exact neighbourhood name (must match the site.config.ts entry)
   - `coords`:   `[lat, lng]` from step 4
   - `gpgRange`: `"[gpgLow]–[gpgHigh]"` from site.config.ts
   - `wqaNote`:  `"Anything above 10.5 GPG is considered 'Very Hard' by the
                 Water Quality Association."`
   - `issues`:   4 hard water issues specific to this neighbourhood's situation
               (older housing stock, pools, newer construction etc)

6. Install Leaflet (not a boilerplate dependency — install per city):
   ```bash
   npm install leaflet @types/leaflet
   ```

7. Add to astro.config.mjs (if not already present):
   ```javascript
   vite: { ssr: { noExternal: ['leaflet'] } }
   ```

8. Add the Leaflet stylesheet to Layout.astro's head (if not already present):
   ```html
   <link rel="stylesheet"
     href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>
   ```

9. Import and add to index.astro after the GPG stat block:
   ```astro
   import MinneapolisMap from '../components/MinneapolisMap.astro'
   <MinneapolisMap />
   ```

10. Run `npm run dev` — verify at localhost:4321:
    - All neighbourhood pins visible within the viewport at zoom 12
    - Hover over a pin — tooltip shows neighbourhood name and GPG
    - Click a pin — report panel updates, map centres on that neighbourhood
    - Reset View button returns the map to the default view
    - Map cannot be panned outside the city bounds

**TILE LAYER — DO NOT CHANGE:**
The tile layer uses OpenStreetMap with a CSS inversion filter. Do not switch
to CARTO (requires an API key as of September 2026) or Stadia Maps (also
requires authentication). The CSS inversion filter is scoped to
`.leaflet-tile-pane` only — it does not affect markers, popups, or controls,
which sit on separate Leaflet panes. See CLAUDE.md → "Map Component — Tile
Layer Rule" for the same note.

### Step 5c — Service Area Pages (optional — only if surrounding cities have search demand)

Service area pages target surrounding cities that homeowners in those cities
search for. Each page must pass the QDP test before being built. Do not build
a service area page for a city that fails the QDP test — it will not rank and
may dilute the primary city's topical authority.

#### QDP Test — run for every potential service area city

Answer all four questions. All four must pass:

1. SEARCH DEMAND
   Is there measurable search volume for "water softener [city] [state]"?
   Check: Google Keyword Planner, Ahrefs, or Semrush
   Pass: volume > 10/month
   Fail: no measurable volume — do not build this page

2. DIFFERENT ENTITIES
   Is this city genuinely different from the primary city?
   Check: different water authority? Different county? Different ZIP codes?
   Different incorporated status (city vs unincorporated community)?
   Pass: at least two meaningful differences from the primary city
   Fail: same water authority, same GPG, same county, same ZIP = do not
         build a separate page — add a section to neighbourhood.astro instead

3. LOW SIMILARITY
   Would this page be meaningfully different from the primary homepage?
   Check: different GPG note? Different water source? Different communities?
   Pass: at least 60% of content is genuinely different
   Fail: only the city name changes — this is a doorway page, do not build

4. RECOGNISABLE PATTERN
   Do homeowners in this city search specifically for "[city] water softener"
   or do they search for the primary city?
   Pass: city-specific search pattern confirmed in keyword tool
   Fail: all searches go to the primary city keyword — do not build

#### Neighbourhood verification checklist

Before adding any neighbourhood name to the `neighbourhoods` array:

- [ ] Is this a named residential community (not a road, highway, or park)?
- [ ] Does it appear in at least one of: Zillow, Realtor.com, city government site?
- [ ] Would a local homeowner recognise this as where they live?
- [ ] Is it within the service area city limits (not the primary city)?

If any answer is NO — remove the name. It is better to have 3 verified
neighbourhood names than 8 that include roads and recreation areas.

#### Adding a service area to site.config.ts

1. Add a new object to the `serviceAreas` array in `site.config.ts`
2. Fill every required field — TypeScript will error on missing fields
3. Set `qdp.verified: false` initially
4. Run the QDP test above — if all four pass set `qdp.verdict: 'PASS'`
5. Set `qdp.verified: true` and `qdp.verifiedDate` to today's date
6. Set `dataVerified: true` and `verificationSource` to the URL used
7. Run `npm run build` — the dynamic route generates the page automatically
8. Verify the new URL appears in `/sitemap.xml`
9. Run Rich Results Test on the new page URL

#### What NOT to do

- Do not set `qdp.verified: true` before running the QDP test
- Do not list road names as neighbourhoods
- Do not copy the primary city's `gpgNote` verbatim — write a new one
- Do not set `testimonial.placeholder: false` until a real review exists
- Do not build a service area page for a city that shares the primary
  city's water authority, GPG, county, and ZIP codes — it is the same
  entity and will not rank as a separate page

### Step 6 — Build and verify locally

```bash
npm run build
```

Must complete with 0 errors and 0 warnings before moving on.

### Step 6b — Score built content quality

Run the quality gate against the rendered HTML output before going live:

```bash
cd C:\Users\lenevo\waterSoftenerProjects\[site-folder]
npm run build

cd C:\Users\lenevo\Local-SEO-Toolkit
npm run score-built-site -- \
  --business [business-id] \
  --dist C:\Users\lenevo\waterSoftenerProjects\[site-folder]\dist
```

All 22 pages must score 80+ before the domain is connected and the site goes live.
If any page fails: fix the flagged rules in the .astro source, rebuild, and rescore.
Do not proceed to Step 7 until all pages pass.

### Step 6c — Quality gate gotchas (learned fixing the Henderson homepage)

The gate's checks are regex/heuristic, not real NLP. These patterns cost real
iteration time on the Henderson site — check for them before assuming a rule
failure means missing content.

**Every H2 section needs an authority signal AND a next-step pointer in its
own last sentence, not just anywhere in the section body.**
- Authority signal (Rule 21/24/39): the literal phrase "according to", "per
  [Capitalized word]" (lowercase "per" required — no `i` flag), "research/data/
  studies show", the bare word "report"/"reports", or "the [1-4 Capitalized
  Words] authority/utility/department/agency/association".
- Next-step pointer (Rule 35): the section's last sentence must contain one of
  see / get a / quote / next / continue / explore / contact / learn more about
  / find out, or end in "?".
- Fastest fix: end each section with one sentence carrying both, e.g.
  "According to {waterAuthority}, this reading holds across every ZIP code —
  see the full report for your neighbourhood."

**GOTCHA — an "eyebrow" label before the *next* section's `<h2>` gets counted
as the end of the *current* section, not the next one.** The checker splits
sections on literal `## heading` lines. A short `<p class="eyebrow">Label</p>`
sitting right before the next `<h2>` is still, textually, before that heading
line — so it becomes the trailing content (and often the literal "last
sentence") of the section *above* it, silently burying a carefully-written
closing sentence. If an eyebrow label has no punctuation and no trigger word,
it can flip Rule 21/35 to failing even though the section's real closing
paragraph already had both. Fix: give every eyebrow label a trigger word too
(e.g. "Where We Work" → "See Where We Work") rather than relying only on
content earlier in the section.

**GOTCHA — an `<h3>` per grid card makes each card its own heading for Rule
9, and 3 single-sentence `<h3>` cards in a row trips Rule 41.** Rule 9 needs
a real sentence (with `.`/`!`) in the first 40 words under *every* H2 *and*
H3. A repeating card grid using `<h3>{name}</h3>` for a label with no lead-in
prose fails per-card. Separately, if 3 such cards in a row each pair with
exactly one sentence, the checker's sentence splitter treats "### Heading\n
Sentence." as one chunk whose first token is literally "###" — three in a row
trips Rule 41's "3+ consecutive sentences share the same opening word" check.
This is a heading-format artifact, not repeated prose — already treated as a
known false positive elsewhere in this project (see WORKSPACE-README.md
"Bucket 3" notes on any live city site). Prefer a non-heading element (`<span
class="...">`) for small repeating link-tiles/pills unless the card
genuinely needs its own heading level.

**GOTCHA — Rule 6 (passive voice) matches on prefix, not whole word, and
across merged sentences.** `SERVICE_VERB_KEYWORDS` is `/\b(install|repair|
service|deliver|maintain|replace)/i` with no closing `\b` — it matches
"installer", "installation", "services" too. Combined with `/\b(is|are|was|
were|be|been|being)\s+\w+ed\b/i` anywhere in the *same* sentence, this can
fire on two unrelated clauses that got glued together (see next gotcha). Fix
by rewriting the actual passive verb active ("is sourced from" → "draws
from"), not by chasing the service-verb match.

**GOTCHA — the sentence splitter is period-based and naive.** It splits on
`(?<=[.!?])\s+`, so a period immediately followed by a closing quote mark
(`."`) does *not* count as a sentence end, and short un-punctuated UI text
(button labels, bullet list items with no trailing period) gets glued onto
whatever text follows it into one long "sentence." Don't assume the sentence
you just wrote is literally the last text the checker sees under a heading —
verify against the real checker (or the project's own rule functions run
against the built HTML) rather than predicting by eye.

**GOTCHA — Rule 13/27 (anchor text) requires an *exact* string match against
the brief's `title()` output — nothing appended.** `checkRule13` compares
`link.anchorText !== matchingTarget.anchorText` with no tolerance: a
trailing "→", extra whitespace, or any other character makes a
byte-for-byte-correct anchor fail again. When fixing an anchor to match a
destination title, copy the title string alone — put any arrow/decoration
outside what gets compared, or drop it. Only links whose `href` contains a
brief-known `targetPageType` slug are checked at all (an unrelated or
external link, or one pointing to a page type with no EAV brief like
`/contact/`, is never checked) — see `eavPageTypes.js` for which page types
exist.

**GOTCHA — do not "fix" the standard affiliate disclosure sentence to
silence Rule 2/12.** `HEDGE_WORDS` flags the literal word "may" anywhere in a
sentence (no exception for legal copy), and the conditional-structure check
flags "if" appearing mid-sentence. "We may earn a commission at no extra
cost to you if you purchase through them" is standard FTC-style affiliate
disclosure language — reword it and you trade a false-positive score
deduction for actual legal risk. Leave it as-is; this is an accepted,
permanent gate failure on any page carrying an affiliate link.

**GOTCHA — FAQ `<summary>` questions read as passive/static-verb/no-claim to
Rules 6, 15, and 20.** A question like "How hard is the water in [city]?" is
inherently a question with a static "is" verb — that's the FAQ format
working correctly (and matches `FAQPage` schema expectations), not a defect.
Don't rewrite FAQ questions into declarative claims to chase these rules.

**GOTCHA — breadcrumb anchor text is also checked by Rule 13/27, but
matching it exactly degrades navigation UX.** A breadcrumb crumb like
`{ label: "Repair", href: "/repair/" }` gets flagged wanting to read "Water
Softener Repair and Maintenance in [City]" — the destination page's full SEO
title. Forcing every breadcrumb crumb to carry its destination's full title
makes the breadcrumb trail unreadable. This project's call: leave short
breadcrumb labels as-is and accept the Rule 13/27 deduction they cause,
rather than degrade the UI. Body-content links (a "See our installation
page" sentence, a CTA button) should still get the exact-title treatment —
only breadcrumbs are exempted by this decision.

### Step 7 — Deploy to Vercel

```bash
git add .
git commit -m "init [CITY] [STATE] water softener site"
git push origin main
vercel link   # create a new Vercel project for this repo
vercel --prod
```

No environment variables are required — the site is pure static output
with zero serverless functions.

### Step 8 — Add the custom domain

- Vercel dashboard → Project → Domains → Add `[domain]`
- Namecheap → DNS → point to Vercel's nameservers/records

### Step 9 — Google Search Console

- Add property → URL prefix → verify via the Vercel-injected meta tag
- Submit sitemap: `https://[domain]/sitemap-index.xml`

### Step 10 — Citations (within 1 week of going live)

Submit to: Google Business Profile, Yelp, BBB, Angi, HomeAdvisor,
Bing Places, Apple Maps, Foursquare, Manta, Hotfrog.

Use identical NAP (Name / Address / Phone) on every directory — pull these
from `site.config.ts` once they're set, not from memory.

## CMS — No Keystatic

Keystatic has been removed from all sites. Site data is managed directly
in `site.config.ts`.

To update the phone number after a tenant signs:
1. Open `site.config.ts`
2. Change `phoneNumber: 'PHONE_NUMBER'` to the tenant's number
3. `git add site.config.ts`
4. `git push origin main`
5. Vercel rebuilds and deploys automatically in ~60 seconds
6. The phone number updates across the utility bar, nav, hero, footer, and
   all contact sections simultaneously

To update any other site detail (address, email, business name):
Same process — edit `site.config.ts`, git push, done.

No GitHub OAuth setup needed. No `/keystatic` admin route. No tenant
GitHub account required.

## Meta Title Pattern (Glendale Elite Drywall format)

Every page title follows this three-part structure:
- Part 1: `[Service keyword] in [City], [State]`
- Part 2: `[BusinessName]` (brand — constant across every page)
- Part 3: `Water Softener Installation and Repair` (scope — constant across every page)

Separator between Part 1 and Part 2: pipe (` | `).
Separator between Part 2 and Part 3: colon (`: `).

Full pattern:
```
[Service] in [City], [State] | [BusinessName]: Water Softener Installation and Repair
```

This is built centrally in `src/components/Layout.astro`'s `<SEO title=...>`
line — every page only sets its own `title` prop to Part 1, and Layout
appends `| [BusinessName]: Water Softener Installation and
Repair` automatically. Do not hand-type Parts 2/3 into an individual page;
that duplication is exactly what breaks consistency if one page's copy
ever drifts.

**Homepage exception — `fullTitle`.** `Layout.astro` accepts an optional
`fullTitle` prop that bypasses the three-part composition entirely for
pages that need a specific exact title order. The homepage uses it:
```
fullTitle={`${site.city} Water Softener | Expert Water Softener Services in ${site.city}`}
```
renders as `[BusinessName] | Expert Water Softener Services in
[City]` — a click-optimized, keyword-first title rather than the
service-first Part 1/2/3 composition every inner page uses. The `title`
prop is still set alongside `fullTitle` (used for the OG/social title,
which stays Part 1 only) even though it no longer drives the `<title>`
tag. Only the homepage uses `fullTitle` — every inner page uses the
standard three-part composition above.

OG title (social sharing) uses Part 1 only, with no brand suffix. This
happens automatically too — `openGraph.basic.title` in `Layout.astro` is
set to the bare `title` prop, which is already Part 1.

Rules:
- Part 1 must be under 60 characters (Google truncates search-result
  titles above that).
- All values use `site.*` variables — no hardcoded city, state, county,
  GPG, or authority names anywhere in a title or description.
- Parts 2 and 3 never change across any page on any city site.
- Do not use em dashes in title tags — pipes and colons only, as shown.
  (Descriptions are not restricted this way.)

Page title reference table (Part 1 only — Parts 2/3 are automatic):

| Page | Part 1 template |
|---|---|
| Homepage | `Water Softener Installation in [City], [State]` |
| Installation | `Water Softener Installation in [City], [State]` |
| Repair | `Water Softener Repair in [City], [State]` |
| Hard Water | `Hard Water Treatment in [City], [State]` |
| Water Quality | `[City] Water Quality and Hardness Report` |
| Comparison | `Best Water Softener in [City], [State]` |
| Products | `Water Softener Systems in [City], [State]` |
| FAQ | `Water Softener FAQ [City], [State]` |
| About | `About [BusinessName]` |
| Contact | `Contact [BusinessName]` |
| Neighbourhood | `Water Softener Service Areas in [City], [State]` |
| Service Area (`[serviceArea]/index.astro`) | `Water Softener Installation in [Area], [Area State]` |

Homepage's `title` prop (used for OG only, not `<title>` — see the
`fullTitle` exception above) still follows the Part 1 pattern:
`Water Softener Installation in [City], [State]`.

## Inner Page H1 Pattern (Glendale Elite Drywall format)

Every inner page H1 follows this two-part structure:
- Part 1: Service keyword + city + state
- Part 2: `Trusted Local Specialists` (constant — never changes)

Separator: pipe (` | `).

Full pattern:
```
[Service] in [City], [State] | Trusted Local Specialists
```

**Why this differs from the meta title:** the meta title uses the brand
name after the pipe — it's a Google SERP signal for brand recognition,
seen before the click. The H1 uses "Trusted Local Specialists" after the
pipe instead — it's a conversion signal for the visitor who already
clicked. Two different jobs for two different audiences; see the "Meta
Title Pattern" section above for the title-tag side of this.

**Homepage H1 is different** — it uses the brand entity pattern, not this
inner-page pattern:
```
[BusinessName] - Expert Water Softener Services in [City], [State]
```
(Plain hyphen-minus between brand and service, not a pipe — this pattern
predates and is unrelated to the inner-page pattern below.)

Directly below the homepage H1 sits an `<h3 class="hero-subheading">`,
styled in the accent color and italic (see `.hero-subheading` in the
homepage's own `<style>` block) — not part of the H1 itself, but always
present immediately after it:
```
Professional Water Softener Installation and Repair in [City]
```

Unlike the meta title pattern, this is **not** centralized in
`Layout.astro` — H1 content lives inside each page's own markup (some via
a shared `ServiceAreaLayout.astro` component), so each page's `<h1>` was
edited directly rather than composed from a shared template.

Inner page H1 reference table:

| Page | H1 template |
|---|---|
| Installation | `Water Softener Installation in [City], [State] \| Trusted Local Specialists` |
| Repair | `Water Softener Repair in [City], [State] \| Trusted Local Specialists` |
| Hard Water | `Hard Water Treatment in [City], [State] \| Trusted Local Specialists` |
| Water Quality | `[City] Water Quality Report \| Trusted Local Specialists` |
| Comparison | `Best Water Softener in [City], [State] \| Trusted Local Specialists` |
| Products | `Water Softener Systems in [City], [State] \| Trusted Local Specialists` |
| FAQ | `Water Softener FAQ in [City], [State] \| Trusted Local Specialists` |
| About | `About [BusinessName] \| Trusted Local Specialists` |
| Contact | `Contact [BusinessName] \| Trusted Local Specialists` |
| Neighbourhood | `Water Softener Service Areas in [City], [State] \| Trusted Local Specialists` |
| Resin Bed Replacement | `Resin Bed Replacement in [City], [State] \| Trusted Local Specialists` |
| Brine Tank Cleaning | `Brine Tank Cleaning in [City], [State] \| Trusted Local Specialists` |
| Control Head Repair | `Control Head Repair in [City], [State] \| Trusted Local Specialists` |
| Free Water Test | `Free Water Test in [City], [State] \| Trusted Local Specialists` |
| New Construction Installation | `New Construction Water Softener Installation in [City], [State] \| Trusted Local Specialists` |
| Quote | `Free Water Softener Quote in [City], [State] \| Trusted Local Specialists` |
| Reverse Osmosis | `Reverse Osmosis Systems in [City], [State] \| Trusted Local Specialists` |
| Salt-Based Installation | `Salt-Based Water Softener Installation in [City], [State] \| Trusted Local Specialists` |
| Salt-Free Installation | `Salt-Free Water Conditioner Installation in [City], [State] \| Trusted Local Specialists` |
| Water Softener Sizing | `Water Softener Sizing in [City], [State] \| Trusted Local Specialists` |
| Whole Home Filtration | `Whole Home Filtration in [City], [State] \| Trusted Local Specialists` |
| Service Area (`[serviceArea]/index.astro`, via `ServiceAreaLayout`'s `h1` prop, overridden after the `{...area}` spread — not the area's own manually-authored `h1` field) | `Water Softener Installation in [Area], [Area State] \| Trusted Local Specialists` |

Rules:
- Use a plain pipe character (`|`) as separator.
- Do not use em dash, hyphen, or slash.
- "Trusted Local Specialists" is always the second part, verbatim.
- All values use `site.*` variables — no hardcoded city or state names.
- H1 styling must not change — content only. `.page-header h1` (global.css)
  and each page's own scoped styles govern appearance; none of those rules
  were touched by this pattern.
- Every inner page on the boilerplate now carries this pattern as of
  this writing — the reference table above is exhaustive, not partial.

## Opening Paragraph Pattern (Glendale Elite format)

**Homepage — two paragraphs, both inside the hero.** No backlink (the
brand text isn't a link, since it's already on the page it would link
to). Sits directly below the `<h3 class="hero-subheading">`, styled with
the plain `.hero-p` class (not `.page-opening` — the homepage has no
separate opening-paragraph section below the hero; both paragraphs live
inside `<div class="hero-text">` alongside the H1/H3/CTAs):

Paragraph 1 — short brand + service claim, no GPG figure:
```
[BusinessName] specializes in water softener installation,
repair, and maintenance for homes and businesses dealing with hard
water.
```

Paragraph 2 — the GPG/water-authority data point:
```
In [City], water typically tests at [GpgLow] to [GpgHigh] GPG,
classified as [GpgLabel] by [Water Authority]. [Water Source], leaving
calcium and magnesium deposits on fixtures, water heaters, and
dishwashers within weeks. Free in-home water testing is available.
```

An earlier version of this pattern put paragraph 2's content in a
separate `.page-opening` section below the hero (a distinct "Brand IS a
company that..." sentence). That section is gone — both paragraphs now
live in the hero itself, immediately after the H3 subheading and before
the CTA buttons.

**Inner pages — "Brand OFFERS/provides" pattern, unchanged.** Opens with
the brand name as a hyperlink to `/` (class `brand-link`), then "offers"
or "provides" (never "is a" — inner pages describe what the business does
for this specific service, not what the business fundamentally is),
followed by page-specific service detail and, where relevant, the local
GPG/water-authority data point. This still uses `.page-opening` inside
`PageHero`'s `opening` slot, exactly as before:
```
<a href="/" class="brand-link">[BusinessName]</a> offers
[service] across [City] and [County]. [Page-specific detail, often
including [GpgLow]–[GpgHigh] GPG and/or [Water Authority]].
```

Rules:
1. Homepage's two paragraphs never use "is a" — paragraph 1 uses
   "specializes in." Inner pages use "offers" or "provides," never "is a."
2. Inner-page opening brand mention is always a hyperlink to `/` via
   `.brand-link`; homepage's is plain text (not a link to itself).
3. No em dashes anywhere in any opening paragraph, or anywhere else in
   page content — use separate sentences, commas, or colons instead.
   (The en dash in GPG ranges, e.g. `11–15`, is unrelated and stays as-is
   throughout the codebase.)
4. No invented or unverifiable business facts (founding year, staff
   count, awards) — omit rather than guess. All factual claims must
   trace to `site.*` config values.
5. All values use `site.*` variables — no hardcoded city, county, state,
   or GPG numbers.

CSS: `.hero-p` (homepage, in the homepage's own `<style>` block) and
`.page-opening` (every inner page, `global.css`) for body copy
sizing/color/line-height, plus `.brand-link` (`font-weight: 700`, inline
text link style for the inner-page brand mention) — themed via the
existing color custom properties so the pattern carries over unchanged
to any city's color scheme.

Every page on the boilerplate — the homepage plus all 21 inner pages —
carries this pattern as of this writing.

## City Config Reference

See `src/site.config.ts` for the full `SiteConfig` interface and every
required field. Every value still in `SCREAMING_SNAKE_CASE` must be replaced
before deployment — a stray placeholder on a live page means this step was
skipped.
