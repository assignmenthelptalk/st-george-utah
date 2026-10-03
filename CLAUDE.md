# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `npm run dev` (Astro dev server runs at `http://localhost:4321`)
- Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Always screenshot from the running dev server (`http://localhost:4321/...`), never a `file:///` URL.
- Capture full-page screenshots at both desktop and mobile viewport widths.
- Save each screenshot with an incrementing, descriptive filename (never overwrite the previous one) so before/after comparisons stay intact.
- After screenshotting, read the image file with the Read tool — Claude can see and analyze it directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Astro `.astro` component files — one component per file, composed into pages. Never a single monolithic `index.html`.
- Styles live in the component's `<style>` tag (scoped by default) or as Tailwind utility classes in the template — never inline `style` attributes.
- Tailwind CSS is installed as a package (not CDN) — use utility classes directly in the markup, no `<script>` tag needed.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Astro-Specific Rules
- Styles go in the component's `<style>` tag or as Tailwind classes in the template — never inline HTML `style` attributes.
- Global styles go in `src/styles/global.css`. Anything specific to one component belongs in that component instead.
- Component-scoped styles (the `<style>` tag) are preferred over adding to global CSS — keep global styles limited to true site-wide tokens and resets.
- Never use `@apply` with Tailwind inside scoped `<style>` blocks — use Tailwind classes directly in the template markup instead.
- Images use Astro's `<Image />` component from `astro:assets` — never raw `<img>` tags.
- Icons use inline SVG — no icon libraries unless one is already installed in the boilerplate.

## Map Component — Tile Layer Rule

When building city neighbourhood maps for any water softener site:

NEVER use CARTO tiles (basemaps.cartocdn.com) — as of September 2026 they
require an API key even for unauthenticated requests. Every tile URL returns
an "API KEY REQUIRED" watermark baked into the tile image. This was
confirmed via direct tile byte inspection on the Henderson site build.

NEVER use Stadia Maps (tiles.stadiamaps.com) — also requires authentication.

ALWAYS use: OpenStreetMap tiles with a CSS inversion filter.
URL pattern: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
CSS filter on `.leaflet-tile-pane` only (NOT on the whole map container):
```css
filter: invert(1) hue-rotate(190deg) brightness(1.18) contrast(0.85) saturate(0.65);
```

The filter must be scoped to `.leaflet-tile-pane` specifically. Markers,
popups, controls, and the reset button sit on separate Leaflet panes and
must NOT be filtered — they render correctly in their own CSS stacking context.

See `src/components/CityMap.astro` for the working reference implementation.

## Tailwind version note
[Tailwind v4]: Configuration is CSS-based via @theme in tailwind.css.
No tailwind.config.js exists. Design tokens defined in @theme are
available as both Tailwind utilities (bg-primary) and CSS custom
properties (var(--color-primary)).

Do not use @apply anywhere. Do not remove global.css.
Both tailwind.css and global.css are imported in Layout.astro.

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Water Softener Niche Design

### Brand positioning
Sites must feel like a local professional service business.
Not a tech startup. Not a generic directory. Not a template.
Target reader: a homeowner who just discovered their water is hard
and wants a trustworthy local solution. Warm, confident, credible.

### Color system
Primary: deep teal or navy — water, trust, cleanliness, professionalism
Never use default Tailwind blue-600 or indigo-500 as primary.
Derive all variants from the primary defined in site.config.ts design tokens.
CTA color: warm orange or amber — creates contrast against teal/navy primary.

### Typography
Heading: DM Serif Display or Merriweather — authoritative, trustworthy
Body: Inter or DM Sans — clean, readable at small sizes
Apply tight tracking (-0.03em) on H1 and H2.
Apply generous line-height (1.75) on body paragraphs.
Never use the same font for headings and body.

### Component quality standards
Quote form — primary conversion element:
  Large input fields with clear labels
  Prominent submit button in CTA color
  Trust signals near the form (no credit card, free quote, local service)
  Must feel safe and professional to fill in

GPG stat block — city hardness data displayed prominently:
  The hardness number (e.g. 18 GPG) displayed large on homepage
  Labelled clearly: "Henderson Water Hardness: 18 GPG — Very Hard"
  Use a stat callout component — not buried in a paragraph

Navigation:
  Clean and minimal
  Sticky on scroll
  Phone number visible in header if available (populated by Keystatic)

### What to avoid
- Stock photos of smiling families holding glasses of water
- Generic blue gradient hero headers
- Clipart or flat illustration icons
- Cookie-cutter layouts identical to every other plumber or HVAC site
- Walls of text with no visual hierarchy

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
