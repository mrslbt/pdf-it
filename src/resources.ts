/**
 * MCP Resources exposed by pdf-it.
 *
 * Resources are addressable content the model can read on demand. We expose
 * static documentation about the templates and design system so an agent
 * deciding how to format a document can consult these inline.
 */

export type ResourceDefinition = {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
};

export const RESOURCES: ResourceDefinition[] = [
  {
    uri: 'pdf-it://templates/research-report',
    name: 'Research Report Template',
    description:
      'Specification for the research-report template: cover page, auto-generated TOC, body hierarchy, page-numbered footer.',
    mimeType: 'text/markdown',
  },
  {
    uri: 'pdf-it://templates/plain',
    name: 'Plain Template',
    description:
      'Specification for the plain template: dense body, no cover, no TOC. Best for short notes.',
    mimeType: 'text/markdown',
  },
  {
    uri: 'pdf-it://style-guide',
    name: 'pdf-it Style Guide',
    description:
      'Typography, color palette, and layout rules pdf-it follows. Useful when an agent decides how to structure markdown for best PDF output.',
    mimeType: 'text/markdown',
  },
  {
    uri: 'pdf-it://markdown-cheatsheet',
    name: 'Markdown Cheatsheet for pdf-it',
    description:
      'Quick reference of which markdown elements pdf-it supports and how each renders. Use this when an agent is unsure whether a feature will render correctly.',
    mimeType: 'text/markdown',
  },
];

export function readResource(uri: string): { uri: string; mimeType: string; text: string } {
  const def = RESOURCES.find((r) => r.uri === uri);
  if (!def) throw new Error(`Unknown resource: ${uri}`);

  if (uri === 'pdf-it://templates/research-report') {
    return {
      uri,
      mimeType: 'text/markdown',
      text: `# Research Report Template

## Structure

A research-report PDF has three parts:

1. **Cover page** — the H1 of the markdown becomes the cover title. Author and date sit below a hairline rule near the bottom of the page.
2. **Table of contents** — auto-generated from H1 and H2 headings in the markdown. Sub-headings (H3+) do not appear in the TOC.
3. **Body** — the rest of the markdown, rendered with hierarchy preserved.

Every body page has a footer with the document title (left) and the page number as "X / Y" (right).

## When to use

- Long-form research output (5+ pages)
- Reports a person should be able to scan via TOC
- Anything you would send to a client or stakeholder

## When NOT to use

- Short notes (use the plain template)
- Internal scratch documents
- Outputs without natural section structure

## Required markdown shape

- One H1 at the top (becomes the cover title)
- At least one H2 (otherwise the TOC will be empty)
- Body content under each H2

## Tips

- Pull quotes (markdown blockquotes) render as italic Newsreader with a hairline rule on the left. Use sparingly. One per spread is enough.
- Tables render with hairline borders. They handle 4+ columns cleanly. Avoid tables wider than 6 columns.
- Code blocks have a subtle gray background, no syntax highlighting, and respect page breaks. Long code blocks (30+ lines) may split across pages.
`,
    };
  }

  if (uri === 'pdf-it://templates/plain') {
    return {
      uri,
      mimeType: 'text/markdown',
      text: `# Plain Template

## Structure

No cover, no TOC. The markdown renders directly as body content with the same typography and page-numbered footer as the research-report template.

## When to use

- Quick notes
- Short summaries (1-3 pages)
- Outputs that do not need a cover page or contents page
- Reference cards, checklists, brief memos

## When NOT to use

- Long-form research (use research-report)
- Anything where a TOC would help the reader

## Required markdown shape

- No specific structure required
- Headings, body, code blocks, tables, blockquotes all render with the same styling as the research-report template
`,
    };
  }

  if (uri === 'pdf-it://style-guide') {
    return {
      uri,
      mimeType: 'text/markdown',
      text: `# pdf-it Style Guide (v2)

## Typography

Three families ship inside the package — no system-font fallback, no CDN, no
runtime download. Every PDF renders identically on every machine.

- **Newsreader** (serif, baked static instances)
  - Cover title: Display 60 Light, 48pt
  - Body H1: Display 32 Regular, 26pt
  - Body text + blockquotes: Text Regular/Medium/Italic, 11pt
- **DM Sans** (humanist sans, variable)
  - H2 (17pt 500), H3 (13pt 500 ink2), table headers, TOC "Contents" heading
- **JetBrains Mono** (monospace, regular + medium)
  - Inline code, code blocks (9.5pt), footer page numbers (9pt),
    cover author/date (10pt), figure source lines

## Color palette

Pure monochrome. No accent colors — anywhere.

- paper #FFFFFF — page background
- ink #111113 — primary text, cover title, body H1
- ink2 #2B2B2E — secondary text, H3, table cells, cover author
- muted #7A7A7E — page numbers, dates, source lines, TOC heading
- hair #E6E6E6 — all rules and divider lines (always 0.5pt)
- paper2 — subtle background for inline code and code blocks

Code blocks have no syntax highlighting on purpose. Color choices in PDFs
age badly.

## Layout

- Page size: A4 (595 × 842 pt)
- Body page padding: 28mm top + bottom, 25mm sides
- Footer: 15mm from page bottom, 25mm side margins
- Cover title sits at 35% from page top
- Cover author + date sit 22mm above page bottom, separated by a 200pt × 0.5pt hairline rule
- Line-height: 1.55 for body, 1.7 for cover metadata

## Page break rules

- Cover and TOC are dedicated pages — no body content shares them
- Code blocks ≤ ~30 lines avoid splitting (wrap={false})
- Tables: rows do not split mid-row
- Blockquotes kept together as wrap={false} blocks
- Headings stay with their following content (no orphan headings)

## Footer

- Document title left (truncates), "pageNumber / totalPages" right
- JetBrains Mono 9pt muted (#7A7A7E)
- Counter starts at 1 on the first body page (cover + TOC excluded from numbering)
- Hidden on cover and TOC

## Why this matters

The design system is enforced in code. Every value lives in
\`src/templates/design-tokens.ts\` as the single source of truth. Components
read tokens, never hardcode. If an agent generates markdown intended for a
research-report PDF, this style guide describes how the PDF will actually
look — match content density and structure to it.
`,
    };
  }

  if (uri === 'pdf-it://markdown-cheatsheet') {
    return {
      uri,
      mimeType: 'text/markdown',
      text: `# Markdown Cheatsheet for pdf-it (v2)

## Headings

- \`# H1\` → Newsreader Display 32 Regular, 26pt ink — body section start
- \`## H2\` → DM Sans 500, 17pt ink — sub-section
- \`### H3\` → DM Sans 500, 13pt ink2 — minor heading
- \`#### H4\` and below → render as H3

In the research-report template, the first H1 in the markdown becomes the
cover title (and the document Title metadata) if no title prop is passed.
All H1 and H2 entries auto-populate the TOC. H3 does not appear in the TOC.

## Inline

- \`**bold**\` → Newsreader Text Medium
- \`*italic*\` → Newsreader Text Italic
- \`\\\`inline code\\\`\` → JetBrains Mono 9.5pt on paper2 background
- \`[link](url)\` → underlined, color inherits

## Block

- Paragraphs: Newsreader Text 11pt, line-height 1.55, ink
- Code blocks (triple-backtick): JetBrains Mono 9.5pt on paper2 background,
  18pt padding, 4pt border-radius. No syntax highlighting.
- Tables (GFM pipe syntax): DM Sans, 1pt header underline, 0.5pt row dividers
- Blockquotes: italic Newsreader 12pt with 0.5pt left hair border, 22pt left padding
- Ordered + unordered lists: 24pt left margin, muted bullets/numbers
- Horizontal rules (\`---\`): 0.5pt hair, 32pt vertical margins

## What does NOT render specially

- HTML embedded in markdown: rendered as raw text
- Mermaid / Graphviz / Vega / diagram blocks: not supported
- LaTeX math: not supported
- Footnotes: rendered as standard markdown links
- Images: not yet supported in v2 (planned)

## Page break behavior

- Code blocks ≤ ~30 lines stay on one page (wrap={false})
- Tables: row dividers split cleanly but a row never splits across pages
- Blockquotes: kept together as a single block
- Headings stay with their following content

## Charts (programmatic only)

The HorizontalBarChart primitive is available in TypeScript but cannot be
expressed via markdown alone. Charts require building a custom template
that imports the component and passes typed data.
`,
    };
  }

  throw new Error(`Resource ${uri} not implemented`);
}
