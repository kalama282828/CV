// Serializer Service
// Requirements: 2.1, 2.2, 2.3, 2.4

import { CVData, CVError, CVErrorType, PersonalInfo, WorkExperience, Education, Skill } from '../models/types';

export class SerializationError extends Error implements CVError {
  type = CVErrorType.SERIALIZATION_ERROR;
  field?: string;
  details?: unknown;

  constructor(message: string, field?: string, details?: unknown) {
    super(message);
    this.name = 'SerializationError';
    this.field = field;
    this.details = details;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function validatePersonalInfo(data: unknown): data is PersonalInfo {
  if (!isObject(data)) return false;
  const required = ['name', 'email', 'phone', 'location'];
  return required.every(field => typeof data[field] === 'string' && (data[field] as string).length > 0);
}

function validateWorkExperience(data: unknown): data is WorkExperience {
  if (!isObject(data)) return false;
  const required = ['id', 'company', 'title', 'startDate', 'endDate'];
  const hasRequired = required.every(field => typeof data[field] === 'string');
  const hasDescription = Array.isArray(data.description) && 
    data.description.every((d: unknown) => typeof d === 'string');
  return hasRequired && hasDescription;
}

function validateEducation(data: unknown): data is Education {
  if (!isObject(data)) return false;
  const required = ['id', 'institution', 'degree', 'field', 'startDate', 'endDate'];
  return required.every(field => typeof data[field] === 'string');
}

function validateSkill(data: unknown): data is Skill {
  if (!isObject(data)) return false;
  const validCategories = ['technical', 'soft', 'language', 'other'];
  return typeof data.name === 'string' && 
         typeof data.category === 'string' &&
         validCategories.includes(data.category);
}

function validateCVDataSchema(data: unknown): data is CVData {
  if (!isObject(data)) {
    throw new SerializationError('Invalid JSON: expected object', 'root');
  }

  // Validate personalInfo
  if (!validatePersonalInfo(data.personalInfo)) {
    throw new SerializationError(
      'Invalid personalInfo: missing or invalid required fields (name, email, phone, location)',
      'personalInfo'
    );
  }

  // Validate workExperience
  if (!Array.isArray(data.workExperience)) {
    throw new SerializationError('Invalid workExperience: expected array', 'workExperience');
  }
  for (let i = 0; i < data.workExperience.length; i++) {
    if (!validateWorkExperience(data.workExperience[i])) {
      throw new SerializationError(
        `Invalid workExperience[${i}]: missing required fields`,
        `workExperience[${i}]`
      );
    }
  }

  // Validate education
  if (!Array.isArray(data.education)) {
    throw new SerializationError('Invalid education: expected array', 'education');
  }
  for (let i = 0; i < data.education.length; i++) {
    if (!validateEducation(data.education[i])) {
      throw new SerializationError(
        `Invalid education[${i}]: missing required fields`,
        `education[${i}]`
      );
    }
  }

  // Validate skills
  if (!Array.isArray(data.skills)) {
    throw new SerializationError('Invalid skills: expected array', 'skills');
  }
  for (let i = 0; i < data.skills.length; i++) {
    if (!validateSkill(data.skills[i])) {
      throw new SerializationError(
        `Invalid skills[${i}]: missing name or invalid category`,
        `skills[${i}]`
      );
    }
  }

  // Validate optional fields
  if (data.summary !== undefined && typeof data.summary !== 'string') {
    throw new SerializationError('Invalid summary: expected string', 'summary');
  }

  if (data.certifications !== undefined && !isStringArray(data.certifications)) {
    throw new SerializationError('Invalid certifications: expected string array', 'certifications');
  }

  return true;
}

export function serialize(data: CVData): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new SerializationError(
      'Failed to serialize CVData to JSON',
      undefined,
      error
    );
  }
}

export function deserialize(json: string): CVData {
  let parsed: unknown;
  
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new SerializationError(
      'Failed to parse JSON string',
      undefined,
      error
    );
  }

  validateCVDataSchema(parsed);
  return parsed as CVData;
}

export const Serializer = {
  serialize,
  deserialize
};
