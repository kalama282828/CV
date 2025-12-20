// Exporter Service
// Requirements: 5.1, 5.2, 5.3

import * as fs from 'fs/promises';
import * as path from 'path';
import { TemplateName, CVError, CVErrorType, ExportOptions } from '../models/types';

export class ExportError extends Error implements CVError {
  type = CVErrorType.EXPORT_ERROR;
  field?: string;
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'ExportError';
    this.details = details;
  }
}

export function generateFileName(name: string, template: TemplateName, format: string): string {
  let sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  // Remove leading/trailing underscores and collapse multiple underscores
  sanitizedName = sanitizedName.replace(/^_+|_+$/g, '').replace(/_+/g, '_');
  // If name becomes empty after sanitization, use 'cv' as default
  if (!sanitizedName) sanitizedName = 'cv';
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${sanitizedName}_${template}_${date}.${format}`;
}

export async function exportHTML(html: string, options: ExportOptions): Promise<string> {
  const fileName = generateFileName(
    path.basename(options.outputPath, path.extname(options.outputPath)) || 'cv',
    options.template,
    'html'
  );
  
  const outputDir = path.dirname(options.outputPath);
  const fullPath = path.join(outputDir, fileName);
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(fullPath, html, 'utf-8');
    return fullPath;
  } catch (error) {
    throw new ExportError(`Failed to export HTML to ${fullPath}`, error);
  }
}

export async function exportPDF(html: string, options: ExportOptions): Promise<string> {
  const fileName = generateFileName(
    path.basename(options.outputPath, path.extname(options.outputPath)) || 'cv',
    options.template,
    'pdf'
  );
  
  const outputDir = path.dirname(options.outputPath);
  const fullPath = path.join(outputDir, fileName);
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    // Dynamic import for puppeteer to avoid issues if not installed
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: fullPath,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true
    });
    
    await browser.close();
    return fullPath;
  } catch (error) {
    throw new ExportError(`Failed to export PDF to ${fullPath}`, error);
  }
}

export async function exportCV(
  html: string,
  name: string,
  options: ExportOptions
): Promise<string> {
  if (options.format === 'html') {
    return exportHTML(html, { ...options, outputPath: path.join(options.outputPath, name) });
  } else {
    return exportPDF(html, { ...options, outputPath: path.join(options.outputPath, name) });
  }
}

export const Exporter = {
  generateFileName,
  exportHTML,
  exportPDF,
  exportCV
};
