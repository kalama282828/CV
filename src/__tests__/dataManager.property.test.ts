// **Feature: ats-cv-generator, Property 2, 3: Data Storage Properties**
// **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

import * as fc from 'fast-check';
import { DataManager } from '../services/dataManager';
import { PersonalInfo, WorkExperience, Education, Skill, SkillCategory, SkillLevel } from '../models/types';

// Generators
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

describe('DataManager Property Tests', () => {
  // **Feature: ats-cv-generator, Property 2: Valid CV Data Storage**
  describe('Property 2: Valid CV Data Storage', () => {
    test('personal info is stored and retrievable with identical values', () => {
      fc.assert(
        fc.property(personalInfoArb, (info) => {
          const manager = new DataManager();
          manager.updatePersonalInfo(info);
          const data = manager.getData();
          
          expect(data.personalInfo.name).toBe(info.name);
          expect(data.personalInfo.email).toBe(info.email);
          expect(data.personalInfo.phone).toBe(info.phone);
          expect(data.personalInfo.location).toBe(info.location);
        }),
        { numRuns: 100 }
      );
    });

    test('work experience is stored and retrievable with identical values', () => {
      fc.assert(
        fc.property(workExperienceArb, (exp) => {
          const manager = new DataManager();
          manager.addWorkExperience(exp);
          const data = manager.getData();
          
          expect(data.workExperience.length).toBe(1);
          expect(data.workExperience[0]).toEqual(exp);
        }),
        { numRuns: 100 }
      );
    });

    test('education is stored and retrievable with identical values', () => {
      fc.assert(
        fc.property(educationArb, (edu) => {
          const manager = new DataManager();
          manager.addEducation(edu);
          const data = manager.getData();
          
          expect(data.education.length).toBe(1);
          expect(data.education[0]).toEqual(edu);
        }),
        { numRuns: 100 }
      );
    });

    test('multiple entries are stored in order', () => {
      fc.assert(
        fc.property(
          fc.array(workExperienceArb, { minLength: 1, maxLength: 5 }),
          (experiences) => {
            const manager = new DataManager();
            experiences.forEach(exp => manager.addWorkExperience(exp));
            const data = manager.getData();
            
            expect(data.workExperience.length).toBe(experiences.length);
            experiences.forEach((exp, i) => {
              expect(data.workExperience[i]).toEqual(exp);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('removing entry by id removes correct entry', () => {
      fc.assert(
        fc.property(
          fc.array(workExperienceArb, { minLength: 2, maxLength: 5 }),
          fc.nat(),
          (experiences, indexSeed) => {
            const manager = new DataManager();
            experiences.forEach(exp => manager.addWorkExperience(exp));
            
            const removeIndex = indexSeed % experiences.length;
            const idToRemove = experiences[removeIndex].id;
            
            const removed = manager.removeEntry('workExperience', idToRemove);
            const data = manager.getData();
            
            expect(removed).toBe(true);
            expect(data.workExperience.length).toBe(experiences.length - 1);
            expect(data.workExperience.find(e => e.id === idToRemove)).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: ats-cv-generator, Property 3: Skill Categorization Consistency**
  describe('Property 3: Skill Categorization Consistency', () => {
    test('skill category is preserved after storage', () => {
      fc.assert(
        fc.property(skillArb, (skill) => {
          const manager = new DataManager();
          manager.addSkill(skill);
          const data = manager.getData();
          
          expect(data.skills.length).toBe(1);
          expect(data.skills[0].category).toBe(skill.category);
          expect(data.skills[0].name).toBe(skill.name);
        }),
        { numRuns: 100 }
      );
    });

    test('multiple skills preserve their categories', () => {
      fc.assert(
        fc.property(
          fc.array(skillArb, { minLength: 1, maxLength: 10 }),
          (skills) => {
            const manager = new DataManager();
            skills.forEach(skill => manager.addSkill(skill));
            const data = manager.getData();
            
            expect(data.skills.length).toBe(skills.length);
            skills.forEach((skill, i) => {
              expect(data.skills[i].category).toBe(skill.category);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('skill level is preserved if provided', () => {
      fc.assert(
        fc.property(
          skillArb.filter(s => s.level !== undefined),
          (skill) => {
            const manager = new DataManager();
            manager.addSkill(skill);
            const data = manager.getData();
            
            expect(data.skills[0].level).toBe(skill.level);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('onChange callback', () => {
    test('callback is triggered on data changes', () => {
      fc.assert(
        fc.property(personalInfoArb, (info) => {
          const manager = new DataManager();
          let callCount = 0;
          
          manager.onChange(() => { callCount++; });
          manager.updatePersonalInfo(info);
          
          expect(callCount).toBe(1);
        }),
        { numRuns: 100 }
      );
    });
  });
});
