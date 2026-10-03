# water-softener-boilerplate

The factory template for a portfolio of exact-match-domain, rank-and-rent
water softener lead-generation sites. **This repo is never deployed as a
live site** — it exists to be cloned once per city.

Stack: Astro (static output) · Keystatic (local storage in this repo,
GitHub storage once cloned to a live city site) · formsubmit.co for lead
delivery. Workflow: local laptop → GitHub → Vercel auto-deploy. No VPS, no
staging server, no server-side rendering.

## What this is

- A city-agnostic set of 22 pages (home, water quality, hard water,
  installation, comparison, FAQ, neighbourhoods, quote, products,
  repair, resin bed replacement, brine tank cleaning, whole home
  filtration, reverse osmosis, about, contact, salt-based-installation,
  salt-free-installation, water-softener-sizing,
  new-construction-installation, control-head-repair, free-water-test)
  that read every piece of city-specific data from `src/site.config.ts` —
  never hardcoded. Plus an optional, QDP-gated `[serviceArea]` dynamic
  route (see PROVISION.md Step 5c) that extends a city toward the
  portfolio's Core 30 page-count target — see the `local-gbp-core30`
  skill in Local-SEO-Toolkit for that planning workflow.
- A single config file (`src/site.config.ts`) that is the only thing you
  edit to turn this into a specific city's site.
- A Keystatic singleton for the business identity fields (phone, email,
  address, hero copy) that get set once a site is rented, without touching
  code.

## What this is not

- Not a live site. `vercel.json` sets `"public": false` and this repo has
  no Vercel project attached to it.
- Not multi-tenant — each city gets its own repo, cloned from this one.

## Usage

See **[PROVISION.md](./PROVISION.md)** for the complete, step-by-step
process of turning this boilerplate into a deployed city site.

## Target cities

15 exact-match domains, provisioned one at a time from this boilerplate via
[PROVISION.md](./PROVISION.md). Henderson is first; the rest follow in the
order listed.

| # | City | State | Domain | GPG | Search Vol | Status |
|---|------|-------|--------|-----|------------|--------|
| 1 | Henderson | NV | watersoftenerhendersonnv.com | 16–18 | 50 | Provisioning |
| 2 | Minneapolis | MN | watersoftenerminneapolis.com | 15–17 | 170 | Queued |
| 3 | Salt Lake City | UT | watersoftenersaltlakecityut.com | 8–19 | 110 | Queued |
| 4 | Lubbock | TX | watersoftenerlubbocktx.com | 20–22 | 110 | Queued |
| 5 | Mesa | AZ | watersoftenermesaaz.com | 12–22 | 70 | Queued |
| 6 | Scottsdale | AZ | watersoftenersscottsdaleaz.com | 12–20 | 70 | Queued |
| 7 | Albuquerque | NM | watersofteneralbuquerque.com | 10–16 | 170 | Queued |
| 8 | New Braunfels | TX | watersoftenernewbraunfelstx.com | 15–18 | 90 | Queued |
| 9 | Round Rock | TX | watersoftenerroundrocktx.com | 20–28 | 140 | Queued |
| 10 | Midland | TX | watersoftenermidlandtx.com | 18–22 | 70 | Queued |
| 11 | Katy | TX | watersoftenerkatytx.com | 12–16 | 70 | Queued |
| 12 | Fishers | IN | watersoftenerfishers.com | 18 | 50 | Queued |
| 13 | Pflugerville | TX | watersoftenerpflugervilletx.com | 14–17 | 50 | Queued |
| 14 | St. George | UT | watersoftenerstgeorgeut.com | 14–18 | 140 | Queued |
| 15 | Georgetown | TX | watersoftenergeorgetowntx.com | 14–17 | 70 | Queued |
