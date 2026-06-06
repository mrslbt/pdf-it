/**
 * Chart preview — drops the bar chart inside a body page so we can see how
 * data viz reads next to typography in the design system.
 *
 *   npx tsx src/preview-chart.tsx
 *
 * Output: ~/Documents/pdf-it/preview-chart.pdf
 */

import { Document, Page, StyleSheet, renderToFile } from "@react-pdf/renderer";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { registerFonts } from "./templates/fonts.js";
import { colors } from "./templates/design-tokens.js";
import { mm } from "./templates/components/body.js";
import { H1, H2, P } from "./templates/components/body.js";
import { HorizontalBarChart } from "./templates/components/charts/HorizontalBarChart.js";
import { Footer } from "./templates/components/Footer.js";

registerFonts();

const outDir = join(homedir(), "Documents", "pdf-it");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "preview-chart.pdf");

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    paddingTop: mm(28),
    paddingHorizontal: mm(25),
    paddingBottom: mm(28),
    color: colors.ink,
    flexDirection: "column",
  },
});

const portfolio = [
  { label: "rippr-mcp",      value: 867 },
  { label: "xendit-mcp",     value: 842 },
  { label: "rakuten-mcp",    value: 732 },
  { label: "japan-ux-mcp",   value: 564 },
  { label: "pdf-it-mcp",     value: 530 },
  { label: "paypay-mcp",     value: 462 },
  { label: "tabedata-mcp",   value: 250 },
];

const weekly = [
  { label: "pdf-it-mcp",   value: 26 },
  { label: "rippr-mcp",    value: 18 },
  { label: "xendit-mcp",   value: 21 },
  { label: "japan-ux-mcp", value: 20 },
  { label: "tabedata-mcp", value: 20 },
  { label: "rakuten-mcp",  value: 17 },
  { label: "paypay-mcp",   value: 9 },
];

await renderToFile(
  <Document title="Portfolio Snapshot" creator="pdf-it" producer="pdf-it">
    <Page size="A4" style={styles.page}>
      <H1>Portfolio Snapshot</H1>
      <P>
        Two views of the same seven packages. The first chart ranks by lifetime
        cumulative installs; the second ranks by current weekly velocity. The
        gap between them is where the story lives — packages with high lifetime
        numbers but low recent activity are coasting, while packages with rising
        weekly velocity are gaining mindshare.
      </P>

      <HorizontalBarChart
        title="All-time installs · npm"
        data={portfolio}
        source="Source: registry.npmjs.org, 2026-06-06"
      />

      <H2>Recent traction</H2>
      <P>
        Weekly downloads have flattened across the portfolio at 17 to 26 installs
        per package, with one exception: pdf-it-mcp sits at the top this week
        despite being mid-pack on cumulative volume.
      </P>

      <HorizontalBarChart
        title="Weekly installs · last 7 days"
        data={weekly}
        source="Source: npm downloads API, week ending 2026-06-05"
        valueSuffix="/wk"
      />

      <Footer title="Portfolio Snapshot" bodyPageOffset={0} />
    </Page>
  </Document>,
  outPath,
);

console.log("✅", outPath);
