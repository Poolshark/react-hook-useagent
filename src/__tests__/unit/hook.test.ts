import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isSSR } from '../../utils/ssr';
import type { Agent, UseUserAgentOptions } from '../../types';

/**
 * Unit Tests for SSR Handling
 * 
 * These tests verify SSR detection behavior.
 * Validates: Requirements 1.5
 */

describe('SSR Detection', () => {
  it('should detect SSR environment when window is undefined', () => {
    // Save original window
    const originalWindow = globalThis.window;
    
    try {
      // Simulate SSR by deleting window
      // @ts-expect-error - Intentionally deleting window for SSR simulation
      delete globalThis.window;

      // isSSR should return true
      expect(isSSR()).toBe(true);
    } finally {
      // Restore window
      if (originalWindow) {
        globalThis.window = originalWindow;
      }
    }
  });

  it('should not throw errors when checking for SSR', () => {
    // Save original window
    const originalWindow = globalThis.window;
    
    try {
      // Restore window if needed
      if (!globalThis.window && originalWindow) {
        globalThis.window = originalWindow;
      }
      
      // Should not throw in client environment (if window exists)
      expect(() => isSSR()).not.toThrow();

      // Simulate SSR
      // @ts-expect-error - Intentionally deleting window for SSR simulation
      delete globalThis.window;

      // Should not throw in SSR environment
      expect(() => isSSR()).not.toThrow();
    } finally {
      // Restore window
      if (originalWindow) {
        globalThis.window = originalWindow;
      }
    }
  });
});

/**
 * Unit Tests for v1.x API Compatibility
 * 
 * These tests verify backward compatibility with v1.x API through type checking.
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

describe('v1.x API Compatibility - Type Structure', () => {
  it('should have optional parameters in UseUserAgentOptions', () => {
    // Type test: options should be optional
    const options1: UseUserAgentOptions = {};
    const options2: UseUserAgentOptions = { highEntropy: true };
    const options3: UseUserAgentOptions = { hints: ['architecture'] };
    
    expect(options1).toBeDefined();
    expect(options2).toBeDefined();
    expect(options3).toBeDefined();
  });

  it('should maintain v1.x Agent structure with required properties', () => {
    // Type test: Agent should have device, browser, renderingEngine
    const agent: Agent = {
      device: undefined,
      browser: undefined,
      renderingEngine: undefined,
    };
    
    expect(agent).toHaveProperty('device');
    expect(agent).toHaveProperty('browser');
    expect(agent).toHaveProperty('renderingEngine');
  });

  it('should allow v1.x Agent structure without new properties', () => {
    // Type test: new properties should be optional
    const v1Agent: Agent = {
      device: {
        isMobile: false,
        platform: 'Mac OS',
        device: 'Desktop PC',
      },
      browser: {
        name: 'Chrome',
        version: '120',
      },
      renderingEngine: {
        name: 'Blink',
        version: '120',
      },
    };
    
    // Should not require detectionMethod or deviceType
    expect(v1Agent.detectionMethod).toBeUndefined();
    expect(v1Agent.deviceType).toBeUndefined();
  });

  it('should maintain device.isMobile property for v1.x compatibility', () => {
    const agent: Agent = {
      device: {
        isMobile: true,
        platform: 'Android',
        device: 'Android',
      },
    };
    
    expect(agent.device?.isMobile).toBe(true);
    expect(typeof agent.device?.isMobile).toBe('boolean');
  });

  it('should maintain browser.name and browser.version for v1.x compatibility', () => {
    const agent: Agent = {
      browser: {
        name: 'Firefox',
        version: '120',
      },
    };
    
    expect(agent.browser?.name).toBe('Firefox');
    expect(agent.browser?.version).toBe('120');
    expect(typeof agent.browser?.name).toBe('string');
    expect(typeof agent.browser?.version).toBe('string');
  });

  it('should maintain renderingEngine property for v1.x compatibility', () => {
    const agent: Agent = {
      renderingEngine: {
        name: 'Gecko',
        version: '120',
      },
    };
    
    expect(agent.renderingEngine?.name).toBe('Gecko');
    expect(typeof agent.renderingEngine?.name).toBe('string');
  });

  it('should allow v1.x destructuring pattern', () => {
    const agent: Agent = {
      device: {
        isMobile: false,
        platform: 'Windows',
        device: 'Desktop PC',
      },
      browser: {
        name: 'Edge',
        version: '120',
      },
      renderingEngine: {
        name: 'Blink',
        version: '120',
      },
    };
    
    // v1.x destructuring should work
    const { device, browser, renderingEngine } = agent;
    
    expect(device).toBeDefined();
    expect(browser).toBeDefined();
    expect(renderingEngine).toBeDefined();
  });

  it('should allow new properties to be added without breaking v1.x code', () => {
    const v2Agent: Agent = {
      device: {
        isMobile: false,
        platform: 'Mac OS',
        device: 'Desktop PC',
      },
      browser: {
        name: 'Safari',
        version: '17',
      },
      renderingEngine: {
        name: 'WebKit',
        version: '17',
      },
      detectionMethod: 'client-hints',
      deviceType: 'desktop',
    };
    
    // v1.x code that only destructures old properties should still work
    const { device, browser, renderingEngine } = v2Agent;
    
    expect(device).toBeDefined();
    expect(browser).toBeDefined();
    expect(renderingEngine).toBeDefined();
    
    // New properties are available but optional
    expect(v2Agent.detectionMethod).toBe('client-hints');
    expect(v2Agent.deviceType).toBe('desktop');
  });
});
