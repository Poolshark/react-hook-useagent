import type { Agent, DeviceInfo, BrowserInfo, RenderingEngineInfo } from '../types';

/**
 * Efficiently compares two Agent objects for equality using shallow comparison
 * 
 * This function performs a shallow comparison of Agent objects to determine if they
 * are equal. It avoids using JSON.stringify for performance reasons and instead
 * compares each property individually.
 * 
 * This is used to prevent unnecessary state updates in the useUserAgent hook when
 * the detected agent information hasn't actually changed.
 * 
 * @param a - First agent object to compare
 * @param b - Second agent object to compare
 * @returns true if objects are equal, false otherwise
 * 
 * @example
 * ```typescript
 * const agent1 = { browser: { name: 'Chrome', version: '120' } };
 * const agent2 = { browser: { name: 'Chrome', version: '120' } };
 * areAgentsEqual(agent1, agent2); // true
 * ```
 */
export function areAgentsEqual(a: Agent, b: Agent): boolean {
  // Quick reference equality check
  if (a === b) return true;
  
  // Check if both are null/undefined
  if (!a || !b) return a === b;
  
  // Compare detection method
  if (a.detectionMethod !== b.detectionMethod) return false;
  
  // Compare device type
  if (a.deviceType !== b.deviceType) return false;
  
  // Compare device info
  if (!areDeviceInfoEqual(a.device, b.device)) return false;
  
  // Compare browser info
  if (!areBrowserInfoEqual(a.browser, b.browser)) return false;
  
  // Compare rendering engine info
  if (!areRenderingEngineInfoEqual(a.renderingEngine, b.renderingEngine)) return false;
  
  return true;
}

/**
 * Compares two DeviceInfo objects for equality
 * 
 * Performs shallow comparison of all DeviceInfo properties including
 * high-entropy values (architecture, model, platformVersion).
 * 
 * @param a - First DeviceInfo object
 * @param b - Second DeviceInfo object
 * @returns true if all properties are equal, false otherwise
 */
function areDeviceInfoEqual(a?: DeviceInfo, b?: DeviceInfo): boolean {
  // Quick reference equality check
  if (a === b) return true;
  
  // Check if both are null/undefined
  if (!a || !b) return a === b;
  
  return (
    a.isMobile === b.isMobile &&
    a.platform === b.platform &&
    a.device === b.device &&
    a.architecture === b.architecture &&
    a.model === b.model &&
    a.platformVersion === b.platformVersion
  );
}

/**
 * Compares two BrowserInfo objects for equality
 * 
 * Performs shallow comparison of all BrowserInfo properties including
 * the optional fullVersion from high-entropy Client Hints.
 * 
 * @param a - First BrowserInfo object
 * @param b - Second BrowserInfo object
 * @returns true if all properties are equal, false otherwise
 */
function areBrowserInfoEqual(a?: BrowserInfo, b?: BrowserInfo): boolean {
  // Quick reference equality check
  if (a === b) return true;
  
  // Check if both are null/undefined
  if (!a || !b) return a === b;
  
  return (
    a.name === b.name &&
    a.version === b.version &&
    a.fullVersion === b.fullVersion
  );
}

/**
 * Compares two RenderingEngineInfo objects for equality
 * 
 * Performs shallow comparison of rendering engine name and version.
 * 
 * @param a - First RenderingEngineInfo object
 * @param b - Second RenderingEngineInfo object
 * @returns true if all properties are equal, false otherwise
 */
function areRenderingEngineInfoEqual(a?: RenderingEngineInfo, b?: RenderingEngineInfo): boolean {
  // Quick reference equality check
  if (a === b) return true;
  
  // Check if both are null/undefined
  if (!a || !b) return a === b;
  
  return (
    a.name === b.name &&
    a.version === b.version
  );
}
