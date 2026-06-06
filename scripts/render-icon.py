#!/usr/bin/env python3
"""
Render pdf-it's project icon.

The icon is the capital letter P set in Newsreader Display 60 Light — the exact
same font used for the cover title in the research-report template. The mark
shares an alphabet with the artifact the tool produces.

Outputs four files into /tmp for review:
  - pdf-it-icon-256-onpaper.png    256x256, paper-white background
  - pdf-it-icon-256-transparent.png 256x256, transparent background
  - pdf-it-icon-512-onpaper.png    512x512, paper-white background
  - pdf-it-icon-512-transparent.png 512x512, transparent background

After approval, copy the chosen variant(s) into ./assets/ and ./public/ for
distribution.

Run from repo root: python3 scripts/render-icon.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
FONT_PATH = REPO / "src" / "assets" / "fonts" / "Newsreader-Display60-Light.ttf"

INK = (17, 17, 19, 255)          # #111113 — the same ink used in body H1 / cover title
PAPER = (255, 255, 255, 255)     # pure white paper
TRANSPARENT = (255, 255, 255, 0) # for adaptive directory listings


def render(size: int, background: tuple[int, int, int, int], glyph: str = "P") -> Image.Image:
    img = Image.new("RGBA", (size, size), background)
    draw = ImageDraw.Draw(img)

    # Iteratively size the font so the glyph occupies ~62% of the canvas height.
    # 62% leaves clean padding while letting the form dominate the tile.
    target_height = int(size * 0.62)
    font_size = target_height
    for _ in range(8):
        font = ImageFont.truetype(str(FONT_PATH), font_size)
        # PIL .getbbox returns (l, t, r, b) of the inked pixels relative to origin.
        bbox = font.getbbox(glyph)
        glyph_height = bbox[3] - bbox[1]
        if glyph_height == 0:
            break
        ratio = target_height / glyph_height
        if 0.97 < ratio < 1.03:
            break
        font_size = max(8, int(font_size * ratio))

    font = ImageFont.truetype(str(FONT_PATH), font_size)
    bbox = font.getbbox(glyph)
    glyph_width = bbox[2] - bbox[0]
    glyph_height = bbox[3] - bbox[1]

    # Center the glyph on the canvas. We have to compensate for bbox.left / top
    # because Pillow draws at the glyph's top-left origin, not the ink box.
    x = (size - glyph_width) // 2 - bbox[0]
    y = (size - glyph_height) // 2 - bbox[1]

    draw.text((x, y), glyph, font=font, fill=INK)
    return img


def main() -> None:
    out = Path("/tmp")
    variants = [
        (256, "onpaper", PAPER),
        (256, "transparent", TRANSPARENT),
        (512, "onpaper", PAPER),
        (512, "transparent", TRANSPARENT),
    ]
    for size, name, bg in variants:
        img = render(size, bg)
        path = out / f"pdf-it-icon-{size}-{name}.png"
        img.save(path)
        print(f"  {path}")


if __name__ == "__main__":
    main()
