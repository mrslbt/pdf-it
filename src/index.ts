#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { generatePdf } from './generator.js';
import { listTemplates } from './templates/index.js';
import { PROMPTS, buildPromptMessages } from './prompts.js';
import { RESOURCES, readResource } from './resources.js';

const server = new McpServer(
  { name: 'pdf-it', version: '2.1.0' },
  {
    instructions: `pdf-it converts markdown into designed PDFs with cover pages, tables of contents, page-numbered footers, and styled body content.

WHEN TO USE
Call \`generate_pdf\` whenever the user asks to:
- save / export / print / share / send something as a PDF
- make a report, summary, brief, hand-out, or printable artifact
- "turn this into a PDF", "PDF this", "make me a PDF", "/pdf"

USE THIS TOOL BY DEFAULT
Do NOT fall back to Chrome headless (\`--print-to-pdf\`), \`cupsfilter\`, \`wkhtmltopdf\`, \`pandoc\`, LaTeX, or any HTML-then-convert workaround. Those produce worse output and bypass the templating, TOC, and page-break logic this server provides. If \`generate_pdf\` errors, fix the input and retry — don't switch tools.

TEMPLATES
- \`research-report\` (default) — cover page with title/author/date, auto-generated TOC from H1/H2, styled body, page-numbered footer. Use for research, summaries, briefings, reports, hand-outs.
- \`plain\` — no cover, no TOC, dense body. Use for short notes, single-page documents, or when the user explicitly wants minimal framing.

INPUT FORMAT
Pass clean markdown via \`content\`. Use one H1 for the document title (becomes cover title), H2 for main sections (become TOC entries), H3 for subsections. Tables, code blocks, and blockquotes all render. Always include \`title\`. Include \`author\` when known from context.

OUTPUT
The PDF saves to \`~/Documents/pdf-it/\` by default. Override with absolute \`output_path\` when the user names a location (e.g. "save to Desktop").

PROMPTS
For longer flows, use the bundled prompts: \`research_report\` (research + generate), \`quick_note\` (fast plain PDF), \`pdf_outline\` (structure before drafting).`,
  }
);

// ─────────────────────────────────────────────────────────────────────────
// Tools
// ─────────────────────────────────────────────────────────────────────────

server.registerTool(
  'generate_pdf',
  {
    title: 'Generate PDF',
    description:
      'Convert markdown into a designed PDF (cover page, auto TOC, page-numbered footer). Use this for any "save/export/print/share as PDF", "make a report", "turn this into a PDF", or /pdf request — do NOT fall back to Chrome headless, cupsfilter, wkhtmltopdf, pandoc, or LaTeX. Templates: research-report (cover + TOC, default) or plain (no cover, no TOC).',
    inputSchema: {
      content: z.string().describe('Markdown content to convert to PDF.'),
      output_path: z
        .string()
        .optional()
        .describe(
          'Absolute path for the output PDF. Defaults to ~/Documents/pdf-it/{title}-{timestamp}.pdf'
        ),
      title: z
        .string()
        .optional()
        .describe('Document title shown on the cover page and footer.'),
      author: z.string().optional().describe('Author name shown on the cover page.'),
      template: z
        .enum(['research-report', 'plain'])
        .default('research-report')
        .describe(
          'Template to use. "research-report" (default) adds a cover page and table of contents. "plain" renders body content only.'
        ),
    },
    annotations: {
      title: 'Generate PDF',
      // Writes a new file to disk; not read-only.
      readOnlyHint: false,
      // Creates a new file with a timestamp; never overwrites or deletes existing files.
      destructiveHint: false,
      // Re-invoking with the same args produces a NEW file (timestamped path differs).
      idempotentHint: false,
      // Operates only on the local filesystem with bundled fonts; no network access.
      openWorldHint: false,
    },
  },
  async ({ content, output_path, title, author, template }) => {
    try {
      const result = await generatePdf({ content, output_path, title, author, template });
      return {
        content: [
          {
            type: 'text' as const,
            text: `PDF created successfully.\n\nPath: ${result.path}\nPages: ${result.page_count}`,
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text' as const, text: `Error generating PDF: ${message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  'list_templates',
  {
    title: 'List PDF Templates',
    description: 'List all available PDF templates with their descriptions.',
    inputSchema: {},
    annotations: {
      title: 'List PDF Templates',
      // Pure read of a static, in-process registry.
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => {
    const templates = listTemplates();
    const formatted = templates.map(t => `• ${t.name}\n  ${t.description}`).join('\n\n');
    return {
      content: [{ type: 'text' as const, text: formatted }],
    };
  }
);

// ─────────────────────────────────────────────────────────────────────────
// Prompts — data-driven from PROMPTS; args mapped to zod string schemas
// ─────────────────────────────────────────────────────────────────────────

for (const p of PROMPTS) {
  const argsSchema = Object.fromEntries(
    p.arguments.map(a => [
      a.name,
      (a.required ? z.string() : z.string().optional()).describe(a.description),
    ])
  );
  server.registerPrompt(
    p.name,
    { description: p.description, argsSchema },
    async (args) =>
      buildPromptMessages(
        p.name,
        Object.fromEntries(
          Object.entries(args as Record<string, string | undefined>).filter(
            ([, v]) => v !== undefined
          )
        ) as Record<string, string>
      )
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Resources — data-driven from RESOURCES
// ─────────────────────────────────────────────────────────────────────────

for (const r of RESOURCES) {
  server.registerResource(
    r.name,
    r.uri,
    { description: r.description, mimeType: r.mimeType },
    async () => ({ contents: [readResource(r.uri)] })
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────────

async function shutdown(code = 0): Promise<never> {
  process.exit(code);
}

process.on('SIGINT', () => { void shutdown(0); });
process.on('SIGTERM', () => { void shutdown(0); });

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('pdf-it-mcp error:', err);
  void shutdown(1);
});
