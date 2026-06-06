/**
 * Research report template — composes Cover + TOC + Body pages with footer.
 *
 * Page layout per v1 spec (baseCss + research-report.ts):
 *   - body page padding: 28mm top, 25mm sides, 25mm bottom
 *   - footer: 15mm from bottom (drawn by Footer component absolutely)
 *   - cover and TOC are separate Page components with their own paddings
 *   - footer's bodyPageOffset = 2 (cover + TOC) so "1 / N" starts on the
 *     first true body page
 */


import type { JSX } from "react";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import { Cover } from "./components/Cover.js";
import { TOC, type TocEntry } from "./components/TOC.js";
import { Footer } from "./components/Footer.js";
import { mm } from "./components/body.js";
import { colors } from "./design-tokens.js";
import { renderMarkdown } from "../markdown/render.js";

export interface ResearchReportProps {
  markdown: string;
  /** Cover title. If omitted, taken from the first H1 in the markdown. */
  title?: string;
  /** Cover author / subtitle area. */
  author?: string;
  /** Cover date (default: today). */
  date?: string;
}

export function ResearchReport({
  markdown,
  title,
  author,
  date,
}: ResearchReportProps): JSX.Element {
  const { body, toc } = renderMarkdown(markdown);

  // If the caller didn't pass a title, derive it from the first H1 entry.
  const documentTitle = title ?? firstH1(toc) ?? "Untitled";

  // Cover (page 1) + TOC (page 2) = 2 front matter pages.
  const bodyPageOffset = 2;

  return (
    <Document
      title={documentTitle}
      author={author}
      creator="pdf-it"
      producer="pdf-it"
    >
      <Cover title={documentTitle} author={author} date={date} />
      <TOC entries={toc} />
      <Page size="A4" style={styles.bodyPage}>
        {body}
        <Footer title={documentTitle} bodyPageOffset={bodyPageOffset} />
      </Page>
    </Document>
  );
}

function firstH1(toc: TocEntry[]): string | undefined {
  return toc.find((e) => e.level === 1)?.text;
}

const styles = StyleSheet.create({
  bodyPage: {
    backgroundColor: colors.paper,
    paddingTop: mm(28),
    paddingHorizontal: mm(25),
    // Bottom padding leaves room for the absolute-positioned footer (15mm).
    paddingBottom: mm(28),
    color: colors.ink,
    flexDirection: "column",
  },
});
