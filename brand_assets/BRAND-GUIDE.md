# Brand Guide — Water Softener City Sites

Generic brand guidance shared across all city sites in this network. Per-city
overrides (real logo, exact hex values once chosen, phone number, etc.) live
in that city's `site.config.ts` / Keystatic data, not here.

## Recommended Primary Colors

Pick one per city (or reuse the same one across the whole network). All three
read as "local professional service," not tech startup.

| Option | Hex | Feel |
|---|---|---|
| Deep Teal | `#0F6E78` | Clean, calm, water-adjacent without being a cliché "water blue" |
| Deep Navy | `#0B3A55` | Authoritative, established, classic trades-business feel |
| Slate Teal | `#1B4B5A` | Between the two above — muted, understated confidence |

Never substitute default Tailwind `blue-600` or `indigo-500` — they read as
generic SaaS, not a local service business.

## Typography Pairings

Pick one pairing per site. Never mix a pairing's heading font with the other
pairing's body font.

**Option A**
- Heading: `DM Serif Display` — authoritative, editorial, trustworthy
- Body: `Inter` — clean and highly readable at small sizes

**Option B**
- Heading: `Merriweather` — warm, classic, slightly more traditional
- Body: `DM Sans` — friendly, geometric, easy to scan

## CTA Color

Warm orange or amber — it sits in visual contrast to any teal/navy primary and
reads as "act now" without looking like a warning or error state.

Recommended: `#E65100` (deep orange). An amber alternative (`#C2760C`) works
if the primary is closer to navy than teal.

## Logo Placeholder Instructions

No real logo exists yet for most cities. Until one is commissioned:

1. Use a text wordmark: business name set in the site's heading font, in the
   primary color, no icon.
2. If a mark is needed for favicon/social-share purposes, use a simple
   geometric glyph (a single water drop or a stacked wave line) in the
   primary color — inline SVG, not a stock icon-pack graphic.
3. When a real logo is commissioned, request: SVG source, a horizontal
   lockup, a square icon-only mark (for favicon/app icon), and both a
   light-background and dark-background variant.
4. Store the final logo assets in this `brand_assets/` folder alongside this
   guide so they're easy to find per city.

## Tone of Voice

- Speak like a knowledgeable local technician, not a national call-center brand — plain, specific, not corporate.
- Lead with reassurance: the reader just found out their water is hard and may feel overwhelmed or upsold to elsewhere.
- Be direct and confident rather than salesy — state facts (hardness levels, what a softener fixes) instead of hyping urgency.
- Keep technical explanations short and only as deep as needed to build trust — never jargon for its own sake.
- Write as "we," grounded in the local area — the copy should read as a real, present business, not a template with a city name swapped in.
