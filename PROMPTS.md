# Water Softener Site — Claude Code Prompts
Quick reference for all recurring tasks.
Usage: copy the prompt block, paste into Claude Code, replace [bracketed values].
Pinned tab in VS Code — always one click away.

---

## SESSION START
Trigger: every time you open a workspace — run this first, every session
Replace: nothing
```
Read WORKSPACE-README.md and give me a status summary:
- Current task
- Core pages: how many written, how many ship-ready
- Outer pages: how many written
- Next action to take
Do not do anything else until you have read the README.
```

---

## WRITE A SINGLE PAGE
Trigger: writing any one of the 16 pages
Replace: [city] [business-id] [page] [site-folder]
```
I am working on the [city] water softener site.

Local-SEO-Toolkit context:
- Topical map: data/[business-id]/topical-map.md
- EAV brief:   data/[business-id]/briefs/[page].json

Task:
Write the [page] page for [city] following the EAV brief.
Apply all 14 core Koray writing rules.
Use [PLACEHOLDER] for any data gap — do not invent facts.
Save the content to [site-folder]/src/pages/[page].astro
```

---

## SCORE A SINGLE PAGE
Trigger: after writing one page and running npm run build
Replace: [city] [page] [business-id] [site-folder]
```
Run the quality gate on the [city] [page] page.
Use the brief at Local-SEO-Toolkit/data/[business-id]/briefs/[page].json
Score the built HTML at [site-folder]/dist/[page]/index.html
Report: score, ship-ready status, every failed rule with exact detail.
Do not fix anything — report only.
```

---

## SCORE ALL 16 PAGES AFTER BUILD
Trigger: after all pages are written and npm run build is clean
Replace: [city] [business-id] [site-folder]
```
Score all 16 pages for [city] after the Astro build.

Run:
cd Local-SEO-Toolkit
npm run score-built-site -- --business [business-id]
  --dist [site-folder]\dist

Report the score per page in a table.
Flag any page below 80 with its top 3 failed rules.
Do not fix anything — report only.
```

---

## FIX FAILED RULES ON A PAGE
Trigger: when a page scores below 80
Replace: [city] [page] [score] — then paste failed rules from the score report
```
The [city] [page] page scored [score]/100.
Failed rules: [paste failed rules from score report here]

Fix only the failed rules listed above.
Do not rewrite or change any content that is currently passing.
After fixing: run npm run build, then rescore using score-built-site.
Report the new score. Repeat until 80+.
```

---

## GENERATE EAV BRIEFS FOR ALL PAGES
Trigger: before Step 5 (Write city content) of provisioning — after topical map is saved
Replace: [city] [business-id] [site-folder]
```
Generate EAV briefs for all 14 EAV-driven pages for the [city] site
(all pages except about and contact — see eavPageTypes.js). This also
covers products, repair, resin-bed-replacement, brine-tank-cleaning,
whole-home-filtration, and reverse-osmosis, plus one brief per configured
neighbourhood — 17 files total for a 4-neighbourhood site.

Run from Local-SEO-Toolkit:
node scripts\generate-briefs.js
  --site-config [site-folder]\src\site.config.ts
  --business [business-id]

Saves briefs to Local-SEO-Toolkit\data\[business-id]\briefs\
Report the openDataGaps list from each brief so I can
fill missing data before writing begins.
```

---

## BUILD CITY NEIGHBOURHOOD MAP
Trigger: Step 5b of provisioning — after site.config.ts is filled with city data
Replace: [City] [city-slug] [business-id]
```
I am building the neighbourhood hardness map for the [City] water softener site.

Context:
- City data: src/site.config.ts (gpgLow, gpgHigh, neighbourhoods array)
- Map template: src/components/CityMap.astro
- Reference implementation: Henderson site HendersonMap.astro

Task:
1. Copy src/components/CityMap.astro to src/components/[City]Map.astro
2. Research real GPS coordinates for [City] centre and each neighbourhood
   using OpenStreetMap (https://www.openstreetmap.org)
3. Find the bounding box for [City] using https://boundingbox.klokantech.com
4. Fill in the MAP_CONFIG constants with verified coordinates and bounds
5. Fill in the neighbourhoods array — one entry per neighbourhood in
   siteConfig.neighbourhoods
6. For each neighbourhood write 4 city-specific hard water issues
   (relate to that specific neighbourhood's housing stock, age, features)
7. Import and add <[City]Map /> to index.astro after the GPG stat block
8. Run npm run dev and verify all pins are visible at zoom 12
9. Run npm run build — must be 0 errors

Coordinate research:
For each neighbourhood: search "[neighbourhood] [city] [state]" on
OpenStreetMap → right-click centre → Show address → note lat/lng
Verify: all pins must be visible simultaneously at zoom 12 from the
city centre coordinates. Adjust MAP_CONFIG.centre if any pin is cut off.

Do not invent coordinates — every lat/lng must be verified on the map.
Do not use CARTO tiles — they require an API key.
Use the OSM tile layer already configured in CityMap.astro.
```

---

## UPDATE README AFTER SCORING
Trigger: after running score-built-site on any page or all pages
Replace: [business-id]
```
Read Local-SEO-Toolkit\data\[business-id]\quality-report-*.json
(use the most recent file if multiple exist).

Update WORKSPACE-README.md:
- Update the Core Pages table: fill Score and Ship-ready columns
  for every page scored in this report
- Update the Outer Pages table if any outer pages were scored
- Recalculate and update the Coverage summary line
- Add any failed rules to the Notes section for pages below 80

Do not change Current Task or any other section.
```

---

## UPDATE TOPICAL MAP STATUS TABLES
Trigger: after running the topical map skill or after scoring a batch of pages
Replace: [business-id] [site-folder]
```
Read Local-SEO-Toolkit\data\[business-id]\topical-map.md in full.
Read Local-SEO-Toolkit\data\[business-id]\quality-report-*.json
(most recent file).

Update WORKSPACE-README.md — replace the page status tables with:

Table 1 — Core Pages
Columns: Page | QDP Verdict | Written | Score | Ship-ready
Pull every Core page from the topical map.
Fill scores from quality report.
Mark Written ✅ if page exists in [site-folder]\src\pages\

Table 2 — Outer Pages
Columns: Page | QDP Verdict | Written | Score | Ship-ready
Pull every Outer page from the topical map.
Mark Written ⏳ for pages not yet written.

Table 3 — Consolidated
Columns: Query | Decision | Merged into
Pull every query the topical map marked as merged or dropped.

Update Coverage summary:
Core pages:  X/X written | X/X ship-ready
Outer pages: X/X written | X/X ship-ready
Overall topical coverage: X% complete

Do not change any other section.
```

---

## FULL NEW CITY — END TO END
Trigger: Steps 3–6b of provisioning (site.config.ts confirmed through quality scoring) — after config and topical map are done
Replace: [city] [state] [site-folder] [business-id]
```
I am provisioning a new site for [city] [state].
Site config is at [site-folder]\src\site.config.ts

Work through these steps in order:

Step 1: Read site.config.ts — confirm all city values are filled,
        no SCREAMING_SNAKE_CASE placeholders remain

Step 2: Generate EAV briefs for all 14 EAV-driven pages using Local-SEO-Toolkit
        (all pages except about and contact — see eavPageTypes.js)
        Save to data/[business-id]/briefs/
        Report openDataGaps before writing

Step 3: Write all 16 pages (14 from briefs + about + contact)
        Apply all 14 core Koray writing rules per page
        Save each page to [site-folder]/src/pages/
        Use [PLACEHOLDER] for any data gap

Step 4: Run npm run build in [site-folder]
        Must complete with 0 errors and 0 warnings

Step 5: Score all 16 pages using score-built-site
        Report scores per page
        Flag pages below 80

Do not proceed to Step 4 until all 16 pages are written.
Do not proceed to Step 5 until build is confirmed clean.
```

---

## WRITE SERVICE AREA PAGE CONTENT
Trigger: after QDP test passes and serviceAreas entry added to site.config.ts
Replace: [city] [primary-city] [state] [county] [gpg-range] [water-authority]
```
I am writing content for the [city] service area page on the [primary-city]
water softener site.

Context:
- Service area data is in site.config.ts serviceAreas array — entry for [city]
- Primary city data is in site.config.ts siteConfig object
- QDP verdict for [city]: PASS — verified [date]

Task:
Fill the following fields in the serviceAreas entry for [city] in site.config.ts:
  gpgNote:    City-specific explanation of [city]'s water hardness (2-3 sentences)
              Must name {waterAuthority}, {waterSource}, and GPG figure
              Must be different from the primary city's GPG note
  wqaNote:    "Anything above 10.5 GPG is classified as Very Hard by the
               Water Quality Association."
  benefits:   4 city-specific benefits — relate to [city]'s specific situation
              (older housing stock, newer development, pools, etc)
  faqs:       3 FAQs specific to [city] — not generic water softener FAQs
              FAQ 1: "How hard is the water in [city], [state]?"
              FAQ 2: Something specific to [city]'s situation
              FAQ 3: Service or installation question for [city]
  testimonial: Placeholder card — placeholder: true always
               Quote references a [city] neighbourhood if possible

Apply all 14 core Koray writing rules to all prose content.
Every sentence must contain a factual claim — no filler.
City name "[city]" must appear in first 60 words of gpgNote.
GPG figure must appear in first sentence of gpgNote (Rule 1 — most
important information first).
```

---

## REGISTER SITE IN LOCAL-SEO-TOOLKIT
Trigger: after Step 7 (Deploy to Vercel) of provisioning — after deploy is complete
Replace: [business-id] [site-folder] [domain]
```
Register this site in Local-SEO-Toolkit businesses.json.

Run:
cd Local-SEO-Toolkit
node scripts\validate-content.js
  --business [business-id]
  --site-config [site-folder]\src\site.config.ts
  --register

Verify the four field conflict resolutions are correct:
1. baseUrl = https://[domain] (not bare domain)
2. serviceKeyword = "water softener" (not fused with city)
3. nap.name/address/phone nested correctly, email at top level
4. placeId = "" (fill after GBP is created)

Report the full businesses.json entry for this site.
```

---

## SESSION END — UPDATE AND COMMIT README
Trigger: end of every work session before closing VS Code
Replace: [what-changed]
```
Update WORKSPACE-README.md for this session:
1. Tick any provisioning checklist items completed this session
2. Update page status table with any new scores
3. Recalculate coverage summary
4. Rewrite Current Task to the specific next action

Then run:
git add WORKSPACE-README.md
git commit -m "update workspace readme — [what-changed]"

Report what was updated and confirm the commit succeeded.
```

---

## QUICK REFERENCE — VARIABLE SUBSTITUTION

| Variable       | Replace with                          | Example                      |
|----------------|---------------------------------------|------------------------------|
| [city]         | City name                             | Minneapolis                  |
| [state]        | State abbreviation                    | MN                            |
| [business-id]  | Folder name in Local-SEO-Toolkit\data | watersoftenerminneapolis     |
| [site-folder]  | Folder name in waterSoftenerProjects  | watersoftenerminneapolis     |
| [page]         | Page type                             | homepage, water-quality, faq |
| [score]        | Score from quality report             | 68                            |
| [domain]       | Bare domain name                      | watersoftenerminneapolis.com |
| [what-changed] | Short description for git commit      | homepage written 52/100      |

---

*Last updated: September 2026*
*Part of the Water Softener Lead Gen portfolio system*
*See PROVISION.md for provisioning steps | See WORKSPACE-README.md for site status*
