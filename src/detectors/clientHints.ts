import type {
  Agent,
  BrowserInfo,
  DeviceInfo,
  NavigatorUAData,
  UADataValues,
  UseUserAgentOptions,
  BrowserName,
  Platform,
  Device,
} from '../types';
import { detectDeviceFromClientHints, getDeviceTypeClassification } from './device';

/**
 * Detects browser and device information using User-Agent Client Hints API
 * 
 * This function uses the modern navigator.userAgentData API to extract browser
 * and device information in a privacy-preserving manner. It handles both
 * synchronous low-entropy values and asynchronous high-entropy values.
 * 
 * The User-Agent Client Hints API is a W3C standard that provides structured
 * browser and platform information while respecting user privacy. Low-entropy
 * values are provided by default, while high-entropy values require explicit
 * permission and may trigger browser permission prompts.
 * 
 * @see https://wicg.github.io/ua-client-hints/ - User-Agent Client Hints specification
 * @see https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API - MDN documentation
 * 
 * @param userAgentData - The navigator.userAgentData object from the Client Hints API
 * @param options - Detection options including high entropy requests
 * @param options.highEntropy - Whether to request high-entropy values (requires permission)
 * @param options.hints - Specific high-entropy hints to request (architecture, model, etc.)
 * @returns Promise resolving to Agent data (if high entropy requested) or synchronous Agent data
 * 
 * @example
 * ```typescript
 * // Basic usage (synchronous)
 * const agent = detectFromClientHints(navigator.userAgentData);
 * 
 * // With high entropy values (asynchronous)
 * const agent = await detectFromClientHints(navigator.userAgentData, { 
 *   highEntropy: true 
 * });
 * 
 * // With specific hints
 * const agent = await detectFromClientHints(navigator.userAgentData, {
 *   highEntropy: true,
 *   hints: ['architecture', 'model']
 * });
 * ```
 */
export function detectFromClientHints(
  userAgentData: NavigatorUAData,
  options?: UseUserAgentOptions
): Agent | Promise<Agent> {
  try {
    // Validate input
    if (!userAgentData) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid userAgentData provided to detectFromClientHints');
      }
      // Return minimal agent data
      return {
        device: undefined,
        browser: undefined,
        renderingEngine: undefined,
        detectionMethod: 'client-hints',
      };
    }

    // Extract low-entropy data synchronously
    const lowEntropyAgent = extractLowEntropyData(userAgentData);
    
    // If high entropy is not requested, return synchronously
    if (!options?.highEntropy) {
      return lowEntropyAgent;
    }
    
    // Request high entropy values asynchronously
    return getHighEntropyData(userAgentData, lowEntropyAgent, options);
  } catch (error) {
    // Never throw errors - return minimal agent data
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error in detectFromClientHints:', error);
    }
    return {
      device: undefined,
      browser: undefined,
      renderingEngine: undefined,
      detectionMethod: 'client-hints',
    };
  }
}

/**
 * Extracts low-entropy data from Client Hints API (synchronous)
 * 
 * Low-entropy data is provided by default without requiring user permission.
 * This includes:
 * - Browser brands and versions (from brands array)
 * - Platform (Windows, macOS, Linux, etc.)
 * - Mobile status (boolean flag)
 * 
 * Low-entropy values are privacy-preserving and don't reveal detailed device
 * information that could be used for fingerprinting.
 * 
 * @see https://wicg.github.io/ua-client-hints/#low-entropy-hint-table - Low-entropy hints specification
 * 
 * @param userAgentData - The navigator.userAgentData object from Client Hints API
 * @returns Agent data with low-entropy information (browser, device, detection method)
 */
function extractLowEntropyData(userAgentData: NavigatorUAData): Agent {
  try {
    const browser = extractBrowserFromBrands(userAgentData.brands);
    const device = detectDeviceFromClientHints(userAgentData);
    
    return {
      browser,
      device,
      detectionMethod: 'client-hints',
      deviceType: getDeviceTypeClassification(device.isMobile, device.device),
    };
  } catch (error) {
    // Never throw errors - return minimal agent data
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error extracting low-entropy data:', error);
    }
    return {
      device: undefined,
      browser: undefined,
      renderingEngine: undefined,
      detectionMethod: 'client-hints',
    };
  }
}

/**
 * Extracts browser information from the brands array
 * 
 * The brands array from Client Hints contains multiple entries including generic
 * brands like "Chromium" and specific brands like "Google Chrome", "Microsoft Edge",
 * etc. This function identifies the actual browser by checking for specific brands
 * in priority order.
 * 
 * The brands array may also include "grease" entries (fake brands starting with
 * "Not" or similar) to prevent passive fingerprinting. These are filtered out.
 * 
 * Priority order:
 * 1. Specific browsers (Edge, Brave, Samsung Internet, Vivaldi, Arc, Opera)
 * 2. Generic Chromium browsers (Chrome, Chromium)
 * 
 * @see https://wicg.github.io/ua-client-hints/#interface - NavigatorUAData.brands
 * @see https://wicg.github.io/ua-client-hints/#grease - GREASE specification
 * 
 * @param brands - Array of brand objects with brand name and version from Client Hints
 * @returns Browser information with name and version, or undefined if no recognizable browser found
 */
function extractBrowserFromBrands(
  brands: Array<{ brand: string; version: string }>
): BrowserInfo | undefined {
  try {
    if (!brands || brands.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Empty or invalid brands array in Client Hints');
      }
      return undefined;
    }
    
    // Priority order for browser detection
    // Check for specific browsers before generic ones
    const browserMap: Array<{ pattern: RegExp; name: BrowserName }> = [
      { pattern: /Microsoft Edge/i, name: 'Edge' },
      { pattern: /Brave/i, name: 'Brave' },
      { pattern: /Samsung Internet/i, name: 'Samsung Internet' },
      { pattern: /Vivaldi/i, name: 'Vivaldi' },
      { pattern: /Arc/i, name: 'Arc' },
      { pattern: /Opera/i, name: 'Opera' },
      { pattern: /Google Chrome/i, name: 'Chrome' },
      { pattern: /Chromium/i, name: 'Chromium' },
    ];
    
    for (const { pattern, name } of browserMap) {
      const match = brands.find(b => pattern.test(b.brand));
      if (match) {
        return {
          name,
          version: match.version,
        };
      }
    }
    
    // Fallback: use the first non-generic brand
    const nonGenericBrand = brands.find(
      b => !b.brand.includes('Not') && b.brand !== 'Chromium'
    );
    
    if (nonGenericBrand) {
      return {
        name: 'Unknown',
        version: nonGenericBrand.version,
      };
    }
    
    // No recognizable browser found
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unable to identify browser from brands:', brands);
    }
    
    return undefined;
  } catch (error) {
    // Never throw errors for unrecognized patterns
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error extracting browser from brands:', error);
    }
    return undefined;
  }
}



/**
 * Requests and merges high-entropy data with low-entropy data
 * 
 * High-entropy data requires explicit permission and may trigger browser permission
 * prompts. This data includes detailed device information that could be used for
 * fingerprinting, so browsers restrict access to protect user privacy.
 * 
 * High-entropy values include:
 * - Architecture: CPU architecture (x86, arm, etc.)
 * - Model: Device model name (e.g., "Pixel 5")
 * - Platform version: Detailed OS version
 * - Full browser version: Complete version string
 * 
 * The function implements a 5-second timeout to prevent hanging if the browser
 * doesn't respond. On timeout or error, it falls back to low-entropy data.
 * 
 * @see https://wicg.github.io/ua-client-hints/#high-entropy-hint-table - High-entropy hints specification
 * @see https://wicg.github.io/ua-client-hints/#getHighEntropyValues - getHighEntropyValues method
 * 
 * @param userAgentData - The navigator.userAgentData object from Client Hints API
 * @param lowEntropyAgent - Agent data with low-entropy information to merge with
 * @param options - Detection options with hints specification (which high-entropy values to request)
 * @returns Promise resolving to Agent data with high-entropy information merged in
 */
async function getHighEntropyData(
  userAgentData: NavigatorUAData,
  lowEntropyAgent: Agent,
  options: UseUserAgentOptions
): Promise<Agent> {
  try {
    // Default hints to request if not specified
    const hints = options.hints || [
      'architecture',
      'model',
      'platformVersion',
      'uaFullVersion',
    ];
    
    // Request high entropy values with timeout
    const highEntropyValues = await Promise.race([
      userAgentData.getHighEntropyValues(hints),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      ),
    ]) as UADataValues | null;
    
    if (!highEntropyValues) {
      // Timeout occurred, return low-entropy data
      return lowEntropyAgent;
    }
    
    // Merge high entropy data with low entropy data
    return mergeHighEntropyData(lowEntropyAgent, highEntropyValues);
  } catch (error) {
    // On error, fall back to low-entropy data
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to retrieve high entropy values:', error);
    }
    return lowEntropyAgent;
  }
}

/**
 * Merges high-entropy values into the agent data
 * 
 * Takes the low-entropy agent data and enriches it with high-entropy values
 * from the Client Hints API. This includes adding architecture, model, and
 * platform version to device info, and full version to browser info.
 * 
 * If fullVersionList is available (more accurate than brands), it's used to
 * update the browser information with more precise version data.
 * 
 * @param agent - Agent data with low-entropy information
 * @param highEntropyValues - High-entropy values from Client Hints API getHighEntropyValues()
 * @returns Agent data with merged high-entropy information
 */
function mergeHighEntropyData(
  agent: Agent,
  highEntropyValues: UADataValues
): Agent {
  const updatedAgent: Agent = { ...agent };
  
  // Update device info with high entropy data
  if (agent.device) {
    updatedAgent.device = {
      ...agent.device,
      architecture: highEntropyValues.architecture,
      model: highEntropyValues.model,
      platformVersion: highEntropyValues.platformVersion,
    };
  }
  
  // Update browser info with full version
  if (agent.browser && highEntropyValues.uaFullVersion) {
    updatedAgent.browser = {
      ...agent.browser,
      fullVersion: highEntropyValues.uaFullVersion,
    };
  }
  
  // If fullVersionList is available, use it to get more accurate browser info
  if (highEntropyValues.fullVersionList && highEntropyValues.fullVersionList.length > 0) {
    const browser = extractBrowserFromBrands(highEntropyValues.fullVersionList);
    if (browser) {
      updatedAgent.browser = {
        ...browser,
        fullVersion: highEntropyValues.uaFullVersion,
      };
    }
  }
  
  return updatedAgent;
}
