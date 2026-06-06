/**
 * Body-page footer.
 *
 * Ported from v1's drawFooters() in src/generator.ts:
 *   - JetBrains Mono 9pt (v1 used Helvetica out of pdf-lib limitations;
 *     v2 embeds JetBrains Mono per the design system's "mono for page
 *     numbers and metadata" convention).
 *   - Color: --muted (#7A7A7E)
 *   - 15mm from the bottom edge of the page
 *   - 25mm side margins
 *   - Left: document title (truncates with ellipsis if too long)
 *   - Right: "n / total" where total is body pages only (cover + TOC excluded)
 *
 * This component is meant to be rendered inside a body <Page> as a `fixed`
 * footer. The cover and TOC pages use their own <Page> and do not include it.
 */


import type { JSX } from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { colors, mm } from "../design-tokens.js";

export interface FooterProps {
  /** Document title shown on the left, truncated to fit. */
  title?: string;
  /** When provided, used as the denominator (e.g. body pages only). */
  bodyPageOffset?: number;
}

export function Footer({ title, bodyPageOffset = 0 }: FooterProps): JSX.Element {
  return (
    <View style={styles.footer} fixed>
      {title ? (
        <Text style={styles.title} fixed>
          {title}
        </Text>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text
        style={styles.pageNum}
        fixed
        render={({ pageNumber, totalPages }) => {
          // Skip cover + TOC pages. Body page numbering starts at 1.
          const bodyPage = pageNumber - bodyPageOffset;
          const bodyTotal = totalPages - bodyPageOffset;
          if (bodyPage < 1) return ""; // never reached for fixed-on-body pages
          return `${bodyPage} / ${bodyTotal}`;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: mm(15),
    left: mm(25),
    right: mm(25),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    fontFamily: "JetBrainsMono",
    fontSize: 9,
    color: colors.muted,
    flexShrink: 1,
    maxWidth: "70%",
  },
  spacer: { flex: 1 },
  pageNum: {
    fontFamily: "JetBrainsMono",
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
  },
});
