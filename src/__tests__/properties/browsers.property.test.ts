import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { detectBrowser } from '../../detectors/userAgentString';

/**
 * Property-Based Tests for Browser Detection
 * 
 * Feature: modernize-user-agent-detection
 * These tests verify the correctness properties of browser detection.
 */

// Generator for Chromium-based browser UA strings
const chromiumBrowserUAArb = fc.constantFrom(
  // Edge Chromium
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  // Samsung Internet
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/22.0 Chrome/111.0.0.0 Safari/537.36',
  // Vivaldi
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.50',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Vivaldi/6.4.3160.44',
  // Opera 15+
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0'
);

// Generator for actual Chrome UA strings (not other Chromium browsers)
const chromeUAArb = fc.constantFrom(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
);

describe('Property 5: Chrome Disambiguation', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 5: Chrome Disambiguation
   * Validates: Requirements 2.4
   * 
   * For any Chromium-based browser User-Agent string, Chrome should only be
   * identified when the UA string is actually from Chrome, not from Edge, Brave,
   * or other Chromium browsers.
   */
  it('should NOT identify Chrome when UA string is from other Chromium browsers', () => {
    fc.assert(
      fc.property(chromiumBrowserUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const result = detectBrowser(mockNavigator);
        
        // The result should NOT be Chrome
        expect(result).toBeDefined();
        expect(result?.name).not.toBe('Chrome');
        
        // It should be one of the other Chromium browsers
        const chromiumBrowsers = ['Edge', 'Samsung Internet', 'Vivaldi', 'Opera15+'];
        expect(chromiumBrowsers).toContain(result?.name);
      }),
      { numRuns: 100 }
    );
  });

  it('should identify Chrome ONLY when UA string is actually from Chrome', () => {
    fc.assert(
      fc.property(chromeUAArb, (userAgent) => {
        const mockNavigator = { userAgent } as Navigator;
        const result = detectBrowser(mockNavigator);
        
        // The result should be Chrome
        expect(result).toBeDefined();
        expect(result?.name).toBe('Chrome');
        
        // And it should have a valid version
        expect(result?.version).toBeDefined();
        expect(result?.version.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly distinguish Chrome from Edge based on Edg/ pattern', () => {
    fc.assert(
      fc.property(fc.boolean(), (isEdge) => {
        const baseUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        const userAgent = isEdge ? `${baseUA} Edg/120.0.0.0` : baseUA;
        
        const mockNavigator = { userAgent } as Navigator;
        const result = detectBrowser(mockNavigator);
        
        expect(result).toBeDefined();
        if (isEdge) {
          expect(result?.name).toBe('Edge');
        } else {
          expect(result?.name).toBe('Chrome');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly distinguish Chrome from Samsung Internet based on SamsungBrowser/ pattern', () => {
    fc.assert(
      fc.property(fc.boolean(), (isSamsung) => {
        const baseUA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36';
        const userAgent = isSamsung ? baseUA.replace('Chrome/115.0.0.0', 'SamsungBrowser/23.0 Chrome/115.0.0.0') : baseUA;
        
        const mockNavigator = { userAgent } as Navigator;
        const result = detectBrowser(mockNavigator);
        
        expect(result).toBeDefined();
        if (isSamsung) {
          expect(result?.name).toBe('Samsung Internet');
        } else {
          expect(result?.name).toBe('Chrome');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly distinguish Chrome from Vivaldi based on Vivaldi/ pattern', () => {
    fc.assert(
      fc.property(fc.boolean(), (isVivaldi) => {
        const baseUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        const userAgent = isVivaldi ? `${baseUA} Vivaldi/6.5.3206.50` : baseUA;
        
        const mockNavigator = { userAgent } as Navigator;
        const result = detectBrowser(mockNavigator);
        
        expect(result).toBeDefined();
        if (isVivaldi) {
          expect(result?.name).toBe('Vivaldi');
        } else {
          expect(result?.name).toBe('Chrome');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly distinguish Chrome from Opera based on OPR/ pattern', () => {
    fc.assert(
      fc.property(fc.boolean(), (isOpera) => {
        const baseUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        const userAgent = isOpera ? `${baseUA} OPR/106.0.0.0` : baseUA;
        
        const mockNavigator = { userAgent } as Navigator;
        const result = detectBrowser(mockNavigator);
        
        expect(result).toBeDefined();
        if (isOpera) {
          expect(result?.name).toBe('Opera15+');
        } else {
          expect(result?.name).toBe('Chrome');
        }
      }),
      { numRuns: 100 }
    );
  });
});
