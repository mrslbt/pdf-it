/**
 * Cover page component.
 *
 * Ported VERBATIM from the original Puppeteer-rendered design system at
 * src/templates/research-report.ts (v1). Every value below traces back to
 * that file's coverCss block. Do not eyeball; if you want to tune, edit
 * the design tokens.
 *
 *   - title:     Newsreader 48pt / 300 weight / 1.05 leading / -0.025em / opsz 60
 *   - title position: 35vh from the top of the page (cover = 100vh)
 *   - divider:   200px × 0.5px, color #E6E6E6 (--hair). Never accent.
 *   - author:    JetBrains Mono 10pt / #2B2B2E (--ink-2)
 *   - date:      JetBrains Mono 10pt / #7A7A7E (--muted)
 *   - meta line-height: 1.7
 *   - bottom block sits 22mm above page bottom
 *
 * No logo. The cover is type-only by design — restraint is the brand.
 */


import type { JSX } from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { colors, cover as coverTokens, leading, type } from "../design-tokens.js";

export interface CoverProps {
  title: string;
  author?: string; // shown above the date, in --ink-2
  date?: string;   // ISO; defaults to today at render time, in --muted
}

// A4 page height in points
const A4_HEIGHT_PT = 842;

export function Cover({ title, author, date }: CoverProps): JSX.Element {
  const today =
    date ??
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.bottomBlock}>
        <View style={styles.divider} />
        {author ? <Text style={styles.author}>{author}</Text> : null}
        <Text style={styles.date}>{today}</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    // The original cover has no explicit page padding — title-block uses
    // 35vh from page top, bottom-block uses 22mm from page bottom. We use
    // generous left/right padding for editorial breath, top/bottom 0 so
    // the original ratios survive.
    paddingTop: 0,
    paddingHorizontal: 64,
    paddingBottom: 0,
    flexDirection: "column",
    color: colors.ink,
  },
  titleBlock: {
    // 35% of A4 height from page top.
    marginTop: A4_HEIGHT_PT * coverTokens.titleTopRatio,
    marginBottom: "auto",
    flexDirection: "column",
  },
  title: {
    // NewsreaderDisplay60 is the static instance baked at opsz=60, wght=300.
    // It carries the heavier display-cut strokes the original CSS got via
    // font-variation-settings — which react-pdf can't pass through.
    fontFamily: "NewsreaderDisplay60",
    fontWeight: 300,
    fontSize: type.coverTitle, // 48pt
    lineHeight: leading.coverTitle, // 1.05
    letterSpacing: -1.2, // ≈ -0.025em × 48pt
    color: colors.ink,
    maxWidth: "92%",
  },
  bottomBlock: {
    marginBottom: coverTokens.bottomMargin, // 22mm
    flexDirection: "column",
  },
  divider: {
    width: coverTokens.dividerWidth,  // 200px
    height: coverTokens.dividerHeight, // 0.5px
    backgroundColor: colors.hair,     // #E6E6E6
    marginBottom: 14,
  },
  author: {
    fontFamily: "JetBrainsMono",
    fontSize: type.meta,
    lineHeight: leading.meta,
    letterSpacing: 0.3, // ≈ 0.03em × 10pt
    color: colors.ink2,
  },
  date: {
    fontFamily: "JetBrainsMono",
    fontSize: type.meta,
    lineHeight: leading.meta,
    letterSpacing: 0.3,
    color: colors.muted,
  },
});
