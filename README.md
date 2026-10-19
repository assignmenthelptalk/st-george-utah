# watersoftenerstgeorgeut

Rank-and-rent lead-generation site for **St George Prime Water Softener** (www.watersoftenerstgeorgeutah.com, target keyword "water softener st george utah").
Astro 7 static site created from `water-softener-boilerplate` with `Local-SEO-Toolkit/scripts/create-site-project.mjs`.

**Status: scaffold only.** The site builds with starter pages (home, About, Contact, thank-you, 404). The topical map, briefs and
research live in `Local-SEO-Toolkit/data/www/`. No copy has been written or imported yet, no images or logo have been added,
and nothing is pushed or deployed.

## Commands

```bash
npm install
npm run import-content   # strategy folder -> src/data/pages, nav.json, map-points.json, LAUNCH-CHECKLIST.md (needs written-content/)
npm run dev
npm run build            # astro check + build, 0 errors and 0 warnings
npm run verify           # structural checks on dist/
```

## Next steps

1. Run the research in `Local-SEO-Toolkit/data/www/reports/cowork-research-prompt.md` and confirm the utility's hardness.
2. Write the copy from the briefs, then `npm run import-content`.
3. Logo, footer logo, favicon and the two diagrams: `node scripts/make-logo.mjs && node scripts/build-diagrams.mjs` (done for you with `--install`). Add the generated photos (`node scripts/prepare-images.mjs`) and `map-points.json`.
4. Replace the placeholders in `src/site.config.ts` (phone, email, `socialLinks`, founder, population, ZIP codes) and set `hardnessVerified` once confirmed.
5. Work through `LAUNCH-CHECKLIST.md`. Do not deploy while any marker remains.

Full recipe: `Local-SEO-Toolkit/workflows/new-site-playbook.md`.
