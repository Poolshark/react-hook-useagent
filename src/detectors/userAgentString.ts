import type { BrowserInfo, DeviceInfo, RenderingEngineInfo, BrowserName } from "../types";
import {
  BROWSER_PATTERNS,
  CHROMIUM_BROWSERS,
  GECKO_BROWSERS,
  WEBKIT_BROWSERS,
} from "../constants/patterns";
import { detectDeviceFromUA } from "./device";

/**
 * Detects browser from User-Agent string
 * 
 * This function parses the traditional User-Agent string to identify the browser
 * name and version. It handles modern browsers including Edge, Brave, Samsung Internet,
 * Vivaldi, and correctly disambiguates Chrome from other Chromium-based browsers.
 * 
 * Detection order matters: more specific browsers (Edge, Brave) are checked before
 * generic ones (Chrome) to avoid false positives.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent - User-Agent header documentation
 * 
 * @param navigator - The Navigator object containing the userAgent string
 * @returns Browser information with name and version, or undefined if unrecognized
 * 
 * @example
 * ```typescript
 * const browser = detectBrowser(window.navigator);
 * if (browser) {
 *   console.log(`${browser.name} ${browser.version}`);
 * }
 * ```
 */
export function detectBrowser(navigator: Navigator): BrowserInfo | undefined {
  try {
    const userAgent = navigator.userAgent;

    // Handle empty or invalid user agent strings
    if (!userAgent || typeof userAgent !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid or empty User-Agent string');
      }
      return undefined;
    }

    // Special case: Brave detection via navigator.brave API
    if ("brave" in navigator && typeof (navigator as any).brave?.isBrave === "function") {
      // Try to extract version from Chrome version in UA string
      const chromeMatch = userAgent.match(/Chrome\/([0-9.]+)/);
      return {
        name: "Brave",
        version: chromeMatch ? chromeMatch[1] : "Unknown",
      };
    }

    // Iterate through browser patterns in order
    for (const { name, pattern, versionPattern } of BROWSER_PATTERNS) {
      if (pattern.test(userAgent)) {
        // Special handling for Chrome - exclude other Chromium browsers
        if (name === "Chrome") {
          // Check if it's actually another Chromium browser
          const isOtherChromium =
            /Edg\//.test(userAgent) ||
            /SamsungBrowser\//.test(userAgent) ||
            /Vivaldi\//.test(userAgent) ||
            /OPR\//.test(userAgent);

          if (isOtherChromium) {
            continue; // Skip Chrome detection, continue to next pattern
          }
        }

        // Special handling for Firefox - exclude Seamonkey
        if (name === "Firefox" && /Seamonkey\//.test(userAgent)) {
          continue;
        }

        // Extract version
        let version = "Unknown";
        if (versionPattern) {
          const versionMatch = userAgent.match(versionPattern);
          if (versionMatch) {
            version = versionMatch[1];
          }
        }

        return {
          name,
          version,
        };
      }
    }

    // No match found - log in development mode only
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unrecognized User-Agent string:', userAgent);
    }

    return undefined;
  } catch (error) {
    // Never throw errors for unrecognized patterns
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error detecting browser:', error);
    }
    return undefined;
  }
}

/**
 * Detects rendering engine from browser information and User-Agent string
 * 
 * Maps browsers to their rendering engines:
 * - Chromium-based browsers (Chrome, Edge, Brave, Opera, Vivaldi) → Blink
 * - Firefox, Seamonkey → Gecko
 * - Safari → WebKit
 * 
 * Note: Modern Edge uses Blink, not EdgeHTML. EdgeHTML was only used in legacy Edge.
 * 
 * @see https://en.wikipedia.org/wiki/Browser_engine - Browser engine overview
 * 
 * @param browser - Browser name to map to rendering engine
 * @param navigator - Optional Navigator object for version extraction from User-Agent string
 * @returns Rendering engine information with name and version, or undefined if unrecognized
 * 
 * @example
 * ```typescript
 * const engine = detectRenderingEngine('Chrome', window.navigator);
 * console.log(engine?.name); // "Blink"
 * ```
 */
export function detectRenderingEngine(
  browser: BrowserName | undefined,
  navigator?: Navigator
): RenderingEngineInfo | undefined {
  try {
    if (!browser) {
      return undefined;
    }

    const userAgent = navigator?.userAgent || "";

    // Map browser to rendering engine
    let engineName: "Blink" | "Gecko" | "WebKit" | undefined;

    if (CHROMIUM_BROWSERS.includes(browser)) {
      engineName = "Blink";
    } else if (GECKO_BROWSERS.includes(browser)) {
      engineName = "Gecko";
    } else if (WEBKIT_BROWSERS.includes(browser)) {
      engineName = "WebKit";
    }

    if (!engineName) {
      // Unrecognized browser - log in development mode only
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unable to determine rendering engine for browser:', browser);
      }
      return undefined;
    }

    // Extract version based on engine type
    let version = "Unknown";

    if (engineName === "Blink" && userAgent) {
      // Try Chrome first, then Chromium
      const chromeMatch = userAgent.match(/Chrome\/([0-9.]+)/);
      const chromiumMatch = userAgent.match(/Chromium\/([0-9.]+)/);
      const match = chromeMatch || chromiumMatch;
      if (match) {
        version = match[1];
      }
    } else if (engineName === "Gecko" && userAgent) {
      const match = userAgent.match(/rv:([0-9.]+)/);
      if (match) {
        version = match[1];
      }
    } else if (engineName === "WebKit" && userAgent) {
      const match = userAgent.match(/AppleWebKit\/([0-9.]+)/);
      if (match) {
        version = match[1];
      }
    }

    return {
      name: engineName,
      version,
    };
  } catch (error) {
    // Never throw errors for unrecognized patterns
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error detecting rendering engine:', error);
    }
    return undefined;
  }
}

/**
 * Detects device information from User-Agent string
 * 
 * Extracts platform, device type, and mobile status from the User-Agent string.
 * Handles special cases like modern iPads (iPadOS 13+) that masquerade as Mac,
 * and Android tablets that lack the "Mobile" keyword.
 * 
 * @param navigator - The Navigator object containing the userAgent string
 * @returns Device information with platform, device type, and mobile flag, or undefined if unrecognized
 * 
 * @example
 * ```typescript
 * const device = detectDevice(window.navigator);
 * if (device) {
 *   console.log(`Platform: ${device.platform}, Mobile: ${device.isMobile}`);
 * }
 * ```
 */
export function detectDevice(navigator: Navigator): DeviceInfo | undefined {
  try {
    return detectDeviceFromUA(navigator);
  } catch (error) {
    // Never throw errors for unrecognized patterns
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error detecting device:', error);
    }
    return undefined;
  }
}
