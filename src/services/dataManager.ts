// DataManager Service
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5

import * as fs from 'fs/promises';
import { CVData, WorkExperience, Education, Skill, PersonalInfo, CVError, CVErrorType } from '../models/types';
import { serialize, deserialize } from './serializer';

export class FileError extends Error implements CVError {
  type = CVErrorType.FILE_ERROR;
  field?: string;
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'FileError';
    this.details = details;
  }
}

type ChangeCallback = (data: CVData) => void;
type ArraySection = 'workExperience' | 'education';

export class DataManager {
  private data: CVData;
  private callbacks: ChangeCallback[] = [];

  constructor(initialData?: CVData) {
    this.data = initialData || this.createEmptyData();
  }

  private createEmptyData(): CVData {
    return {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: ''
      },
      workExperience: [],
      education: [],
      skills: []
    };
  }

  async load(filePath: string): Promise<CVData> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.data = deserialize(content);
      this.notifyChange();
      return this.data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileError(`File not found: ${filePath}`, error);
      }
      throw error;
    }
  }

  async save(filePath: string): Promise<void> {
    try {
      const content = serialize(this.data);
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new FileError(`Failed to save file: ${filePath}`, error);
    }
  }

  getData(): CVData {
    return { ...this.data };
  }

  updatePersonalInfo(info: Partial<PersonalInfo>): void {
    this.data.personalInfo = { ...this.data.personalInfo, ...info };
    this.notifyChange();
  }

  updateSummary(summary: string | undefined): void {
    this.data.summary = summary;
    this.notifyChange();
  }

  addWorkExperience(entry: WorkExperience): void {
    this.data.workExperience.push(entry);
    this.notifyChange();
  }

  addEducation(entry: Education): void {
    this.data.education.push(entry);
    this.notifyChange();
  }

  addSkill(skill: Skill): void {
    this.data.skills.push(skill);
    this.notifyChange();
  }

  addEntry(section: ArraySection, entry: WorkExperience | Education): void {
    if (section === 'workExperience') {
      this.data.workExperience.push(entry as WorkExperience);
    } else {
      this.data.education.push(entry as Education);
    }
    this.notifyChange();
  }

  removeEntry(section: ArraySection, id: string): boolean {
    const array = this.data[section];
    const index = array.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    array.splice(index, 1);
    this.notifyChange();
    return true;
  }

  removeSkill(name: string): boolean {
    const index = this.data.skills.findIndex(s => s.name === name);
    if (index === -1) return false;
    
    this.data.skills.splice(index, 1);
    this.notifyChange();
    return true;
  }

  updateWorkExperience(id: string, updates: Partial<WorkExperience>): boolean {
    const entry = this.data.workExperience.find(e => e.id === id);
    if (!entry) return false;
    
    Object.assign(entry, updates);
    this.notifyChange();
    return true;
  }

  updateEducation(id: string, updates: Partial<Education>): boolean {
    const entry = this.data.education.find(e => e.id === id);
    if (!entry) return false;
    
    Object.assign(entry, updates);
    this.notifyChange();
    return true;
  }

  setCertifications(certs: string[]): void {
    this.data.certifications = certs;
    this.notifyChange();
  }

  onChange(callback: ChangeCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }

  private notifyChange(): void {
    const dataCopy = { ...this.data };
    this.callbacks.forEach(cb => cb(dataCopy));
  }
}

export function createDataManager(initialData?: CVData): DataManager {
  return new DataManager(initialData);
}
