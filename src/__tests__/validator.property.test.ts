// **Feature: ats-cv-generator, Property 9, 10, 11: Validation Properties**
// **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

import * as fc from 'fast-check';
import { validate, validateEmail, validateDateRange } from '../services/validator';
import { CVData, PersonalInfo, WorkExperience, Education, Skill } from '../models/types';

// Helper to create valid CVData
const createValidCVData = (overrides: Partial<CVData> = {}): CVData => ({
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'New York, USA'
  },
  workExperience: [{
    id: '1',
    company: 'Tech Corp',
    title: 'Developer',
    startDate: '2020-01',
    endDate: '2023-12',
    description: ['Developed features']
  }],
  education: [],
  skills: [],
  ...overrides
});

describe('Validator Property Tests', () => {
  // **Feature: ats-cv-generator, Property 9: Required Field Validation**
  describe('Property 9: Required Field Validation', () => {
    test('missing name returns error specifying the field', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim() === ''),
          (emptyName) => {
            const data = createValidCVData({
              personalInfo: { ...createValidCVData().personalInfo, name: emptyName }
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'personalInfo.name' && e.type === 'required')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('missing email returns error specifying the field', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim() === ''),
          (emptyEmail) => {
            const data = createValidCVData({
              personalInfo: { ...createValidCVData().personalInfo, email: emptyEmail }
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'personalInfo.email' && e.type === 'required')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('missing phone returns error specifying the field', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim() === ''),
          (emptyPhone) => {
            const data = createValidCVData({
              personalInfo: { ...createValidCVData().personalInfo, phone: emptyPhone }
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'personalInfo.phone' && e.type === 'required')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('missing location returns error specifying the field', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim() === ''),
          (emptyLocation) => {
            const data = createValidCVData({
              personalInfo: { ...createValidCVData().personalInfo, location: emptyLocation }
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'personalInfo.location' && e.type === 'required')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('missing work experience company returns error', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim() === ''),
          (emptyCompany) => {
            const data = createValidCVData({
              workExperience: [{
                id: '1',
                company: emptyCompany,
                title: 'Developer',
                startDate: '2020-01',
                endDate: '2023-12',
                description: []
              }]
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field.includes('company') && e.type === 'required')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('missing work experience title returns error', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim() === ''),
          (emptyTitle) => {
            const data = createValidCVData({
              workExperience: [{
                id: '1',
                company: 'Tech Corp',
                title: emptyTitle,
                startDate: '2020-01',
                endDate: '2023-12',
                description: []
              }]
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field.includes('title') && e.type === 'required')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: ats-cv-generator, Property 10: Date Range Validation**
  describe('Property 10: Date Range Validation', () => {
    test('end date before start date returns range error', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2000, max: 2020 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 5 }), // years to subtract
          (startYear, startMonth, yearsBack) => {
            const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}`;
            const endYear = startYear - yearsBack;
            const endDate = `${endYear}-${String(startMonth).padStart(2, '0')}`;
            
            expect(validateDateRange(startDate, endDate)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('end date after start date is valid', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2000, max: 2020 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 5 }), // years to add
          (startYear, startMonth, yearsForward) => {
            const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}`;
            const endYear = startYear + yearsForward;
            const endDate = `${endYear}-${String(startMonth).padStart(2, '0')}`;
            
            expect(validateDateRange(startDate, endDate)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('present as end date is always valid', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1970, max: 2024 }),
          fc.integer({ min: 1, max: 12 }),
          (year, month) => {
            const startDate = `${year}-${String(month).padStart(2, '0')}`;
            expect(validateDateRange(startDate, 'present')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('invalid date range in work experience returns error', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2010, max: 2020 }),
          fc.integer({ min: 1, max: 12 }),
          (startYear, month) => {
            const startDate = `${startYear}-${String(month).padStart(2, '0')}`;
            const endDate = `${startYear - 2}-${String(month).padStart(2, '0')}`;
            
            const data = createValidCVData({
              workExperience: [{
                id: '1',
                company: 'Tech Corp',
                title: 'Developer',
                startDate,
                endDate,
                description: []
              }]
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.type === 'range')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: ats-cv-generator, Property 11: Email Format Validation**
  describe('Property 11: Email Format Validation', () => {
    test('valid emails pass validation', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            expect(validateEmail(email)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('emails without @ fail validation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
          (invalidEmail) => {
            expect(validateEmail(invalidEmail)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('emails with spaces fail validation', () => {
      fc.assert(
        fc.property(
          fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })),
          ([local, domain]) => {
            const emailWithSpace = `${local} @${domain}.com`;
            expect(validateEmail(emailWithSpace)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('invalid email in CVData returns format error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => !s.includes('@') && s.trim().length > 0),
          (invalidEmail) => {
            const data = createValidCVData({
              personalInfo: { ...createValidCVData().personalInfo, email: invalidEmail }
            });
            const result = validate(data);
            
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'personalInfo.email' && e.type === 'format')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
