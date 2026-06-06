/**
 * Markdown → React component tree, via the remark AST.
 *
 * Why not markdown-it (v1's parser)? Because v1 emitted HTML for Puppeteer to
 * render. v2 needs to compose actual @react-pdf components — there is no DOM
 * in this pipeline. Remark gives us an AST we can walk directly into our
 * body primitives.
 *
 * Heading slugs (used by the TOC for in-PDF anchors) are computed the same way
 * v1 computed them (slugify + dedupe via counter). The slug becomes the `id`
 * prop on H1/H2 so <Link src="#slug" /> from the TOC resolves correctly.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, RootContent, PhrasingContent } from "mdast";
import { toString } from "mdast-util-to-string";
import type { ReactNode } from "react";
import {
  A,
  Blockquote,
  CodeBlock,
  Em,
  H1,
  H2,
  H3,
  H456,
  HR,
  InlineCode,
  OL,
  P,
  Strong,
  Tbl,
  UL,
  type TableCell,
} from "../templates/components/body.js";

export interface TocEntry {
  level: 1 | 2;
  text: string;
  id: string;
}

export interface RenderedMarkdown {
  /** React nodes ready to drop into a Body page. */
  body: ReactNode[];
  /** TOC entries (H1 + H2 only) in document order. */
  toc: TocEntry[];
}

const parser = unified().use(remarkParse).use(remarkGfm);

export function renderMarkdown(markdown: string): RenderedMarkdown {
  const tree = parser.parse(markdown) as Root;

  const toc: TocEntry[] = [];
  const usedSlugs = new Map<string, number>();
  const body: ReactNode[] = [];

  let i = 0;
  for (const node of tree.children as RootContent[]) {
    const rendered = renderBlock(node, toc, usedSlugs, i);
    if (rendered) body.push(rendered);
    i++;
  }

  return { body, toc };
}

function renderBlock(
  node: RootContent,
  toc: TocEntry[],
  usedSlugs: Map<string, number>,
  key: number,
): ReactNode {
  switch (node.type) {
    case "heading": {
      const text = toString(node);
      let id = slugify(text);
      const count = usedSlugs.get(id) ?? 0;
      usedSlugs.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;

      if (node.depth === 1) {
        toc.push({ level: 1, text, id });
        return <H1 key={key} id={id}>{renderInlineChildren(node.children)}</H1>;
      }
      if (node.depth === 2) {
        toc.push({ level: 2, text, id });
        return <H2 key={key} id={id}>{renderInlineChildren(node.children)}</H2>;
      }
      if (node.depth === 3) {
        return <H3 key={key}>{renderInlineChildren(node.children)}</H3>;
      }
      return <H456 key={key}>{renderInlineChildren(node.children)}</H456>;
    }

    case "paragraph":
      return <P key={key}>{renderInlineChildren(node.children)}</P>;

    case "blockquote": {
      const inner: ReactNode[] = [];
      for (const child of node.children) {
        if (child.type === "paragraph") {
          inner.push(renderInlineChildren(child.children));
        }
      }
      return <Blockquote key={key}>{inner}</Blockquote>;
    }

    case "list": {
      const items: ReactNode[] = [];
      for (const li of node.children) {
        const liChildren: ReactNode[] = [];
        for (const c of li.children) {
          if (c.type === "paragraph") {
            liChildren.push(renderInlineChildren(c.children));
          }
        }
        items.push(<>{liChildren}</>);
      }
      return node.ordered ? <OL key={key} items={items} /> : <UL key={key} items={items} />;
    }

    case "code":
      return <CodeBlock key={key} code={node.value} />;

    case "thematicBreak":
      return <HR key={key} />;

    case "table": {
      const header: TableCell[] = (node.children[0]?.children ?? []).map((cell) => ({
        content: renderInlineChildren(cell.children),
      }));
      const rows = node.children.slice(1).map((row) =>
        row.children.map((cell) => ({
          content: renderInlineChildren(cell.children),
        })),
      );
      return <Tbl key={key} header={header} rows={rows} />;
    }

    case "html":
      // pdf-it intentionally does not parse raw HTML in markdown
      return null;

    default:
      return null;
  }
}

function renderInlineChildren(children: PhrasingContent[]): ReactNode {
  return children.map((child, i) => renderInline(child, i));
}

function renderInline(node: PhrasingContent, key: number): ReactNode {
  switch (node.type) {
    case "text":
      return node.value;
    case "strong":
      return <Strong key={key}>{renderInlineChildren(node.children)}</Strong>;
    case "emphasis":
      return <Em key={key}>{renderInlineChildren(node.children)}</Em>;
    case "inlineCode":
      return <InlineCode key={key}>{node.value}</InlineCode>;
    case "link":
      return (
        <A key={key} href={node.url}>
          {renderInlineChildren(node.children)}
        </A>
      );
    case "break":
      return "\n";
    default:
      return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
