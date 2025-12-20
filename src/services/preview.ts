// Preview Service
// Requirements: 6.1, 6.3

import { CVData, TemplateName } from '../models/types';
import { render } from './templateEngine';
import { DataManager } from './dataManager';

export interface PreviewOptions {
  template: TemplateName;
  autoRefresh: boolean;
}

export class PreviewService {
  private currentHtml: string = '';
  private currentTemplate: TemplateName = 'classic';
  private unsubscribe: (() => void) | null = null;
  private onUpdateCallbacks: ((html: string) => void)[] = [];

  constructor(private dataManager?: DataManager) {
    if (dataManager) {
      this.setupAutoRefresh(dataManager);
    }
  }

  private setupAutoRefresh(dataManager: DataManager): void {
    this.unsubscribe = dataManager.onChange((data) => {
      this.refresh(data);
    });
  }

  generate(data: CVData, template: TemplateName = 'classic'): string {
    this.currentTemplate = template;
    this.currentHtml = render(data, template);
    return this.currentHtml;
  }

  refresh(data: CVData): void {
    this.currentHtml = render(data, this.currentTemplate);
    this.notifyUpdate();
  }

  setTemplate(template: TemplateName): void {
    this.currentTemplate = template;
  }

  getCurrentHtml(): string {
    return this.currentHtml;
  }

  getCurrentTemplate(): TemplateName {
    return this.currentTemplate;
  }

  onUpdate(callback: (html: string) => void): () => void {
    this.onUpdateCallbacks.push(callback);
    return () => {
      const index = this.onUpdateCallbacks.indexOf(callback);
      if (index > -1) this.onUpdateCallbacks.splice(index, 1);
    };
  }

  private notifyUpdate(): void {
    this.onUpdateCallbacks.forEach(cb => cb(this.currentHtml));
  }

  dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.onUpdateCallbacks = [];
  }
}

export function createPreview(dataManager?: DataManager): PreviewService {
  return new PreviewService(dataManager);
}
