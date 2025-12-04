import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { detectFromClientHints } from '../../detectors/clientHints';
import { detectBrowser, detectDevice, detectRenderingEngine } from '../../detectors/userAgentString';
import { areAgentsEqual } from '../../utils/comparison';
import type { Agent } from '../../types';

/**
 * Property-Based Tests for Performance Properties
 * 
 * Feature: modernize-user-agent-detection
 * These tests verify performance-related correctness properties.
 */

describe('Property 15: Single Detection Per Mount', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 15: Single Detection Per Mount
   * Validates: Requirements 7.1
   * 
   * For any component using the hook, user agent detection should execute exactly
   * once when the component mounts, not on every render.
   * 
   * Note: This property tests the detection functions themselves to ensure they
   * are deterministic and don't have side effects that would cause issues with
   * single execution.
   */

  const userAgentStringArb = fc.constantFrom(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  );

  it('should return identical results when detection functions are called multiple times', () => {
    fc.assert(
      fc.property(userAgentStringArb, (uaString) => {
        const mockNavigator = { userAgent: uaString } as Navigator;

        // Call detection functions multiple times
        const browser1 = detectBrowser(mockNavigator);
        const browser2 = detectBrowser(mockNavigator);
        const browser3 = detectBrowser(mockNavigator);

        const device1 = detectDevice(mockNavigator);
        const device2 = detectDevice(mockNavigator);
        const device3 = detectDevice(mockNavigator);

        // Results should be identical (deterministic)
        expect(browser1).toEqual(browser2);
        expect(browser2).toEqual(browser3);
        expect(device1).toEqual(device2);
        expect(device2).toEqual(device3);
      }),
      { numRuns: 100 }
    );
  });

  it('should not have side effects that change detection results', () => {
    fc.assert(
      fc.property(userAgentStringArb, (uaString) => {
        const mockNavigator = { userAgent: uaString } as Navigator;

        // First detection
        const browser1 = detectBrowser(mockNavigator);
        const device1 = detectDevice(mockNavigator);
        const engine1 = detectRenderingEngine(browser1?.name, mockNavigator);

        // Second detection (should not be affected by first)
        const browser2 = detectBrowser(mockNavigator);
        const device2 = detectDevice(mockNavigator);
        const engine2 = detectRenderingEngine(browser2?.name, mockNavigator);

        // Results should be identical
        expect(browser1).toEqual(browser2);
        expect(device1).toEqual(device2);
        expect(engine1).toEqual(engine2);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce deterministic results for Client Hints detection', async () => {
    const navigatorUADataArb = fc.record({
      brands: fc.array(
        fc.record({
          brand: fc.constantFrom('Google Chrome', 'Chromium', 'Microsoft Edge'),
          version: fc.integer({ min: 90, max: 130 }).map(String)
        }),
        { minLength: 1, maxLength: 3 }
      ),
      mobile: fc.boolean(),
      platform: fc.constantFrom('Windows', 'macOS', 'Linux', 'Android'),
      getHighEntropyValues: fc.constant(async () => ({
        brands: [],
        mobile: false,
        platform: 'Windows',
        architecture: 'x86',
        model: '',
        platformVersion: '10.0.0',
        uaFullVersion: '120.0.0.0'
      }))
    });

    await fc.assert(
      fc.asyncProperty(navigatorUADataArb, async (userAgentData) => {
        // Call detection multiple times
        const result1 = detectFromClientHints(userAgentData);
        const result2 = detectFromClientHints(userAgentData);

        const agent1 = result1 instanceof Promise ? await result1 : result1;
        const agent2 = result2 instanceof Promise ? await result2 : result2;

        // Results should be identical
        expect(areAgentsEqual(agent1, agent2)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 16: No Unnecessary Updates', () => {
  /**
   * Feature: modernize-user-agent-detection, Property 16: No Unnecessary Updates
   * Validates: Requirements 7.2
   * 
   * For any hook execution where the detected agent data is identical to the
   * previous state, the system should not trigger a state update.
   * 
   * This property tests the areAgentsEqual comparison function to ensure it
   * correctly identifies when agents are equal.
   */

  const agentArb = fc.record({
    browser: fc.option(
      fc.record({
        name: fc.constantFrom('Chrome', 'Firefox', 'Safari', 'Edge'),
        version: fc.string({ minLength: 1, maxLength: 20 }),
        fullVersion: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined })
      }),
      { nil: undefined }
    ),
    device: fc.option(
      fc.record({
        isMobile: fc.boolean(),
        platform: fc.constantFrom('Windows', 'Mac OS', 'Linux', 'Android', 'iOS'),
        device: fc.constantFrom('Desktop PC', 'Android', 'iPhone', 'iPad'),
        architecture: fc.option(fc.string(), { nil: undefined }),
        model: fc.option(fc.string(), { nil: undefined }),
        platformVersion: fc.option(fc.string(), { nil: undefined })
      }),
      { nil: undefined }
    ),
    renderingEngine: fc.option(
      fc.record({
        name: fc.constantFrom('Blink', 'Gecko', 'WebKit'),
        version: fc.string({ minLength: 1, maxLength: 20 })
      }),
      { nil: undefined }
    ),
    detectionMethod: fc.option(
      fc.constantFrom('client-hints', 'user-agent-string', 'ssr'),
      { nil: undefined }
    ),
    deviceType: fc.option(
      fc.constantFrom('mobile', 'tablet', 'desktop'),
      { nil: undefined }
    )
  });

  it('should identify identical agents as equal', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        // An agent should be equal to itself
        expect(areAgentsEqual(agent, agent)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should identify deep copies as equal', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        // Create a deep copy
        const copy = JSON.parse(JSON.stringify(agent)) as Agent;
        
        // Deep copy should be equal to original
        expect(areAgentsEqual(agent, copy)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should identify agents with different browser names as not equal', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        if (!agent.browser) return; // Skip if no browser

        // Create a modified copy with different browser name
        const modified = {
          ...agent,
          browser: {
            ...agent.browser,
            name: agent.browser.name === 'Chrome' ? 'Firefox' as const : 'Chrome' as const
          }
        };

        // Should not be equal
        expect(areAgentsEqual(agent, modified)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should identify agents with different mobile flags as not equal', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        if (!agent.device) return; // Skip if no device

        // Create a modified copy with flipped mobile flag
        const modified = {
          ...agent,
          device: {
            ...agent.device,
            isMobile: !agent.device.isMobile
          }
        };

        // Should not be equal
        expect(areAgentsEqual(agent, modified)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should identify agents with different detection methods as not equal', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        if (!agent.detectionMethod) return; // Skip if no detection method

        // Create a modified copy with different detection method
        const modified = {
          ...agent,
          detectionMethod: agent.detectionMethod === 'client-hints' 
            ? 'user-agent-string' as const 
            : 'client-hints' as const
        };

        // Should not be equal
        expect(areAgentsEqual(agent, modified)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle undefined values correctly in comparison', () => {
    const agent1: Agent = {
      browser: undefined,
      device: undefined,
      renderingEngine: undefined
    };

    const agent2: Agent = {
      browser: undefined,
      device: undefined,
      renderingEngine: undefined
    };

    // Both undefined should be equal
    expect(areAgentsEqual(agent1, agent2)).toBe(true);
  });

  it('should identify agents where one has undefined and other has value as not equal', () => {
    const agent1: Agent = {
      browser: { name: 'Chrome', version: '120' },
      device: undefined,
      renderingEngine: undefined
    };

    const agent2: Agent = {
      browser: undefined,
      device: undefined,
      renderingEngine: undefined
    };

    // Should not be equal
    expect(areAgentsEqual(agent1, agent2)).toBe(false);
  });
});
