import type { Template, TemplateRenderOptions, RenderedTemplate } from '../types.js';
import { baseCss } from './styles.js';

export const plain: Template = {
  name: 'plain',
  description: 'No cover page, no table of contents. Dense, clean body content. Best for short documents and notes.',

  render(contentHtml: string, _options: TemplateRenderOptions): RenderedTemplate {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <style>${baseCss}</style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;
    return { html };
  },
};
