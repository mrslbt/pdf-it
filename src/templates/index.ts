import { researchReport } from './research-report.js';
import { plain } from './plain.js';
import type { Template } from '../types.js';

const registry: Template[] = [researchReport, plain];

export function getTemplate(name: string): Template | undefined {
  return registry.find(t => t.name === name);
}

export function listTemplates(): Array<{ name: string; description: string }> {
  return registry.map(t => ({ name: t.name, description: t.description }));
}
