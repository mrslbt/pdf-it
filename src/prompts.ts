/**
 * MCP Prompts exposed by pdf-it.
 *
 * Prompts are reusable templates users invoke by name. Each prompt returns
 * a message sequence that primes the model to produce a specific kind of
 * output that flows naturally into a generate_pdf call.
 */

export type PromptArg = {
  name: string;
  description: string;
  required?: boolean;
};

export type PromptDefinition = {
  name: string;
  description: string;
  arguments: PromptArg[];
};

export const PROMPTS: PromptDefinition[] = [
  {
    name: 'research_report',
    description:
      'Generate a designed PDF research report on a topic. Researches the topic, structures the findings as markdown, and generates a research-report PDF with cover, TOC, and page numbers.',
    arguments: [
      {
        name: 'topic',
        description: 'The research topic or question.',
        required: true,
      },
      {
        name: 'author',
        description: 'Author name to show on the cover.',
        required: false,
      },
    ],
  },
  {
    name: 'quick_note',
    description:
      'Save the current conversation or content as a quick PDF note using the plain template (no cover, no TOC).',
    arguments: [
      {
        name: 'title',
        description: 'Title for the note. Used in the filename and footer.',
        required: false,
      },
    ],
  },
  {
    name: 'pdf_outline',
    description:
      'Draft a structured outline for a research report before generating the full PDF. Useful for long-form documents where alignment on structure matters before research begins.',
    arguments: [
      {
        name: 'topic',
        description: 'The topic to outline.',
        required: true,
      },
    ],
  },
];

export function buildPromptMessages(
  name: string,
  args: Record<string, string> | undefined
): { description: string; messages: Array<{ role: 'user'; content: { type: 'text'; text: string } }> } {
  const def = PROMPTS.find((p) => p.name === name);
  if (!def) throw new Error(`Unknown prompt: ${name}`);

  const a = args ?? {};

  if (name === 'research_report') {
    const topic = a['topic'] ?? '[unspecified topic]';
    const author = a['author'] ?? '';
    const text = `Generate a designed PDF research report on: ${topic}

Steps:

1. Research the topic thoroughly. Use whatever tools are available (web search, file reads, other MCPs). Aim for substance over breadth.

2. Structure the findings as clean markdown:
   - One H1 for the document title (this becomes the cover title)
   - H2 for main sections (these auto-generate the table of contents)
   - H3 for subsections where they add clarity
   - Tables for comparisons or structured data
   - Code blocks where relevant
   - Pull quotes (markdown blockquotes) for memorable lines

3. Call the generate_pdf tool with:
   - content: the markdown you produced
   - template: "research-report"
   - title: the H1 text${author ? `\n   - author: "${author}"` : ''}

The output should be a publishable artifact, not a dump. Edit ruthlessly. The cover, TOC, and page-numbered footer are automatic.`;

    return {
      description: def.description,
      messages: [{ role: 'user', content: { type: 'text', text } }],
    };
  }

  if (name === 'quick_note') {
    const title = a['title'] ?? '';
    const text = `Save the current content as a quick PDF note.

Steps:

1. Identify what should go in the note. This may be the current conversation, content the user has provided, or a specific section they have indicated.

2. Format as clean, dense markdown. Skip cover-page-style framing. Get to the point.

3. Call the generate_pdf tool with:
   - content: the markdown
   - template: "plain"${title ? `\n   - title: "${title}"` : ''}

The output is a no-cover, no-TOC PDF for fast reference.`;

    return {
      description: def.description,
      messages: [{ role: 'user', content: { type: 'text', text } }],
    };
  }

  if (name === 'pdf_outline') {
    const topic = a['topic'] ?? '[unspecified topic]';
    const text = `Draft a research report outline for: ${topic}

Steps:

1. Propose 5 to 10 main sections (H2 level). These will become TOC entries.
2. For each section, list 2 to 4 subsections (H3 level) with one-line descriptions.
3. Note where tables, code blocks, or pull quotes would strengthen the report.
4. Estimate total length in pages.
5. Flag any sections that need outside research before drafting.

Return the outline as markdown. Do NOT generate the full PDF in this step. After the user approves the outline, they can run the research_report prompt to produce the full document.`;

    return {
      description: def.description,
      messages: [{ role: 'user', content: { type: 'text', text } }],
    };
  }

  throw new Error(`Prompt ${name} not implemented`);
}
