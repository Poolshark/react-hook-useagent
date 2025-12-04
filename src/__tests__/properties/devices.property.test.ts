import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  detectDeviceFromUA, 
  detectDeviceFromClientHints, 
  getDeviceTypeClassification,
  isIPad,
  isAndroidTablet
} from '../../detectors/device';
import type { NavigatorUAData, Device } from '../../types';

/**
 * Property-Based Tests for Device Detection
 * 
 * Feature: modernize-user-agent-detection
 * These tests verify the correctness properties of device detection.
 */

// Arbitraries (generators) for device detection

// Mobile phone user agents
const mobilePhoneUAArb = fc.constantFrom(
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPod touch; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
);

// Tablet user agents
const tabletUAArb = fc.constantFrom(
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', // Modern iPad
  'Mozilla/5.0 (Linux; Android 12; Lenovo TB-X606F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
);

// Desktop user agents
const desktopUAArb = fc.constantFrom(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; CrOS x86_64 15236.80.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);

// Mock Navigator for UA string testing
function createMockNavigator(userAgent: string, maxTouchPoints: number = 0): Navigator {
  return {
    userAgent,
    maxTouchPoints,
  } as Navigator;
}

// Client Hints arbitraries
const mobileClientHintsArb = fc.record({
  brands: fc.array(fc.record({
    brand: fc.constantFrom('Google Chrome', 'Chromium', 'Not A;Brand'),
    version: fc.integer({ min: 90, max: 130 }).map(String)
  }), { minLength: 1, maxLength: 3 }),
  mobile: fc.constant(true),
  platform: fc.constantFrom('Android', 'iOS'),
  getHighEntropyValues: fc.constant(async () => ({
    brands: [],
    mobile: true,
    platform: 'Android',
  }))
});

const tabletClientHintsArb = fc.record({
  brands: fc.array(fc.record({
    brand: fc.constantFrom('Google Chrome', 'Chromium', 'Not A;Brand'),
    version: fc.integer({ min: 90, max: 130 }).map(String)
  }), { minLength: 1, maxLength: 3 }),
  mobile: fc.constant(false),
  platform: fc.constantFrom('Android', 'iOS'),
  getHighEntropyValues: fc.constant(async () => ({
    brands: [],
    mobile: false,
    platform: 'Android',
  }))
});

const desktopClientHintsArb = fc.record({
  brands: fc.array(fc.record({
    brand: fc.constantFrom('Google Chrome', 'Chromium', 'Not A;Brand'),
    version: fc.integer({ min: 90, max: 130 }).map(String)
  }), { minLength: 1, maxLength: 3 }),
  mobile: fc.constant(false),
  platform: fc.constantFrom('Windows', 'macOS', 'Linux', 'Chrome OS'),
  getHighEntropyValues: fc.constant(async () => ({
    brands: [],
    mobile: false,
    platform: 'Windows',
  }))
});

describe('Property 10: Device Type Classification', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 10: Device Type Classification
   * Validates: Requirements 4.1, 4.2, 4.3
   * 
   * For any valid navigator input, the system should correctly classify devices such that:
   * - Mobile phones have isMobile: true and deviceType: "mobile"
   * - Tablets have isMobile: false and deviceType: "tablet"
   * - Desktops have isMobile: false and deviceType: "desktop"
   */

  describe('Mobile Phone Classification (UA String)', () => {
    it('should classify mobile phones with isMobile: true and deviceType: "mobile"', () => {
      fc.assert(
        fc.property(mobilePhoneUAArb, (userAgent) => {
          const navigator = createMockNavigator(userAgent);
          const deviceInfo = detectDeviceFromUA(navigator);
          
          expect(deviceInfo).toBeDefined();
          expect(deviceInfo?.isMobile).toBe(true);
          
          const deviceType = getDeviceTypeClassification(
            deviceInfo!.isMobile,
            deviceInfo!.device
          );
          expect(deviceType).toBe('mobile');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Tablet Classification (UA String)', () => {
    it('should classify tablets with isMobile: false and deviceType: "tablet"', () => {
      fc.assert(
        fc.property(tabletUAArb, (userAgent) => {
          // For modern iPad detection, we need maxTouchPoints
          const maxTouchPoints = userAgent.includes('Macintosh') ? 5 : 0;
          const navigator = createMockNavigator(userAgent, maxTouchPoints);
          const deviceInfo = detectDeviceFromUA(navigator);
          
          expect(deviceInfo).toBeDefined();
          
          // Tablets should not be marked as mobile
          expect(deviceInfo?.isMobile).toBe(false);
          
          const deviceType = getDeviceTypeClassification(
            deviceInfo!.isMobile,
            deviceInfo!.device
          );
          expect(deviceType).toBe('tablet');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Desktop Classification (UA String)', () => {
    it('should classify desktops with isMobile: false and deviceType: "desktop"', () => {
      fc.assert(
        fc.property(desktopUAArb, (userAgent) => {
          const navigator = createMockNavigator(userAgent);
          const deviceInfo = detectDeviceFromUA(navigator);
          
          expect(deviceInfo).toBeDefined();
          expect(deviceInfo?.isMobile).toBe(false);
          
          const deviceType = getDeviceTypeClassification(
            deviceInfo!.isMobile,
            deviceInfo!.device
          );
          expect(deviceType).toBe('desktop');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Mobile Phone Classification (Client Hints)', () => {
    it('should classify mobile phones with isMobile: true and deviceType: "mobile"', () => {
      fc.assert(
        fc.property(mobileClientHintsArb, (userAgentData) => {
          const deviceInfo = detectDeviceFromClientHints(userAgentData);
          
          expect(deviceInfo).toBeDefined();
          expect(deviceInfo.isMobile).toBe(true);
          
          const deviceType = getDeviceTypeClassification(
            deviceInfo.isMobile,
            deviceInfo.device
          );
          expect(deviceType).toBe('mobile');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Tablet Classification (Client Hints)', () => {
    it('should classify tablets with isMobile: false and deviceType: "tablet"', () => {
      fc.assert(
        fc.property(tabletClientHintsArb, (userAgentData) => {
          const deviceInfo = detectDeviceFromClientHints(userAgentData);
          
          expect(deviceInfo).toBeDefined();
          expect(deviceInfo.isMobile).toBe(false);
          
          const deviceType = getDeviceTypeClassification(
            deviceInfo.isMobile,
            deviceInfo.device
          );
          expect(deviceType).toBe('tablet');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Desktop Classification (Client Hints)', () => {
    it('should classify desktops with isMobile: false and deviceType: "desktop"', () => {
      fc.assert(
        fc.property(desktopClientHintsArb, (userAgentData) => {
          const deviceInfo = detectDeviceFromClientHints(userAgentData);
          
          expect(deviceInfo).toBeDefined();
          expect(deviceInfo.isMobile).toBe(false);
          
          const deviceType = getDeviceTypeClassification(
            deviceInfo.isMobile,
            deviceInfo.device
          );
          expect(deviceType).toBe('desktop');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Device Type Consistency', () => {
    it('should ensure iPad and Tablet devices always map to "tablet" deviceType', () => {
      const tabletDevices: Device[] = ['iPad', 'Tablet'];
      
      fc.assert(
        fc.property(fc.constantFrom(...tabletDevices), fc.boolean(), (device, isMobile) => {
          const deviceType = getDeviceTypeClassification(isMobile, device);
          expect(deviceType).toBe('tablet');
        }),
        { numRuns: 100 }
      );
    });

    it('should ensure mobile flag with non-tablet devices maps to "mobile" deviceType', () => {
      const mobileDevices: Device[] = ['Android', 'iPhone', 'iPod', 'Unknown'];
      
      fc.assert(
        fc.property(fc.constantFrom(...mobileDevices), (device) => {
          const deviceType = getDeviceTypeClassification(true, device);
          expect(deviceType).toBe('mobile');
        }),
        { numRuns: 100 }
      );
    });

    it('should ensure non-mobile flag with Desktop PC maps to "desktop" deviceType', () => {
      const deviceType = getDeviceTypeClassification(false, 'Desktop PC');
      expect(deviceType).toBe('desktop');
    });
  });
});

describe('Property 11: Android Tablet Distinction', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 11: Android Tablet Distinction
   * Validates: Requirements 4.5
   * 
   * For any Android User-Agent string, the system should distinguish tablets from phones
   * based on UA patterns, setting deviceType appropriately.
   */

  const androidPhoneUAArb = fc.constantFrom(
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; OnePlus 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36'
  );

  const androidTabletUAArb = fc.constantFrom(
    'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; Lenovo TB-X606F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
  );

  it('should identify Android phones (with "Mobile" keyword) as mobile devices', () => {
    fc.assert(
      fc.property(androidPhoneUAArb, (userAgent) => {
        const navigator = createMockNavigator(userAgent);
        const deviceInfo = detectDeviceFromUA(navigator);
        
        expect(deviceInfo).toBeDefined();
        expect(deviceInfo?.platform).toBe('Android');
        expect(deviceInfo?.isMobile).toBe(true);
        expect(deviceInfo?.device).toBe('Android');
        
        const deviceType = getDeviceTypeClassification(
          deviceInfo!.isMobile,
          deviceInfo!.device
        );
        expect(deviceType).toBe('mobile');
      }),
      { numRuns: 100 }
    );
  });

  it('should identify Android tablets (without "Mobile" keyword) as tablets', () => {
    fc.assert(
      fc.property(androidTabletUAArb, (userAgent) => {
        const navigator = createMockNavigator(userAgent);
        const deviceInfo = detectDeviceFromUA(navigator);
        
        expect(deviceInfo).toBeDefined();
        expect(deviceInfo?.platform).toBe('Android');
        expect(deviceInfo?.isMobile).toBe(false);
        expect(deviceInfo?.device).toBe('Tablet');
        
        const deviceType = getDeviceTypeClassification(
          deviceInfo!.isMobile,
          deviceInfo!.device
        );
        expect(deviceType).toBe('tablet');
      }),
      { numRuns: 100 }
    );
  });

  it('should use isAndroidTablet helper to distinguish tablets from phones', () => {
    fc.assert(
      fc.property(androidPhoneUAArb, androidTabletUAArb, (phoneUA, tabletUA) => {
        expect(isAndroidTablet(phoneUA)).toBe(false);
        expect(isAndroidTablet(tabletUA)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false for non-Android user agents', () => {
    const nonAndroidUAs = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    ];
    
    fc.assert(
      fc.property(fc.constantFrom(...nonAndroidUAs), (userAgent) => {
        expect(isAndroidTablet(userAgent)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
