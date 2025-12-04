import { describe, it, expect } from 'vitest';
import { detectDeviceFromUA, isIPad, isAndroidTablet } from '../../detectors/device';

/**
 * Unit Tests for Device Detection
 * 
 * These tests verify specific device detection scenarios with real User-Agent strings.
 */

// Mock Navigator helper
function createMockNavigator(userAgent: string, maxTouchPoints: number = 0): Navigator {
  return {
    userAgent,
    maxTouchPoints,
  } as Navigator;
}

describe('iPad Detection', () => {
  describe('Older iPad Detection (Requirement 4.4)', () => {
    it('should detect iPad from explicit iPad UA string', () => {
      const userAgent = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const navigator = createMockNavigator(userAgent);
      
      const deviceInfo = detectDeviceFromUA(navigator);
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.device).toBe('iPad');
      expect(deviceInfo?.platform).toBe('iOS');
      expect(deviceInfo?.isMobile).toBe(false);
    });

    it('should detect iPad using isIPad helper with explicit iPad UA', () => {
      const userAgent = 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
      const navigator = createMockNavigator(userAgent);
      
      expect(isIPad(navigator)).toBe(true);
    });

    it('should detect iPad with different iOS versions', () => {
      const userAgents = [
        'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
      ];

      userAgents.forEach(userAgent => {
        const navigator = createMockNavigator(userAgent);
        const deviceInfo = detectDeviceFromUA(navigator);
        
        expect(deviceInfo?.device).toBe('iPad');
        expect(deviceInfo?.platform).toBe('iOS');
        expect(deviceInfo?.isMobile).toBe(false);
      });
    });
  });

  describe('Modern iPad Detection with maxTouchPoints (Requirement 4.4)', () => {
    it('should detect modern iPad masquerading as Mac with maxTouchPoints > 1', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      const navigator = createMockNavigator(userAgent, 5);
      
      const deviceInfo = detectDeviceFromUA(navigator);
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.device).toBe('iPad');
      expect(deviceInfo?.platform).toBe('iOS');
      expect(deviceInfo?.isMobile).toBe(false);
    });

    it('should detect modern iPad using isIPad helper with maxTouchPoints', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      const navigator = createMockNavigator(userAgent, 5);
      
      expect(isIPad(navigator)).toBe(true);
    });

    it('should NOT detect regular Mac as iPad when maxTouchPoints is 0', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      const navigator = createMockNavigator(userAgent, 0);
      
      const deviceInfo = detectDeviceFromUA(navigator);
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.device).toBe('Desktop PC');
      expect(deviceInfo?.platform).toBe('Mac OS');
      expect(deviceInfo?.isMobile).toBe(false);
    });

    it('should NOT detect regular Mac as iPad using isIPad helper when maxTouchPoints is 0', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      const navigator = createMockNavigator(userAgent, 0);
      
      expect(isIPad(navigator)).toBe(false);
    });

    it('should NOT detect regular Mac as iPad when maxTouchPoints is 1', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      const navigator = createMockNavigator(userAgent, 1);
      
      const deviceInfo = detectDeviceFromUA(navigator);
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.device).toBe('Desktop PC');
      expect(deviceInfo?.platform).toBe('Mac OS');
    });

    it('should detect iPad with various maxTouchPoints values > 1', () => {
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      
      [2, 5, 10].forEach(touchPoints => {
        const navigator = createMockNavigator(userAgent, touchPoints);
        const deviceInfo = detectDeviceFromUA(navigator);
        
        expect(deviceInfo?.device).toBe('iPad');
        expect(deviceInfo?.platform).toBe('iOS');
      });
    });
  });

  describe('iPad Edge Cases', () => {
    it('should handle iPad Pro user agents', () => {
      const userAgent = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const navigator = createMockNavigator(userAgent);
      
      expect(isIPad(navigator)).toBe(true);
    });

    it('should not detect iPhone as iPad', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const navigator = createMockNavigator(userAgent);
      
      expect(isIPad(navigator)).toBe(false);
    });

    it('should not detect Android tablet as iPad', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const navigator = createMockNavigator(userAgent);
      
      expect(isIPad(navigator)).toBe(false);
    });
  });
});

describe('Android Tablet Detection', () => {
  describe('Android Tablet vs Phone Distinction (Requirement 4.5)', () => {
    it('should detect Android tablet without "Mobile" keyword', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const navigator = createMockNavigator(userAgent);
      
      const deviceInfo = detectDeviceFromUA(navigator);
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.platform).toBe('Android');
      expect(deviceInfo?.device).toBe('Tablet');
      expect(deviceInfo?.isMobile).toBe(false);
    });

    it('should detect Android phone with "Mobile" keyword', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      const navigator = createMockNavigator(userAgent);
      
      const deviceInfo = detectDeviceFromUA(navigator);
      
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.platform).toBe('Android');
      expect(deviceInfo?.device).toBe('Android');
      expect(deviceInfo?.isMobile).toBe(true);
    });

    it('should use isAndroidTablet helper to distinguish tablets', () => {
      const tabletUA = 'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const phoneUA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      
      expect(isAndroidTablet(tabletUA)).toBe(true);
      expect(isAndroidTablet(phoneUA)).toBe(false);
    });

    it('should detect various Android tablet models', () => {
      const tabletUAs = [
        'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; Lenovo TB-X606F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      ];

      tabletUAs.forEach(userAgent => {
        const navigator = createMockNavigator(userAgent);
        const deviceInfo = detectDeviceFromUA(navigator);
        
        expect(deviceInfo?.platform).toBe('Android');
        expect(deviceInfo?.device).toBe('Tablet');
        expect(deviceInfo?.isMobile).toBe(false);
        expect(isAndroidTablet(userAgent)).toBe(true);
      });
    });

    it('should detect various Android phone models', () => {
      const phoneUAs = [
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; OnePlus 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
      ];

      phoneUAs.forEach(userAgent => {
        const navigator = createMockNavigator(userAgent);
        const deviceInfo = detectDeviceFromUA(navigator);
        
        expect(deviceInfo?.platform).toBe('Android');
        expect(deviceInfo?.device).toBe('Android');
        expect(deviceInfo?.isMobile).toBe(true);
        expect(isAndroidTablet(userAgent)).toBe(false);
      });
    });
  });

  describe('Android Tablet Edge Cases', () => {
    it('should not detect non-Android devices as Android tablets', () => {
      const nonAndroidUAs = [
        'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ];

      nonAndroidUAs.forEach(userAgent => {
        expect(isAndroidTablet(userAgent)).toBe(false);
      });
    });

    it('should handle case-insensitive Android detection', () => {
      const userAgent = 'Mozilla/5.0 (Linux; android 13; SM-X906C) AppleWebKit/537.36';
      expect(isAndroidTablet(userAgent)).toBe(true);
    });

    it('should handle case-insensitive Mobile keyword detection', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 mobile Safari/537.36';
      expect(isAndroidTablet(userAgent)).toBe(false);
    });
  });
});

describe('Chrome OS Detection', () => {
  it('should detect Chrome OS devices', () => {
    const userAgent = 'Mozilla/5.0 (X11; CrOS x86_64 15236.80.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const navigator = createMockNavigator(userAgent);
    
    const deviceInfo = detectDeviceFromUA(navigator);
    
    expect(deviceInfo).toBeDefined();
    expect(deviceInfo?.platform).toBe('Chrome OS');
    expect(deviceInfo?.device).toBe('Desktop PC');
    expect(deviceInfo?.isMobile).toBe(false);
  });

  it('should detect Chrome OS with different architectures', () => {
    const userAgents = [
      'Mozilla/5.0 (X11; CrOS x86_64 15236.80.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; CrOS aarch64 15236.80.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    userAgents.forEach(userAgent => {
      const navigator = createMockNavigator(userAgent);
      const deviceInfo = detectDeviceFromUA(navigator);
      
      expect(deviceInfo?.platform).toBe('Chrome OS');
      expect(deviceInfo?.isMobile).toBe(false);
    });
  });
});
