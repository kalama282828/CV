// CV Data Types and Interfaces
// Requirements: 1.1, 1.2, 1.3, 1.4

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string; // YYYY-MM format
  endDate: string | 'present';
  description: string[];
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string; // YYYY-MM format
  endDate: string;
  gpa?: string;
}

export type SkillCategory = 'technical' | 'soft' | 'language' | 'other';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  category: SkillCategory;
  level?: SkillLevel;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications?: string[];
  projects?: Project[];
}

// Validation Types
export type ValidationErrorType = 'required' | 'format' | 'range';

export interface ValidationError {
  field: string;
  message: string;
  type: ValidationErrorType;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Error Types
export enum CVErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  TEMPLATE_ERROR = 'TEMPLATE_ERROR',
  EXPORT_ERROR = 'EXPORT_ERROR',
  FILE_ERROR = 'FILE_ERROR'
}

export interface CVError {
  type: CVErrorType;
  message: string;
  field?: string;
  details?: unknown;
}

// Template Types
export type TemplateName = 'classic' | 'modern' | 'minimal';

export interface ExportOptions {
  template: TemplateName;
  format: 'html' | 'pdf';
  outputPath: string;
}
