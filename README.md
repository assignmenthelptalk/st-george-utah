# Water Softener St George Utah

Rank-and-rent lead-generation site for **water softener St George, Utah**.

- Domain: https://watersoftenerstgeorgeutah.com (exact match for the target keyword "water softener st george utah")
- Repo: https://github.com/assignmenthelptalk/st-george-utah
- Stack: Astro 7 (static output) · Tailwind v4 · Leaflet map · formsubmit.co for the quote form · Vercel (adapter installed, project not yet created)
- Cloned from `water-softener-boilerplate`. See [PROVISION.md](./PROVISION.md) for the provisioning process and [CLAUDE.md](./CLAUDE.md) for the design rules.

## Local data

| Field | Value |
|---|---|
| City | St George, Utah (Washington County) |
| Water hardness | 13–24 GPG, Very Hard (the City of St. George's 2023 water quality report recommends softener settings of 13–24 GPG) |
| Water authority | City of St. George Water Services |
| Water source | About 70% Virgin River water from the Washington County Water Conservancy District (Quail Creek plant), about 30% city wells and springs |
| ZIP codes | 84770, 84790, 84791 |
| Neighbourhoods | Bloomington, Bloomington Hills, Green Valley, Sun River, Little Valley |
| Population | 95,342 (2020 Census) |

Everything above lives in `src/site.config.ts`, the only file that holds city data. Pages read from it and never hardcode city facts.

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Type check (`astro check`) and build to `dist/` |
| `npm run preview` | Preview the built site |

## Site structure

22 fixed pages plus `thank-you` (23 built): home, water quality, hard water, installation, comparison, FAQ, neighbourhoods, quote, products, repair, resin bed replacement, brine tank cleaning, whole home filtration, reverse osmosis, about, contact, salt-based installation, salt-free installation, water softener sizing, new construction installation, control head repair and free water test.

Notable pieces:
- **Brand and titles:** brand is `Water Softener St George Utah` (exact match). The homepage title is `Water Softener St George Utah | Installation & Repair`, and inner pages use `[Page] | Water Softener St George Utah`.
- **Homepage backlink variety:** the opening paragraph of each inner page links home using one of four anchor styles (exact, naked URL, partial, plain) to avoid repeating the exact-match anchor. The pattern is documented in PROVISION.md under "Homepage Backlink Variety" and implemented in the boilerplate as `HomeLink.astro`. This site still uses the hand-written version of the same pattern.
- **Hardness slider:** `GPGSliderMini` on the hard-water and comparison pages. It starts at 18 GPG so the badge matches the site's "Very Hard" label.
- **Neighbourhood map:** `StGeorgeMap.astro` (Leaflet with OpenStreetMap tiles) on the homepage, with five pins geocoded from OpenStreetMap.
- **Branding:** droplet-and-red-rock-mesa mark in navy `#17496B` and terracotta `#C2562B`. Files are in `public/` (`favicon.svg`, `logo.svg`, `logo-mark.svg`, PNG sizes, `og-default.jpg`).
- **Images:** 27 optimized WebP photos in `src/assets/images/`, wired through `astro:assets`. Image prompts are in [IMAGE-PROMPTS.md](./IMAGE-PROMPTS.md). Original JPGs are kept locally in `source-images/` (git-ignored).

## Still to do

- Real phone number and email in `site.config.ts` (phone is hidden on the site until set).
- Written page content: pages currently use the boilerplate wording with St George's data filled in. They have not been rewritten to the depth of the Indianapolis site or run through the quality gate.
- Replace a few Albuquerque-style images (neighbourhood header, contact header, new-construction header, About driveway shot, homepage hero) with St George red-rock scenes.
- Add images for the whole-home-filtration page header and the About "Who Uses Our Services" banner.
- Verify search volume (`searchVol` is 0) and the population and ZIP figures against a source.
- Deploy to Vercel, connect the domain, add Search Console and submit citations (PROVISION.md Steps 7 to 10).
