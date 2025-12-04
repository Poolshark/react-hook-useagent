import type { DeviceInfo, NavigatorUAData, Platform, Device } from '../types';

/**
 * Enhanced device type detection module
 * 
 * This module provides comprehensive device detection including:
 * - Mobile phone detection (isMobile: true, deviceType: "mobile")
 * - Tablet detection (isMobile: false, deviceType: "tablet")
 * - Desktop detection (isMobile: false, deviceType: "desktop")
 * - Chrome OS platform detection
 * - iPad detection (including modern iPads masquerading as Mac)
 * - Android tablet distinction from phones
 */

/**
 * Detects device information from User-Agent string
 * 
 * Provides comprehensive device detection including:
 * - Platform identification (Android, iOS, Windows, Mac OS, Linux, Chrome OS)
 * - Device type classification (mobile phone, tablet, desktop)
 * - Mobile flag determination
 * - Special handling for modern iPads (iPadOS 13+) that masquerade as Mac
 * - Android tablet distinction from phones
 * 
 * @param navigator - The Navigator object containing userAgent and maxTouchPoints
 * @returns Device information with platform, device type, and mobile flag, or undefined if detection fails
 * 
 * @example
 * ```typescript
 * const device = detectDeviceFromUA(window.navigator);
 * if (device) {
 *   console.log(`Platform: ${device.platform}, Device: ${device.device}, Mobile: ${device.isMobile}`);
 * }
 * ```
 */
export function detectDeviceFromUA(navigator: Navigator): DeviceInfo | undefined {
  try {
    const userAgent = navigator.userAgent;

    // Handle empty or invalid user agent strings
    if (!userAgent || typeof userAgent !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid or empty User-Agent string in device detection');
      }
      return undefined;
    }

    let platform: Platform = "Unknown";
    let device: Device = "Unknown";
    let isMobile = false;

    // Android detection
    if (/Android/i.test(userAgent)) {
      platform = "Android";
      // Android tablets don't have "Mobile" in UA string
      isMobile = /Mobile/i.test(userAgent);
      device = isMobile ? "Android" : "Tablet";
    }
    // iPhone detection
    else if (/iPhone/i.test(userAgent)) {
      platform = "iOS";
      isMobile = true;
      device = "iPhone";
    }
    // iPad detection (older iPads)
    else if (/iPad/i.test(userAgent)) {
      platform = "iOS";
      isMobile = false;
      device = "iPad";
    }
    // iPod detection
    else if (/iPod/i.test(userAgent)) {
      platform = "iOS";
      isMobile = true;
      device = "iPod";
    }
    // Windows detection
    else if (/Win/i.test(userAgent)) {
      platform = "Windows";
      isMobile = /Mobile/i.test(userAgent);
      device = isMobile ? "Unknown" : "Desktop PC";
    }
    // Mac detection (including modern iPads masquerading as Mac)
    else if (/Mac/i.test(userAgent)) {
      platform = "Mac OS";
      // Modern iPads (iPadOS 13+) report as Mac with touch support
      if (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
        isMobile = false;
        device = "iPad";
        platform = "iOS";
      } else {
        isMobile = false;
        device = "Desktop PC";
      }
    }
    // Chrome OS detection
    else if (/CrOS/i.test(userAgent)) {
      platform = "Chrome OS";
      isMobile = false;
      device = "Desktop PC";
    }
    // Linux detection
    else if (/Linux/i.test(userAgent)) {
      platform = "Linux";
      isMobile = /Mobile/i.test(userAgent);
      device = isMobile ? "Unknown" : "Desktop PC";
    }

    // If no platform was detected, log in development mode
    if (platform === "Unknown" && process.env.NODE_ENV === 'development') {
      console.warn('Unrecognized platform in User-Agent string:', userAgent);
    }

    return {
      isMobile,
      platform,
      device,
    };
  } catch (error) {
    // Never throw errors for unrecognized patterns
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error detecting device from User-Agent:', error);
    }
    return undefined;
  }
}

/**
 * Detects device information from Client Hints API
 * 
 * Extracts device information from the modern User-Agent Client Hints API,
 * providing structured platform and mobile status data. This is the preferred
 * detection method when available, as it provides clean, structured data
 * without string parsing.
 * 
 * @see https://wicg.github.io/ua-client-hints/#interface - NavigatorUAData interface
 * 
 * @param userAgentData - The navigator.userAgentData object from Client Hints API
 * @returns Device information with platform, device type, and mobile flag
 * 
 * @example
 * ```typescript
 * if ('userAgentData' in navigator) {
 *   const device = detectDeviceFromClientHints(navigator.userAgentData);
 *   console.log(device.platform); // "Windows"
 * }
 * ```
 */
export function detectDeviceFromClientHints(userAgentData: NavigatorUAData): DeviceInfo {
  try {
    const platform = mapPlatform(userAgentData.platform);
    const isMobile = userAgentData.mobile;
    const device = determineDevice(isMobile, platform);

    return {
      isMobile,
      platform,
      device,
    };
  } catch (error) {
    // Never throw errors - return default device info
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error detecting device from Client Hints:', error);
    }
    return {
      isMobile: false,
      platform: 'Unknown',
      device: 'Unknown',
    };
  }
}

/**
 * Maps Client Hints platform string to our Platform type
 * 
 * Converts the platform string from Client Hints API (which may vary in format)
 * to our standardized Platform type. Performs case-insensitive matching to handle
 * variations in platform naming across browsers.
 * 
 * @param platformString - Platform string from Client Hints (e.g., "Windows", "macOS", "Linux")
 * @returns Mapped platform type from our Platform enum, or "Unknown" if unrecognized
 */
function mapPlatform(platformString: string): Platform {
  const platformLower = platformString.toLowerCase();

  if (platformLower.includes('android')) return 'Android';
  if (platformLower.includes('windows')) return 'Windows';
  if (platformLower.includes('mac')) return 'Mac OS';
  if (platformLower.includes('linux')) return 'Linux';
  if (platformLower.includes('chrome os') || platformLower.includes('chromeos')) return 'Chrome OS';

  // iOS detection from platform (though iOS doesn't support Client Hints yet)
  if (platformLower.includes('ios') || platformLower.includes('iphone') || platformLower.includes('ipad')) {
    return 'iOS';
  }

  return 'Unknown';
}

/**
 * Determines device type based on mobile flag and platform
 * 
 * Maps the combination of mobile flag and platform to a specific device type.
 * This provides more granular device identification than just the mobile flag.
 * 
 * Logic:
 * - Android + mobile → "Android" (phone)
 * - Android + not mobile → "Tablet"
 * - iOS + mobile → "iPhone"
 * - iOS + not mobile → "iPad"
 * - Other + mobile → "Unknown" (mobile device)
 * - Other + not mobile → "Desktop PC"
 * 
 * @param isMobile - Mobile flag from Client Hints
 * @param platform - Platform type (Android, iOS, Windows, etc.)
 * @returns Specific device type (Android, iPhone, iPad, Tablet, Desktop PC, Unknown)
 */
function determineDevice(isMobile: boolean, platform: Platform): Device {
  if (platform === 'Android') {
    return isMobile ? 'Android' : 'Tablet';
  }

  if (platform === 'iOS') {
    return isMobile ? 'iPhone' : 'iPad';
  }

  if (isMobile) {
    return 'Unknown'; // Mobile device but not Android/iOS
  }

  return 'Desktop PC';
}

/**
 * Determines device type classification (mobile/tablet/desktop)
 * 
 * Classifies devices into three categories based on mobile flag and device type:
 * - Mobile phones: isMobile: true, deviceType: "mobile"
 * - Tablets: isMobile: false, deviceType: "tablet" (includes iPad)
 * - Desktops: isMobile: false, deviceType: "desktop"
 * 
 * This provides a simplified device classification that's useful for responsive
 * design and device-specific logic.
 * 
 * @param isMobile - Mobile flag indicating if device is a mobile phone
 * @param device - Specific device type (Android, iPhone, iPad, Desktop PC, etc.)
 * @returns Simplified device type classification: 'mobile', 'tablet', or 'desktop'
 * 
 * @example
 * ```typescript
 * const deviceType = getDeviceTypeClassification(false, 'iPad');
 * console.log(deviceType); // "tablet"
 * 
 * const phoneType = getDeviceTypeClassification(true, 'iPhone');
 * console.log(phoneType); // "mobile"
 * ```
 */
export function getDeviceTypeClassification(
  isMobile: boolean,
  device: Device
): 'mobile' | 'tablet' | 'desktop' {
  // Tablets are explicitly identified
  if (device === 'Tablet' || device === 'iPad') {
    return 'tablet';
  }

  // Mobile phones
  if (isMobile) {
    return 'mobile';
  }

  // Desktop computers
  return 'desktop';
}

/**
 * Checks if a device is an iPad (including modern iPads)
 * 
 * Detects both older and modern iPads:
 * - Older iPads (pre-iPadOS 13): Explicitly identify as "iPad" in User-Agent
 * - Modern iPads (iPadOS 13+): Masquerade as "Macintosh" but have touch support
 * 
 * Modern iPad detection uses navigator.maxTouchPoints > 1 combined with Mac
 * platform detection, as iPadOS 13+ reports itself as Mac to receive desktop
 * websites by default.
 * 
 * @see https://developer.apple.com/forums/thread/119186 - iPadOS User-Agent changes
 * 
 * @param navigator - The Navigator object with userAgent and maxTouchPoints
 * @returns true if device is an iPad (any generation), false otherwise
 * 
 * @example
 * ```typescript
 * if (isIPad(window.navigator)) {
 *   // Apply iPad-specific optimizations
 *   console.log('iPad detected');
 * }
 * ```
 */
export function isIPad(navigator: Navigator): boolean {
  const userAgent = navigator.userAgent;

  // Older iPads explicitly identify as iPad
  if (/iPad/i.test(userAgent)) {
    return true;
  }

  // Modern iPads (iPadOS 13+) masquerade as Mac with touch support
  if (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
    return true;
  }

  return false;
}

/**
 * Checks if an Android device is a tablet
 * 
 * Distinguishes Android tablets from phones by checking for "Android" in the
 * User-Agent string without the "Mobile" keyword. Android phones include
 * "Mobile" in their UA string, while tablets do not.
 * 
 * This is the standard method for Android tablet detection as recommended
 * by Google's Android documentation.
 * 
 * @see https://developer.android.com/guide/webapps/targeting - Android web targeting
 * 
 * @param userAgent - User-Agent string to analyze
 * @returns true if device is an Android tablet, false otherwise
 * 
 * @example
 * ```typescript
 * const ua = 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36';
 * if (isAndroidTablet(ua)) {
 *   console.log('Android tablet detected');
 * }
 * ```
 */
export function isAndroidTablet(userAgent: string): boolean {
  // Must have Android in UA string
  if (!/Android/i.test(userAgent)) {
    return false;
  }

  // Tablets don't have "Mobile" keyword
  return !/Mobile/i.test(userAgent);
}
