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
      text: `# pdf-it Style Guide

## Typography

- Body and primary headings: Inter
- Code: JetBrains Mono
- Page numbers and footer: Helvetica (embedded by pdf-lib)

## Color palette

- Background: pure white (#FFFFFF)
- Body text: near-black (#1c1c1e)
- Headings: black (#111)
- Code block background: light gray (#fafafa)
- Hairline borders: light gray (#ebebeb)
- Footer color: medium gray (#aaa)

No accent colors. No syntax highlighting in code blocks. Restraint compounds.

## Layout

- Page size: A4
- Margins: 25mm sides and top, 30mm bottom
- Single column
- Generous line-height (1.7 for body)
- Page break logic respects code blocks, tables, blockquotes, and headings

## Page break rules

- Headings: never end a page
- Code blocks: avoid splitting if under ~30 lines
- Tables: rows do not split mid-row
- Pull quotes: kept together
- Orphans and widows: minimum 3 lines

## Footer

- Document title (left), page number "X / Y" (right)
- Helvetica 8pt, medium gray
- Hidden on cover and TOC pages
`,
    };
  }

  if (uri === 'pdf-it://markdown-cheatsheet') {
    return {
      uri,
      mimeType: 'text/markdown',
      text: `# Markdown Cheatsheet for pdf-it

## Headings

- # H1 → primary heading, large weight 700
- ## H2 → section heading with bottom border
- ### H3 → sub-section heading
- #### H4-H6 → smaller bold headings

## Inline

- **bold** → font-weight 600
- *italic* → italic Inter
- \`inline code\` → JetBrains Mono with light gray background
- [link](url) → underlined, inherits text color

## Block

- Paragraphs: standard prose
- Code blocks (\`\`\`): JetBrains Mono on light gray, no syntax highlighting
- Tables: hairline borders, header has gray background
- Blockquotes: italic with left border, used as pull quotes
- Lists (ordered and unordered): standard indent
- Horizontal rules: hairline

## What does NOT render specially

- HTML embedded in markdown: rendered as raw markdown
- Mermaid or other diagram blocks: not supported
- LaTeX math: not supported
- Footnotes: rendered as standard markdown links

## Page break behavior

- Headings stay with their following content
- Code blocks under ~30 lines stay on one page
- Tables: rows do not break mid-row
- Long content flows naturally with orphan/widow control
`,
    };
  }

  throw new Error(`Resource ${uri} not implemented`);
}
