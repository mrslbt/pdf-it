/**
 * Multi-page preview — exercises cover + TOC + body type + footer.
 *
 *   npx tsx src/preview-research-report.tsx
 *
 * Output: ~/Documents/pdf-it/preview-research-report.pdf
 */

import { renderToFile } from "@react-pdf/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { registerFonts } from "./templates/fonts.js";
import { ResearchReport } from "./templates/ResearchReport.js";

registerFonts();

const outDir = join(homedir(), "Documents", "pdf-it");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "preview-research-report.pdf");

const sample = readFileSync(
  join(import.meta.dirname ?? __dirname, "..", "samples", "designing-ai-agent-uiux.md"),
  "utf8",
);

await renderToFile(
  <ResearchReport markdown={sample} author="Deep Research Report" date="April 30, 2026" />,
  outPath,
);

console.log("✅", outPath);
