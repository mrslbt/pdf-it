# pdf-it

Convert your Claude research output into a beautifully-designed PDF — cover page, table of contents, styled body, and page-numbered footer. One command.

## When to use this skill

Use this skill when the user says any of the following (or close variations):

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

### Basic usage

Call the `generate_pdf` tool with the content you want to convert:

```
generate_pdf({
  content: "<markdown content>",
  title: "<document title>",
  author: "<author name>"
})
```

The PDF will be saved to `~/Documents/pdf-it/` and the path returned.

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `content` | Yes | Markdown string to convert |
| `title` | No | Shown on cover page and footer |
| `author` | No | Shown on cover page |
| `output_path` | No | Custom output path (absolute) |
| `template` | No | `research-report` (default) or `plain` |

### Templates

- **research-report** — Cover page with title/author/date, auto-generated table of contents from H1/H2 headings, styled body, page-numbered footer. Best for research, summaries, and reports.
- **plain** — No cover, no TOC. Clean, dense body. Best for notes and short documents.

## Behavior

1. Collect the content to convert. This may be the current conversation, a file the user has provided, or content they paste.
2. Ask for a title if not obvious from context.
3. Call `generate_pdf` with the content and any available metadata.
4. Return the output path to the user.
5. Do not ask for author unless the user has mentioned their name earlier in the conversation.

## Example interaction

**User:** Save this as a PDF  
**Claude:** Generating PDF with the research-report template...  
*(calls generate_pdf)*  
**Claude:** Done. Your PDF is at `~/Documents/pdf-it/my-research-2025-01-15T14-30-00.pdf`

## Setup

### Install the MCP server

```bash
npm install -g pdf-it-mcp
```

### Add to Claude Code config

```json
{
  "mcpServers": {
    "pdf-it": {
      "command": "pdf-it-mcp"
    }
  }
}
```

Or if using `npx`:

```json
{
  "mcpServers": {
    "pdf-it": {
      "command": "npx",
      "args": ["pdf-it-mcp"]
    }
  }
}
```

### Requirements

- Node.js 18+
- Google Chrome installed (used for PDF rendering — no extra download)

### Custom Chrome path

If Chrome is in a non-standard location:

```json
{
  "mcpServers": {
    "pdf-it": {
      "command": "pdf-it-mcp",
      "env": {
        "CHROME_PATH": "/path/to/chrome"
      }
    }
  }
}
```
