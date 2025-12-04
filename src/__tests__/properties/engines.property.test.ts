import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { detectBrowser, detectRenderingEngine } from '../../detectors/userAgentString';
import type { BrowserName } from '../../types';

/**
 * Property-Based Tests for Rendering Engine Detection
 * 
 * Feature: modernize-user-agent-detection
 * These tests verify the correctness properties of rendering engine detection.
 */

// Generator for Chromium-based browser UA strings
const chromiumBrowserUAArb = fc.constantFrom(
  // Chrome
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Edge Chromium
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  // Samsung Internet
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
  // Vivaldi
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.50',
  // Opera 15+
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  // Chromium
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/118.0.0.0 Safari/537.36'
);

// Generator for Gecko-based browser UA strings
const geckoBrowserUAArb = fc.constantFrom(
  // Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0',
  // Seamonkey
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:2.53) Gecko/20100101 Seamonkey/2.53.18'
);

// Generator for WebKit-based browser UA strings
const webkitBrowserUAArb = fc.constantFrom(
  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  // Safari on iOS
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
);

describe('Property 12: Rendering Engine Mapping', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 12: Rendering Engine Mapping
   * Validates: Requirements 5.1, 5.2, 5.3
   * 
   * For any detected browser, the system should map it to the correct rendering engine:
   * Chromium-based browsers to "Blink", Firefox/Seamonkey to "Gecko", and Safari to "WebKit".
   */
  it('should map all Chromium-based browsers to Blink engine', () => {
    fc.assert(
      fc.property(chromiumBrowserUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const browser = detectBrowser(mockNavigator);
        
        expect(browser).toBeDefined();
        
        const engine = detectRenderingEngine(browser?.name, mockNavigator);
        
        expect(engine).toBeDefined();
        expect(engine?.name).toBe('Blink');
      }),
      { numRuns: 100 }
    );
  });

  it('should map Firefox and Seamonkey to Gecko engine', () => {
    fc.assert(
      fc.property(geckoBrowserUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const browser = detectBrowser(mockNavigator);
        
        expect(browser).toBeDefined();
        expect(['Firefox', 'Seamonkey']).toContain(browser?.name);
        
        const engine = detectRenderingEngine(browser?.name, mockNavigator);
        
        expect(engine).toBeDefined();
        expect(engine?.name).toBe('Gecko');
      }),
      { numRuns: 100 }
    );
  });

  it('should map Safari to WebKit engine', () => {
    fc.assert(
      fc.property(webkitBrowserUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const browser = detectBrowser(mockNavigator);
        
        expect(browser).toBeDefined();
        expect(browser?.name).toBe('Safari');
        
        const engine = detectRenderingEngine(browser?.name, mockNavigator);
        
        expect(engine).toBeDefined();
        expect(engine?.name).toBe('WebKit');
      }),
      { numRuns: 100 }
    );
  });

  it('should consistently map the same browser to the same engine', () => {
    const chromiumBrowsers: BrowserName[] = ['Chrome', 'Chromium', 'Edge', 'Brave', 'Samsung Internet', 'Vivaldi', 'Opera15+'];
    const geckoBrowsers: BrowserName[] = ['Firefox', 'Seamonkey'];
    const webkitBrowsers: BrowserName[] = ['Safari'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...chromiumBrowsers, ...geckoBrowsers, ...webkitBrowsers),
        (browserName) => {
          const engine = detectRenderingEngine(browserName);
          
          if (chromiumBrowsers.includes(browserName)) {
            expect(engine?.name).toBe('Blink');
          } else if (geckoBrowsers.includes(browserName)) {
            expect(engine?.name).toBe('Gecko');
          } else if (webkitBrowsers.includes(browserName)) {
            expect(engine?.name).toBe('WebKit');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return undefined for unknown browsers', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Unknown' as BrowserName, undefined),
        (browserName) => {
          const engine = detectRenderingEngine(browserName);
          expect(engine).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 13: Engine Version Extraction', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 13: Engine Version Extraction
   * Validates: Requirements 5.5
   * 
   * For any User-Agent string containing rendering engine version information,
   * the system should extract and return the version number in the renderingEngine object.
   */
  it('should extract Blink version from Chrome version in UA string', () => {
    fc.assert(
      fc.property(chromiumBrowserUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const browser = detectBrowser(mockNavigator);
        const engine = detectRenderingEngine(browser?.name, mockNavigator);
        
        expect(engine).toBeDefined();
        expect(engine?.version).toBeDefined();
        expect(engine?.version).not.toBe('Unknown');
        
        // Version should be a valid version string
        expect(/^[0-9.]+$/.test(engine?.version || '')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should extract Gecko version from rv: pattern in UA string', () => {
    fc.assert(
      fc.property(geckoBrowserUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const browser = detectBrowser(mockNavigator);
        const engine = detectRenderingEngine(browser?.name, mockNavigator);
        
        expect(engine).toBeDefined();
        expect(engine?.version).toBeDefined();
        expect(engine?.version).not.toBe('Unknown');
        
        // Version should be a valid version string
        expect(/^[0-9.]+$/.test(engine?.version || '')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should extract WebKit version from AppleWebKit pattern in UA string', () => {
    fc.assert(
      fc.property(webkitBrowserUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const browser = detectBrowser(mockNavigator);
        const engine = detectRenderingEngine(browser?.name, mockNavigator);
        
        expect(engine).toBeDefined();
        expect(engine?.version).toBeDefined();
        expect(engine?.version).not.toBe('Unknown');
        
        // Version should be a valid version string
        expect(/^[0-9.]+$/.test(engine?.version || '')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should always return a version string (even if Unknown)', () => {
    const allBrowsers: BrowserName[] = [
      'Chrome', 'Chromium', 'Edge', 'Brave', 'Samsung Internet', 'Vivaldi', 'Opera15+',
      'Firefox', 'Seamonkey', 'Safari'
    ];
    
    fc.assert(
      fc.property(fc.constantFrom(...allBrowsers), (browserName) => {
        const engine = detectRenderingEngine(browserName);
        
        if (engine) {
          expect(engine.version).toBeDefined();
          expect(typeof engine.version).toBe('string');
        }
      }),
      { numRuns: 100 }
    );
  });
});
