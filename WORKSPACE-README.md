# Water Softener St George Utah — Workspace

## Build status
| Component | Status |
|---|---|
| Source | ✅ cloned from `water-softener-boilerplate`, no CMS (edit `site.config.ts` directly) |
| Output mode | ✅ Static (`output: "static"`, `@astrojs/vercel`, zero serverless functions) |
| `site.config.ts` | ✅ filled with St George data (see Site identity) |
| Design tokens | ✅ navy `#17496B` primary, terracotta `#C2562B` accent, DM Serif Display and Inter |
| Brand name | ✅ `Water Softener St George Utah` (exact match for the domain and keyword) |
| Homepage H1 / title | ✅ H1 `Water Softener St George Utah: Installation, Repair & Free Water Testing`; title `Water Softener St George Utah \| Installation & Repair` |
| Inner page titles | ✅ `[Page] \| Water Softener St George Utah` (the old repeated "Water Softener Installation and Repair" suffix was removed) |
| Homepage backlink variety | ✅ 4 anchor styles across 21 inner pages (4 exact, 6 naked URL, 5 partial, 6 plain). Hand-written here; the boilerplate has the reusable `HomeLink.astro` version |
| Varied CTA button text | ✅ 4 installation and sizing pages use distinct button copy |
| Neighbourhood map | ✅ `StGeorgeMap.astro`, 5 pins, OpenStreetMap tiles with CSS inversion (never CARTO or Stadia) |
| Hardness slider | ✅ `GPGSliderMini` on hard-water and comparison pages; defaults to 18 GPG so the badge reads "Very Hard" |
| Favicon and logo | ✅ droplet-and-mesa mark; `favicon.svg`, `logo.svg`, `logo-mark.svg`, PNG sizes and `og-default.jpg` in `public/` |
| Photography | ✅ 27 WebP images (17.5 MB of JPGs reduced to 1.4 MB) in `src/assets/images/`: 3 homepage, 20 page headers, 3 About banners, 1 unused portrait (`about-founders.webp`) |
| About page | ✅ founder, founding-year, customer and project figures removed (never invent them); founders section removed |
| Content depth | ⏳ boilerplate wording with St George data filled in; not rewritten per page, not quality-gated |

**Next action**: add the real phone number and email, rewrite page content, fix the remaining images (see Notes), then deploy.

## Site identity
- Domain:           watersoftenerstgeorgeutah.com
- City:             St George, UT (Washington County)
- GPG:              13-24 (Very Hard), per the City of St. George 2023 water quality report
- Water source:     About 70% Virgin River water from the Washington County Water Conservancy District (Quail Creek plant), about 30% city wells and springs
- Water authority:  City of St. George Water Services
- Primary keyword:  water softener st george utah (search volume unverified)
- GitHub repo:      https://github.com/assignmenthelptalk/st-george-utah (private, `main`)
- Vercel project:   not yet created
- Vercel URL:       not yet created
- Live domain:      not yet connected

## Folder structure
- waterSoftenerProjects/watersoftenerstgeorgeut/
    src/site.config.ts       ← city config (only file changed per city)
    src/pages/               ← all page files
    src/components/          ← Layout, PageHero, StGeorgeMap, GPGSliderMini and others
    src/assets/images/       ← optimized WebP photography
    public/                  ← favicon, logo, social card
    source-images/           ← original JPGs (git-ignored, local only)
    IMAGE-PROMPTS.md         ← prompts for all 28 image slots
    dist/                    ← built static HTML (after `npm run build`)

## Page status
All 22 fixed pages exist and build (23 with `thank-you`). Content is the boilerplate wording with St George's figures filled in. None have been scored.

✅ = done | 🔄 = in progress | ⏳ = not started | ❌ = blocked

| Page                           | Built | Photo header | Score | Ship-ready |
|--------------------------------|-------|--------------|-------|------------|
| homepage                       | ✅    | ✅ (3 images) | —     | —          |
| water-quality                  | ✅    | ✅           | —     | —          |
| hard-water                     | ✅    | ✅           | —     | —          |
| installation                   | ✅    | ✅           | —     | —          |
| comparison                     | ✅    | ✅           | —     | —          |
| faq                            | ✅    | ✅           | —     | —          |
| neighbourhood                  | ✅    | ⚠️ Albuquerque scene | — | —     |
| repair                         | ✅    | ✅           | —     | —          |
| about                          | ✅    | ⚠️ Albuquerque scene | — | —     |
| contact                        | ✅    | ⚠️ Albuquerque scene | — | —     |
| quote                          | ✅    | ✅           | —     | —          |
| products                       | ✅    | ✅           | —     | —          |
| whole-home-filtration          | ✅    | ⏳ no image  | —     | —          |
| reverse-osmosis                | ✅    | ✅           | —     | —          |
| resin-bed-replacement          | ✅    | ✅           | —     | —          |
| brine-tank-cleaning            | ✅    | ✅           | —     | —          |
| salt-based-installation        | ✅    | ✅           | —     | —          |
| salt-free-installation         | ✅    | ✅           | —     | —          |
| water-softener-sizing          | ✅    | ✅           | —     | —          |
| new-construction-installation  | ✅    | ⚠️ Albuquerque scene | — | —     |
| control-head-repair            | ✅    | ✅           | —     | —          |
| free-water-test                | ✅    | ✅           | —     | —          |

## Quality gate (last run: never)
Score threshold: 80/100
Run: cd C:\Users\lenevo\Local-SEO-Toolkit
     npm run score-built-site -- --business [business-id] --dist C:\Users\lenevo\waterSoftenerProjects\watersoftenerstgeorgeut\dist

## Local data
- Neighbourhoods:  Bloomington, Bloomington Hills, Green Valley, Sun River, Little Valley (coordinates geocoded from OpenStreetMap)
- ZIP codes:       84770, 84790, 84791 (not independently confirmed)
- County:          Washington County
- Population:      95,342 (2020 Census, from memory, not verified against a source)

## SpringWell affiliate links
- /follow/softener/ — salt-based softener
- /follow/combo/    — softener + filtration combo
- /follow/ro/       — reverse osmosis system

## Provisioning checklist
Mirrors PROVISION.md step-for-step.

- [x] Step 1 — GitHub repo created (existed and was empty; pushed to `main`)
- [x] Step 2 — Boilerplate copied into the repo + `npm install`
- [x] Step 3 — `src/site.config.ts` filled in (phone and email still placeholders)
- [x] Step 4 — ~~Keystatic~~ REMOVED, no CMS step
- [ ] Step 5 — Content written for all 22 pages (boilerplate wording only so far)
- [x] Step 5b — Interactive components: map built, hardness slider placed on hard-water and comparison. `GPGSlider` (full version) not yet placed on water-quality; `SystemTour` not yet placed on installation
- [x] Step 6 — `npm run build` — 0 errors, 0 warnings, 23 pages
- [ ] Step 6b — All pages scored 80+ via the quality gate
- [ ] Step 7 — Deployed to Vercel
- [ ] Step 8 — Custom domain added (Vercel dashboard + DNS)
- [ ] Step 9 — Google Search Console property added, sitemap submitted
- [ ] Step 10 — Citations submitted (Google Business Profile, Yelp, BBB, Angi, HomeAdvisor, Bing Places, Apple Maps, Foursquare, Manta, Hotfrog)

## Notes
- **Images are partly from the Albuquerque prompt set.** The neighbourhood, contact, new-construction and About page images (and the homepage hero's terracotta wall) show adobe homes and Sandia-style mountains. St George is red rock and tile roofs. Regenerate those with St George prompts from IMAGE-PROMPTS.md.
- **Missing images:** whole-home-filtration header (falls back to the GPG stat card) and the About "Who Uses Our Services" banner (section is text only).
- **Title length:** several inner-page titles run past about 60 characters once the brand suffix is added (for example water-quality at 76), so Google may truncate them.
- **Opening paragraphs** use the brand name as the sentence subject ("Water Softener St George Utah offers..."), which reads slightly awkwardly in places.
- **`searchVol` is 0:** no keyword-tool access when this site was built.
- **GPG range choice:** 13–24 comes from the city's own softener-setting recommendation. Third-party sources report 20–24 GPG as typical, so the real figure at a given tap is likely toward the upper end.
- **Boilerplate sync:** the `HomeLink.astro` component and the "Homepage Backlink Variety" docs were added to the boilerplate after this site's version was built by hand. The boilerplate repo has no remote yet, so those changes exist locally only.
