/**
 * ingest-images.mjs: the standard way to bring new generated photos into a site (two commands).
 *
 *   node scripts/ingest-images.mjs --list              look at what you saved in public/
 *   node scripts/ingest-images.mjs --apply [map.json] [--dry-run] [--no-brand]
 *
 * 1. --list  Finds the image files you dropped in public/ (the favicon and og-default.jpg are ignored), then
 *            - flags EXACT duplicates of anything already archived, and duplicates inside the batch,
 *            - flags NEAR duplicates (the same scene with small changes) against the archive and the batch,
 *            - builds a numbered contact sheet: brand_assets/new-images-contact.jpg (open it and look at each image),
 *            - writes brand_assets/new-images-map.json: each new file suggested for the next pending prompt, in the
 *              order the files were saved (the order you generated them in).
 *          Edit the map before applying: fix wrong ids, and set a file to "hold" when it must NOT go on the site
 *          (a visible face, text or a logo, equipment that does not look like a water softener, a near-duplicate).
 *
 * 2. --apply Reads the map, checks every id exists in IMAGE-PROMPTS.md, then for the files that are not "hold":
 *            converts them to WebP in src/assets/images (max 1200 px; hero 1376 px),
 *            BRANDS them automatically (see below), and archives the untouched originals in
 *            brand_assets/unbranded-images/. Then it moves EVERY raw image out of public/ into
 *            brand_assets/gemini-originals/ (git-ignored) so nothing unoptimised is ever published.
 *          Finish with: npm run import-content && npm run build && npm run verify, then refresh the prompt sheet
 *          in the toolkit (node scripts/image-prompts-from-copy.mjs ...), which drops what is now inserted.
 *
 * Branding protocol (automatic when src/assets/logo.png and brand_assets/mark.png exist; --no-brand turns it off):
 *   large photos .... the full logo, bottom-right, translucent plate, about 22% of the image width
 *   card-* photos ... the water drop alone (brand_assets/mark.png), about 11% of the image width
 *   never branded ... hero-* and og-default (the hero's form/overlay covers that corner; the social crop is cut)
 * Branding always starts from the untouched originals, so it can be redone at any time (see prepare-images.mjs).
 *
 * Needs "sharp" (Astro installs it). Run from the site project root.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const args = process.argv.slice(2);
const LIST = args.includes("--list");
const APPLY = args.includes("--apply");
const DRY = args.includes("--dry-run");
const NO_BRAND = args.includes("--no-brand");
const mapArg = args.find((a, i) => APPLY && !a.startsWith("--") && args[i - 1] !== "--prompts");
const PUB = path.join(root, "public");
const RAW_ARCHIVE = path.join(root, "brand_assets", "gemini-originals");
const BRANDED_SRC = path.join(root, "brand_assets", "unbranded-images");
const IMG_OUT = path.join(root, "src", "assets", "images");
const MAP = path.resolve(root, mapArg || path.join("brand_assets", "new-images-map.json"));
const SHEET = path.join(root, "IMAGE-PROMPTS.md");
const IMG = /\.(jpe?g|png|webp)$/i;
const KEEP_IN_PUBLIC = new Set(["og-default.jpg", "favicon.png"]);
const fail = (m) => { console.error(`ingest-images: ${m}`); process.exit(1); };

if (!LIST && !APPLY) fail("pass --list or --apply (see the header of this file)");
if (!fs.existsSync(SHEET)) fail(`no ${path.basename(SHEET)} in the project root. Copy the toolkit's prompt sheet here first.`);

const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const listImages = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => IMG.test(f) && !KEEP_IN_PUBLIC.has(f)).map((f) => path.join(d, f)) : []);
async function dhash(p) {
  const { data } = await sharp(p).grayscale().resize(9, 8, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let b = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) b += data[y * 9 + x] > data[y * 9 + x + 1] ? "1" : "0";
  return b;
}
const ham = (a, b) => { let d = 0; for (let i = 0; i < 64; i++) if (a[i] !== b[i]) d++; return d; };

// prompt ids in sheet order, with the ones already inserted in the site removed
function promptIds() {
  const ids = [];
  for (const line of fs.readFileSync(SHEET, "utf8").split(/\r?\n/)) {
    if (/^## .*(Build in code|Already done)/i.test(line)) break;
    const m = line.match(/^### `([a-z0-9-]+)`/);
    if (m) ids.push(m[1]);
  }
  return ids;
}
const inserted = (id) => fs.existsSync(path.join(IMG_OUT, `${id}.webp`));

async function list() {
  const raw = listImages(PUB).map((p) => ({ p, f: path.basename(p), t: fs.statSync(p).mtimeMs })).sort((a, b) => a.t - b.t);
  if (!raw.length) { console.log("No new images in public/. Nothing to do."); return; }
  const archive = [...listImages(RAW_ARCHIVE), ...listImages(BRANDED_SRC)];
  const archSha = new Set(archive.map(sha));
  const archHash = []; for (const p of archive) archHash.push(await dhash(p));
  const pending = promptIds().filter((id) => !inserted(id));
  const rows = [], fresh = [], seenSha = new Set();
  for (const x of raw) {
    const h = sha(x.p);
    if (archSha.has(h)) { rows.push({ file: x.f, status: "DUPLICATE: exact copy of an archived image", suggest: "skip" }); continue; }
    if (seenSha.has(h)) { rows.push({ file: x.f, status: "DUPLICATE: same bytes as another file in this batch", suggest: "skip" }); continue; }
    seenSha.add(h); fresh.push({ ...x, dh: await dhash(x.p), meta: await sharp(x.p).metadata() });
  }
  const map = {};
  let k = 0;
  fresh.forEach((x, i) => {
    let note = "";
    for (const ah of archHash) if (ham(x.dh, ah) <= 6) { note = "NEAR-DUPLICATE of an archived image"; break; }
    for (let j = 0; j < i && !note; j++) if (ham(x.dh, fresh[j].dh) <= 6) note = `NEAR-DUPLICATE of #${j + 1} in this batch`;
    const id = pending[k];
    if (note) { map[x.f] = "hold"; rows.push({ file: x.f, status: `NEW, but ${note}`, suggest: "hold (look at it first)" }); }
    else { map[x.f] = id || "hold"; rows.push({ file: x.f, status: id ? "NEW" : "NEW, but no pending prompt is left", suggest: id || "hold" }); if (id) k++; }
  });
  const W = 380, H = 285, cols = 4, rowsN = Math.max(1, Math.ceil(fresh.length / cols));
  if (fresh.length) {
    const tiles = [];
    for (let i = 0; i < fresh.length; i++) {
      const img = await sharp(fresh[i].p).resize(W, H, { fit: "cover" }).jpeg({ quality: 72 }).toBuffer();
      const label = Buffer.from(`<svg width="${W}" height="${H}"><rect width="70" height="38" fill="#000" fill-opacity="0.75"/><text x="10" y="28" font-family="Arial" font-size="26" font-weight="700" fill="#fff">${i + 1}</text><text x="${W - 8}" y="${H - 8}" text-anchor="end" font-family="Arial" font-size="15" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${fresh[i].meta.width}x${fresh[i].meta.height}</text></svg>`);
      tiles.push({ input: await sharp(img).composite([{ input: label }]).toBuffer(), left: (i % cols) * W, top: Math.floor(i / cols) * H });
    }
    fs.mkdirSync(path.join(root, "brand_assets"), { recursive: true });
    await sharp({ create: { width: W * cols, height: H * rowsN, channels: 3, background: "#fff" } }).composite(tiles).jpeg({ quality: 74 }).toFile(path.join(root, "brand_assets", "new-images-contact.jpg"));
    fs.writeFileSync(MAP, JSON.stringify(map, null, 2) + "\n");
  }
  console.log(`Found ${raw.length} image file(s) in public/: ${fresh.length} new, ${raw.length - fresh.length} duplicate(s).\n`);
  console.table(rows.map((r, i) => ({ "#": i + 1, file: r.file.replace("Gemini_Generated_Image_", "G_"), status: r.status, suggest: r.suggest })));
  if (fresh.length) {
    console.log(`\nContact sheet: ${path.relative(root, path.join("brand_assets", "new-images-contact.jpg"))}  (numbers follow the order the files were saved)`);
    console.log(`Suggested map: ${path.relative(root, MAP)}  (new files matched to the next pending prompts, in save order)`);
    console.log("Look at every image. Fix wrong ids and set a file to \"hold\" if it shows a visible face, text or a logo, a wrong subject or a near-duplicate. Then:\n  node scripts/ingest-images.mjs --apply");
  }
}

async function apply() {
  if (!fs.existsSync(MAP)) fail(`no map at ${path.relative(root, MAP)}. Run --list first.`);
  const map = JSON.parse(fs.readFileSync(MAP, "utf8").replace(/^﻿/, ""));
  const all = new Set(promptIds());
  const use = Object.entries(map).filter(([, id]) => id && !/^(hold|skip)$/i.test(id));
  const seen = new Map();
  for (const [file, id] of use) {
    if (!all.has(id)) fail(`"${id}" (for ${file}) is not an id in ${path.basename(SHEET)}.`);
    if (!fs.existsSync(path.join(PUB, file))) fail(`${file} is not in public/.`);
    if (seen.has(id)) fail(`two files map to ${id}: ${seen.get(id)} and ${file}.`);
    seen.set(id, file);
  }
  console.log(`${use.length} image(s) to insert, ${Object.keys(map).length - use.length} held or skipped.`);
  if (use.length) {
    const stage = fs.mkdtempSync(path.join(os.tmpdir(), "ingest-"));
    let prompts = "# ids to convert\n\n";
    for (const [file, id] of use) { fs.copyFileSync(path.join(PUB, file), path.join(stage, `${id}${path.extname(file).toLowerCase()}`)); prompts += `### \`${id}\`\n\n`; }
    const promptsFile = path.join(stage, "ids.md");
    fs.writeFileSync(promptsFile, prompts);
    const r = spawnSync(process.execPath, [path.join(root, "scripts", "prepare-images.mjs"), "--src", stage, "--prompts", promptsFile, ...(DRY ? ["--dry-run"] : []), ...(NO_BRAND ? ["--no-brand"] : [])], { stdio: "inherit" });
    if (r.status !== 0) fail("prepare-images failed; nothing was moved out of public/.");
  }
  if (DRY) { console.log("\nDry run: nothing was written or moved."); return; }
  // every raw image leaves public/ (inserted, held or duplicate) so nothing unoptimised is published
  fs.mkdirSync(RAW_ARCHIVE, { recursive: true });
  let moved = 0;
  for (const p of listImages(PUB)) { fs.copyFileSync(p, path.join(RAW_ARCHIVE, path.basename(p))); fs.unlinkSync(p); moved++; }
  console.log(`\nMoved ${moved} raw file(s) from public/ to brand_assets/gemini-originals/ (git-ignored).`);
  console.log("Next: npm run import-content && npm run build && npm run verify\nThen refresh the pending prompt sheet in the toolkit and commit.");
}

if (LIST) await list(); else await apply();
