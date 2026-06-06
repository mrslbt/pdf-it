/**
 * Public types for the MCP tool surface. Internal types live alongside
 * the components that own them.
 */

export interface GeneratePdfOptions {
  /** Markdown content to render. */
  content: string;
  /** Absolute output path. If omitted, the generator picks one. */
  output_path?: string;
  /** Document title — shown on cover (research-report) and in PDF metadata. */
  title?: string;
  /** Author — shown on cover and in PDF metadata. */
  author?: string;
  /** Template name. Defaults to "research-report". */
  template?: string;
}

export interface GeneratePdfResult {
  path: string;
  page_count: number;
}
