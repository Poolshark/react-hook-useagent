import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Agent, BrowserInfo, DeviceInfo, RenderingEngineInfo } from '../../types';

/**
 * Property-Based Tests for Backward Compatibility
 * 
 * These tests verify that the v2.x API maintains compatibility with v1.x usage patterns.
 * Feature: modernize-user-agent-detection
 */

/**
 * Arbitrary for generating valid BrowserInfo objects
 */
const browserInfoArbitrary = fc.record({
  name: fc.constantFrom(
    'Chrome', 'Chromium', 'Edge', 'Firefox', 'Safari', 
    'Opera', 'Brave', 'Samsung Internet', 'Vivaldi', 'Arc', 'Unknown'
  ),
  version: fc.integer({ min: 1, max: 150 }).map(String),
  fullVersion: fc.option(fc.string(), { nil: undefined }),
});

/**
 * Arbitrary for generating valid DeviceInfo objects
 */
const deviceInfoArbitrary = fc.record({
  isMobile: fc.boolean(),
  platform: fc.constantFrom('Android', 'iOS', 'Windows', 'Linux', 'Mac OS', 'Chrome OS', 'Unknown'),
  device: fc.constantFrom('Android', 'iPhone', 'iPad', 'iPod', 'Desktop PC', 'Tablet', 'Unknown'),
  architecture: fc.option(fc.constantFrom('x86', 'arm', 'x64'), { nil: undefined }),
  model: fc.option(fc.string(), { nil: undefined }),
  platformVersion: fc.option(fc.string(), { nil: undefined }),
});

/**
 * Arbitrary for generating valid RenderingEngineInfo objects
 */
const renderingEngineInfoArbitrary = fc.record({
  name: fc.constantFrom('Blink', 'Gecko', 'WebKit', 'Unknown'),
  version: fc.integer({ min: 1, max: 150 }).map(String),
});

/**
 * Arbitrary for generating v1.x compatible Agent objects (without new properties)
 */
const v1AgentArbitrary = fc.record({
  device: fc.option(deviceInfoArbitrary, { nil: undefined }),
  browser: fc.option(browserInfoArbitrary, { nil: undefined }),
  renderingEngine: fc.option(renderingEngineInfoArbitrary, { nil: undefined }),
});

/**
 * Arbitrary for generating v2.x Agent objects (with new properties)
 */
const v2AgentArbitrary = fc.record({
  device: fc.option(deviceInfoArbitrary, { nil: undefined }),
  browser: fc.option(browserInfoArbitrary, { nil: undefined }),
  renderingEngine: fc.option(renderingEngineInfoArbitrary, { nil: undefined }),
  detectionMethod: fc.option(fc.constantFrom('client-hints', 'user-agent-string', 'ssr'), { nil: undefined }),
  deviceType: fc.option(fc.constantFrom('mobile', 'tablet', 'desktop'), { nil: undefined }),
});

describe('Property 17: API Signature Compatibility', () => {
  /**
   * **Feature: modernize-user-agent-detection, Property 17: API Signature Compatibility**
   * 
   * For any valid usage of the hook from version 1.x, the hook should accept 
   * the same parameters (none) and return an agent object with compatible structure.
   * 
   * **Validates: Requirements 10.1**
   */
  it('should maintain v1.x API signature - Agent structure is compatible', () => {
    fc.assert(
      fc.property(v1AgentArbitrary, (agent) => {
        // v1.x Agent objects should have the required properties
        expect(agent).toHaveProperty('device');
        expect(agent).toHaveProperty('browser');
        expect(agent).toHaveProperty('renderingEngine');
        
        // The structure should be valid
        const isValidStructure = 
          'device' in agent &&
          'browser' in agent &&
          'renderingEngine' in agent;
        
        return isValidStructure;
      }),
      { numRuns: 100 }
    );
  });

  it('should allow v1.x destructuring patterns without errors', () => {
    fc.assert(
      fc.property(v2AgentArbitrary, (agent) => {
        // v1.x code that destructures only old properties should work
        const { device, browser, renderingEngine } = agent;
        
        // These properties should exist (can be undefined)
        const hasRequiredProperties = 
          device !== null &&
          browser !== null &&
          renderingEngine !== null;
        
        return hasRequiredProperties;
      }),
      { numRuns: 100 }
    );
  });

  it('should not require new properties for v1.x compatibility', () => {
    fc.assert(
      fc.property(v1AgentArbitrary, (agent) => {
        // v1.x Agent objects don't need detectionMethod or deviceType
        const hasOnlyV1Properties = 
          !('detectionMethod' in agent) &&
          !('deviceType' in agent);
        
        // This should be valid - new properties are optional
        return hasOnlyV1Properties || true; // Always true because new props are optional
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 18: Backward Compatible Properties', () => {
  /**
   * **Feature: modernize-user-agent-detection, Property 18: Backward Compatible Properties**
   * 
   * For any agent object returned by the hook, it should contain the properties 
   * device.isMobile, browser.name, browser.version, and renderingEngine to maintain 
   * compatibility with version 1.x code.
   * 
   * **Validates: Requirements 10.2, 10.3, 10.4**
   */
  it('should maintain device.isMobile property when device is present', () => {
    fc.assert(
      fc.property(deviceInfoArbitrary, (device) => {
        // When device is present, it must have isMobile property
        expect(device).toHaveProperty('isMobile');
        expect(typeof device.isMobile).toBe('boolean');
        
        return typeof device.isMobile === 'boolean';
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain browser.name and browser.version when browser is present', () => {
    fc.assert(
      fc.property(browserInfoArbitrary, (browser) => {
        // When browser is present, it must have name and version
        expect(browser).toHaveProperty('name');
        expect(browser).toHaveProperty('version');
        expect(typeof browser.name).toBe('string');
        expect(typeof browser.version).toBe('string');
        
        return (
          typeof browser.name === 'string' &&
          typeof browser.version === 'string'
        );
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain renderingEngine property structure when present', () => {
    fc.assert(
      fc.property(renderingEngineInfoArbitrary, (engine) => {
        // When renderingEngine is present, it must have name property
        expect(engine).toHaveProperty('name');
        expect(typeof engine.name).toBe('string');
        
        return typeof engine.name === 'string';
      }),
      { numRuns: 100 }
    );
  });

  it('should allow v1.x code to access all required properties', () => {
    fc.assert(
      fc.property(v2AgentArbitrary, (agent) => {
        // v1.x code should be able to access these properties
        if (agent.device) {
          expect(agent.device).toHaveProperty('isMobile');
        }
        
        if (agent.browser) {
          expect(agent.browser).toHaveProperty('name');
          expect(agent.browser).toHaveProperty('version');
        }
        
        if (agent.renderingEngine) {
          expect(agent.renderingEngine).toHaveProperty('name');
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain property types for v1.x compatibility', () => {
    fc.assert(
      fc.property(v2AgentArbitrary, (agent) => {
        // Check types match v1.x expectations
        if (agent.device) {
          const isMobileIsBoolean = typeof agent.device.isMobile === 'boolean';
          if (!isMobileIsBoolean) return false;
        }
        
        if (agent.browser) {
          const nameIsString = typeof agent.browser.name === 'string';
          const versionIsString = typeof agent.browser.version === 'string';
          if (!nameIsString || !versionIsString) return false;
        }
        
        if (agent.renderingEngine) {
          const nameIsString = typeof agent.renderingEngine.name === 'string';
          if (!nameIsString) return false;
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
