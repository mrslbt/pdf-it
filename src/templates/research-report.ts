import type { Template, TemplateRenderOptions, RenderedTemplate } from '../types.js';
import { escapeHtml } from '../utils.js';
import { baseCss } from './styles.js';

/**
 * Cover page: asymmetric layout with negative space dominant.
 * - Title at ~35% from top, large Newsreader light, hold the page
 * - Hairline rule + monospace metadata at ~75% mark
 * - Single design move (the rule), no decoration, no logo
 *
 * TOC: hairline-divided rows, no leader dots, generous line-height,
 * Newsreader for titles, monospace for sub-rows.
 */
const coverCss = `
  .cover {
    height: 100vh;
    display: flex;
    flex-direction: column;
    page-break-after: always;
    break-after: page;
  }

  .cover-title-block {
    margin-top: 35vh;
    margin-bottom: auto;
  }

  .cover-title {
    font-family: 'Newsreader', 'Iowan Old Style', 'Charter', Georgia, serif;
    font-size: 48pt;
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: -0.025em;
    color: var(--ink);
    font-variation-settings: 'opsz' 60;
    max-width: 92%;
    margin: 0;
  }

  .cover-bottom {
    margin-bottom: 22mm;
  }

  .cover-divider {
    width: 200px;
    height: 0.5px;
    background: var(--hair);
    margin-bottom: 14px;
    border: none;
  }

  .cover-meta {
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 10pt;
    letter-spacing: 0.03em;
    line-height: 1.7;
  }

  .cover-author {
    color: var(--ink-2);
    display: block;
  }

  .cover-date {
    color: var(--muted);
    display: block;
  }

  /* ── Table of contents ─────────────────────────────────── */
  .toc {
    padding-top: 8px;
    page-break-after: always;
    break-after: page;
  }

  .toc-heading {
    font-family: 'DM Sans', -apple-system, sans-serif;
    font-size: 10pt;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 28px 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 0.5px solid var(--hair);
  }

  .toc-item {
    border-bottom: 0.5px solid var(--hair);
    padding: 12px 0;
    margin: 0;
  }

  .toc-item a {
    font-family: 'Newsreader', serif;
    font-size: 11pt;
    font-weight: 400;
    color: var(--ink);
    text-decoration: none;
  }

  .toc-item--sub { padding-left: 24px; padding-top: 8px; padding-bottom: 8px; }

  .toc-item--sub a {
    font-size: 10pt;
    font-weight: 400;
    color: var(--ink-2);
  }
`;

function renderCoverHtml(opts: TemplateRenderOptions): string {
  const { title, author, date } = opts;
  const coverTitle = title ? `<h1 class="cover-title">${escapeHtml(title)}</h1>` : '';
  const coverMeta = author || date ? `
    <div class="cover-bottom">
      <div class="cover-divider"></div>
      <div class="cover-meta">
        ${author ? `<span class="cover-author">${escapeHtml(author)}</span>` : ''}
        ${date ? `<span class="cover-date">${escapeHtml(date)}</span>` : ''}
      </div>
    </div>
  ` : '';
  return `
    <div class="cover">
      <div class="cover-title-block">
        ${coverTitle}
      </div>
      ${coverMeta}
    </div>
  `;
}

function wrapDocument(title: string | undefined, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title ? escapeHtml(title) : 'Document'}</title>
  <style>${baseCss}\n${coverCss}</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

export const researchReport: Template = {
  name: 'research-report',
  description: 'Cover page, auto-generated table of contents, styled body with footer page numbers. Best for research output and reports.',

  render(contentHtml: string, options: TemplateRenderOptions): RenderedTemplate {
    const cover = renderCoverHtml(options);
    const tocHtml = options.tocHtml;

    const html = wrapDocument(options.title, `${cover}${tocHtml}${contentHtml}`);
    const frontMatter = wrapDocument(options.title, `${cover}${tocHtml}`);

    return { html, frontMatter };
  },
};
