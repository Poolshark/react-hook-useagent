import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { detectFromClientHints } from '../../detectors/clientHints';
import type { NavigatorUAData, UADataValues } from '../../types';

/**
 * Property-Based Tests for High Entropy Client Hints
 * 
 * Feature: modernize-user-agent-detection
 * These tests verify the correctness properties of high entropy value retrieval.
 */

// Arbitraries for high entropy testing
const hintsArb = fc.array(
  fc.constantFrom('architecture', 'model', 'platform', 'platformVersion', 'uaFullVersion'),
  { minLength: 1, maxLength: 5 }
);

const architectureArb = fc.constantFrom('x86', 'arm', 'arm64', 'x86_64');
const modelArb = fc.string({ minLength: 1, maxLength: 30 });
const platformVersionArb = fc.tuple(
  fc.integer({ min: 1, max: 20 }),
  fc.integer({ min: 0, max: 99 }),
  fc.integer({ min: 0, max: 99 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);
const fullVersionArb = fc.tuple(
  fc.integer({ min: 90, max: 130 }),
  fc.integer({ min: 0, max: 99 }),
  fc.integer({ min: 0, max: 9999 }),
  fc.integer({ min: 0, max: 999 })
).map(([major, minor, build, patch]) => `${major}.${minor}.${build}.${patch}`);

const brandArb = fc.record({
  brand: fc.constantFrom('Google Chrome', 'Chromium', 'Microsoft Edge'),
  version: fc.integer({ min: 90, max: 130 }).map(String)
});

const uaDataValuesArb = fc.record({
  brands: fc.array(brandArb, { minLength: 1, maxLength: 3 }),
  mobile: fc.boolean(),
  platform: fc.constantFrom('Windows', 'macOS', 'Linux', 'Android'),
  architecture: fc.option(architectureArb, { nil: undefined }),
  model: fc.option(modelArb, { nil: undefined }),
  platformVersion: fc.option(platformVersionArb, { nil: undefined }),
  uaFullVersion: fc.option(fullVersionArb, { nil: undefined }),
  fullVersionList: fc.option(
    fc.array(brandArb, { minLength: 1, maxLength: 3 }),
    { nil: undefined }
  )
});

describe('Property 6: High Entropy API Call', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 6: High Entropy API Call
   * Validates: Requirements 3.1
   * 
   * For any request for high entropy values with valid hints, the system should
   * call getHighEntropyValues() with those specific hints.
   */
  it('should call getHighEntropyValues with the specified hints', async () => {
    await fc.assert(
      fc.asyncProperty(hintsArb, uaDataValuesArb, async (hints, highEntropyData) => {
        // Create a mock that tracks what hints were requested
        const getHighEntropyValuesMock = vi.fn().mockResolvedValue(highEntropyData);
        
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: getHighEntropyValuesMock
        };
        
        // Request high entropy with specific hints
        const result = await detectFromClientHints(userAgentData, {
          highEntropy: true,
          hints: hints as any
        });
        
        // Verify getHighEntropyValues was called with the specified hints
        expect(getHighEntropyValuesMock).toHaveBeenCalledWith(hints);
        expect(getHighEntropyValuesMock).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  it('should call getHighEntropyValues with default hints when hints not specified', async () => {
    await fc.assert(
      fc.asyncProperty(uaDataValuesArb, async (highEntropyData) => {
        const getHighEntropyValuesMock = vi.fn().mockResolvedValue(highEntropyData);
        
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: getHighEntropyValuesMock
        };
        
        // Request high entropy without specifying hints
        await detectFromClientHints(userAgentData, { highEntropy: true });
        
        // Verify getHighEntropyValues was called with default hints
        expect(getHighEntropyValuesMock).toHaveBeenCalledTimes(1);
        const calledHints = getHighEntropyValuesMock.mock.calls[0][0];
        expect(Array.isArray(calledHints)).toBe(true);
        expect(calledHints.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should not call getHighEntropyValues when highEntropy is false', async () => {
    await fc.assert(
      fc.asyncProperty(uaDataValuesArb, async (highEntropyData) => {
        const getHighEntropyValuesMock = vi.fn().mockResolvedValue(highEntropyData);
        
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: getHighEntropyValuesMock
        };
        
        // Don't request high entropy
        const result = detectFromClientHints(userAgentData, { highEntropy: false });
        
        // Result should be synchronous (not a Promise)
        expect(result instanceof Promise).toBe(false);
        
        // getHighEntropyValues should not have been called
        expect(getHighEntropyValuesMock).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 7: High Entropy Data Inclusion', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 7: High Entropy Data Inclusion
   * Validates: Requirements 3.2
   * 
   * For any successful high entropy API response, the returned agent data should
   * include the detailed platform, architecture, and model information from the response.
   */
  it('should include architecture in device info when provided', async () => {
    await fc.assert(
      fc.asyncProperty(architectureArb, async (architecture) => {
        const highEntropyData: UADataValues = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          architecture
        };
        
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: vi.fn().mockResolvedValue(highEntropyData)
        };
        
        const result = await detectFromClientHints(userAgentData, { highEntropy: true });
        
        expect(result.device?.architecture).toBe(architecture);
      }),
      { numRuns: 100 }
    );
  });

  it('should include model in device info when provided', async () => {
    await fc.assert(
      fc.asyncProperty(modelArb, async (model) => {
        const highEntropyData: UADataValues = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          model
        };
        
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: vi.fn().mockResolvedValue(highEntropyData)
        };
        
        const result = await detectFromClientHints(userAgentData, { highEntropy: true });
        
        expect(result.device?.model).toBe(model);
      }),
      { numRuns: 100 }
    );
  });

  it('should include platformVersion in device info when provided', async () => {
    await fc.assert(
      fc.asyncProperty(platformVersionArb, async (platformVersion) => {
        const highEntropyData: UADataValues = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          platformVersion
        };
        
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: vi.fn().mockResolvedValue(highEntropyData)
        };
        
        const result = await detectFromClientHints(userAgentData, { highEntropy: true });
        
        expect(result.device?.platformVersion).toBe(platformVersion);
      }),
      { numRuns: 100 }
    );
  });

  it('should include fullVersion in browser info when provided', async () => {
    await fc.assert(
      fc.asyncProperty(fullVersionArb, async (fullVersion) => {
        const highEntropyData: UADataValues = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          uaFullVersion: fullVersion
        };
        
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: vi.fn().mockResolvedValue(highEntropyData)
        };
        
        const result = await detectFromClientHints(userAgentData, { highEntropy: true });
        
        expect(result.browser?.fullVersion).toBe(fullVersion);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 8: High Entropy Fallback', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 8: High Entropy Fallback
   * Validates: Requirements 3.3
   * 
   * For any failed high entropy API call, the system should return agent data
   * using available low-entropy information without throwing errors.
   */
  it('should fall back to low-entropy data when getHighEntropyValues rejects', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (errorMessage) => {
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: vi.fn().mockRejectedValue(new Error(errorMessage))
        };
        
        // Should not throw, should return low-entropy data
        const result = await detectFromClientHints(userAgentData, { highEntropy: true });
        
        expect(result).toBeDefined();
        expect(result.detectionMethod).toBe('client-hints');
        expect(result.device).toBeDefined();
        expect(result.device?.isMobile).toBe(false);
        expect(result.browser).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should fall back to low-entropy data when getHighEntropyValues times out', async () => {
    const userAgentData: NavigatorUAData = {
      brands: [{ brand: 'Google Chrome', version: '120' }],
      mobile: true,
      platform: 'Android',
      getHighEntropyValues: vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000)) // Never resolves in time
      )
    };
    
    // Should timeout and return low-entropy data
    const result = await detectFromClientHints(userAgentData, { highEntropy: true });
    
    expect(result).toBeDefined();
    expect(result.detectionMethod).toBe('client-hints');
    expect(result.device).toBeDefined();
    expect(result.device?.isMobile).toBe(true);
  }, 10000);
});

describe('Property 9: Async Handling', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 9: Async Handling
   * Validates: Requirements 3.5
   * 
   * For any high entropy request, the system should properly handle the Promise
   * returned by getHighEntropyValues() and resolve to valid agent data.
   */
  it('should return a Promise when highEntropy is requested', () => {
    fc.assert(
      fc.property(uaDataValuesArb, (highEntropyData) => {
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: vi.fn().mockResolvedValue(highEntropyData)
        };
        
        const result = detectFromClientHints(userAgentData, { highEntropy: true });
        
        // Should return a Promise
        expect(result instanceof Promise).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should resolve to valid agent data after async operation', async () => {
    await fc.assert(
      fc.asyncProperty(uaDataValuesArb, async (highEntropyData) => {
        const userAgentData: NavigatorUAData = {
          brands: [{ brand: 'Google Chrome', version: '120' }],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: vi.fn().mockResolvedValue(highEntropyData)
        };
        
        const result = await detectFromClientHints(userAgentData, { highEntropy: true });
        
        // Should resolve to valid agent data
        expect(result).toBeDefined();
        expect(result.detectionMethod).toBe('client-hints');
        expect(result.device).toBeDefined();
        expect(result.browser).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});
