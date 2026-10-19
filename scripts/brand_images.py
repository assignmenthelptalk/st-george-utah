"""Bake the logo badge into the site images.

Reads the unbranded originals from brand_assets/unbranded-images/ and writes
branded WebP files to src/assets/images/. Re-run after replacing an original.
Usage: python scripts/brand_images.py <path-to-logo-render.png>
(logo render = public/logo.svg screenshotted at 3x on a transparent background)
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "brand_assets" / "unbranded-images"
OUT = ROOT / "src" / "assets" / "images"

# Pages crop these images to different aspect ratios, so the badge must sit
# inside the area that always survives the crop.
SIDE_MARGIN = 280      # px from the right edge (hero/tile center-crops)
BOTTOM_MARGIN = 40     # default px from the bottom
BOTTOM_MARGIN_BY_NAME = {
    "about-before-after": 110,   # 900x400 crop
    "about-team": 110,
    "about-homeowner": 110,
    "about-clean-water": 175,    # 900x300 banner crop
}
# About-page images are shown full width (no sideways crop), so they get a true corner.
SIDE_MARGIN_BY_NAME = {
    "about-before-after": 40,
    "about-team": 40,
    "about-homeowner": 40,
    "about-clean-water": 40,
    "about-founders": 200,       # 700x500 crop
}
BADGE_OPACITY = 0.7   # 1.0 = solid, lower = more see-through
# 1200px-wide 4:3 photos are shown smaller than the 1408px ones, so the badge
# is drawn relatively larger and sits closer to the corner.
LOGO_WIDTH_BY_NAME = {
    "best-section": 360,
    "new-construction-installation-header": 330,
}
SIDE_MARGIN_BY_NAME.update({"best-section": 100, "new-construction-installation-header": 70})
BOTTOM_MARGIN_BY_NAME.update({"best-section": 70, "new-construction-installation-header": 50})
PAD = 14
LOGO_WIDTH = 300


def badge(logo_path: Path, width: int = LOGO_WIDTH) -> Image.Image:
    logo = Image.open(logo_path).convert("RGBA")
    logo = logo.crop(logo.getbbox())
    h = round(logo.height * width / logo.width)
    logo = logo.resize((width, h), Image.LANCZOS)
    w, hh = logo.width + PAD * 2, logo.height + PAD * 2
    pill = Image.new("RGBA", (w, hh), (0, 0, 0, 0))
    ImageDraw.Draw(pill).rounded_rectangle((0, 0, w - 1, hh - 1), radius=18, fill=(255, 255, 255, 230))
    pill.alpha_composite(logo, (PAD, PAD))
    pill.putalpha(pill.getchannel("A").point(lambda a: round(a * BADGE_OPACITY)))
    return pill


def main(logo_path: str) -> None:
    for src in sorted(SRC.glob("*.webp")):
        im = Image.open(src).convert("RGBA")
        pill = badge(Path(logo_path), LOGO_WIDTH_BY_NAME.get(src.stem, LOGO_WIDTH))
        bottom = BOTTOM_MARGIN_BY_NAME.get(src.stem, BOTTOM_MARGIN)
        x = im.width - SIDE_MARGIN_BY_NAME.get(src.stem, SIDE_MARGIN) - pill.width
        y = im.height - bottom - pill.height
        im.alpha_composite(pill, (x, y))
        im.convert("RGB").save(OUT / src.name, "WEBP", quality=88)
        print("branded", src.name)


if __name__ == "__main__":
    main(sys.argv[1])
