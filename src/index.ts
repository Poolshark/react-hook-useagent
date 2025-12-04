/**
 * react-hook-useagent
 * 
 * A React Hook for detecting browser, device, and rendering engine information
 * using modern W3C User-Agent Client Hints API with fallback to User-Agent string parsing.
 * 
 * @see https://wicg.github.io/ua-client-hints/
 * @packageDocumentation
 */

// ============================================================================
// Main Hook Export
// ============================================================================

/**
 * React Hook for detecting user agent information
 * 
 * This hook provides browser, device, and rendering engine detection using
 * the modern User-Agent Client Hints API when available, with automatic
 * fallback to traditional User-Agent string parsing.
 * 
 * Features:
 * - Modern Client Hints API support
 * - Automatic fallback to UA string parsing
 * - SSR-safe (returns undefined values during server-side rendering)
 * - Optional high-entropy data requests
 * - TypeScript support with full type definitions
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const agent = useUserAgent();
 * console.log(agent.browser?.name); // "Chrome"
 * console.log(agent.device?.isMobile); // false
 * 
 * // With high entropy values
 * const agent = useUserAgent({ highEntropy: true });
 * console.log(agent.device?.architecture); // "x86"
 * console.log(agent.device?.model); // "Pixel 5"
 * ```
 * 
 * @param options - Optional configuration for detection behavior
 * @returns Agent object containing browser, device, and rendering engine information
 */
export { useUserAgent } from "./useUserAgent";

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Main Agent interface returned by useUserAgent hook
 * 
 * Contains optional properties for browser, device, and rendering engine information.
 * All properties are optional to handle cases where detection is not possible.
 */
export type { Agent } from "./types";

/**
 * Browser information interface
 * 
 * Contains browser name, version, and optionally full version from high-entropy Client Hints.
 */
export type { BrowserInfo } from "./types";

/**
 * Device information interface
 * 
 * Contains mobile flag, platform, device type, and optional high-entropy data
 * like architecture, model, and platform version.
 */
export type { DeviceInfo } from "./types";

/**
 * Rendering engine information interface
 * 
 * Contains rendering engine name (Blink, Gecko, WebKit) and version.
 */
export type { RenderingEngineInfo } from "./types";

/**
 * Options interface for useUserAgent hook
 * 
 * Allows requesting high-entropy values and specifying which hints to request.
 */
export type { UseUserAgentOptions } from "./types";

/**
 * Browser name literal type
 * 
 * Includes all supported browsers: Chrome, Edge, Firefox, Safari, Brave,
 * Samsung Internet, Vivaldi, Arc, Opera, and legacy browsers.
 */
export type { BrowserName } from "./types";

/**
 * Platform literal type
 * 
 * Includes: Android, iOS, Windows, Linux, Mac OS, Chrome OS, Unknown
 */
export type { Platform } from "./types";

/**
 * Device literal type
 * 
 * Includes: Android, iPhone, iPad, iPod, Desktop PC, Tablet, Unknown
 */
export type { Device } from "./types";

/**
 * Rendering engine literal type
 * 
 * Includes: Blink (Chromium-based), Gecko (Firefox), WebKit (Safari), Unknown
 */
export type { RenderingEngine } from "./types";

/**
 * User-Agent Client Hints API interface
 * 
 * TypeScript interface for the navigator.userAgentData object.
 * @see https://wicg.github.io/ua-client-hints/#interface
 */
export type { NavigatorUAData } from "./types";

/**
 * High-entropy values interface from Client Hints API
 * 
 * Contains detailed device and browser information that requires explicit permission.
 * @see https://wicg.github.io/ua-client-hints/#getHighEntropyValues
 */
export type { UADataValues } from "./types";

/**
 * Legacy type alias for backward compatibility
 * @deprecated Use BrowserName instead
 */
export type { Browsers } from "./types";

// ============================================================================
// Utility Function Exports
// ============================================================================

/**
 * Checks if code is running in a Server-Side Rendering (SSR) environment
 * 
 * This utility detects SSR by checking for the absence of the window object.
 * Useful for conditional logic that should only run client-side.
 * 
 * @returns true if running in SSR environment, false if client-side
 * 
 * @example
 * ```typescript
 * import { isSSR } from 'react-hook-useagent';
 * 
 * if (isSSR()) {
 *   // Skip browser-specific logic
 *   return defaultValue;
 * }
 * // Safe to access window, navigator, etc.
 * ```
 */
export { isSSR } from "./utils/ssr";

/**
 * Efficiently compares two Agent objects for equality
 * 
 * Uses shallow comparison to determine if two Agent objects are equal.
 * Useful for preventing unnecessary state updates or re-renders.
 * 
 * @param a - First agent object to compare
 * @param b - Second agent object to compare
 * @returns true if objects are equal, false otherwise
 * 
 * @example
 * ```typescript
 * import { areAgentsEqual } from 'react-hook-useagent';
 * 
 * const agent1 = { browser: { name: 'Chrome', version: '120' } };
 * const agent2 = { browser: { name: 'Chrome', version: '120' } };
 * 
 * if (areAgentsEqual(agent1, agent2)) {
 *   // Agents are equal, skip update
 * }
 * ```
 */
export { areAgentsEqual } from "./utils/comparison";

// ============================================================================
// Detection Function Exports (Advanced Usage)
// ============================================================================

/**
 * Detects browser and device information using User-Agent Client Hints API
 * 
 * This is a low-level detection function that directly uses the Client Hints API.
 * Most users should use the useUserAgent hook instead.
 * 
 * @param userAgentData - The navigator.userAgentData object
 * @param options - Detection options including high entropy requests
 * @returns Promise resolving to Agent data or synchronous Agent data
 * 
 * @example
 * ```typescript
 * import { detectFromClientHints } from 'react-hook-useagent';
 * 
 * if ('userAgentData' in navigator) {
 *   const agent = await detectFromClientHints(
 *     navigator.userAgentData,
 *     { highEntropy: true }
 *   );
 * }
 * ```
 */
export { detectFromClientHints } from "./detectors/clientHints";

/**
 * Detects browser from User-Agent string
 * 
 * Low-level function for browser detection from UA string.
 * Most users should use the useUserAgent hook instead.
 * 
 * @param navigator - The Navigator object
 * @returns Browser information or undefined
 * 
 * @example
 * ```typescript
 * import { detectBrowser } from 'react-hook-useagent';
 * 
 * const browser = detectBrowser(window.navigator);
 * console.log(browser?.name); // "Chrome"
 * ```
 */
export { detectBrowser } from "./detectors/userAgentString";

/**
 * Detects device information from User-Agent string
 * 
 * Low-level function for device detection from UA string.
 * Most users should use the useUserAgent hook instead.
 * 
 * @param navigator - The Navigator object
 * @returns Device information or undefined
 * 
 * @example
 * ```typescript
 * import { detectDevice } from 'react-hook-useagent';
 * 
 * const device = detectDevice(window.navigator);
 * console.log(device?.platform); // "Windows"
 * ```
 */
export { detectDevice } from "./detectors/userAgentString";

/**
 * Detects rendering engine from browser information
 * 
 * Low-level function for rendering engine detection.
 * Most users should use the useUserAgent hook instead.
 * 
 * @param browser - Browser name
 * @param navigator - Navigator object for version extraction
 * @returns Rendering engine information or undefined
 * 
 * @example
 * ```typescript
 * import { detectRenderingEngine } from 'react-hook-useagent';
 * 
 * const engine = detectRenderingEngine('Chrome', window.navigator);
 * console.log(engine?.name); // "Blink"
 * ```
 */
export { detectRenderingEngine } from "./detectors/userAgentString";

/**
 * Detects device information from Client Hints API
 * 
 * Low-level function for device detection from Client Hints.
 * Most users should use the useUserAgent hook instead.
 * 
 * @param userAgentData - The navigator.userAgentData object
 * @returns Device information
 * 
 * @example
 * ```typescript
 * import { detectDeviceFromClientHints } from 'react-hook-useagent';
 * 
 * if ('userAgentData' in navigator) {
 *   const device = detectDeviceFromClientHints(navigator.userAgentData);
 * }
 * ```
 */
export { detectDeviceFromClientHints } from "./detectors/device";

/**
 * Detects device information from User-Agent string
 * 
 * Low-level function for device detection from UA string.
 * Most users should use the useUserAgent hook instead.
 * 
 * @param navigator - The Navigator object
 * @returns Device information or undefined
 * 
 * @example
 * ```typescript
 * import { detectDeviceFromUA } from 'react-hook-useagent';
 * 
 * const device = detectDeviceFromUA(window.navigator);
 * ```
 */
export { detectDeviceFromUA } from "./detectors/device";

/**
 * Determines device type classification (mobile/tablet/desktop)
 * 
 * Helper function that classifies devices based on mobile flag and device type.
 * 
 * @param isMobile - Mobile flag
 * @param device - Device type
 * @returns Device type classification: 'mobile', 'tablet', or 'desktop'
 * 
 * @example
 * ```typescript
 * import { getDeviceTypeClassification } from 'react-hook-useagent';
 * 
 * const deviceType = getDeviceTypeClassification(false, 'iPad');
 * console.log(deviceType); // "tablet"
 * ```
 */
export { getDeviceTypeClassification } from "./detectors/device";

/**
 * Checks if a device is an iPad (including modern iPads)
 * 
 * Detects both older iPads (explicit iPad in UA) and modern iPads
 * (iPadOS 13+ that masquerade as Mac with touch support).
 * 
 * @param navigator - The Navigator object
 * @returns true if device is an iPad
 * 
 * @example
 * ```typescript
 * import { isIPad } from 'react-hook-useagent';
 * 
 * if (isIPad(window.navigator)) {
 *   // Apply iPad-specific logic
 * }
 * ```
 */
export { isIPad } from "./detectors/device";

/**
 * Checks if an Android device is a tablet
 * 
 * Distinguishes Android tablets from phones by checking for
 * "Android" without "Mobile" keyword in the UA string.
 * 
 * @param userAgent - User-Agent string
 * @returns true if device is an Android tablet
 * 
 * @example
 * ```typescript
 * import { isAndroidTablet } from 'react-hook-useagent';
 * 
 * if (isAndroidTablet(navigator.userAgent)) {
 *   // Apply tablet-specific logic
 * }
 * ```
 */
export { isAndroidTablet } from "./detectors/device";
