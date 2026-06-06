/**
 * One-shot preview script — renders Cover.tsx as a standalone PDF so we
 * can design-check before wiring it into the full template pipeline.
 *
 *   npx tsx src/preview-cover.tsx
 *
 * Output: ~/Documents/pdf-it/preview-cover.pdf
 */

import { renderToFile, Document } from "@react-pdf/renderer";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Cover } from "./templates/components/Cover.js";
import { registerFonts } from "./templates/fonts.js";

registerFonts();

const outDir = join(homedir(), "Documents", "pdf-it");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "preview-cover.pdf");

void renderToFile(
  <Document>
    <Cover
      title="Designing AI Agent UI/UX"
      author="Deep Research Report"
      date="April 30, 2026"
    />
  </Document>,
  outPath,
).then(() => {
  console.log("✅ Wrote", outPath);
});
