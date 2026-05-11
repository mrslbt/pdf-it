#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { generatePdf, closeBrowser } from './generator.js';
import { listTemplates } from './templates/index.js';
import { PROMPTS, buildPromptMessages } from './prompts.js';
import { RESOURCES, readResource } from './resources.js';

const server = new Server(
  { name: 'pdf-it', version: '1.2.0' },
  {
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
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

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_pdf',
      description:
        'Convert markdown into a designed PDF (cover page, auto TOC, page-numbered footer). Use this for any "save/export/print/share as PDF", "make a report", "turn this into a PDF", or /pdf request — do NOT fall back to Chrome headless, cupsfilter, wkhtmltopdf, pandoc, or LaTeX. Templates: research-report (cover + TOC, default) or plain (no cover, no TOC).',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'Markdown content to convert to PDF.',
          },
          output_path: {
            type: 'string',
            description:
              'Absolute path for the output PDF. Defaults to ~/Documents/pdf-it/{title}-{timestamp}.pdf',
          },
          title: {
            type: 'string',
            description: 'Document title shown on the cover page and footer.',
          },
          author: {
            type: 'string',
            description: 'Author name shown on the cover page.',
          },
          template: {
            type: 'string',
            enum: ['research-report', 'plain'],
            description:
              'Template to use. "research-report" (default) adds a cover page and table of contents. "plain" renders body content only.',
            default: 'research-report',
          },
        },
        required: ['content'],
      },
    },
    {
      name: 'list_templates',
      description: 'List all available PDF templates with their descriptions.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'generate_pdf') {
    const { content, output_path, title, author, template } = args as {
      content: string;
      output_path?: string;
      title?: string;
      author?: string;
      template?: string;
    };

    if (!content || typeof content !== 'string') {
      return {
        content: [{ type: 'text', text: 'Error: content is required and must be a string.' }],
        isError: true,
      };
    }

    try {
      const result = await generatePdf({ content, output_path, title, author, template });
      return {
        content: [
          {
            type: 'text',
            text: `PDF created successfully.\n\nPath: ${result.path}\nPages: ${result.page_count}`,
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text', text: `Error generating PDF: ${message}` }],
        isError: true,
      };
    }
  }

  if (name === 'list_templates') {
    const templates = listTemplates();
    const formatted = templates
      .map(t => `• ${t.name}\n  ${t.description}`)
      .join('\n\n');
    return {
      content: [{ type: 'text', text: formatted }],
    };
  }

  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// ─────────────────────────────────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPTS.map((p) => ({
    name: p.name,
    description: p.description,
    arguments: p.arguments,
  })),
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    return buildPromptMessages(name, args);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message);
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCES.map((r) => ({
    uri: r.uri,
    name: r.name,
    description: r.description,
    mimeType: r.mimeType,
  })),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  try {
    const content = readResource(uri);
    return {
      contents: [content],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message);
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────────

async function shutdown(code = 0): Promise<never> {
  try {
    await closeBrowser();
  } catch {
    // ignore
  }
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
