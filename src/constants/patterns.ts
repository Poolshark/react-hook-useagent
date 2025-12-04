import type { BrowserName, RenderingEngine } from "../types";

/**
 * Browser detection patterns for User-Agent string parsing
 * 
 * This array defines regex patterns for detecting browsers from User-Agent strings.
 * The order is critical: more specific patterns (Edge, Samsung Internet, Vivaldi)
 * must come before generic ones (Chrome) to avoid false positives, since many
 * browsers are Chromium-based and include "Chrome" in their UA string.
 * 
 * Detection strategy:
 * 1. Check for specific Chromium variants first (Edge, Samsung, Vivaldi, Opera)
 * 2. Then check for Chrome (after excluding other Chromium browsers)
 * 3. Check for non-Chromium browsers (Firefox, Safari)
 * 4. Check for legacy browsers (Opera 12-)
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent - User-Agent header format
 */
export const BROWSER_PATTERNS: Array<{
  name: BrowserName;
  pattern: RegExp;
  versionPattern?: RegExp;
}> = [
  // Edge Chromium - must come before Chrome
  {
    name: "Edge",
    pattern: /Edg\//,
    versionPattern: /Edg\/([0-9.]+)/,
  },
  // Samsung Internet - must come before Chrome
  {
    name: "Samsung Internet",
    pattern: /SamsungBrowser\//,
    versionPattern: /SamsungBrowser\/([0-9.]+)/,
  },
  // Vivaldi - must come before Chrome
  {
    name: "Vivaldi",
    pattern: /Vivaldi\//,
    versionPattern: /Vivaldi\/([0-9.]+)/,
  },
  // Opera 15+ (Chromium-based) - must come before Chrome
  {
    name: "Opera15+",
    pattern: /OPR\//,
    versionPattern: /OPR\/([0-9.]+)/,
  },
  // Chrome - after all Chromium variants
  {
    name: "Chrome",
    pattern: /Chrome\//,
    versionPattern: /Chrome\/([0-9.]+)/,
  },
  // Chromium
  {
    name: "Chromium",
    pattern: /Chromium\//,
    versionPattern: /Chromium\/([0-9.]+)/,
  },
  // Firefox - exclude Seamonkey
  {
    name: "Firefox",
    pattern: /Firefox\//,
    versionPattern: /Firefox\/([0-9.]+)/,
  },
  // Seamonkey
  {
    name: "Seamonkey",
    pattern: /Seamonkey\//,
    versionPattern: /Seamonkey\/([0-9.]+)/,
  },
  // Safari
  {
    name: "Safari",
    pattern: /Safari\//,
    versionPattern: /Version\/([0-9.]+)/,
  },
  // Opera 12- (Presto-based) - obsolete
  {
    name: "Opera12-",
    pattern: /Opera\//,
    versionPattern: /Opera\/([0-9.]+)/,
  },
];

/**
 * Rendering engine detection patterns for User-Agent string parsing
 * 
 * Maps User-Agent string patterns to rendering engines:
 * - Blink: Chromium-based browsers (Chrome, Edge, Brave, Opera, Vivaldi)
 * - Gecko: Firefox and Seamonkey
 * - WebKit: Safari
 * 
 * Note: Modern Edge uses Blink, not EdgeHTML. EdgeHTML was only used in legacy Edge (pre-2020).
 * 
 * @see https://en.wikipedia.org/wiki/Browser_engine - Browser engine comparison
 */
export const ENGINE_PATTERNS: Array<{
  name: RenderingEngine;
  pattern: RegExp;
  versionPattern?: RegExp;
}> = [
  {
    name: "Blink",
    pattern: /Chrome\//,
    versionPattern: /Chrome\/([0-9.]+)/,
  },
  {
    name: "Gecko",
    pattern: /Gecko\//,
    versionPattern: /Gecko\/([0-9.]+)/,
  },
  {
    name: "WebKit",
    pattern: /AppleWebKit\//,
    versionPattern: /AppleWebKit\/([0-9.]+)/,
  },
];

/**
 * Chromium-based browsers that use the Blink rendering engine
 * 
 * All these browsers are built on Chromium and use the Blink rendering engine.
 * This list is used to map browser names to their rendering engine.
 * 
 * @see https://www.chromium.org/Home - Chromium project
 */
export const CHROMIUM_BROWSERS: BrowserName[] = [
  "Chrome",
  "Chromium",
  "Edge",
  "Brave",
  "Samsung Internet",
  "Vivaldi",
  "Opera15+",
];

/**
 * Gecko-based browsers that use the Gecko rendering engine
 * 
 * Gecko is Mozilla's rendering engine used in Firefox and related browsers.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Gecko - Gecko engine documentation
 */
export const GECKO_BROWSERS: BrowserName[] = ["Firefox", "Seamonkey"];

/**
 * WebKit-based browsers that use the WebKit rendering engine
 * 
 * WebKit is Apple's rendering engine used in Safari and other Apple browsers.
 * Note: Chrome and other Chromium browsers forked from WebKit to create Blink.
 * 
 * @see https://webkit.org/ - WebKit project
 */
export const WEBKIT_BROWSERS: BrowserName[] = ["Safari"];
