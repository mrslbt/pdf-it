/**
 * Horizontal bar chart — first chart primitive in pdf-it's data viz library.
 *
 * Editorial restraint applied to data viz:
 *   - Monochrome (no accent color). Bars are 100% --ink.
 *   - Hairline left baseline (0.5px --hair). No top, right, or bottom axes.
 *   - Labels in DM Sans 10pt --ink (matches body H3 weight)
 *   - Values in JetBrains Mono 10pt --muted (matches metadata)
 *   - Optional title above (DM Sans 10pt uppercase tracked, like the TOC heading)
 *   - Optional source line below (JetBrains Mono 9pt --muted)
 *
 * Sized to live inside a body page (full-width minus 25mm side margins).
 */


import type { JSX } from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { colors, leading } from "../../design-tokens.js";

export interface BarDatum {
  label: string;
  value: number;
}

export interface HorizontalBarChartProps {
  title?: string;
  data: BarDatum[];
  /** Caption / source line under the chart. */
  source?: string;
  /** Override automatic max. Useful for comparing two charts at the same scale. */
  maxValue?: number;
  /** Number of decimal places to round values to. Default: 0. */
  valuePrecision?: number;
  /** A suffix to append after each value, e.g. "/wk" or "%". */
  valueSuffix?: string;
}

export function HorizontalBarChart({
  title,
  data,
  source,
  maxValue,
  valuePrecision = 0,
  valueSuffix = "",
}: HorizontalBarChartProps): JSX.Element {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));

  return (
    <View style={s.wrap} wrap={false}>
      {title ? <Text style={s.title}>{title}</Text> : null}

      <View style={s.rows}>
        {data.map((d) => {
          const ratio = max > 0 ? d.value / max : 0;
          // Bar track is 60% of the row width; label takes 28%; value takes 12%.
          const widthPct = ratio * 60;
          return (
            <View key={d.label} style={s.row}>
              <Text style={s.label}>{d.label}</Text>
              <View style={s.track}>
                <View style={[s.bar, { width: `${widthPct}%` }]} />
              </View>
              <Text style={s.value}>
                {d.value.toFixed(valuePrecision)}
                {valueSuffix}
              </Text>
            </View>
          );
        })}
      </View>

      {source ? <Text style={s.source}>{source}</Text> : null}
    </View>
  );
}

const ROW_HEIGHT = 22;
const BAR_HEIGHT = 12;

const s = StyleSheet.create({
  wrap: {
    marginTop: 18,
    marginBottom: 22,
    flexDirection: "column",
  },
  title: {
    fontFamily: "DMSans",
    fontWeight: 500,
    fontSize: 10,
    letterSpacing: 1.0, // ≈ 0.10em × 10pt — matches TOC heading register
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 14,
  },
  rows: {
    flexDirection: "column",
    borderLeftWidth: 0.5,
    borderLeftColor: colors.hair,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    paddingLeft: 0,
  },
  label: {
    fontFamily: "DMSans",
    fontWeight: 400,
    fontSize: 10,
    color: colors.ink,
    width: "28%",
    paddingLeft: 8,
  },
  track: {
    width: "60%",
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  bar: {
    height: BAR_HEIGHT,
    backgroundColor: colors.ink,
  },
  value: {
    fontFamily: "JetBrainsMono",
    fontSize: 10,
    lineHeight: leading.body,
    color: colors.muted,
    width: "12%",
    textAlign: "right",
  },
  source: {
    fontFamily: "JetBrainsMono",
    fontSize: 9,
    color: colors.muted,
    marginTop: 8,
    letterSpacing: 0.2,
  },
});
