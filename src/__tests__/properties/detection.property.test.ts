import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { detectFromClientHints } from '../../detectors/clientHints';
import { detectBrowser, detectDevice, detectRenderingEngine } from '../../detectors/userAgentString';
import type { BrowserName } from '../../types';

/**
 * Property-Based Tests for Client Hints Detection
 * 
 * Feature: modernize-user-agent-detection
 * These tests verify the correctness properties of Client Hints detection.
 */

// Arbitraries (generators) for Client Hints types
const brandArb = fc.record({
  brand: fc.constantFrom(
    'Google Chrome',
    'Chromium',
    'Microsoft Edge',
    'Brave',
    'Opera',
    'Vivaldi',
    'Arc',
    'Samsung Internet',
    'Not_A Brand',
    'Not A;Brand'
  ),
  version: fc.integer({ min: 90, max: 130 }).map(String)
});

const brandsArb = fc.array(brandArb, { minLength: 1, maxLength: 5 });

const platformArb = fc.constantFrom(
  'Windows',
  'macOS',
  'Linux',
  'Android',
  'Chrome OS',
  'iOS'
);

const navigatorUADataArb = fc.record({
  brands: brandsArb,
  mobile: fc.boolean(),
  platform: platformArb,
  getHighEntropyValues: fc.constant(async (hints: string[]) => {
    return {
      brands: [],
      mobile: false,
      platform: 'Windows',
      architecture: 'x86',
      model: '',
      platformVersion: '10.0.0',
      uaFullVersion: '120.0.0.0'
    };
  })
});

describe('Property 1: Client Hints API Priority', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 1: Client Hints API Priority
   * Validates: Requirements 1.1
   * 
   * For any environment where navigator.userAgentData exists, the detection system
   * should use the Client Hints API as the primary detection method rather than
   * User-Agent string parsing.
   */
  it('should use client-hints detection method when navigator.userAgentData is provided', async () => {
    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, async (userAgentData) => {
        // When we call detectFromClientHints with valid userAgentData
        const result = detectFromClientHints(userAgentData);
        
        // The result should indicate client-hints as the detection method
        // Handle both sync and async results
        const agent = result instanceof Promise ? await result : result;
        expect(agent.detectionMethod).toBe('client-hints');
      }),
      { numRuns: 100 }
    );
  });

  it('should always return an agent object with detectionMethod set to client-hints', async () => {
    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, async (userAgentData) => {
        const result = detectFromClientHints(userAgentData);
        
        // Verify the result is either an Agent or a Promise<Agent>
        const agent = result instanceof Promise ? await result : result;
        expect(agent).toBeDefined();
        expect(agent.detectionMethod).toBe('client-hints');
      }),
      { numRuns: 100 }
    );
  });

  it('should extract data from Client Hints API, not from UA string parsing', async () => {
    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, async (userAgentData) => {
        const result = detectFromClientHints(userAgentData);
        const agent = result instanceof Promise ? await result : result;
        
        // The function should use the brands array from userAgentData
        // not attempt to parse a UA string
        const hasRecognizableBrand = userAgentData.brands.some(b =>
          ['Google Chrome', 'Microsoft Edge', 'Brave', 'Opera', 'Vivaldi', 'Arc', 'Samsung Internet']
            .some(name => b.brand.includes(name))
        );
        
        if (hasRecognizableBrand) {
          expect(agent.browser).toBeDefined();
        }
        
        // Device info should come from Client Hints mobile/platform
        expect(agent.device).toBeDefined();
        expect(agent.device?.isMobile).toBe(userAgentData.mobile);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 2: Fallback to User-Agent String', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 2: Fallback to User-Agent String
   * Validates: Requirements 1.2, 3.4
   * 
   * For any environment where navigator.userAgentData is unavailable, the detection
   * system should fall back to User-Agent string parsing and return valid agent data.
   */
  
  // Generator for realistic User-Agent strings
  const userAgentStringArb = fc.constantFrom(
    // Chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    // Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
    // Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    // Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    // Samsung Internet
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
    // Android Mobile
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    // Android Tablet
    'Mozilla/5.0 (Linux; Android 13; SM-X900) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // iPad
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    // iPhone
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  );

  it('should return valid agent data when using UA string fallback', () => {
    fc.assert(
      fc.property(userAgentStringArb, (uaString) => {
        // Create a mock Navigator without userAgentData
        const mockNavigator = {
          userAgent: uaString,
        } as Navigator;

        // Use the fallback detection functions
        const browser = detectBrowser(mockNavigator);
        const device = detectDevice(mockNavigator);
        const renderingEngine = detectRenderingEngine(browser?.name, mockNavigator);

        // Should return valid data structures
        // At least one of browser or device should be detected
        const hasValidData = browser !== undefined || device !== undefined;
        expect(hasValidData).toBe(true);

        // If browser is detected, it should have proper structure
        if (browser) {
          expect(browser).toHaveProperty('name');
          expect(browser).toHaveProperty('version');
          expect(typeof browser.name).toBe('string');
          expect(typeof browser.version).toBe('string');
        }

        // If device is detected, it should have proper structure
        if (device) {
          expect(device).toHaveProperty('isMobile');
          expect(device).toHaveProperty('platform');
          expect(device).toHaveProperty('device');
          expect(typeof device.isMobile).toBe('boolean');
        }

        // If rendering engine is detected, it should have proper structure
        if (renderingEngine) {
          expect(renderingEngine).toHaveProperty('name');
          expect(renderingEngine).toHaveProperty('version');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should not throw errors when Client Hints is unavailable', () => {
    fc.assert(
      fc.property(userAgentStringArb, (uaString) => {
        const mockNavigator = {
          userAgent: uaString,
        } as Navigator;

        // These functions should not throw
        expect(() => detectBrowser(mockNavigator)).not.toThrow();
        expect(() => detectDevice(mockNavigator)).not.toThrow();
        
        const browser = detectBrowser(mockNavigator);
        expect(() => detectRenderingEngine(browser?.name, mockNavigator)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  it('should extract browser information from UA string when Client Hints unavailable', () => {
    fc.assert(
      fc.property(userAgentStringArb, (uaString) => {
        const mockNavigator = {
          userAgent: uaString,
        } as Navigator;

        const browser = detectBrowser(mockNavigator);

        // For our known UA strings, browser should be detected
        if (uaString.includes('Chrome') || uaString.includes('Firefox') || 
            uaString.includes('Safari') || uaString.includes('Edg')) {
          expect(browser).toBeDefined();
          
          if (browser) {
            // Browser name should be one of the known types
            const validBrowserNames: BrowserName[] = [
              'Chrome', 'Chromium', 'Edge', 'Firefox', 'Safari', 'Opera',
              'Brave', 'Samsung Internet', 'Vivaldi', 'Arc', 'Seamonkey',
              'Opera15+', 'Opera12-', 'Unknown'
            ];
            expect(validBrowserNames).toContain(browser.name);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should extract device information from UA string when Client Hints unavailable', () => {
    fc.assert(
      fc.property(userAgentStringArb, (uaString) => {
        const mockNavigator = {
          userAgent: uaString,
        } as Navigator;

        const device = detectDevice(mockNavigator);

        // Device should always be detected for our known UA strings
        expect(device).toBeDefined();
        
        if (device) {
          // Mobile flag should be correct based on UA string
          if (uaString.includes('Mobile') && !uaString.includes('iPad')) {
            expect(device.isMobile).toBe(true);
          }
          
          // Platform should be detected
          expect(device.platform).toBeDefined();
          expect(device.platform).not.toBe('Unknown');
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 4: Detection Method Consistency', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 4: Detection Method Consistency
   * Validates: Requirements 1.4
   * 
   * For any browser/device combination, the agent data structure returned from
   * Client Hints detection should be compatible with the structure returned from
   * UA string detection (same property names and types).
   */
  
  // Generator for matching UA strings and Client Hints data
  const chromeUAString = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const chromeClientHints = {
    brands: [
      { brand: 'Google Chrome', version: '120' },
      { brand: 'Chromium', version: '120' }
    ],
    mobile: false,
    platform: 'Windows',
    getHighEntropyValues: async () => ({
      brands: [{ brand: 'Google Chrome', version: '120' }],
      mobile: false,
      platform: 'Windows',
      architecture: 'x86',
      model: '',
      platformVersion: '10.0.0',
      uaFullVersion: '120.0.0.0'
    })
  };

  it('should return agent structures with same property names from both detection methods', async () => {
    // Detect using Client Hints
    const clientHintsResult = detectFromClientHints(chromeClientHints);
    const clientHintsAgent = clientHintsResult instanceof Promise ? await clientHintsResult : clientHintsResult;

    // Detect using UA string
    const mockNavigator = { userAgent: chromeUAString } as Navigator;
    const browser = detectBrowser(mockNavigator);
    const device = detectDevice(mockNavigator);
    const renderingEngine = detectRenderingEngine(browser?.name, mockNavigator);
    const uaAgent = { browser, device, renderingEngine };

    // Both should have the same top-level properties
    expect(clientHintsAgent).toHaveProperty('browser');
    expect(clientHintsAgent).toHaveProperty('device');
    expect(uaAgent).toHaveProperty('browser');
    expect(uaAgent).toHaveProperty('device');

    // Browser structure should be consistent
    if (clientHintsAgent.browser && uaAgent.browser) {
      expect(clientHintsAgent.browser).toHaveProperty('name');
      expect(clientHintsAgent.browser).toHaveProperty('version');
      expect(uaAgent.browser).toHaveProperty('name');
      expect(uaAgent.browser).toHaveProperty('version');
      
      expect(typeof clientHintsAgent.browser.name).toBe(typeof uaAgent.browser.name);
      expect(typeof clientHintsAgent.browser.version).toBe(typeof uaAgent.browser.version);
    }

    // Device structure should be consistent
    if (clientHintsAgent.device && uaAgent.device) {
      expect(clientHintsAgent.device).toHaveProperty('isMobile');
      expect(clientHintsAgent.device).toHaveProperty('platform');
      expect(clientHintsAgent.device).toHaveProperty('device');
      expect(uaAgent.device).toHaveProperty('isMobile');
      expect(uaAgent.device).toHaveProperty('platform');
      expect(uaAgent.device).toHaveProperty('device');
      
      expect(typeof clientHintsAgent.device.isMobile).toBe(typeof uaAgent.device.isMobile);
      expect(typeof clientHintsAgent.device.platform).toBe(typeof uaAgent.device.platform);
      expect(typeof clientHintsAgent.device.device).toBe(typeof uaAgent.device.device);
    }
  });

  it('should have compatible types for all agent properties across detection methods', async () => {
    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, userAgentStringArb, async (clientHintsData, uaString) => {
        // Detect using Client Hints
        const clientHintsResult = detectFromClientHints(clientHintsData);
        const clientHintsAgent = clientHintsResult instanceof Promise ? await clientHintsResult : clientHintsResult;

        // Detect using UA string
        const mockNavigator = { userAgent: uaString } as Navigator;
        const browser = detectBrowser(mockNavigator);
        const device = detectDevice(mockNavigator);
        const renderingEngine = detectRenderingEngine(browser?.name, mockNavigator);

        // Type compatibility checks
        if (clientHintsAgent.browser && browser) {
          expect(typeof clientHintsAgent.browser.name).toBe('string');
          expect(typeof browser.name).toBe('string');
          expect(typeof clientHintsAgent.browser.version).toBe('string');
          expect(typeof browser.version).toBe('string');
        }

        if (clientHintsAgent.device && device) {
          expect(typeof clientHintsAgent.device.isMobile).toBe('boolean');
          expect(typeof device.isMobile).toBe('boolean');
          expect(typeof clientHintsAgent.device.platform).toBe('string');
          expect(typeof device.platform).toBe('string');
          expect(typeof clientHintsAgent.device.device).toBe('string');
          expect(typeof device.device).toBe('string');
        }

        if (clientHintsAgent.renderingEngine && renderingEngine) {
          expect(typeof clientHintsAgent.renderingEngine.name).toBe('string');
          expect(typeof renderingEngine.name).toBe('string');
          expect(typeof clientHintsAgent.renderingEngine.version).toBe('string');
          expect(typeof renderingEngine.version).toBe('string');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should allow destructuring the same properties regardless of detection method', async () => {
    // This test ensures backward compatibility - code that destructures
    // agent properties should work with both detection methods
    
    const clientHintsResult = detectFromClientHints(chromeClientHints);
    const clientHintsAgent = clientHintsResult instanceof Promise ? await clientHintsResult : clientHintsResult;

    const mockNavigator = { userAgent: chromeUAString } as Navigator;
    const browser = detectBrowser(mockNavigator);
    const device = detectDevice(mockNavigator);
    const renderingEngine = detectRenderingEngine(browser?.name, mockNavigator);
    const uaAgent = { browser, device, renderingEngine };

    // These destructuring patterns should work for both
    const { browser: chBrowser, device: chDevice } = clientHintsAgent;
    const { browser: uaBrowser, device: uaDevice } = uaAgent;

    // Both should allow the same destructuring
    expect(chBrowser).toBeDefined();
    expect(chDevice).toBeDefined();
    expect(uaBrowser).toBeDefined();
    expect(uaDevice).toBeDefined();

    // Nested destructuring should also work
    if (chBrowser && uaBrowser) {
      const { name: chName, version: chVersion } = chBrowser;
      const { name: uaName, version: uaVersion } = uaBrowser;
      
      expect(chName).toBeDefined();
      expect(chVersion).toBeDefined();
      expect(uaName).toBeDefined();
      expect(uaVersion).toBeDefined();
    }
  });
});

// Re-declare userAgentStringArb for use in Property 4
const userAgentStringArb = fc.constantFrom(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-X900) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
);

describe('Property 3: Structured Browser Data', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 3: Structured Browser Data
   * Validates: Requirements 1.3
   * 
   * For any valid navigator input (Client Hints or UA string), when browser
   * information is detected, the return value should contain a structured object
   * with name and version properties.
   */
  it('should return structured browser data with name and version when browser is detected', async () => {
    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, async (userAgentData) => {
        const result = detectFromClientHints(userAgentData);
        const agent = result instanceof Promise ? await result : result;
        
        // If browser is detected, it must have name and version
        if (agent.browser) {
          expect(agent.browser).toHaveProperty('name');
          expect(agent.browser).toHaveProperty('version');
          expect(typeof agent.browser.name).toBe('string');
          expect(typeof agent.browser.version).toBe('string');
          expect(agent.browser.version.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should return browser info with valid BrowserName type', async () => {
    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, async (userAgentData) => {
        const result = detectFromClientHints(userAgentData);
        const agent = result instanceof Promise ? await result : result;
        
        const validBrowserNames: BrowserName[] = [
          'Chrome', 'Chromium', 'Edge', 'Firefox', 'Safari', 'Opera',
          'Brave', 'Samsung Internet', 'Vivaldi', 'Arc', 'Seamonkey',
          'Opera15+', 'Opera12-', 'Unknown'
        ];
        
        if (agent.browser) {
          expect(validBrowserNames).toContain(agent.browser.name);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should always return an agent with device info structure', async () => {
    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, async (userAgentData) => {
        const result = detectFromClientHints(userAgentData);
        const agent = result instanceof Promise ? await result : result;
        
        // Device should always be present with required properties
        expect(agent.device).toBeDefined();
        expect(agent.device).toHaveProperty('isMobile');
        expect(agent.device).toHaveProperty('platform');
        expect(agent.device).toHaveProperty('device');
        expect(typeof agent.device?.isMobile).toBe('boolean');
      }),
      { numRuns: 100 }
    );
  });
});
