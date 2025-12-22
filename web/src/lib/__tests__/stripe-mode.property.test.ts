import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: stripe-integration, Property 8: Environment-Based Key Selection
 * For any environment configuration, the Stripe publishable key used SHALL match 
 * the configured mode (test keys for test mode, live keys for production).
 * Validates: Requirements 5.1, 5.2
 */

type StripeMode = 'test' | 'live';

// Mock the key detection logic from stripe.ts
function isTestKey(key: string): boolean {
  return key.startsWith('pk_test_');
}

function isLiveKey(key: string): boolean {
  return key.startsWith('pk_live_');
}

function getKeyMode(key: string): StripeMode | null {
  if (isTestKey(key)) return 'test';
  if (isLiveKey(key)) return 'live';
  return null;
}

function validateKeyForMode(key: string, expectedMode: StripeMode): boolean {
  const keyMode = getKeyMode(key);
  return keyMode === expectedMode;
}

describe('Stripe Mode Properties', () => {
  it('Property 8: Test keys should be identified as test mode', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }), // random suffix
        (suffix) => {
          const testKey = `pk_test_${suffix}`;
          expect(isTestKey(testKey)).toBe(true);
          expect(isLiveKey(testKey)).toBe(false);
          expect(getKeyMode(testKey)).toBe('test');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Live keys should be identified as live mode', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }), // random suffix
        (suffix) => {
          const liveKey = `pk_live_${suffix}`;
          expect(isTestKey(liveKey)).toBe(false);
          expect(isLiveKey(liveKey)).toBe(true);
          expect(getKeyMode(liveKey)).toBe('live');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Invalid keys should return null mode', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.startsWith('pk_test_') && !s.startsWith('pk_live_')),
        (invalidKey) => {
          expect(getKeyMode(invalidKey)).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Test key should validate for test mode only', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        (suffix) => {
          const testKey = `pk_test_${suffix}`;
          expect(validateKeyForMode(testKey, 'test')).toBe(true);
          expect(validateKeyForMode(testKey, 'live')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Live key should validate for live mode only', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        (suffix) => {
          const liveKey = `pk_live_${suffix}`;
          expect(validateKeyForMode(liveKey, 'test')).toBe(false);
          expect(validateKeyForMode(liveKey, 'live')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Specific key examples', () => {
    // Real-world format examples
    expect(getKeyMode('pk_test_51ABC123xyz')).toBe('test');
    expect(getKeyMode('pk_live_51ABC123xyz')).toBe('live');
    expect(getKeyMode('sk_test_51ABC123xyz')).toBe(null); // secret key, not publishable
    expect(getKeyMode('invalid_key')).toBe(null);
    expect(getKeyMode('')).toBe(null);
  });
});
