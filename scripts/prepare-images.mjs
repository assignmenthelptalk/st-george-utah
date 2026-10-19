/**
 * prepare-images.mjs: turn a folder of AI-generated photos into the site's images.
 *
 *   node scripts/prepare-images.mjs --src <folder> [--prompts IMAGE-PROMPTS.md]
 *        [--logo brand_assets/logo.png] [--out src/assets/images] [--dry-run]
 *
 * How files are matched to page IDs
 *   1. The page IDs come from the "### `page-id`" headings of IMAGE-PROMPTS.md, in
 *      order, stopping at the "Build in code" / "Already done" sections.
 *   2. If the files in --src are already named <page-id>.jpg|png|webp they are used by name.
 *   3. Otherwise the files are matched by SAVE ORDER (oldest first), which is the order
 *      the prompts were generated in. "name (1).jpg" style duplicates are skipped.
 *      The count must equal the number of page IDs, or the script stops.
 *   Always run with --dry-run first and check the printed table.
 *
 * What it writes
 *   src/assets/images/<id>.webp   max 1200px wide (hero-* keeps up to 1376px)
 *   public/og-default.jpg         1200x630 crop of the og-default image
 *   brand_assets/unbranded-images/<id>.<ext>   the untouched originals (git-ignore this folder)
 *
 * Logo (automatic when src/assets/logo.png exists; --no-brand to skip): the logo is stamped bottom-right at about 22% of the image
 * width on a soft translucent plate. The logo's near-white background is turned
 * transparent first. The hero image and og-default are not branded (the hero's overlay and form cover that corner; the social image is cropped for link previews).
 * --card-logo <png> stamps card-* images with a smaller mark instead (e.g. the water drop alone, brand_assets/mark.png from make-logo.mjs), sized by --card-width (default 0.13 of the image width).
 * Needs "sharp", which Astro already installs.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const DRY = args.includes("--dry-run");
const root = process.cwd();
const SRC = opt("src");
const PROMPTS = path.resolve(root, opt("prompts", "IMAGE-PROMPTS.md"));
const OUT = path.resolve(root, opt("out", "src/assets/images"));
const ARCHIVE = path.join(root, "brand_assets", "unbranded-images");
// Branding is the default: when src/assets/logo.png (and brand_assets/mark.png for cards) exist they are used
// automatically. Pass --no-brand to convert without any logo, or --logo / --card-logo to use other files.
const NO_BRAND = args.includes("--no-brand");
const existing = (rel) => (fs.existsSync(path.resolve(root, rel)) ? rel : undefined);
// Optional per-site settings: brand_assets/brand-settings.json
//   { "logoWidth": 0.34, "cardLogo": "src/assets/logo.png", "cardWidth": 0.42, "plateOpacity": 0.75 }
// logoWidth = full logo as a share of a large photo's width; cardLogo/cardWidth = the stamp on card-* photos
// (default: the water-drop mark at 11%); plateOpacity = the white plate behind the logo. Command-line flags win.
const settingsPath = path.join(root, "brand_assets", "brand-settings.json");
const BS = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, "utf8").replace(/^﻿/, "")) : {};
const LOGO = NO_BRAND ? undefined : opt("logo", existing("src/assets/logo.png"));
const CARD_LOGO = NO_BRAND ? undefined : opt("card-logo", BS.cardLogo && existing(BS.cardLogo) ? BS.cardLogo : existing("brand_assets/mark.png")); // stamp for card-* images
const CARD_WIDTH_RATIO = parseFloat(opt("card-width", String(BS.cardWidth ?? 0.11)));
const LOGO_OPACITY = 0.8, PLATE_OPACITY = BS.plateOpacity ?? 0.55, WIDTH_RATIO = parseFloat(opt("logo-width", String(BS.logoWidth ?? 0.22))), MARGIN_RATIO = 0.03;

const fail = (msg) => { console.error(`prepare-images: ${msg}`); process.exit(1); };
if (!SRC) fail("pass --src <folder with the generated images>");
if (!fs.existsSync(PROMPTS)) fail(`no prompts file at ${PROMPTS}`);

// 1. page IDs in prompt order
const ids = [];
for (const line of fs.readFileSync(PROMPTS, "utf8").split(/\r?\n/)) {
  if (/^## .*(Build in code|Already done)/i.test(line)) break;
  const m = line.match(/^### `([a-z0-9-]+)`/);
  if (m) ids.push(m[1]);
}
if (!ids.length) fail("no '### `page-id`' headings found in the prompts file");

// 2/3. match files to IDs
const IMG = /\.(jpe?g|png|webp)$/i;
const files = fs.readdirSync(SRC).filter((f) => IMG.test(f));
const byName = new Map(files.map((f) => [f.replace(IMG, ""), f]));
let plan;
if (ids.every((id) => byName.has(id))) {
  plan = ids.map((id) => ({ id, file: byName.get(id) }));
  console.log("Matching by file name.");
} else {
  const fresh = files
    .filter((f) => !/ \(\d+\)\.\w+$/.test(f))
    .map((f) => ({ f, t: fs.statSync(path.join(SRC, f)).mtimeMs }))
    .sort((a, b) => a.t - b.t)
    .map((x) => x.f);
  if (fresh.length !== ids.length) fail(`${fresh.length} usable files but ${ids.length} page IDs in ${path.basename(PROMPTS)}. Fix the folder or the prompts, or name files <page-id>.jpg.`);
  plan = ids.map((id, i) => ({ id, file: fresh[i] }));
  console.log("Matching by save order (oldest file = first prompt). Check the table before trusting it.");
}
console.table(plan.map((p, i) => ({ "#": i + 1, id: p.id, file: p.file })));
if (DRY) { console.log("Dry run: nothing written."); process.exit(0); }

// logo with its backdrop made transparent
async function prepLogo(file) {
  const { data, info } = await sharp(path.resolve(root, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const d = 255 - Math.min(data[i], data[i + 1], data[i + 2]); // distance from white
    data[i + 3] = Math.min(255, Math.max(0, (d - 14) * 4)) * LOGO_OPACITY * (data[i + 3] / 255);
  }
  return sharp(data, { raw: info }).png().toBuffer();
}
const logoPng = LOGO ? await prepLogo(LOGO) : null;
const cardLogoPng = CARD_LOGO ? await prepLogo(CARD_LOGO) : null;

async function stamp(buf, width, height, png = logoPng, ratio = WIDTH_RATIO) {
  const lw = Math.round(width * ratio), pad = Math.round(lw * 0.08);
  const logo = await sharp(png).resize({ width: lw }).toBuffer();
  const lh = (await sharp(logo).metadata()).height;
  const pw = lw + pad * 2, ph = lh + pad * 2, r = Math.round(ph * 0.18);
  const plate = Buffer.from(`<svg width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="${r}" fill="#fff" fill-opacity="${PLATE_OPACITY}"/></svg>`);
  const m = Math.round(width * MARGIN_RATIO), left = width - pw - m, top = height - ph - m;
  return sharp(buf).composite([{ input: plate, left, top }, { input: logo, left: left + pad, top: top + pad }]);
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ARCHIVE, { recursive: true });
fs.mkdirSync(path.join(root, "public"), { recursive: true });
for (const { id, file } of plan) {
  const input = path.join(SRC, file);
  const meta = await sharp(input).metadata();
  const isHero = id.startsWith("hero-");
  const w = Math.min(meta.width, isHero ? 1376 : 1200);
  const h = Math.round(meta.height * (w / meta.width));
  const resized = await sharp(input).resize({ width: w }).toBuffer();
  const isCard = id.startsWith("card-");
  const png = isCard && cardLogoPng ? cardLogoPng : logoPng;
  const ratio = isCard && cardLogoPng ? CARD_WIDTH_RATIO : WIDTH_RATIO;
  const brand = png && !isHero && id !== "og-default"; // the hero and the social crop stay clean
  if (id === "og-default") {
    const crop = await sharp(input).resize(1200, 630, { fit: "cover" }).toBuffer();
    const og = brand ? await stamp(crop, 1200, 630) : sharp(crop);
    await og.jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(root, "public", "og-default.jpg"));
  }
  const out = brand ? await stamp(resized, w, h, png, ratio) : sharp(resized);
  await out.webp({ quality: 80 }).toFile(path.join(OUT, `${id}.webp`));
  const archived = path.join(ARCHIVE, `${id}${path.extname(file).toLowerCase()}`);
  if (path.resolve(input) !== path.resolve(archived)) fs.copyFileSync(input, archived);
  console.log(`${brand ? "branded " : "plain   "} ${id}`);
}
console.log(`\nDone: ${plan.length} images in ${path.relative(root, OUT)}. Originals copied to brand_assets/unbranded-images (git-ignore it).`);
console.log("Next: npm run import-content && npm run build && npm run verify");
