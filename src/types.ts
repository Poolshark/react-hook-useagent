import { useUserAgent } from ".";

export type Browsers =
  | "Chrome"
  | "Chromium"
  | "Firefox"
  | "Seamonkey"
  | "Opera15+"
  | "Opera12-"
  | "Safari"
  | "unknown";

export type Agent = {
  device?: {
    isMobile: boolean;
    platform: string;
    device: string;
  };
  browser?: {
    name: string;
    version: string;
  };
  renderingEngine?: {
    name: string;
    version: string;
  };
};
