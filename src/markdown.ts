import MarkdownIt from 'markdown-it';
import type { TocEntry } from './types.js';
import { escapeHtml, slugify } from './utils.js';

export function parseMarkdown(content: string): { html: string; toc: TocEntry[] } {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  const toc: TocEntry[] = [];
  const usedIds = new Map<string, number>();

  const defaultHeadingOpen = md.renderer.rules.heading_open;

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const level = parseInt(token.tag.slice(1), 10);
    const inlineToken = tokens[idx + 1];
    const text = inlineToken?.children
      ?.filter(t => t.type === 'text' || t.type === 'code_inline')
      .map(t => t.content)
      .join('') ?? '';

    let id = slugify(text);
    const count = usedIds.get(id) ?? 0;
    usedIds.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;

    if (level <= 2) {
      toc.push({ level, text, id });
    }

    token.attrSet('id', id);
    return defaultHeadingOpen
      ? defaultHeadingOpen(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options);
  };

  const html = md.render(content);
  return { html, toc };
}

export function generateTocHtml(toc: TocEntry[]): string {
  if (toc.length === 0) return '';

  const items = toc.map(entry => {
    const indent = entry.level === 2 ? ' toc-item--sub' : '';
    return `<li class="toc-item${indent}"><a href="#${entry.id}">${escapeHtml(entry.text)}</a></li>`;
  }).join('\n        ');

  return `
    <div class="toc">
      <h2 class="toc-heading">Contents</h2>
      <ul class="toc-list">
        ${items}
      </ul>
    </div>
  `;
}
