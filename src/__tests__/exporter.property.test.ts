// **Feature: ats-cv-generator, Property 8: Filename Pattern Compliance**
// **Validates: Requirements 5.3**

import * as fc from 'fast-check';
import { generateFileName } from '../services/exporter';
import { TemplateName } from '../models/types';

const templateNameArb: fc.Arbitrary<TemplateName> = fc.constantFrom('classic', 'modern', 'minimal');
const formatArb = fc.constantFrom('html', 'pdf');
const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

describe('Exporter Property Tests', () => {
  // **Feature: ats-cv-generator, Property 8: Filename Pattern Compliance**
  describe('Property 8: Filename Pattern Compliance', () => {
    test('filename matches pattern {name}_{template}_{date}.{format}', () => {
      fc.assert(
        fc.property(nameArb, templateNameArb, formatArb, (name, template, format) => {
          const filename = generateFileName(name, template, format);
          
          // Pattern: sanitized_name_template_YYYY-MM-DD.format
          const pattern = /^[a-z0-9_]+_(classic|modern|minimal)_\d{4}-\d{2}-\d{2}\.(html|pdf)$/;
          expect(filename).toMatch(pattern);
        }),
        { numRuns: 100 }
      );
    });

    test('filename contains the template name', () => {
      fc.assert(
        fc.property(nameArb, templateNameArb, formatArb, (name, template, format) => {
          const filename = generateFileName(name, template, format);
          expect(filename).toContain(template);
        }),
        { numRuns: 100 }
      );
    });

    test('filename ends with correct format extension', () => {
      fc.assert(
        fc.property(nameArb, templateNameArb, formatArb, (name, template, format) => {
          const filename = generateFileName(name, template, format);
          expect(filename).toMatch(new RegExp(`\\.${format}$`));
        }),
        { numRuns: 100 }
      );
    });

    test('filename contains valid date format', () => {
      fc.assert(
        fc.property(nameArb, templateNameArb, formatArb, (name, template, format) => {
          const filename = generateFileName(name, template, format);
          const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
          
          expect(dateMatch).not.toBeNull();
          if (dateMatch) {
            const date = new Date(dateMatch[1]);
            expect(date.toString()).not.toBe('Invalid Date');
          }
        }),
        { numRuns: 100 }
      );
    });

    test('special characters in name are sanitized', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => /[^a-zA-Z0-9]/.test(s) && s.trim().length > 0),
          templateNameArb,
          formatArb,
          (nameWithSpecialChars, template, format) => {
            const filename = generateFileName(nameWithSpecialChars, template, format);
            
            // The name part should only contain lowercase alphanumeric and underscores
            // or be 'cv' if all characters were special
            const namePart = filename.split('_')[0];
            expect(namePart).toMatch(/^[a-z0-9]+$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filename is consistent for same inputs on same day', () => {
      fc.assert(
        fc.property(nameArb, templateNameArb, formatArb, (name, template, format) => {
          const filename1 = generateFileName(name, template, format);
          const filename2 = generateFileName(name, template, format);
          
          expect(filename1).toBe(filename2);
        }),
        { numRuns: 100 }
      );
    });
  });
});
