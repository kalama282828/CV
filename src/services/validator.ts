// Validator Service
// Requirements: 7.1, 7.2, 7.3, 7.4

import { CVData, ValidationResult, ValidationError } from '../models/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  if (endDate === 'present') return true;
  
  if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
    return false;
  }
  
  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);
  
  if (endYear < startYear) return false;
  if (endYear === startYear && endMonth < startMonth) return false;
  
  return true;
}

export function validate(data: CVData): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate personalInfo required fields
  if (!data.personalInfo.name || data.personalInfo.name.trim() === '') {
    errors.push({
      field: 'personalInfo.name',
      message: 'Name is required',
      type: 'required'
    });
  }

  if (!data.personalInfo.email || data.personalInfo.email.trim() === '') {
    errors.push({
      field: 'personalInfo.email',
      message: 'Email is required',
      type: 'required'
    });
  } else if (!validateEmail(data.personalInfo.email)) {
    errors.push({
      field: 'personalInfo.email',
      message: 'Invalid email format',
      type: 'format'
    });
  }

  if (!data.personalInfo.phone || data.personalInfo.phone.trim() === '') {
    errors.push({
      field: 'personalInfo.phone',
      message: 'Phone is required',
      type: 'required'
    });
  }

  if (!data.personalInfo.location || data.personalInfo.location.trim() === '') {
    errors.push({
      field: 'personalInfo.location',
      message: 'Location is required',
      type: 'required'
    });
  }

  // Validate at least one experience or education
  if (data.workExperience.length === 0 && data.education.length === 0) {
    errors.push({
      field: 'workExperience/education',
      message: 'At least one work experience or education entry is required',
      type: 'required'
    });
  }

  // Validate work experience entries
  data.workExperience.forEach((exp, index) => {
    if (!exp.company || exp.company.trim() === '') {
      errors.push({
        field: `workExperience[${index}].company`,
        message: 'Company is required',
        type: 'required'
      });
    }
    if (!exp.title || exp.title.trim() === '') {
      errors.push({
        field: `workExperience[${index}].title`,
        message: 'Title is required',
        type: 'required'
      });
    }
    if (!exp.startDate) {
      errors.push({
        field: `workExperience[${index}].startDate`,
        message: 'Start date is required',
        type: 'required'
      });
    }
    if (!exp.endDate) {
      errors.push({
        field: `workExperience[${index}].endDate`,
        message: 'End date is required',
        type: 'required'
      });
    }
    if (exp.startDate && exp.endDate && !validateDateRange(exp.startDate, exp.endDate)) {
      errors.push({
        field: `workExperience[${index}].dateRange`,
        message: 'End date must be after start date',
        type: 'range'
      });
    }
  });

  // Validate education entries
  data.education.forEach((edu, index) => {
    if (!edu.institution || edu.institution.trim() === '') {
      errors.push({
        field: `education[${index}].institution`,
        message: 'Institution is required',
        type: 'required'
      });
    }
    if (!edu.degree || edu.degree.trim() === '') {
      errors.push({
        field: `education[${index}].degree`,
        message: 'Degree is required',
        type: 'required'
      });
    }
    if (!edu.startDate) {
      errors.push({
        field: `education[${index}].startDate`,
        message: 'Start date is required',
        type: 'required'
      });
    }
    if (!edu.endDate) {
      errors.push({
        field: `education[${index}].endDate`,
        message: 'End date is required',
        type: 'required'
      });
    }
    if (edu.startDate && edu.endDate && !validateDateRange(edu.startDate, edu.endDate)) {
      errors.push({
        field: `education[${index}].dateRange`,
        message: 'End date must be after start date',
        type: 'range'
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export const Validator = {
  validate,
  validateEmail,
  validateDateRange
};
