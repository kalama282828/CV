// **Feature: ats-cv-generator, Property 1: Serialization Round Trip**
// **Validates: Requirements 2.1, 2.2, 2.3**

import * as fc from 'fast-check';
import { serialize, deserialize } from '../services/serializer';
import { CVData, PersonalInfo, WorkExperience, Education, Skill, SkillCategory, SkillLevel } from '../models/types';

// Generators for CVData components
const personalInfoArb: fc.Arbitrary<PersonalInfo> = fc.record({
  name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  location: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  linkedin: fc.option(fc.webUrl(), { nil: undefined }),
  website: fc.option(fc.webUrl(), { nil: undefined })
});

const workExperienceArb: fc.Arbitrary<WorkExperience> = fc.record({
  id: fc.uuid(),
  company: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  startDate: fc.date({ min: new Date('1970-01-01'), max: new Date('2024-12-31') })
    .map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`),
  endDate: fc.oneof(
    fc.constant('present' as const),
    fc.date({ min: new Date('1970-01-01'), max: new Date('2024-12-31') })
      .map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  ),
  description: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
  location: fc.option(fc.string(), { nil: undefined })
});

const educationArb: fc.Arbitrary<Education> = fc.record({
  id: fc.uuid(),
  institution: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  degree: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  field: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  startDate: fc.date({ min: new Date('1970-01-01'), max: new Date('2024-12-31') })
    .map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`),
  endDate: fc.date({ min: new Date('1970-01-01'), max: new Date('2024-12-31') })
    .map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`),
  gpa: fc.option(fc.string(), { nil: undefined })
});

const skillCategoryArb: fc.Arbitrary<SkillCategory> = fc.constantFrom('technical', 'soft', 'language', 'other');
const skillLevelArb: fc.Arbitrary<SkillLevel> = fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert');

const skillArb: fc.Arbitrary<Skill> = fc.record({
  name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  category: skillCategoryArb,
  level: fc.option(skillLevelArb, { nil: undefined })
});

const cvDataArb: fc.Arbitrary<CVData> = fc.record({
  personalInfo: personalInfoArb,
  summary: fc.option(fc.string(), { nil: undefined }),
  workExperience: fc.array(workExperienceArb, { minLength: 0, maxLength: 5 }),
  education: fc.array(educationArb, { minLength: 0, maxLength: 3 }),
  skills: fc.array(skillArb, { minLength: 0, maxLength: 10 }),
  certifications: fc.option(fc.array(fc.string(), { maxLength: 5 }), { nil: undefined }),
  projects: fc.option(fc.constant(undefined), { nil: undefined })
});

describe('Serializer Property Tests', () => {
  // **Feature: ats-cv-generator, Property 1: Serialization Round Trip**
  test('Property 1: serialize then deserialize produces equivalent CVData', () => {
    fc.assert(
      fc.property(cvDataArb, (originalData) => {
        const serialized = serialize(originalData);
        const deserialized = deserialize(serialized);
        
        // Deep equality check
        expect(deserialized).toEqual(originalData);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 1: serialization preserves all field values exactly', () => {
    fc.assert(
      fc.property(cvDataArb, (originalData) => {
        const serialized = serialize(originalData);
        const deserialized = deserialize(serialized);
        
        // Check personal info fields
        expect(deserialized.personalInfo.name).toBe(originalData.personalInfo.name);
        expect(deserialized.personalInfo.email).toBe(originalData.personalInfo.email);
        expect(deserialized.personalInfo.phone).toBe(originalData.personalInfo.phone);
        expect(deserialized.personalInfo.location).toBe(originalData.personalInfo.location);
        
        // Check arrays have same length
        expect(deserialized.workExperience.length).toBe(originalData.workExperience.length);
        expect(deserialized.education.length).toBe(originalData.education.length);
        expect(deserialized.skills.length).toBe(originalData.skills.length);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 1: double serialization produces same result', () => {
    fc.assert(
      fc.property(cvDataArb, (originalData) => {
        const serialized1 = serialize(originalData);
        const deserialized1 = deserialize(serialized1);
        const serialized2 = serialize(deserialized1);
        
        expect(serialized1).toBe(serialized2);
      }),
      { numRuns: 100 }
    );
  });
});


// **Feature: ats-cv-generator, Property 12: Invalid JSON Schema Rejection**
// **Validates: Requirements 2.4**

describe('Serializer Invalid JSON Rejection Tests', () => {
  // **Feature: ats-cv-generator, Property 12: Invalid JSON Schema Rejection**
  test('Property 12: invalid JSON string throws SerializationError', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => {
          try { JSON.parse(s); return false; } catch { return true; }
        }),
        (invalidJson) => {
          expect(() => deserialize(invalidJson)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: missing personalInfo throws SerializationError', () => {
    fc.assert(
      fc.property(
        fc.record({
          workExperience: fc.constant([]),
          education: fc.constant([]),
          skills: fc.constant([])
        }),
        (invalidData) => {
          const json = JSON.stringify(invalidData);
          expect(() => deserialize(json)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: missing required personalInfo fields throws error', () => {
    const requiredFields = ['name', 'email', 'phone', 'location'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredFields),
        fc.string({ minLength: 1 }),
        (missingField, value) => {
          const personalInfo: Record<string, string> = {
            name: 'Test',
            email: 'test@test.com',
            phone: '123',
            location: 'City'
          };
          delete personalInfo[missingField];
          
          const data = {
            personalInfo,
            workExperience: [],
            education: [],
            skills: []
          };
          
          expect(() => deserialize(JSON.stringify(data))).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: invalid skill category throws error', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !['technical', 'soft', 'language', 'other'].includes(s)),
        (invalidCategory) => {
          const data = {
            personalInfo: { name: 'Test', email: 'test@test.com', phone: '123', location: 'City' },
            workExperience: [],
            education: [],
            skills: [{ name: 'Skill', category: invalidCategory }]
          };
          
          expect(() => deserialize(JSON.stringify(data))).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: non-object root throws error', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null), fc.array(fc.anything())),
        (invalidRoot) => {
          const json = JSON.stringify(invalidRoot);
          expect(() => deserialize(json)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
