/**
 * Table of contents.
 *
 * Ported from v1's coverCss `.toc-*` rules in src/templates/research-report.ts:
 *   - heading "Contents": DM Sans 10pt 500 uppercase tracked 0.12em, color --muted
 *   - top of list:        hairline-rule above the first entry
 *   - per-entry:          hairline-rule below, padding 12px 0
 *   - H1 entry:           Newsreader (Text) 11pt 400, color --ink
 *   - H2 entry:           Newsreader (Text) 10pt 400, color --ink-2, indented 24px,
 *                         tighter top/bottom padding 8px
 *
 * No leader dots. No page numbers in TOC entries (the original didn't have them).
 * The body's headings carry anchors; the rendered PDF uses those for in-PDF
 * navigation. (Anchor links are added by the renderer, not this component.)
 */


import type { JSX } from "react";
import { Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { colors, leading, mm } from "../design-tokens.js";

export interface TocEntry {
  level: 1 | 2;
  text: string;
  /** Internal anchor id (slugified heading text) for in-PDF linking. */
  id: string;
}

export interface TOCProps {
  entries: TocEntry[];
}

export function TOC({ entries }: TOCProps): JSX.Element {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.heading}>Contents</Text>
      <View style={styles.list}>
        {entries.map((entry, i) => (
          <View
            key={`${entry.id}-${i}`}
            style={entry.level === 1 ? styles.itemH1 : styles.itemH2}
            wrap={false}
          >
            <Link src={`#${entry.id}`} style={styles.link}>
              <Text style={entry.level === 1 ? styles.textH1 : styles.textH2}>
                {entry.text}
              </Text>
            </Link>
          </View>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    paddingTop: mm(28),
    paddingHorizontal: mm(25),
    paddingBottom: mm(25),
    flexDirection: "column",
    color: colors.ink,
  },
  heading: {
    fontFamily: "DMSans",
    fontWeight: 500,
    fontSize: 10,
    letterSpacing: 1.2, // ≈ 0.12em × 10pt
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 28,
  },
  list: {
    borderTopWidth: 0.5,
    borderTopColor: colors.hair,
    flexDirection: "column",
  },
  itemH1: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.hair,
  },
  itemH2: {
    paddingLeft: 24,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.hair,
  },
  link: {
    textDecoration: "none",
    color: colors.ink,
  },
  textH1: {
    fontFamily: "NewsreaderText",
    fontWeight: 400,
    fontSize: 11,
    color: colors.ink,
    lineHeight: leading.body,
  },
  textH2: {
    fontFamily: "NewsreaderText",
    fontWeight: 400,
    fontSize: 10,
    color: colors.ink2,
    lineHeight: leading.body,
  },
});
