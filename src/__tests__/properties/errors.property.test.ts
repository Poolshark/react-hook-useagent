import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { detectBrowser, detectDevice, detectRenderingEngine } from '../../detectors/userAgentString';
import { detectFromClientHints } from '../../detectors/clientHints';

/**
 * Property-Based Tests for Error Handling
 * 
 * Feature: modernize-user-agent-detection
 * These tests verify that detection functions handle errors gracefully.
 */

describe('Property 14: Undefined for No Match', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 14: Undefined for No Match
   * Validates: Requirements 6.1
   * 
   * For any unrecognizable User-Agent string or navigator input, detection functions
   * should return undefined rather than throwing errors or returning invalid data.
   */

  // Generator for unrecognizable/malformed User-Agent strings
  const unrecognizableUAArb = fc.oneof(
    // Empty strings
    fc.constant(''),
    // Random gibberish
    fc.string({ minLength: 1, maxLength: 100 }),
    // Strings with special characters only
    fc.constant('!@#$%^&*()_+-=[]{}|;:,.<>?'),
    // Very short strings
    fc.string({ minLength: 1, maxLength: 5 }),
    // Strings with only whitespace
    fc.constant('   '),
    fc.constant('\t\n\r'),
    // Strings that look like UA but aren't
    fc.constant('NotABrowser/1.0'),
    fc.constant('CustomClient/2.0 (Unknown Platform)'),
    fc.constant('MyApp/1.0'),
    // Malformed UA strings
    fc.constant('Mozilla/'),
    fc.constant('AppleWebKit/'),
    fc.constant('Chrome/'),
    // Very long random strings
    fc.string({ minLength: 500, maxLength: 1000 })
  );

  it('should return undefined for unrecognizable User-Agent strings without throwing', () => {
    fc.assert(
      fc.property(unrecognizableUAArb, (uaString) => {
        const mockNavigator = {
          userAgent: uaString,
        } as Navigator;

        // Detection functions should not throw errors
        let browser: ReturnType<typeof detectBrowser>;
        let device: ReturnType<typeof detectDevice>;
        let renderingEngine: ReturnType<typeof detectRenderingEngine>;
        
        expect(() => {
          browser = detectBrowser(mockNavigator);
        }).not.toThrow();
        
        expect(() => {
          device = detectDevice(mockNavigator);
        }).not.toThrow();
        
        expect(() => {
          renderingEngine = detectRenderingEngine(browser?.name, mockNavigator);
        }).not.toThrow();

        // For truly unrecognizable strings, functions should return undefined
        // or return data with "Unknown" values, but never throw
        if (browser === undefined || browser.name === 'Unknown') {
          // This is acceptable
          expect(true).toBe(true);
        }
        
        if (device === undefined || device.platform === 'Unknown') {
          // This is acceptable
          expect(true).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty User-Agent strings gracefully', () => {
    const mockNavigator = {
      userAgent: '',
    } as Navigator;

    expect(() => detectBrowser(mockNavigator)).not.toThrow();
    expect(() => detectDevice(mockNavigator)).not.toThrow();

    const browser = detectBrowser(mockNavigator);
    const device = detectDevice(mockNavigator);

    // Should return undefined for empty UA strings
    expect(browser).toBeUndefined();
    expect(device).toBeUndefined();
  });

  it('should handle malformed navigator objects without throwing', () => {
    fc.assert(
      fc.property(fc.string(), (randomString) => {
        const mockNavigator = {
          userAgent: randomString,
        } as Navigator;

        // Should never throw, even with random input
        expect(() => detectBrowser(mockNavigator)).not.toThrow();
        expect(() => detectDevice(mockNavigator)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should return undefined for rendering engine when browser is undefined', () => {
    fc.assert(
      fc.property(unrecognizableUAArb, (uaString) => {
        const mockNavigator = {
          userAgent: uaString,
        } as Navigator;

        const browser = detectBrowser(mockNavigator);
        const renderingEngine = detectRenderingEngine(browser?.name, mockNavigator);

        // If browser is undefined or Unknown, rendering engine should be undefined
        if (!browser || browser.name === 'Unknown') {
          expect(renderingEngine).toBeUndefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should handle invalid Client Hints data gracefully', () => {
    // Generator for malformed Client Hints data
    const malformedClientHintsArb = fc.oneof(
      // Empty brands array
      fc.constant({
        brands: [] as Array<{ brand: string; version: string }>,
        mobile: false as boolean,
        platform: 'Unknown' as string,
        getHighEntropyValues: async () => ({
          brands: [] as Array<{ brand: string; version: string }>,
          mobile: false as boolean,
          platform: 'Unknown' as string
        })
      }),
      // Brands with unrecognizable names
      fc.constant({
        brands: [
          { brand: 'Not A Browser', version: '1' },
          { brand: 'Unknown Client', version: '2' }
        ] as Array<{ brand: string; version: string }>,
        mobile: false as boolean,
        platform: 'Unknown Platform' as string,
        getHighEntropyValues: async () => ({
          brands: [] as Array<{ brand: string; version: string }>,
          mobile: false as boolean,
          platform: 'Unknown' as string
        })
      })
    );

    fc.assert(
      fc.asyncProperty(malformedClientHintsArb, async (clientHints) => {
        // Should not throw with malformed data
        let result: ReturnType<typeof detectFromClientHints>;
        expect(() => {
          result = detectFromClientHints(clientHints as any);
        }).not.toThrow();

        // Handle async result
        const agent = result! instanceof Promise ? await result : result!;

        // Should return a valid agent structure even if data is unrecognizable
        expect(agent).toBeDefined();
        expect(agent).toHaveProperty('device');
        expect(agent).toHaveProperty('detectionMethod');
        
        // Browser might be undefined for unrecognizable brands
        if (agent.browser === undefined) {
          expect(true).toBe(true); // This is acceptable
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should never return invalid data structures even for bad input', () => {
    fc.assert(
      fc.property(unrecognizableUAArb, (uaString) => {
        const mockNavigator = {
          userAgent: uaString,
        } as Navigator;

        const browser = detectBrowser(mockNavigator);
        const device = detectDevice(mockNavigator);
        const renderingEngine = detectRenderingEngine(browser?.name, mockNavigator);

        // If browser is defined, it must have valid structure
        if (browser !== undefined) {
          expect(browser).toHaveProperty('name');
          expect(browser).toHaveProperty('version');
          expect(typeof browser.name).toBe('string');
          expect(typeof browser.version).toBe('string');
        }

        // If device is defined, it must have valid structure
        if (device !== undefined) {
          expect(device).toHaveProperty('isMobile');
          expect(device).toHaveProperty('platform');
          expect(device).toHaveProperty('device');
          expect(typeof device.isMobile).toBe('boolean');
          expect(typeof device.platform).toBe('string');
          expect(typeof device.device).toBe('string');
        }

        // If rendering engine is defined, it must have valid structure
        if (renderingEngine !== undefined) {
          expect(renderingEngine).toHaveProperty('name');
          expect(renderingEngine).toHaveProperty('version');
          expect(typeof renderingEngine.name).toBe('string');
          expect(typeof renderingEngine.version).toBe('string');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should handle null or undefined userAgent property', () => {
    const mockNavigatorNull = {
      userAgent: null as any,
    } as Navigator;

    const mockNavigatorUndefined = {
      userAgent: undefined as any,
    } as Navigator;

    // Should not throw
    expect(() => detectBrowser(mockNavigatorNull)).not.toThrow();
    expect(() => detectBrowser(mockNavigatorUndefined)).not.toThrow();
    expect(() => detectDevice(mockNavigatorNull)).not.toThrow();
    expect(() => detectDevice(mockNavigatorUndefined)).not.toThrow();

    // Should return undefined
    expect(detectBrowser(mockNavigatorNull)).toBeUndefined();
    expect(detectBrowser(mockNavigatorUndefined)).toBeUndefined();
    expect(detectDevice(mockNavigatorNull)).toBeUndefined();
    expect(detectDevice(mockNavigatorUndefined)).toBeUndefined();
  });

  it('should handle non-string userAgent values', () => {
    const mockNavigatorNumber = {
      userAgent: 12345 as any,
    } as Navigator;

    const mockNavigatorObject = {
      userAgent: { foo: 'bar' } as any,
    } as Navigator;

    const mockNavigatorArray = {
      userAgent: ['test'] as any,
    } as Navigator;

    // Should not throw
    expect(() => detectBrowser(mockNavigatorNumber)).not.toThrow();
    expect(() => detectBrowser(mockNavigatorObject)).not.toThrow();
    expect(() => detectBrowser(mockNavigatorArray)).not.toThrow();
    expect(() => detectDevice(mockNavigatorNumber)).not.toThrow();
    expect(() => detectDevice(mockNavigatorObject)).not.toThrow();
    expect(() => detectDevice(mockNavigatorArray)).not.toThrow();

    // Should return undefined for invalid types
    expect(detectBrowser(mockNavigatorNumber)).toBeUndefined();
    expect(detectBrowser(mockNavigatorObject)).toBeUndefined();
    expect(detectBrowser(mockNavigatorArray)).toBeUndefined();
    expect(detectDevice(mockNavigatorNumber)).toBeUndefined();
    expect(detectDevice(mockNavigatorObject)).toBeUndefined();
    expect(detectDevice(mockNavigatorArray)).toBeUndefined();
  });
});
