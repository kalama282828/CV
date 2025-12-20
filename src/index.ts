// ATS CV Generator - Main Entry Point
// Requirements: All

// Export types
export * from './models/types';

// Export services
export { Serializer, serialize, deserialize, SerializationError } from './services/serializer';
export { Validator, validate, validateEmail, validateDateRange } from './services/validator';
export { DataManager, createDataManager, FileError } from './services/dataManager';
export { TemplateEngine, render, renderAll, getAvailableTemplates } from './services/templateEngine';
export { Exporter, generateFileName, exportHTML, exportPDF, exportCV, ExportError } from './services/exporter';
export { PreviewService, createPreview } from './services/preview';

// Import for CVGenerator facade
import { CVData, TemplateName, ValidationResult, ExportOptions } from './models/types';
import { DataManager } from './services/dataManager';
import { validate } from './services/validator';
import { render, renderAll } from './services/templateEngine';
import { exportHTML, exportPDF, generateFileName } from './services/exporter';
import { PreviewService } from './services/preview';

export class CVGenerator {
  private dataManager: DataManager;
  private previewService: PreviewService;

  constructor(initialData?: CVData) {
    this.dataManager = new DataManager(initialData);
    this.previewService = new PreviewService(this.dataManager);
  }

  // Data management
  getData(): CVData {
    return this.dataManager.getData();
  }

  async loadFromFile(filePath: string): Promise<CVData> {
    return this.dataManager.load(filePath);
  }

  async saveToFile(filePath: string): Promise<void> {
    return this.dataManager.save(filePath);
  }

  updatePersonalInfo(info: Partial<CVData['personalInfo']>): void {
    this.dataManager.updatePersonalInfo(info);
  }

  addWorkExperience(exp: CVData['workExperience'][0]): void {
    this.dataManager.addWorkExperience(exp);
  }

  addEducation(edu: CVData['education'][0]): void {
    this.dataManager.addEducation(edu);
  }

  addSkill(skill: CVData['skills'][0]): void {
    this.dataManager.addSkill(skill);
  }

  removeWorkExperience(id: string): boolean {
    return this.dataManager.removeEntry('workExperience', id);
  }

  removeEducation(id: string): boolean {
    return this.dataManager.removeEntry('education', id);
  }

  // Validation
  validate(): ValidationResult {
    return validate(this.dataManager.getData());
  }

  // Rendering
  render(template: TemplateName = 'classic'): string {
    return render(this.dataManager.getData(), template);
  }

  renderAll(): Map<TemplateName, string> {
    return renderAll(this.dataManager.getData());
  }

  // Preview
  preview(template: TemplateName = 'classic'): string {
    return this.previewService.generate(this.dataManager.getData(), template);
  }

  onPreviewUpdate(callback: (html: string) => void): () => void {
    return this.previewService.onUpdate(callback);
  }

  // Export
  async exportHTML(outputPath: string, template: TemplateName = 'classic'): Promise<string> {
    const html = this.render(template);
    const options: ExportOptions = { template, format: 'html', outputPath };
    return exportHTML(html, options);
  }

  async exportPDF(outputPath: string, template: TemplateName = 'classic'): Promise<string> {
    const html = this.render(template);
    const options: ExportOptions = { template, format: 'pdf', outputPath };
    return exportPDF(html, options);
  }

  getFileName(template: TemplateName, format: 'html' | 'pdf'): string {
    const name = this.dataManager.getData().personalInfo.name;
    return generateFileName(name, template, format);
  }

  // Lifecycle
  onChange(callback: (data: CVData) => void): () => void {
    return this.dataManager.onChange(callback);
  }

  dispose(): void {
    this.previewService.dispose();
  }
}

export function createCVGenerator(initialData?: CVData): CVGenerator {
  return new CVGenerator(initialData);
}
