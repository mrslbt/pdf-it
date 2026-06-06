/**
 * Design tokens — ported verbatim from the original src/templates/styles.ts
 * (the v1 Puppeteer-rendered version's design system).
 *
 * Refined editorial restraint:
 * - Newsreader serif for body and primary headings
 * - DM Sans for sub-headings
 * - JetBrains Mono for code, page numbers, metadata
 * - No accent colors in the base palette — accent is brand-kit injected only
 * - No syntax highlighting in code blocks (color in PDFs ages badly)
 */

// ── Colors ─────────────────────────────────────────────────
export const colors = {
  paper: "#FFFFFF",
  paper2: "#F4F4F4",
  ink: "#111113",
  ink2: "#2B2B2E",
  muted: "#7A7A7E",
  hair: "#E6E6E6",
} as const;

// ── Type scale (point sizes, matching original baseCss) ────
export const type = {
  body: 11,           // body Newsreader
  h1: 26,             // Newsreader 400
  h2: 17,             // DM Sans 500
  h3: 13,             // DM Sans 500
  h456: 10,           // DM Sans 500 uppercase tracked
  code: 9.5,          // JetBrains Mono
  inlineCode: 9.5,
  caption: 9,         // JetBrains Mono figcaption
  meta: 10,           // JetBrains Mono cover metadata
  coverTitle: 48,     // Newsreader 300, opsz 60
  blockquote: 12,     // Newsreader italic
} as const;

// ── Line heights ──────────────────────────────────────────
export const leading = {
  body: 1.55,
  h1: 1.2,
  h2: 1.3,
  h3: 1.4,
  blockquote: 1.5,
  meta: 1.7,
  coverTitle: 1.05,
  code: 1.55,
} as const;

// ── Spacing primitives ─────────────────────────────────────
// 1mm ≈ 2.834pt for conversion of original mm-based values.
export const mm = (n: number): number => n * 2.834;

// Cover-specific positioning (from the original CSS):
//  • title block sits at 35vh from the cover's top edge
//  • bottom metadata sits 22mm from the page bottom
//  • hairline divider is a fixed 200px wide
export const cover = {
  titleTopRatio: 0.35,
  bottomMargin: mm(22),
  dividerWidth: 200,
  dividerHeight: 0.5,
} as const;
