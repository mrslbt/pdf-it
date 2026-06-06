# AGENTS.md

Project contract for AI coding agents (Cursor, Codex, Continue.dev, Claude Code, etc.) working in this repo. Read this before making changes.

## What this project is

`pdf-it-mcp` is an MCP server + Claude Code skill that converts markdown into designed PDFs. v2.0.0 is a native renderer: `@react-pdf/renderer` + remark, no Chrome, no Puppeteer, no external runtime at render time. Fonts are embedded.

Two templates ship: `research-report` (cover + auto-TOC + footer) and `plain` (body only). Two tools: `generate_pdf`, `list_templates`.

## Source of truth

`src/templates/design-tokens.ts` is the single source for colors, type sizes, leadings, mm/pt conversion, and cover positioning. Every component reads from this file. **Do not hardcode design values anywhere else.**

If a component needs a value not yet in `design-tokens.ts`, add it to `design-tokens.ts` first, then read it from the component. No exceptions.

## Architecture

```
src/
  index.ts                    MCP server entry (low-level SDK Server)
  generator.tsx               generatePdf() — picks template, calls renderToFile
  types.ts                    GeneratePdfOptions / Result
  utils.ts                    slugify only
  prompts.ts                  MCP prompts: research_report, quick_note, pdf_outline
  resources.ts                MCP resources: pdf-it://templates/* + style-guide + cheatsheet
  markdown/render.tsx         remark mdast → React component tree + TOC entry list
  templates/
    index.ts                  template registry { "research-report", "plain" }
    ResearchReport.tsx        Cover + TOC + Body Page with Footer
    Plain.tsx                 Body Page only, optional Footer
    design-tokens.ts          single source of truth
    fonts.ts                  registerFonts() — call once before render
    components/
      Cover.tsx               type-only cover
      TOC.tsx                 "Contents" + entry list, in-PDF anchor Links
      Footer.tsx              fixed footer, JetBrains Mono page numbers
      body.tsx                H1/H2/H3, P, Strong/Em, A, InlineCode, CodeBlock,
                              Blockquote, UL/OL, HR, Tbl + mm() helper
      charts/
        HorizontalBarChart.tsx  first chart primitive (monochrome, hairline)
  assets/fonts/               ships into dist via npm run build:assets
  preview-*.tsx               dev-only — excluded from tsconfig, not in dist
```

## Build + verify

```bash
npm run build       # tsc + cpSync src/assets → dist/assets
node dist/index.js  # boot MCP server on stdio (Ctrl-C to stop)
```

There is no Jest. The CI smoke test (`.github/workflows/ci.yml`) boots the server, sends `initialize` + `tools/list` + a real `tools/call generate_pdf`, and asserts a PDF >1 KB was written. Mirror this pattern when adding new tools or templates.

Manual visual verification:
```bash
npx tsx src/preview-research-report.tsx   # writes a sample to /tmp
npx tsx src/preview-chart.tsx
npx tsx src/preview-cover.tsx
```

## Conventions

- **All relative imports end in `.js`** even when importing a `.ts`/`.tsx` file. This is NodeNext + ESM. The `.js` is fictional at the source level but real at runtime; TypeScript resolves it correctly.
- **Every `.tsx` file imports `JSX` explicitly**: `import type { JSX } from "react"`. React 19 + TypeScript 6 require this.
- **No CSS-in-JS for layout.** Use `StyleSheet.create({...})` from `@react-pdf/renderer`. Look at `body.tsx` for the idiom.
- **No accent colors.** The design language is ink (#111113), ink2 (#2B2B2E), muted (#7A7A7E), hair (#E6E6E6) on paper (#FFFFFF) only. If you need to differentiate something, use weight, size, or whitespace — never hue.
- **mm and pt.** Page units are points; physical layout values use the `mm(n)` helper from `body.tsx`. Read `design-tokens.ts` for the constant.
- **Fonts are baked, not variable.** Variable-font opsz cannot be passed through `@react-pdf/renderer`'s `Font.register`. Adding a new optical size means baking a new static instance with fontTools and shipping the TTF.

## Don't change without checking

- The five Newsreader static instances. They were baked specifically to solve the variable-font opsz axis problem. Replacing them with the variable TTF will silently break display-size rendering.
- The cover positioning ratios in `design-tokens.ts` (`titleTopRatio`, `bottomMargin`, `dividerWidth`). They were derived from the v1 reference layout.
- Tool annotations on `generate_pdf` and `list_templates`. Clients use these for auto-approve and UI labeling.
- Server `instructions` in `src/index.ts`. They steer Claude away from Chrome-headless / cupsfilter / pandoc fallbacks at the tool-shopping stage.

## How to add things

**New template** — add a `.tsx` file in `src/templates/`, export a component that takes `{ markdown, title, author }` and returns a `<Document>`. Register it in `src/templates/index.ts`. Add to the `template` enum in `src/index.ts`'s tool schema.

**New body primitive** — add to `src/templates/components/body.tsx`. Use `StyleSheet.create` for styles. Read colors and leadings from `design-tokens.ts`.

**New chart** — add a `.tsx` file in `src/templates/components/charts/`. Follow `HorizontalBarChart.tsx`: monochrome, hairline axes, DM Sans labels, JetBrains Mono values, optional title (DM Sans uppercase tracked) and source line.

**New MCP prompt** — add to `src/prompts.ts`. Route the agent toward `generate_pdf` with the right arg shape.

**New MCP resource** — add to `src/resources.ts`. URIs use the `pdf-it://` scheme.

## Release checklist

Before shipping a new version:

1. Bump `package.json#version` and `server.json#version` and `server.json#packages[0].version`. All three must match.
2. Add a CHANGELOG entry. Breaking changes go under a `BREAKING CHANGES` heading.
3. Run `npm run build` then boot `dist/index.js` and send `tools/list` — confirm both tools have `annotations` on the wire.
4. Run the three preview scripts and visually inspect the output PDFs.
5. Run `npm pack --dry-run` — confirm 70-80 files, ~750 KB compressed, no `src/preview-*` shipped.
6. Tag `vX.Y.Z` locally before pushing.
7. `npm publish` is the irreversible step. Get explicit user approval before running it.
