export interface GeneratePdfOptions {
  content: string;
  output_path?: string;
  title?: string;
  author?: string;
  template?: string;
}

export interface GeneratePdfResult {
  path: string;
  page_count: number;
}

export interface TocEntry {
  level: number;
  text: string;
  id: string;
}

export interface TemplateRenderOptions {
  title?: string;
  author?: string;
  date: string;
  tocHtml: string;
}

export interface RenderedTemplate {
  /**
   * Complete HTML document that is rendered to PDF in a single pass.
   * Internal anchor links (TOC → headings) must resolve within this HTML.
   */
  html: string;
  /**
   * Optional HTML containing only the front-matter (e.g. cover + TOC).
   * Rendered separately just to count its pages so the generator knows
   * how many leading pages should remain unfootered.
   */
  frontMatter?: string;
}

export interface Template {
  name: string;
  description: string;
  render(contentHtml: string, options: TemplateRenderOptions): RenderedTemplate;
}
