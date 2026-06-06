/**
 * Font registration for @react-pdf/renderer.
 *
 * We use STATIC instances of Newsreader, baked from the variable font at
 * specific (opsz, wght) coordinates. This matters: react-pdf's Font.register
 * does not expose font-variation-settings, so a variable Newsreader would
 * render every weight at the font's default optical size (≈14) — which
 * makes display sizes look hairline-thin.
 *
 * The bake recipe (see scripts/bake-fonts.ts equivalent in /docs):
 *   Newsreader-Display60-Light.ttf   opsz=60, wght=300   cover title
 *   Newsreader-Display32-Regular.ttf opsz=32, wght=400   H1
 *   Newsreader-Text-Regular.ttf      opsz=14, wght=400   body
 *   Newsreader-Text-Medium.ttf       opsz=14, wght=500   body strong
 *   Newsreader-Text-Italic.ttf       opsz=14, wght=400   italic body / blockquote
 *
 * Families are split by intended display size — a component picks the
 * family it needs, not a generic "Newsreader" + weight number. This is
 * the only way to get the original design's optical-size differentiation
 * to survive the static-font constraint.
 */

import { Font } from "@react-pdf/renderer";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const fontPath = (name: string): string =>
  join(HERE, "..", "assets", "fonts", name);

let registered = false;

export function registerFonts(): void {
  if (registered) return;

  // Newsreader at display optical size 60 — for the cover title only.
  Font.register({
    family: "NewsreaderDisplay60",
    fonts: [
      { src: fontPath("Newsreader-Display60-Light.ttf"), fontWeight: 300 },
    ],
  });

  // Newsreader at display optical size 32 — for body H1.
  Font.register({
    family: "NewsreaderDisplay32",
    fonts: [
      { src: fontPath("Newsreader-Display32-Regular.ttf"), fontWeight: 400 },
    ],
  });

  // Newsreader at text optical size 14 — body paragraphs, lists, blockquotes,
  // and TOC entries. Multiple weights + italic registered together so a
  // <Text style={{ fontFamily: 'NewsreaderText', fontStyle: 'italic' }}/>
  // resolves correctly.
  Font.register({
    family: "NewsreaderText",
    fonts: [
      { src: fontPath("Newsreader-Text-Regular.ttf"), fontWeight: 400 },
      { src: fontPath("Newsreader-Text-Medium.ttf"), fontWeight: 500 },
      {
        src: fontPath("Newsreader-Text-Italic.ttf"),
        fontWeight: 400,
        fontStyle: "italic",
      },
    ],
  });

  // JetBrains Mono — code, page numbers, metadata.
  Font.register({
    family: "JetBrainsMono",
    fonts: [
      { src: fontPath("JetBrainsMono-Regular.ttf"), fontWeight: 400 },
      { src: fontPath("JetBrainsMono-Medium.ttf"), fontWeight: 500 },
    ],
  });

  // DM Sans — sub-headings, table type, the "Contents" toc heading.
  // Variable file is fine here because the optical size axis doesn't exist
  // for DM Sans; only the weight axis varies.
  Font.register({
    family: "DMSans",
    fonts: [
      { src: fontPath("DMSans-Variable.ttf"), fontWeight: 400 },
      { src: fontPath("DMSans-Variable.ttf"), fontWeight: 500 },
      { src: fontPath("DMSans-Variable.ttf"), fontWeight: 600 },
    ],
  });

  registered = true;
}
