import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { convertToKurus, convertFromKurus } from '../stripe';

/**
 * Feature: stripe-integration, Property 1: Price Consistency
 * For any checkout session creation request, the amount passed to Stripe 
 * SHALL equal the price configured in site settings multiplied by 100 (for kuruş conversion).
 * Validates: Requirements 1.2, 3.2
 */
describe('Stripe Price Conversion Properties', () => {
  it('Property 1: convertToKurus should multiply price by 100', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100000, noNaN: true }),
        (priceTRY) => {
          const priceKurus = convertToKurus(priceTRY);
          // Should be approximately price * 100 (accounting for floating point)
          expect(priceKurus).toBe(Math.round(priceTRY * 100));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Round trip conversion should preserve value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }), // kuruş values
        (priceKurus) => {
          const priceTRY = convertFromKurus(priceKurus);
          const backToKurus = convertToKurus(priceTRY);
          // Round trip should preserve the value
          expect(backToKurus).toBe(priceKurus);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Specific price values should convert correctly', () => {
    // Test common price points
    expect(convertToKurus(50)).toBe(5000);
    expect(convertToKurus(99.99)).toBe(9999);
    expect(convertToKurus(249.99)).toBe(24999);
    expect(convertToKurus(0)).toBe(0);
  });

  it('Property 1: convertFromKurus should divide by 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }),
        (priceKurus) => {
          const priceTRY = convertFromKurus(priceKurus);
          expect(priceTRY).toBe(priceKurus / 100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
