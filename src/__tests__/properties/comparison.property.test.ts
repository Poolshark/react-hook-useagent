import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { areAgentsEqual } from '../../utils/comparison';
import type { Agent, BrowserName, Platform, Device, RenderingEngine } from '../../types';

/**
 * Property-Based Tests for Agent Comparison Utility
 * 
 * Feature: modernize-user-agent-detection, Property 16: No Unnecessary Updates
 * Validates: Requirements 7.2
 * 
 * These tests verify that the areAgentsEqual function correctly identifies
 * when two Agent objects are equal, preventing unnecessary state updates.
 */

// Arbitraries (generators) for Agent types
const browserNameArb = fc.constantFrom<BrowserName>(
  'Chrome', 'Chromium', 'Edge', 'Firefox', 'Safari', 'Opera',
  'Brave', 'Samsung Internet', 'Vivaldi', 'Arc', 'Seamonkey',
  'Opera15+', 'Opera12-', 'Unknown'
);

const platformArb = fc.constantFrom<Platform>(
  'Android', 'iOS', 'Windows', 'Linux', 'Mac OS', 'Chrome OS', 'Unknown'
);

const deviceArb = fc.constantFrom<Device>(
  'Android', 'iPhone', 'iPad', 'iPod', 'Desktop PC', 'Tablet', 'Unknown'
);

const renderingEngineArb = fc.constantFrom<RenderingEngine>(
  'Blink', 'Gecko', 'WebKit', 'Unknown'
);

const browserInfoArb = fc.record({
  name: browserNameArb,
  version: fc.string({ minLength: 1, maxLength: 20 }),
  fullVersion: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined })
});

const deviceInfoArb = fc.record({
  isMobile: fc.boolean(),
  platform: platformArb,
  device: deviceArb,
  architecture: fc.option(fc.constantFrom('x86', 'arm', 'arm64'), { nil: undefined }),
  model: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
  platformVersion: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined })
});

const renderingEngineInfoArb = fc.record({
  name: renderingEngineArb,
  version: fc.string({ minLength: 1, maxLength: 20 })
});

const agentArb = fc.record({
  device: fc.option(deviceInfoArb, { nil: undefined }),
  browser: fc.option(browserInfoArb, { nil: undefined }),
  renderingEngine: fc.option(renderingEngineInfoArb, { nil: undefined }),
  detectionMethod: fc.option(fc.constantFrom('client-hints', 'user-agent-string', 'ssr'), { nil: undefined }),
  deviceType: fc.option(fc.constantFrom('mobile', 'tablet', 'desktop'), { nil: undefined })
});

describe('Property 16: No Unnecessary Updates', () => {
  it('should return true for identical agent objects (reflexivity)', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        // An agent should always equal itself
        expect(areAgentsEqual(agent, agent)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should return true for deep clones of the same agent (structural equality)', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        // Create a deep clone
        const clone = JSON.parse(JSON.stringify(agent)) as Agent;
        
        // Cloned agents with same values should be equal
        expect(areAgentsEqual(agent, clone)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should be symmetric (if a equals b, then b equals a)', () => {
    fc.assert(
      fc.property(agentArb, agentArb, (a, b) => {
        const aEqualsB = areAgentsEqual(a, b);
        const bEqualsA = areAgentsEqual(b, a);
        
        // Symmetry property
        expect(aEqualsB).toBe(bEqualsA);
      }),
      { numRuns: 100 }
    );
  });

  it('should be transitive (if a equals b and b equals c, then a equals c)', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        // Create two clones
        const clone1 = JSON.parse(JSON.stringify(agent)) as Agent;
        const clone2 = JSON.parse(JSON.stringify(agent)) as Agent;
        
        const aEqualsB = areAgentsEqual(agent, clone1);
        const bEqualsC = areAgentsEqual(clone1, clone2);
        const aEqualsC = areAgentsEqual(agent, clone2);
        
        // If a equals b and b equals c, then a must equal c
        if (aEqualsB && bEqualsC) {
          expect(aEqualsC).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should return false when browser name differs', () => {
    fc.assert(
      fc.property(agentArb, browserNameArb, browserNameArb, (agent, name1, name2) => {
        fc.pre(name1 !== name2); // Only test when names are different
        
        const agent1 = {
          ...agent,
          browser: { name: name1, version: '1.0' }
        };
        const agent2 = {
          ...agent,
          browser: { name: name2, version: '1.0' }
        };
        
        expect(areAgentsEqual(agent1, agent2)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false when browser version differs', () => {
    fc.assert(
      fc.property(agentArb, fc.string(), fc.string(), (agent, version1, version2) => {
        fc.pre(version1 !== version2); // Only test when versions are different
        
        const agent1 = {
          ...agent,
          browser: { name: 'Chrome' as BrowserName, version: version1 }
        };
        const agent2 = {
          ...agent,
          browser: { name: 'Chrome' as BrowserName, version: version2 }
        };
        
        expect(areAgentsEqual(agent1, agent2)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false when device isMobile differs', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        const agent1 = {
          ...agent,
          device: {
            isMobile: true,
            platform: 'Android' as Platform,
            device: 'Android' as Device
          }
        };
        const agent2 = {
          ...agent,
          device: {
            isMobile: false,
            platform: 'Android' as Platform,
            device: 'Android' as Device
          }
        };
        
        expect(areAgentsEqual(agent1, agent2)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should return false when detection method differs', () => {
    fc.assert(
      fc.property(agentArb, (agent) => {
        const agent1 = { ...agent, detectionMethod: 'client-hints' as const };
        const agent2 = { ...agent, detectionMethod: 'user-agent-string' as const };
        
        expect(areAgentsEqual(agent1, agent2)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle undefined and null values correctly', () => {
    const emptyAgent1: Agent = {};
    const emptyAgent2: Agent = {};
    
    expect(areAgentsEqual(emptyAgent1, emptyAgent2)).toBe(true);
    
    const agentWithUndefined: Agent = {
      device: undefined,
      browser: undefined,
      renderingEngine: undefined
    };
    
    expect(areAgentsEqual(emptyAgent1, agentWithUndefined)).toBe(true);
  });
});
