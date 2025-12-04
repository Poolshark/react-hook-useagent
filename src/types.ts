// Client Hints API type definitions
export interface NavigatorUAData {
  brands: Array<{ brand: string; version: string }>;
  mobile: boolean;
  platform: string;
  getHighEntropyValues(hints: string[]): Promise<UADataValues>;
}

export interface UADataValues {
  brands: Array<{ brand: string; version: string }>;
  mobile: boolean;
  platform: string;
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  uaFullVersion?: string;
  fullVersionList?: Array<{ brand: string; version: string }>;
}

// Browser types
export type BrowserName =
  | "Chrome"
  | "Chromium"
  | "Edge"
  | "Firefox"
  | "Safari"
  | "Opera"
  | "Brave"
  | "Samsung Internet"
  | "Vivaldi"
  | "Arc"
  | "Seamonkey"
  | "Opera15+"
  | "Opera12-"
  | "Unknown";

export interface BrowserInfo {
  name: BrowserName;
  version: string;
  fullVersion?: string;
}

// Platform types
export type Platform =
  | "Android"
  | "iOS"
  | "Windows"
  | "Linux"
  | "Mac OS"
  | "Chrome OS"
  | "Unknown";

// Device types
export type Device =
  | "Android"
  | "iPhone"
  | "iPad"
  | "iPod"
  | "Desktop PC"
  | "Tablet"
  | "Unknown";

export interface DeviceInfo {
  isMobile: boolean;
  platform: Platform;
  device: Device;
  architecture?: string;
  model?: string;
  platformVersion?: string;
}

// Rendering Engine types
export type RenderingEngine =
  | "Blink"
  | "Gecko"
  | "WebKit"
  | "Unknown";

export interface RenderingEngineInfo {
  name: RenderingEngine;
  version: string;
}

// Hook options
export interface UseUserAgentOptions {
  highEntropy?: boolean;
  hints?: Array<'architecture' | 'model' | 'platform' | 'platformVersion' | 'uaFullVersion'>;
}

// Main Agent type
export interface Agent {
  device?: DeviceInfo;
  browser?: BrowserInfo;
  renderingEngine?: RenderingEngineInfo;
  detectionMethod?: 'client-hints' | 'user-agent-string' | 'ssr';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

// Legacy export for backward compatibility
export type Browsers = BrowserName;
