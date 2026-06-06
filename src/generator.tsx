/**
 * PDF generator — replaces v1's puppeteer-core + pdf-lib + markdown-it pipeline
 * with a single @react-pdf/renderer pass.
 *
 * The whole render is:
 *   1. registerFonts() — once per process
 *   2. pick a template component by name
 *   3. renderToFile(<Template markdown=... />)
 *
 * Page numbering, TOC anchors, embedded fonts, deterministic output, and PDF
 * metadata are all handled by the React tree. There is no Chrome to launch,
 * no font CDN to depend on, and no post-render PDF mutation.
 */

import { renderToFile } from "@react-pdf/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { registerFonts } from "./templates/fonts.js";
import { getTemplate } from "./templates/index.js";
import { slugify } from "./utils.js";
import type { GeneratePdfOptions, GeneratePdfResult } from "./types.js";

const DEFAULT_OUT_DIR = join(homedir(), "Documents", "pdf-it");

/**
 * Expand a leading `~` to the user's home directory. POSIX shells do this for
 * us; Node does not. Without this, agents that pass natural paths like
 * `~/Desktop/report.pdf` hit a "must be absolute" error and have to retry.
 */
function expandTilde(p: string): string {
  if (p === "~") return homedir();
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  return p;
}

function resolveOutputPath(requested: string | undefined, title: string | undefined): string {
  if (requested) {
    const expanded = expandTilde(requested);
    if (!isAbsolute(expanded)) {
      throw new Error(
        `output_path must be absolute or start with ~. Got: ${requested}`,
      );
    }
    return expanded;
  }
  const slug = slugify(title ?? "document");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return join(DEFAULT_OUT_DIR, `${slug}-${stamp}.pdf`);
}

async function countPdfPages(path: string): Promise<number> {
  try {
    const bytes = readFileSync(path);
    // PDFKit's PDFDocument is shipped via react-pdf. Loading is overkill here;
    // a regex over the file's xref count is faster and dependency-free.
    const text = bytes.toString("latin1");
    const matches = text.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) return matches.length;
    return 0;
  } catch {
    return 0;
  }
}

export async function generatePdf(
  options: GeneratePdfOptions,
): Promise<GeneratePdfResult> {
  const {
    content,
    output_path,
    title,
    author,
    template: templateName = "research-report",
  } = options;

  const Template = getTemplate(templateName);
  if (!Template) {
    throw new Error(
      `Template "${templateName}" not found. Available: research-report, plain`,
    );
  }

  registerFonts();

  const outputPath = resolveOutputPath(output_path, title);
  mkdirSync(dirname(outputPath), { recursive: true });

  await renderToFile(
    <Template markdown={content} title={title} author={author} />,
    outputPath,
  );

  const page_count = await countPdfPages(outputPath);
  return { path: outputPath, page_count };
}
