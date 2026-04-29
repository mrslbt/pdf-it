#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { generatePdf, closeBrowser } from './generator.js';
import { listTemplates } from './templates/index.js';

const server = new Server(
  { name: 'pdf-it', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_pdf',
      description:
        'Convert markdown content into a beautifully-designed PDF. Supports research-report (cover page + TOC) and plain templates.',
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
