// CV Data Types
export interface PersonalInfo {
  name: string;
  title: string; // Job title shown under name (e.g., "Software Engineer")
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
  startDate: string;
  endDate: string;
  description: string[];
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export type SkillCategory = 'technical' | 'soft' | 'language' | 'other';

export interface Skill {
  name: string;
  category: SkillCategory;
}

export interface AdditionalInfo {
  languages: string;
  certificates: string;
  awards: string;
  references: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  photo?: string; // Base64 encoded image
  summary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  additionalInfo?: AdditionalInfo;
}

export type TemplateName = 'classic' | 'modern' | 'minimal' | 'pastel';

export type Language = 'tr' | 'en';

// Translations for CV sections
export const translations = {
  en: {
    summary: 'SUMMARY',
    experience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    skills: 'TECHNICAL SKILLS',
    additional: 'ADDITIONAL INFORMATION',
    languages: 'Languages',
    certificates: 'Certificates',
    awards: 'Awards/Activities',
    references: 'References',
    present: 'Present',
    graduated: 'Graduated with High Honors.',
  },
  tr: {
    summary: 'ÖZET',
    experience: 'İŞ DENEYİMİ',
    education: 'EĞİTİM',
    skills: 'TEKNİK BECERİLER',
    additional: 'EK BİLGİLER',
    languages: 'Diller',
    certificates: 'Sertifikalar',
    awards: 'Ödüller/Aktiviteler',
    references: 'Referanslar',
    present: 'Devam Ediyor',
    graduated: 'Yüksek Onur Derecesiyle Mezun.',
  },
} as const;
