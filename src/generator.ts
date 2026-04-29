import puppeteer, { type Browser } from 'puppeteer-core';
import { mkdirSync, statSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { parseMarkdown, generateTocHtml } from './markdown.js';
import { getTemplate } from './templates/index.js';
import { slugify } from './utils.js';
import type { GeneratePdfOptions, GeneratePdfResult } from './types.js';

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome(): string {
  const envPath = process.env['CHROME_PATH'];
  if (envPath) {
    try {
      statSync(envPath);
      return envPath;
    } catch {
      throw new Error(`CHROME_PATH set but not found: ${envPath}`);
    }
  }
  for (const p of CHROME_PATHS) {
    try {
      statSync(p);
      return p;
    } catch {
      // continue
    }
  }
  throw new Error(
    'Chrome not found. Install Google Chrome or set the CHROME_PATH environment variable to your Chrome executable.'
  );
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        executablePath: findChrome(),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })
      .then((browser) => {
        browser.on('disconnected', () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return;
  const promise = browserPromise;
  browserPromise = null;
  try {
    const browser = await promise;
    await browser.close();
  } catch {
    // launch failed; nothing to close
  }
}

function resolveOutputPath(outputPath: string | undefined, title: string | undefined): string {
  if (outputPath) {
    mkdirSync(dirname(outputPath), { recursive: true });
    return outputPath;
  }
  const dir = join(homedir(), 'Documents', 'pdf-it');
  mkdirSync(dir, { recursive: true });
  const slug = slugify(title ?? 'document');
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return join(dir, `${slug}-${ts}.pdf`);
}

const PAGE_MARGIN = {
  top: '25mm',
  right: '25mm',
  bottom: '30mm',
  left: '25mm',
} as const;

const MM_TO_PT = 2.834645669;

async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // 'load' waits for window.load (images + stylesheets + fonts triggered
    // during initial render). We then wait for document.fonts.ready as a
    // belt-and-braces guard for @import'd webfonts.
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page
      .evaluate(() => (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready)
      .catch(() => undefined);

    const buffer = await page.pdf({
      format: 'A4',
      margin: PAGE_MARGIN,
      printBackground: true,
      displayHeaderFooter: false,
    });

    return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  } finally {
    await page.close().catch(() => undefined);
  }
}

async function countPdfPages(buffer: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(buffer);
  return doc.getPageCount();
}

/**
 * The footer is drawn with built-in Helvetica (WinAnsi encoded), which can't
 * render most non-ASCII characters. Rather than silently dropping things like
 * em-dashes — making titles look like "Foo  Bar" — we substitute the common
 * Unicode punctuation people actually use, then strip whatever's left
 * (emoji, CJK, etc). Document metadata is UTF-16 and keeps everything intact.
 */
function asciiSafe(text: string): string {
  return text
    .replace(/[—]/g, '--')   // em dash
    .replace(/[–]/g, '-')    // en dash
    .replace(/[‘’]/g, "'") // smart single quotes
    .replace(/[“”]/g, '"') // smart double quotes
    .replace(/…/g, '...')    // ellipsis
    .replace(/[    ]/g, ' ') // non-breaking / thin spaces
    .replace(/[×]/g, 'x')    // multiplication sign
    .replace(/[^\x20-\x7E]/g, '');
}

function truncateToWidth(
  text: string,
  font: import('pdf-lib').PDFFont,
  fontSize: number,
  maxWidth: number
): string {
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && font.widthOfTextAtSize(truncated + '…', fontSize) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

async function drawFooters(
  pdfDoc: PDFDocument,
  options: { startPage: number; footerTitle: string }
): Promise<void> {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // Approximation of #7A7A7E (design system "muted")
  const mutedColor = rgb(0.478, 0.478, 0.494);
  const fontSize = 9;
  const yOffset = 15 * MM_TO_PT;
  const sideMargin = 25 * MM_TO_PT;
  const safeTitle = asciiSafe(options.footerTitle);

  const pages = pdfDoc.getPages();
  const totalBodyPages = pages.length - options.startPage;

  for (let i = options.startPage; i < pages.length; i++) {
    const page = pages[i];
    if (!page) continue;
    const { width } = page.getSize();
    const pageNum = i - options.startPage + 1;

    if (safeTitle) {
      const maxTitleWidth = width - sideMargin * 2 - 80;
      const text = truncateToWidth(safeTitle, font, fontSize, maxTitleWidth);
      page.drawText(text, {
        x: sideMargin,
        y: yOffset,
        size: fontSize,
        font,
        color: mutedColor,
      });
    }

    const pnText = `${pageNum} / ${totalBodyPages}`;
    const pnWidth = font.widthOfTextAtSize(pnText, fontSize);
    page.drawText(pnText, {
      x: width - sideMargin - pnWidth,
      y: yOffset,
      size: fontSize,
      font,
      color: mutedColor,
    });
  }
}

export async function generatePdf(options: GeneratePdfOptions): Promise<GeneratePdfResult> {
  const {
    content,
    output_path,
    title,
    author,
    template: templateName = 'research-report',
  } = options;

  const template = getTemplate(templateName);
  if (!template) {
    throw new Error(
      `Template "${templateName}" not found. Available templates: research-report, plain`
    );
  }

  const { html: contentHtml, toc } = parseMarkdown(content);
  const tocHtml = generateTocHtml(toc);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rendered = template.render(contentHtml, { title, author, date, tocHtml });
  const outputPath = resolveOutputPath(output_path, title);

  // Render the full document and (in parallel, if there's any) the front
  // matter just to count pages. Single render of the full HTML keeps internal
  // anchor links (TOC → headings) intact.
  const [mainBuffer, frontMatterPageCount] = await Promise.all([
    renderHtmlToPdf(rendered.html),
    rendered.frontMatter
      ? renderHtmlToPdf(rendered.frontMatter).then(countPdfPages)
      : Promise.resolve(0),
  ]);

  const pdfDoc = await PDFDocument.load(mainBuffer);

  await drawFooters(pdfDoc, {
    startPage: frontMatterPageCount,
    footerTitle: title ?? '',
  });

  if (title) pdfDoc.setTitle(title);
  if (author) pdfDoc.setAuthor(author);
  pdfDoc.setCreator('pdf-it');
  pdfDoc.setProducer('pdf-it');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const bytes = await pdfDoc.save();
  writeFileSync(outputPath, bytes);

  return { path: outputPath, page_count: pdfDoc.getPageCount() };
}
