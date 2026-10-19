/**
 * make-logo.mjs: draw the site's logo, footer logo and favicon from its own config. No design work per site.
 *
 *   node scripts/make-logo.mjs [--force] [--favicon-only] [--brand-dir brand_assets]
 *
 * Reads businessName and city from src/site.config.ts and the colours from src/styles/global.css, then writes
 *   src/assets/logo.png            header logo, transparent, 1200 x 300 (the layout picks it up automatically)
 *   src/assets/logo-reversed.png   footer logo for the dark footer (white lettering)
 *   public/favicon.svg             the water-drop mark alone
 *   brand_assets/logo.svg, logo-reversed.svg   editable sources (text uses system fonts: Segoe UI, then Arial)
 * A name shaped "<City> Elite <Rest>" gets the layout: CITY on top, an orange ELITE tag, then REST. Any other name
 * gets: CITY on top, an orange rule and the rest of the name below.
 * Existing logo PNGs are kept unless you pass --force, so a hand-made logo is never overwritten.
 * --favicon-only writes just public/favicon.svg (no sharp needed). Needs "sharp", which Astro already installs.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const FAVICON_ONLY = args.includes("--favicon-only");
const BRAND_DIR = path.resolve(root, args.includes("--brand-dir") ? args[args.indexOf("--brand-dir") + 1] : "brand_assets");

const config = fs.readFileSync(path.join(root, "src/site.config.ts"), "utf8");
const grab = (key) => (config.match(new RegExp(`^\\s*${key}:\\s*"([^"]+)"`, "m")) || [])[1];
const businessName = grab("businessName") || "Your Water Softener Company";
const city = grab("city") || "";
const css = fs.readFileSync(path.join(root, "src/styles/global.css"), "utf8");
const token = (name, fallback) => (css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8})`)) || [])[1] || fallback;
const NAVY = token("primary", "#1A3C5E"), DARK = token("primary-dark", "#12293F"), ORANGE = token("accent", "#E87722");
const PALE = token("primary-light", "#CFE0F0");
const FONT = "Segoe UI, Arial, Helvetica, sans-serif";
// raise a hex colour's lightness (amount 0 to 1 of the remaining headroom) but keep its saturation, for the top of
// the drop gradient; mixing with white would turn a deep blue grey
const lighten = (hex, amount) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let hue = 0, l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue *= 60; if (hue < 0) hue += 360;
  l = Math.min(0.9, l + (1 - l) * amount * 0.6);
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((hue / 60) % 2) - 1)), m = l - c / 2;
  const [rr, gg, bb] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [rr, gg, bb].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// the water-drop mark in a 100 x 100 box: gradient drop, orange river wave, pale wave, dark wave, highlight
const DROP = "M50 3 C50 3 15 40 15 64 A35 35 0 0 0 85 64 C85 40 50 3 50 3 Z";
const mark = (id, ring) => `<defs><clipPath id="${id}"><path d="${DROP}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(NAVY, 0.2)}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
<path d="${DROP}" fill="url(#${id}g)" ${ring ? 'stroke="#FFFFFF" stroke-width="3"' : ""}/><g clip-path="url(#${id})"><path d="M5 66 C20 54 34 56 48 65 C62 74 76 72 95 58 L95 100 L5 100 Z" fill="${ORANGE}"/><path d="M5 80 C20 70 36 72 50 80 C64 88 78 86 95 74 L95 100 L5 100 Z" fill="${ring ? "#FFFFFF" : PALE}"/><path d="M5 92 C22 85 38 87 52 93 C66 99 80 97 95 88 L95 100 L5 100 Z" fill="${DARK}"/></g>
<path d="M31 44 C27 51 26 58 28 65" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.9"/>`;

// ring badge (--icon ring): a round badge with a small drop above a copper river and a dark base, so a second
// site in the same palette family can have a clearly different icon from the plain drop
const ringMark = (id, rev) => `<defs><clipPath id="${id}"><circle cx="50" cy="50" r="41"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(NAVY, 0.25)}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
<circle cx="50" cy="50" r="46" fill="${rev ? "none" : "#FFFFFF"}" stroke="${rev ? "#FFFFFF" : NAVY}" stroke-width="6"/>
<g clip-path="url(#${id})"><path d="M0 64 C18 50 34 52 50 62 C66 72 82 70 100 54 L100 100 L0 100 Z" fill="${ORANGE}"/><path d="M0 80 C18 70 36 72 50 80 C64 88 82 86 100 74 L100 100 L0 100 Z" fill="${rev ? "#FFFFFF" : DARK}"/></g>
<g transform="translate(26 8) scale(0.48)"><path d="${DROP}" fill="${rev ? PALE : `url(#${id}g)`}"/><path d="M31 44 C27 51 26 58 28 65" fill="none" stroke="${rev ? NAVY : "#FFFFFF"}" stroke-width="6" stroke-linecap="round" opacity="0.9"/></g>`;
// plains badge (--icon plains): rounded square, copper half-sun on a horizon, white drop above, river line below
const plainsMark = (id, rev) => `<defs><clipPath id="${id}"><rect x="6" y="6" width="88" height="88" rx="22"/></clipPath></defs>
<rect x="6" y="6" width="88" height="88" rx="22" fill="${NAVY}" ${rev ? 'stroke="#FFFFFF" stroke-width="2.5"' : ""}/>
<g clip-path="url(#${id})"><circle cx="50" cy="70" r="26" fill="${ORANGE}"/><rect x="0" y="70" width="100" height="30" fill="${DARK}"/><path d="M0 70 L100 70" stroke="${PALE}" stroke-width="2.5"/></g>
<g transform="translate(34 14) scale(0.32)"><path d="${DROP}" fill="#FFFFFF"/></g>
<path d="M22 82 C34 77 44 80 52 84 C62 88 72 86 80 80" fill="none" stroke="${PALE}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`;
const ICON_STYLE = args.includes("--icon") ? args[args.indexOf("--icon") + 1] : "drop";
const emblem = (id, rev) => (ICON_STYLE === "ring" ? ringMark(id, rev) : ICON_STYLE === "plains" ? plainsMark(id, rev) : mark(id, rev));

const T = (x, y, s, size, w, fill, ls, extra = "") =>
  `<text x="${x}" y="${y}" ${extra} font-family="${FONT}" font-size="${size}" font-weight="${w}" letter-spacing="${ls}" fill="${fill}">${esc(s)}</text>`;

// name parts
const m = businessName.match(/^(.*?)\s+Elite\s+(.+)$/i);
const line1 = (m ? m[1] : city || businessName).toUpperCase();
const rest = (m ? m[2] : businessName.replace(new RegExp(`^${city}\\s*`, "i"), "") || "Water Softener").toUpperCase();
const size1 = Math.min(100, Math.floor(850 / (line1.length * 0.64)));

const lockup = (reversed) => {
  const name = reversed ? "#FFFFFF" : NAVY;
  let body;
  if (m) {
    const size3 = Math.min(50, Math.floor(584 / (rest.length * 0.76)));
    body = `${T(318, 130, line1, size1, 800, name, 1)}
<rect x="322" y="160" width="250" height="92" rx="18" fill="${ORANGE}"/>
${T(447, 228, "ELITE", 74, 900, "#FFFFFF", 6, 'text-anchor="middle"')}
${T(596, 228, rest, size3, 800, name, 5)}`;
  } else {
    const size3 = Math.min(54, Math.floor(850 / (rest.length * 0.78)));
    body = `${T(318, 140, line1, size1, 800, name, 1)}
<rect x="322" y="162" width="96" height="8" rx="4" fill="${ORANGE}"/>
${T(320, 236, rest, size3, 700, ORANGE, 8)}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300">
<g transform="translate(6 6) scale(2.88)">${emblem(reversed ? "r" : "n", reversed)}</g>
${body}
</svg>`;
};
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 100 100" role="img" aria-label="${esc(businessName)}">${emblem("f", false)}</svg>\n`;

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(path.join(root, "public/favicon.svg"), icon);
console.log("wrote public/favicon.svg");
if (FAVICON_ONLY) process.exit(0);

const sharp = (await import("sharp")).default;
fs.mkdirSync(path.join(root, "src/assets"), { recursive: true });
fs.mkdirSync(BRAND_DIR, { recursive: true });
fs.writeFileSync(path.join(BRAND_DIR, "logo.svg"), lockup(false));
fs.writeFileSync(path.join(BRAND_DIR, "logo-reversed.svg"), lockup(true));
for (const [file, svg] of [["src/assets/logo.png", lockup(false)], ["src/assets/logo-reversed.png", lockup(true)]]) {
  const target = path.join(root, file);
  if (fs.existsSync(target) && !FORCE) { console.log(`kept existing ${file} (use --force to replace)`); continue; }
  await sharp(Buffer.from(svg)).png().toFile(target);
  console.log(`wrote ${file}`);
}

// the water drop alone, for small stamps such as card photos (see prepare-images.mjs --card-logo)
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">${emblem("m", false)}</svg>`;
await sharp(Buffer.from(markSvg)).png().toFile(path.join(BRAND_DIR, "mark.png"));
console.log("wrote brand_assets/mark.png");
// --favicon-png also writes public/favicon.png (128 px) for sites whose layout links a PNG favicon
if (args.includes("--favicon-png")) {
  await sharp(Buffer.from(markSvg)).resize(128, 128).png().toFile(path.join(root, "public/favicon.png"));
  console.log("wrote public/favicon.png");
}
