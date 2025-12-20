// TemplateEngine Service
// Requirements: 3.2, 4.1, 4.2, 4.3

import { CVData, TemplateName } from '../models/types';
import { renderClassic } from '../templates/classic';
import { renderModern } from '../templates/modern';
import { renderMinimal } from '../templates/minimal';

type RenderFunction = (data: CVData) => string;

const templates: Record<TemplateName, RenderFunction> = {
  classic: renderClassic,
  modern: renderModern,
  minimal: renderMinimal
};

export function render(data: CVData, template: TemplateName): string {
  const renderFn = templates[template];
  if (!renderFn) {
    throw new Error(`Unknown template: ${template}`);
  }
  return renderFn(data);
}

export function renderAll(data: CVData): Map<TemplateName, string> {
  const results = new Map<TemplateName, string>();
  
  for (const templateName of getAvailableTemplates()) {
    results.set(templateName, render(data, templateName));
  }
  
  return results;
}

export function getAvailableTemplates(): TemplateName[] {
  return ['classic', 'modern', 'minimal'];
}

export const TemplateEngine = {
  render,
  renderAll,
  getAvailableTemplates
};
