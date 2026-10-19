/**
 * build-diagrams.mjs: draw the two diagrams AI image tools cannot letter correctly.
 *
 *   node scripts/build-diagrams.mjs [--out src/assets/images]
 *
 * Writes (names follow the city in src/site.config.ts, colours come from src/styles/global.css):
 *   water-softener-process-<city>-<st>.webp     the 4-step installation process
 *   water-softener-size-guide-<city>-<st>.webp  grain capacity against household size
 * The text is real SVG text rendered by sharp, so it uses installed system fonts (Segoe UI, then Arial).
 * Needs "sharp", which Astro already installs. Then run `npm run import-content` so the pages pick the files up.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const args = process.argv.slice(2);
const OUT = path.resolve(root, args.includes("--out") ? args[args.indexOf("--out") + 1] : "src/assets/images");

const config = fs.readFileSync(path.join(root, "src/site.config.ts"), "utf8");
const grab = (key) => (config.match(new RegExp(`^\\s*${key}:\\s*"([^"]+)"`, "m")) || [])[1];
const city = grab("city");
const st = grab("stateAbbr");
if (!city || !st) { console.error("Could not read city and stateAbbr from src/site.config.ts"); process.exit(1); }
const slug = `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${st.toLowerCase()}`;

const css = fs.readFileSync(path.join(root, "src/styles/global.css"), "utf8");
const token = (name, fallback) => (css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8})`)) || [])[1] || fallback;
const C = {
  primary: token("primary", "#1A3C5E"),
  dark: token("primary-dark", "#12293F"),
  light: token("primary-light", "#E6EDF4"),
  accent: token("accent", "#E87722"),
};
const FONT = "Segoe UI, Arial, Helvetica, sans-serif";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, s, size, fill, weight = 400, anchor = "start") =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;

/** Wrap a label over at most two lines at roughly `max` characters. */
function wrap(label, max) {
  const words = label.split(" ");
  const lines = [""];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if ((last + " " + w).trim().length > max && last) lines.push(w);
    else lines[lines.length - 1] = (last + " " + w).trim();
  }
  return lines;
}

// ---- 1. the 4-step process ----
const STEPS = [
  ["Free Estimate and Water Test", "A technician tests your hardness and reviews your household and install location."],
  ["Custom System Recommendation", "You get a written recommendation with system type, grain capacity and an itemized price."],
  ["Professional Installation", "The system is installed, the drain and brine line connected and every tap tested."],
  ["Ongoing Support and Maintenance", "Salt refills, settings and a yearly inspection keep the system at capacity."],
];

function processSvg() {
  const W = 1200, H = 520, cardW = 258, gap = 22, x0 = 40, y0 = 130, cardH = 340;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  s += `<rect width="${W}" height="${H}" fill="${C.light}"/>`;
  s += text(W / 2, 62, "Simple 4-Step Water Softener Installation", 38, C.primary, 700, "middle");
  s += text(W / 2, 100, `From the first call to the follow-up visit in ${city}, ${st}`, 21, "#4B5B6B", 400, "middle");
  STEPS.forEach(([title, body], i) => {
    const x = x0 + i * (cardW + gap);
    s += `<rect x="${x}" y="${y0}" width="${cardW}" height="${cardH}" rx="16" fill="#FFFFFF" stroke="#CBD6E1" stroke-width="2"/>`;
    s += `<rect x="${x}" y="${y0}" width="${cardW}" height="10" rx="5" fill="${C.accent}"/>`;
    s += `<circle cx="${x + 52}" cy="${y0 + 66}" r="32" fill="${C.primary}"/>`;
    s += text(x + 52, y0 + 78, String(i + 1), 34, "#FFFFFF", 700, "middle");
    wrap(title, 17).forEach((l, j) => { s += text(x + 24, y0 + 142 + j * 30, l, 25, C.primary, 700); });
    wrap(body, 23).forEach((l, j) => { s += text(x + 24, y0 + 218 + j * 27, l, 19, "#33414F"); });
    if (i < STEPS.length - 1) s += `<path d="M ${x + cardW + 3} ${y0 + 66} l 16 0" stroke="${C.accent}" stroke-width="5" stroke-linecap="round"/>`;
  });
  return s + `</svg>`;
}

// ---- 2. the size chart ----
const SIZES = [
  ["24,000", "1 to 3 people", "moderate hardness"],
  ["32,000", "3 to 4 people", "moderate to high hardness"],
  ["48,000", "4 to 6 people", "high hardness or iron"],
  ["64,000", "6 or more people", "very hard water or heavy use"],
];

function sizeSvg() {
  const W = 1200, H = 640, rowH = 92, y0 = 150, x0 = 60, tw = W - 120;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  s += `<rect width="${W}" height="${H}" fill="${C.light}"/>`;
  s += text(W / 2, 62, "Water Softener Size Guide", 38, C.primary, 700, "middle");
  s += text(W / 2, 100, "Grain capacity against typical household size", 21, "#4B5B6B", 400, "middle");
  s += `<rect x="${x0}" y="${y0 - 36}" width="${tw}" height="44" rx="10" fill="${C.primary}"/>`;
  s += text(x0 + 30, y0 - 6, "Size (grains)", 20, "#FFFFFF", 700);
  s += text(x0 + 330, y0 - 6, "Typical household", 20, "#FFFFFF", 700);
  s += text(x0 + 640, y0 - 6, "Best fit", 20, "#FFFFFF", 700);
  SIZES.forEach(([grains, who, fit], i) => {
    const y = y0 + 14 + i * rowH;
    s += `<rect x="${x0}" y="${y}" width="${tw}" height="${rowH - 12}" rx="12" fill="#FFFFFF" stroke="#CBD6E1" stroke-width="2"/>`;
    s += `<rect x="${x0 + 14}" y="${y + 14}" width="230" height="${rowH - 40}" rx="10" fill="${C.accent}"/>`;
    s += text(x0 + 129, y + 52, grains, 30, "#FFFFFF", 700, "middle");
    s += text(x0 + 330, y + 52, who, 24, C.primary, 700);
    s += text(x0 + 640, y + 52, fit, 22, "#33414F");
  });
  const fy = y0 + 14 + SIZES.length * rowH + 6;
  s += `<rect x="${x0}" y="${fy}" width="${tw}" height="62" rx="12" fill="${C.dark}"/>`;
  s += text(W / 2, fy + 40, "Daily grains = people x gallons per person x hardness (gpg)", 24, "#FFFFFF", 700, "middle");
  return s + `</svg>`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, svg] of [[`water-softener-process-${slug}`, processSvg()], [`water-softener-size-guide-${slug}`, sizeSvg()]]) {
  const file = path.join(OUT, `${name}.webp`);
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(file);
  console.log("wrote", path.relative(root, file));
}
