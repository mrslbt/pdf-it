/**
 * Body element primitives — H1, H2, H3, Paragraph, Strong/Em, Code, CodeBlock,
 * Blockquote, OrderedList, UnorderedList, HorizontalRule, Tbl (table).
 *
 * Every value below is ported directly from v1's baseCss in src/templates/styles.ts.
 * Names match the markdown AST node intent.
 */


import type { JSX } from "react";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { colors, leading, mm, type } from "../design-tokens.js";

// ── Headings ──────────────────────────────────────────────────────

export const H1 = ({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}): JSX.Element => (
  <Text id={id} style={s.h1}>
    {children}
  </Text>
);

export const H2 = ({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}): JSX.Element => (
  <Text id={id} style={s.h2}>
    {children}
  </Text>
);

export const H3 = ({ children }: { children: ReactNode }): JSX.Element => (
  <Text style={s.h3}>{children}</Text>
);

export const H456 = ({ children }: { children: ReactNode }): JSX.Element => (
  <Text style={s.h456}>{children}</Text>
);

// ── Paragraph + inline ────────────────────────────────────────────

export const P = ({ children }: { children: ReactNode }): JSX.Element => (
  <Text style={s.p}>{children}</Text>
);

export const Strong = ({ children }: { children: ReactNode }): JSX.Element => (
  <Text style={s.strong}>{children}</Text>
);

export const Em = ({ children }: { children: ReactNode }): JSX.Element => (
  <Text style={s.em}>{children}</Text>
);

export const A = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}): JSX.Element => (
  <Link src={href} style={s.a}>
    {children}
  </Link>
);

export const InlineCode = ({ children }: { children: ReactNode }): JSX.Element => (
  <Text style={s.inlineCode}>{children}</Text>
);

// ── Block code ────────────────────────────────────────────────────

export const CodeBlock = ({ code }: { code: string }): JSX.Element => (
  <View style={s.pre} wrap={false}>
    <Text style={s.preCode}>{code}</Text>
  </View>
);

// ── Blockquote ────────────────────────────────────────────────────

export const Blockquote = ({ children }: { children: ReactNode }): JSX.Element => (
  <View style={s.blockquote} wrap={false}>
    <Text style={s.blockquoteText}>{children}</Text>
  </View>
);

// ── Lists ─────────────────────────────────────────────────────────

export const UL = ({ items }: { items: ReactNode[] }): JSX.Element => (
  <View style={s.list}>
    {items.map((item, i) => (
      <View key={i} style={s.li}>
        <Text style={s.bullet}>•</Text>
        <Text style={s.liText}>{item}</Text>
      </View>
    ))}
  </View>
);

export const OL = ({ items }: { items: ReactNode[] }): JSX.Element => (
  <View style={s.list}>
    {items.map((item, i) => (
      <View key={i} style={s.li}>
        <Text style={s.olMarker}>{i + 1}.</Text>
        <Text style={s.liText}>{item}</Text>
      </View>
    ))}
  </View>
);

// ── Horizontal rule ───────────────────────────────────────────────

export const HR = (): JSX.Element => <View style={s.hr} />;

// ── Table ─────────────────────────────────────────────────────────

export interface TableCell {
  content: ReactNode;
}

export const Tbl = ({
  header,
  rows,
}: {
  header: TableCell[];
  rows: TableCell[][];
}): JSX.Element => (
  <View style={s.tableWrap}>
    {header.length > 0 ? (
      <View style={s.thead} wrap={false}>
        {header.map((c, i) => (
          <Text key={i} style={s.th}>
            {c.content}
          </Text>
        ))}
      </View>
    ) : null}
    {rows.map((row, ri) => (
      <View key={ri} style={ri === rows.length - 1 ? s.trLast : s.tr} wrap={false}>
        {row.map((c, ci) => (
          <Text key={ci} style={s.td}>
            {c.content}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

// ── Styles (all values from v1 baseCss) ───────────────────────────

const s = StyleSheet.create({
  // Headings
  h1: {
    fontFamily: "NewsreaderDisplay32",
    fontWeight: 400,
    fontSize: type.h1, // 26pt
    lineHeight: leading.h1, // 1.2
    letterSpacing: -0.4, // ≈ -0.015em × 26pt
    color: colors.ink,
    marginTop: 44,
    marginBottom: 16,
  },
  h2: {
    fontFamily: "DMSans",
    fontWeight: 500,
    fontSize: type.h2, // 17pt
    lineHeight: leading.h2, // 1.3
    letterSpacing: -0.1, // ≈ -0.005em × 17pt
    color: colors.ink,
    marginTop: 36,
    marginBottom: 12,
  },
  h3: {
    fontFamily: "DMSans",
    fontWeight: 500,
    fontSize: type.h3, // 13pt
    lineHeight: leading.h3, // 1.4
    color: colors.ink2,
    marginTop: 26,
    marginBottom: 8,
  },
  h456: {
    fontFamily: "DMSans",
    fontWeight: 500,
    fontSize: type.h456, // 10pt
    color: colors.ink2,
    textTransform: "uppercase",
    letterSpacing: 0.8, // ≈ 0.08em × 10pt
    marginTop: 20,
    marginBottom: 6,
  },

  // Paragraph + inline
  p: {
    fontFamily: "NewsreaderText",
    fontSize: type.body, // 11pt
    lineHeight: leading.body, // 1.55
    color: colors.ink,
    marginBottom: 12,
  },
  strong: { fontFamily: "NewsreaderText", fontWeight: 500 },
  em: { fontFamily: "NewsreaderText", fontStyle: "italic", fontWeight: 400 },
  a: {
    color: colors.ink,
    textDecoration: "underline",
  },
  inlineCode: {
    fontFamily: "JetBrainsMono",
    fontSize: type.inlineCode, // 9.5pt
    backgroundColor: colors.paper2,
    color: colors.ink,
  },

  // Code block
  pre: {
    backgroundColor: colors.paper2,
    padding: 18,
    marginTop: 18,
    marginBottom: 22,
    borderRadius: 4,
  },
  preCode: {
    fontFamily: "JetBrainsMono",
    fontSize: type.code, // 9.5pt
    lineHeight: leading.code, // 1.55
    color: colors.ink,
  },

  // Blockquote
  blockquote: {
    borderLeftWidth: 0.5,
    borderLeftColor: colors.hair,
    paddingLeft: 22,
    paddingTop: 4,
    paddingBottom: 4,
    marginTop: 22,
    marginBottom: 22,
  },
  blockquoteText: {
    fontFamily: "NewsreaderText",
    fontStyle: "italic",
    fontSize: type.blockquote, // 12pt
    lineHeight: leading.blockquote, // 1.5
    color: colors.ink2,
  },

  // Lists
  list: {
    marginTop: 10,
    marginBottom: 14,
    marginLeft: 24,
    flexDirection: "column",
  },
  li: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 4,
  },
  bullet: {
    fontFamily: "NewsreaderText",
    fontSize: type.body,
    color: colors.muted,
    width: 14,
  },
  olMarker: {
    fontFamily: "NewsreaderText",
    fontSize: type.body,
    color: colors.muted,
    width: 20,
  },
  liText: {
    fontFamily: "NewsreaderText",
    fontSize: type.body,
    lineHeight: leading.body,
    color: colors.ink,
    flex: 1,
  },

  // HR
  hr: {
    borderTopWidth: 0.5,
    borderTopColor: colors.hair,
    marginTop: 32,
    marginBottom: 32,
  },

  // Table
  tableWrap: {
    marginTop: 18,
    marginBottom: 22,
    flexDirection: "column",
  },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
  },
  th: {
    flex: 1,
    fontFamily: "DMSans",
    fontWeight: 500,
    fontSize: 9.5,
    color: colors.ink,
    letterSpacing: 0.2,
    paddingTop: 10,
    paddingBottom: 9,
    paddingHorizontal: 12,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.hair,
  },
  trLast: {
    flexDirection: "row",
  },
  td: {
    flex: 1,
    fontFamily: "DMSans",
    fontSize: 10,
    color: colors.ink2,
    lineHeight: leading.body,
    paddingTop: 9,
    paddingBottom: 9,
    paddingHorizontal: 12,
  },
});

// Re-export the mm helper so templates can use it for page padding without
// importing tokens twice.
export { mm };
