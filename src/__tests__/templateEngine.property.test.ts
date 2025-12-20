// **Feature: ats-cv-generator, Property 4, 5, 6, 7: Template Rendering Properties**
// **Validates: Requirements 3.2, 3.3, 3.4, 4.2, 4.3**

import * as fc from 'fast-check';
import { render, renderAll, getAvailableTemplates } from '../services/templateEngine';
import { CVData, PersonalInfo, WorkExperience, Education, Skill, SkillCategory, TemplateName } from '../models/types';

// Helper to escape HTML for comparison
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

// Generators - use alphanumeric strings to avoid HTML escape issues in tests
const safeStringArb = fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0);

const personalInfoArb: fc.Arbitrary<PersonalInfo> = fc.record({
  name: safeStringArb,
  email: fc.emailAddress().filter(e => /^[a-zA-Z0-9.@]+$/.test(e)),
  phone: safeStringArb,
  location: safeStringArb,
  linkedin: fc.option(fc.constant('https://linkedin.com/in/test'), { nil: undefined }),
  website: fc.option(fc.constant('https://example.com'), { nil: undefined })
});

const workExperienceArb: fc.Arbitrary<WorkExperience> = fc.record({
  id: fc.uuid(),
  company: safeStringArb,
  title: safeStringArb,
  startDate: fc.constantFrom('2020-01', '2021-06', '2022-03'),
  endDate: fc.constantFrom('present', '2023-12', '2024-01'),
  description: fc.array(safeStringArb, { minLength: 0, maxLength: 3 }),
  location: fc.option(safeStringArb, { nil: undefined })
});

const educationArb: fc.Arbitrary<Education> = fc.record({
  id: fc.uuid(),
  institution: safeStringArb,
  degree: safeStringArb,
  field: safeStringArb,
  startDate: fc.constantFrom('2016-09', '2017-09', '2018-09'),
  endDate: fc.constantFrom('2020-06', '2021-06', '2022-06'),
  gpa: fc.option(fc.constantFrom('3.5', '3.8', '4.0'), { nil: undefined })
});

const skillCategoryArb: fc.Arbitrary<SkillCategory> = fc.constantFrom('technical', 'soft', 'language', 'other');

const skillArb: fc.Arbitrary<Skill> = fc.record({
  name: safeStringArb,
  category: skillCategoryArb,
  level: fc.option(fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert'), { nil: undefined })
});

const cvDataArb: fc.Arbitrary<CVData> = fc.record({
  personalInfo: personalInfoArb,
  summary: fc.option(safeStringArb, { nil: undefined }),
  workExperience: fc.array(workExperienceArb, { minLength: 0, maxLength: 3 }),
  education: fc.array(educationArb, { minLength: 0, maxLength: 2 }),
  skills: fc.array(skillArb, { minLength: 0, maxLength: 5 }),
  certifications: fc.option(fc.array(safeStringArb, { maxLength: 3 }), { nil: undefined }),
  projects: fc.option(fc.constant(undefined), { nil: undefined })
});

const templateNameArb: fc.Arbitrary<TemplateName> = fc.constantFrom('classic', 'modern', 'minimal');

describe('TemplateEngine Property Tests', () => {
  // **Feature: ats-cv-generator, Property 4: Template Rendering Completeness**
  describe('Property 4: Template Rendering Completeness', () => {
    test('rendered HTML contains personal info name', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).toContain(data.personalInfo.name);
        }),
        { numRuns: 100 }
      );
    });

    test('rendered HTML contains personal info email', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).toContain(data.personalInfo.email);
        }),
        { numRuns: 100 }
      );
    });

    test('rendered HTML contains work experience companies', () => {
      fc.assert(
        fc.property(
          cvDataArb.filter(d => d.workExperience.length > 0),
          templateNameArb,
          (data, template) => {
            const html = render(data, template);
            data.workExperience.forEach(exp => {
              expect(html).toContain(exp.company);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('rendered HTML contains education institutions', () => {
      fc.assert(
        fc.property(
          cvDataArb.filter(d => d.education.length > 0),
          templateNameArb,
          (data, template) => {
            const html = render(data, template);
            data.education.forEach(edu => {
              expect(html).toContain(edu.institution);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('rendered HTML contains skill names', () => {
      fc.assert(
        fc.property(
          cvDataArb.filter(d => d.skills.length > 0),
          templateNameArb,
          (data, template) => {
            const html = render(data, template);
            data.skills.forEach(skill => {
              expect(html).toContain(skill.name);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: ats-cv-generator, Property 5: Section Removal Exclusion**
  describe('Property 5: Section Removal Exclusion', () => {
    test('empty work experience section is not rendered', () => {
      fc.assert(
        fc.property(
          cvDataArb.map(d => ({ ...d, workExperience: [] })),
          templateNameArb,
          (data, template) => {
            const html = render(data, template);
            expect(html).not.toContain('Work Experience');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('empty education section is not rendered', () => {
      fc.assert(
        fc.property(
          cvDataArb.map(d => ({ ...d, education: [] })),
          templateNameArb,
          (data, template) => {
            const html = render(data, template);
            expect(html).not.toContain('Education');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('empty skills section is not rendered', () => {
      fc.assert(
        fc.property(
          cvDataArb.map(d => ({ ...d, skills: [] })),
          templateNameArb,
          (data, template) => {
            const html = render(data, template);
            expect(html).not.toContain('Skills');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: ats-cv-generator, Property 6: ATS Compliance**
  describe('Property 6: ATS Compliance', () => {
    test('rendered HTML does not contain table elements', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).not.toMatch(/<table/i);
          expect(html).not.toMatch(/<tr/i);
          expect(html).not.toMatch(/<td/i);
        }),
        { numRuns: 100 }
      );
    });

    test('rendered HTML does not contain image elements', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).not.toMatch(/<img/i);
        }),
        { numRuns: 100 }
      );
    });

    test('rendered HTML uses standard fonts', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).toMatch(/font-family:\s*Arial/i);
        }),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: ats-cv-generator, Property 7: Valid HTML Output**
  describe('Property 7: Valid HTML Output', () => {
    test('rendered HTML has DOCTYPE declaration', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).toMatch(/^<!DOCTYPE html>/i);
        }),
        { numRuns: 100 }
      );
    });

    test('rendered HTML has html, head, and body tags', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).toMatch(/<html/i);
          expect(html).toMatch(/<head/i);
          expect(html).toMatch(/<body/i);
          expect(html).toMatch(/<\/html>/i);
          expect(html).toMatch(/<\/head>/i);
          expect(html).toMatch(/<\/body>/i);
        }),
        { numRuns: 100 }
      );
    });

    test('rendered HTML has title tag', () => {
      fc.assert(
        fc.property(cvDataArb, templateNameArb, (data, template) => {
          const html = render(data, template);
          expect(html).toMatch(/<title>/i);
          expect(html).toMatch(/<\/title>/i);
        }),
        { numRuns: 100 }
      );
    });

    test('renderAll produces output for all templates', () => {
      fc.assert(
        fc.property(cvDataArb, (data) => {
          const results = renderAll(data);
          const templates = getAvailableTemplates();
          
          expect(results.size).toBe(templates.length);
          templates.forEach(t => {
            expect(results.has(t)).toBe(true);
            expect(results.get(t)).toBeTruthy();
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
