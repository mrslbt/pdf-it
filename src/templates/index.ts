/**
 * Template registry — name → React component.
 *
 * Components take their own props; the generator passes through whatever the
 * MCP tool received. No more HTML render contracts; the template IS the
 * document.
 */

import type { JSX } from "react";
import { ResearchReport } from "./ResearchReport.js";
import { Plain } from "./Plain.js";

export interface TemplateProps {
  markdown: string;
  title?: string;
  author?: string;
  date?: string;
}

export type TemplateComponent = (props: TemplateProps) => JSX.Element;

export const templates: Record<string, TemplateComponent> = {
  "research-report": ResearchReport as TemplateComponent,
  "plain": Plain as TemplateComponent,
};

export function getTemplate(name: string): TemplateComponent | undefined {
  return templates[name];
}

export function listTemplates(): Array<{ name: string; description: string }> {
  return [
    {
      name: "research-report",
      description:
        "Cover page, auto-generated table of contents, styled body with footer page numbers. Best for research output and reports.",
    },
    {
      name: "plain",
      description:
        "No cover, no TOC. Dense, clean body content. Best for notes and short documents.",
    },
  ];
}
