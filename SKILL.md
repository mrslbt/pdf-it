# pdf-it

Convert a Claude session, research artifact, or markdown blob into a designed PDF: cover page, auto-generated table of contents, styled body, page-numbered footer. One tool call.

## When to use this skill

Trigger on any of the following (or close variations):

- "save this as PDF"
- "export as PDF"
- "make a PDF report from this"
- "turn this into a PDF"
- "generate a PDF"
- "/pdf"
- "create a report"
- "I want a PDF of this research"
- "PDF this"

## How to use

This skill requires the `pdf-it-mcp` MCP server. If it is not connected, prompt the user to install and connect it first (see Setup below).

Do NOT fall back to Chrome headless (`--print-to-pdf`), `cupsfilter`, `wkhtmltopdf`, `pandoc`, or LaTeX. Those bypass the cover, TOC, page-break, and embedded-font logic this server provides. If `generate_pdf` errors, fix the input and retry. Don't switch tools.

### Basic usage

```
generate_pdf({
  content: "<markdown content>",
  title: "<document title>",
  author: "<author name>"
})
```

The PDF saves to `~/Documents/pdf-it/{slug}-{timestamp}.pdf` and the path is returned.

### Parameters

| Parameter | Required | Description |
|---|---|---|
| `content` | Yes | Markdown string to convert |
| `title` | No | Shown on cover page and footer |
| `author` | No | Shown on cover page |
| `output_path` | No | Custom output path. Absolute (`/Users/...`) or tilde-prefixed (`~/Desktop/x.pdf`) both work |
| `template` | No | `research-report` (default) or `plain` |

### Templates

- **research-report**: Cover page with title/author/date, auto-generated table of contents from H1/H2 headings, styled body, page-numbered footer. Best for research, summaries, briefings, and reports.
- **plain**: No cover, no TOC. Dense, clean body. Best for short notes and single-page documents.

## Behavior

1. Collect the content to convert. This may be the current conversation, a file the user has provided, or content they paste.
2. Ask for a title if not obvious from context.
3. Call `generate_pdf` with the content and any available metadata.
4. Return the output path to the user.
5. Do not ask for author unless the user has mentioned their name earlier in the conversation.

## Example interaction

**User:** Save this as a PDF
**Claude:** Generating PDF with the research-report template…
*(calls generate_pdf)*
**Claude:** Done. Your PDF is at `~/Documents/pdf-it/my-research-2026-06-07T14-30-00.pdf`

## Setup

### Install the MCP server

```bash
npm install -g pdf-it-mcp
```

Or run on demand with `npx -y pdf-it-mcp`.

### Add to your client config

Claude Desktop, Claude Code, Cursor, Cline, Continue, Zed, and Goose all use the same shape:

```json
{
  "mcpServers": {
    "pdf-it": {
      "command": "npx",
      "args": ["-y", "pdf-it-mcp"]
    }
  }
}
```

For Claude Code specifically:

```bash
claude mcp add pdf-it -- npx -y pdf-it-mcp
```

### Requirements

- Node.js 20 or newer.
- No Chrome, no Puppeteer, no external runtime. The renderer (`@react-pdf/renderer`) and all fonts (Newsreader, JetBrains Mono, DM Sans) ship inside the package.
