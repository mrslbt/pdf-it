/**
 * Plain template — body content only.
 *
 * No cover, no TOC. Page-numbered footer optional (kept on so multi-page
 * notes still locate). Matches v1's plain template intent: "dense body,
 * no framing, best for short notes and single-page documents."
 */


import type { JSX } from "react";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import { Footer } from "./components/Footer.js";
import { mm } from "./components/body.js";
import { colors } from "./design-tokens.js";
import { renderMarkdown } from "../markdown/render.js";

export interface PlainProps {
  markdown: string;
  /** Used only for PDF metadata + footer text. Not rendered as a cover. */
  title?: string;
  author?: string;
}

export function Plain({ markdown, title, author }: PlainProps): JSX.Element {
  const { body } = renderMarkdown(markdown);
  const documentTitle = title ?? "Untitled";

  return (
    <Document
      title={documentTitle}
      author={author}
      creator="pdf-it"
      producer="pdf-it"
    >
      <Page size="A4" style={styles.page}>
        {body}
        {title ? <Footer title={documentTitle} bodyPageOffset={0} /> : null}
      </Page>
    </Document>
  );
}

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
