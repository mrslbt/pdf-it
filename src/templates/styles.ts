/**
 * Shared base CSS used by every template.
 *
 * Design system: refined editorial restraint.
 * - Newsreader (serif) for body and primary headings (carries the editorial weight)
 * - DM Sans for sub-headings (keeps hierarchy crisp without ornament)
 * - JetBrains Mono for code, page numbers, metadata
 * - Pure white paper, near-black ink, neutral grays (no warm tint)
 * - No accent colors (restraint ages forever)
 * - No syntax highlighting in code blocks (color in PDFs ages badly)
 * - Generous line-height and breathing room
 */
export const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,ital,wght@6..72,0,300;6..72,0,400;6..72,0,500;6..72,1,400&display=swap');

  :root {
    --paper: #FFFFFF;
    --paper-2: #F4F4F4;
    --ink: #111113;
    --ink-2: #2B2B2E;
    --muted: #7A7A7E;
    --hair: #E6E6E6;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { background: var(--paper); }

  html {
    font-family: 'Newsreader', 'Iowan Old Style', 'Charter', Georgia, serif;
    font-size: 11pt;
    color: var(--ink);
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1, 'onum' 1;
    font-variation-settings: 'opsz' 14;
  }

  /* ── Headings ───────────────────────────────────────────── */
  h1 {
    font-family: 'Newsreader', 'Iowan Old Style', 'Charter', Georgia, serif;
    font-size: 26pt;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--ink);
    font-variation-settings: 'opsz' 32;
    margin: 44px 0 16px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h1:first-child { margin-top: 0; }

  h2 {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 17pt;
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.005em;
    color: var(--ink);
    margin: 36px 0 12px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h3 {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13pt;
    font-weight: 500;
    line-height: 1.4;
    color: var(--ink-2);
    margin: 26px 0 8px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h4, h5, h6 {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10pt;
    font-weight: 500;
    color: var(--ink-2);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 20px 0 6px;
    page-break-after: avoid;
    break-after: avoid;
  }

  p { margin-bottom: 12px; }

  a {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--hair);
    text-decoration-thickness: 0.5px;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
    word-break: normal;
  }

  strong { font-weight: 500; }
  em { font-style: italic; }

  /* ── Code ───────────────────────────────────────────────── */
  code {
    font-family: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
    font-size: 9.5pt;
    background: var(--paper-2);
    border-radius: 2px;
    padding: 1px 5px;
    color: var(--ink);
    font-feature-settings: 'liga' 0;
  }

  pre {
    background: var(--paper-2);
    border: none;
    border-radius: 4px;
    padding: 18px 22px;
    margin: 18px 0 22px;
    page-break-inside: avoid;
    break-inside: avoid;
    overflow: hidden;
  }

  pre code {
    background: none;
    padding: 0;
    border-radius: 0;
    color: var(--ink);
    font-size: 9.5pt;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
    font-feature-settings: 'liga' 0;
  }

  /* ── Tables ─────────────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 18px 0 22px;
    font-family: 'DM Sans', -apple-system, sans-serif;
    font-size: 10pt;
  }

  thead { display: table-header-group; }
  tr { page-break-inside: avoid; break-inside: avoid; }

  th {
    font-weight: 500;
    text-align: left;
    padding: 10px 12px 9px;
    border-bottom: 1px solid var(--ink);
    color: var(--ink);
    font-size: 9.5pt;
    letter-spacing: 0.02em;
  }

  td {
    padding: 9px 12px;
    border-bottom: 0.5px solid var(--hair);
    vertical-align: top;
    color: var(--ink-2);
  }

  tr:last-child td { border-bottom: none; }

  /* ── Blockquote (pull quote) ────────────────────────────── */
  blockquote {
    font-family: 'Newsreader', 'Iowan Old Style', Georgia, serif;
    font-style: italic;
    font-size: 12pt;
    line-height: 1.5;
    color: var(--ink-2);
    border-left: 0.5px solid var(--hair);
    margin: 22px 0;
    padding: 4px 0 4px 22px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  blockquote p { margin-bottom: 8px; }
  blockquote p:last-child { margin-bottom: 0; }

  /* ── Lists ──────────────────────────────────────────────── */
  ul, ol { margin: 10px 0 14px 24px; }
  li { margin: 4px 0; padding-left: 4px; }
  li::marker { color: var(--muted); }
  li > ul, li > ol { margin: 4px 0 4px 20px; }

  /* ── HR ─────────────────────────────────────────────────── */
  hr {
    border: none;
    border-top: 0.5px solid var(--hair);
    margin: 32px 0;
  }

  /* ── Images & figures ───────────────────────────────────── */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16px 0;
  }

  figure {
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 16px 0;
  }

  figcaption {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
    color: var(--muted);
    letter-spacing: 0.02em;
    margin-top: 6px;
  }

  /* ── Orphan/widow control ───────────────────────────────── */
  p, li { orphans: 3; widows: 3; }
`;
