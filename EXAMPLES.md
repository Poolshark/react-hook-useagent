# TypeScript Usage Examples

This document provides comprehensive TypeScript examples for using react-hook-useagent.

## Table of Contents

- [Basic Usage](#basic-usage)
- [High Entropy Usage](#high-entropy-usage)
- [SSR Usage Patterns](#ssr-usage-patterns)
- [Type Definitions](#type-definitions)
- [Advanced Patterns](#advanced-patterns)
- [Real-World Examples](#real-world-examples)

## Basic Usage

### Simple Detection

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

function BasicExample() {
  const agent: Agent = useUserAgent();

  return (
    <div>
      <h2>Browser Information</h2>
      <p>Name: {agent.browser?.name}</p>
      <p>Version: {agent.browser?.version}</p>
      
      <h2>Device Information</h2>
      <p>Platform: {agent.device?.platform}</p>
      <p>Mobile: {agent.device?.isMobile ? 'Yes' : 'No'}</p>
      <p>Device Type: {agent.deviceType}</p>
      
      <h2>Rendering Engine</h2>
      <p>Engine: {agent.renderingEngine?.name}</p>
      <p>Version: {agent.renderingEngine?.version}</p>
    </div>
  );
}
```

### Destructuring with Types

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { BrowserInfo, DeviceInfo, RenderingEngineInfo } from 'react-hook-useagent';

function DestructuredExample() {
  const { browser, device, renderingEngine, deviceType } = useUserAgent();

  // Type-safe access
  const browserInfo: BrowserInfo | undefined = browser;
  const deviceInfo: DeviceInfo | undefined = device;
  const engineInfo: RenderingEngineInfo | undefined = renderingEngine;

  return (
    <div>
      {browser && <p>Browser: {browser.name} {browser.version}</p>}
      {device && <p>Platform: {device.platform}</p>}
      {renderingEngine && <p>Engine: {renderingEngine.name}</p>}
      {deviceType && <p>Device Type: {deviceType}</p>}
    </div>
  );
}
```

### Type Guards

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { Agent, BrowserName, Platform } from 'react-hook-useagent';

function TypeGuardExample() {
  const agent: Agent = useUserAgent();

  // Type guard for browser
  const isBrowser = (name: BrowserName): boolean => {
    return agent.browser?.name === name;
  };

  // Type guard for platform
  const isPlatform = (platform: Platform): boolean => {
    return agent.device?.platform === platform;
  };

  return (
    <div>
      {isBrowser('Chrome') && <p>Chrome-specific content</p>}
      {isBrowser('Safari') && <p>Safari-specific content</p>}
      {isPlatform('iOS') && <p>iOS-specific content</p>}
      {isPlatform('Android') && <p>Android-specific content</p>}
    </div>
  );
}
```

## High Entropy Usage

### Basic High Entropy Request

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { Agent, UseUserAgentOptions } from 'react-hook-useagent';

function HighEntropyExample() {
  const options: UseUserAgentOptions = {
    highEntropy: true
  };

  const agent: Agent = useUserAgent(options);

  return (
    <div>
      <h2>High Entropy Data</h2>
      <p>Architecture: {agent.device?.architecture ?? 'Not available'}</p>
      <p>Model: {agent.device?.model ?? 'Not available'}</p>
      <p>Platform Version: {agent.device?.platformVersion ?? 'Not available'}</p>
      <p>Full Browser Version: {agent.browser?.fullVersion ?? 'Not available'}</p>
      <p>Detection Method: {agent.detectionMethod}</p>
    </div>
  );
}
```

### Specific Hints Request

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { UseUserAgentOptions } from 'react-hook-useagent';

function SpecificHintsExample() {
  // Request only specific high-entropy values
  const options: UseUserAgentOptions = {
    highEntropy: true,
    hints: ['architecture', 'model']
  };

  const agent = useUserAgent(options);

  return (
    <div>
      <p>Architecture: {agent.device?.architecture}</p>
      <p>Model: {agent.device?.model}</p>
      {/* platformVersion and fullVersion won't be available */}
    </div>
  );
}
```

### Conditional High Entropy

```typescript
import { useState } from 'react';
import { useUserAgent } from 'react-hook-useagent';
import type { UseUserAgentOptions } from 'react-hook-useagent';

function ConditionalHighEntropyExample() {
  const [requestDetails, setRequestDetails] = useState(false);

  const options: UseUserAgentOptions | undefined = requestDetails
    ? { highEntropy: true }
    : undefined;

  const agent = useUserAgent(options);

  return (
    <div>
      <button onClick={() => setRequestDetails(true)}>
        Request Detailed Info
      </button>
      
      {requestDetails && agent.device?.model && (
        <p>Device Model: {agent.device.model}</p>
      )}
    </div>
  );
}
```

## SSR Usage Patterns

### Basic SSR Handling

```typescript
import { useUserAgent, isSSR } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

function SSRExample() {
  const agent: Agent = useUserAgent();

  // Check if running in SSR
  if (isSSR()) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Browser: {agent.browser?.name}</p>
      <p>Platform: {agent.device?.platform}</p>
    </div>
  );
}
```

### SSR with Fallback Content

```typescript
import { useUserAgent, isSSR } from 'react-hook-useagent';

function SSRFallbackExample() {
  const agent = useUserAgent();

  const browserName = isSSR() 
    ? 'Unknown (SSR)' 
    : agent.browser?.name ?? 'Unknown';

  const isMobile = isSSR() 
    ? false 
    : agent.device?.isMobile ?? false;

  return (
    <div>
      <p>Browser: {browserName}</p>
      <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Next.js SSR Example

```typescript
import { useEffect, useState } from 'react';
import { useUserAgent, isSSR } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

function NextJSExample() {
  const [mounted, setMounted] = useState(false);
  const agent: Agent = useUserAgent();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Browser: {agent.browser?.name}</p>
      <p>Device: {agent.deviceType}</p>
    </div>
  );
}
```

### Remix SSR Example

```typescript
import { useUserAgent, isSSR } from 'react-hook-useagent';

export default function RemixExample() {
  const agent = useUserAgent();

  // Remix handles hydration automatically
  return (
    <div>
      {!isSSR() && (
        <>
          <p>Browser: {agent.browser?.name}</p>
          <p>Platform: {agent.device?.platform}</p>
        </>
      )}
    </div>
  );
}
```

## Type Definitions

### All Exported Types

```typescript
import type {
  // Main types
  Agent,
  BrowserInfo,
  DeviceInfo,
  RenderingEngineInfo,
  UseUserAgentOptions,
  
  // Literal types
  BrowserName,
  Platform,
  Device,
  RenderingEngine,
  
  // Client Hints API types
  NavigatorUAData,
  UADataValues,
  
  // Legacy types
  Browsers, // Deprecated: use BrowserName
} from 'react-hook-useagent';
```

### Type Definitions Reference

```typescript
// Agent - Main return type
interface Agent {
  device?: DeviceInfo;
  browser?: BrowserInfo;
  renderingEngine?: RenderingEngineInfo;
  detectionMethod?: 'client-hints' | 'user-agent-string' | 'ssr';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

// BrowserInfo
interface BrowserInfo {
  name: BrowserName;
  version: string;
  fullVersion?: string; // From high-entropy Client Hints
}

// DeviceInfo
interface DeviceInfo {
  isMobile: boolean;
  platform: Platform;
  device: Device;
  architecture?: string;      // From high-entropy Client Hints
  model?: string;             // From high-entropy Client Hints
  platformVersion?: string;   // From high-entropy Client Hints
}

// RenderingEngineInfo
interface RenderingEngineInfo {
  name: RenderingEngine;
  version: string;
}

// UseUserAgentOptions
interface UseUserAgentOptions {
  highEntropy?: boolean;
  hints?: Array<'architecture' | 'model' | 'platform' | 'platformVersion' | 'uaFullVersion'>;
}

// Literal types
type BrowserName = 
  | "Chrome" | "Chromium" | "Edge" | "Firefox" | "Safari" 
  | "Opera" | "Brave" | "Samsung Internet" | "Vivaldi" | "Arc" 
  | "Seamonkey" | "Opera15+" | "Opera12-" | "Unknown";

type Platform = 
  | "Android" | "iOS" | "Windows" | "Linux" 
  | "Mac OS" | "Chrome OS" | "Unknown";

type Device = 
  | "Android" | "iPhone" | "iPad" | "iPod" 
  | "Desktop PC" | "Tablet" | "Unknown";

type RenderingEngine = 
  | "Blink" | "Gecko" | "WebKit" | "Unknown";
```

### Custom Type Helpers

```typescript
import type { Agent, BrowserName, Platform } from 'react-hook-useagent';

// Helper type for browser checks
type BrowserCheck = {
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isBrave: boolean;
};

function getBrowserChecks(agent: Agent): BrowserCheck {
  const name = agent.browser?.name;
  return {
    isChrome: name === 'Chrome',
    isFirefox: name === 'Firefox',
    isSafari: name === 'Safari',
    isEdge: name === 'Edge',
    isBrave: name === 'Brave',
  };
}

// Helper type for platform checks
type PlatformCheck = {
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  isAndroid: boolean;
  isIOS: boolean;
};

function getPlatformChecks(agent: Agent): PlatformCheck {
  const platform = agent.device?.platform;
  return {
    isWindows: platform === 'Windows',
    isMac: platform === 'Mac OS',
    isLinux: platform === 'Linux',
    isAndroid: platform === 'Android',
    isIOS: platform === 'iOS',
  };
}
```

## Advanced Patterns

### Custom Hook Wrapper

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

interface ExtendedAgent extends Agent {
  isDesktop: boolean;
  isMobileDevice: boolean;
  isTabletDevice: boolean;
  isChromiumBased: boolean;
}

function useExtendedUserAgent(): ExtendedAgent {
  const agent = useUserAgent();

  return {
    ...agent,
    isDesktop: agent.deviceType === 'desktop',
    isMobileDevice: agent.deviceType === 'mobile',
    isTabletDevice: agent.deviceType === 'tablet',
    isChromiumBased: ['Chrome', 'Edge', 'Brave', 'Opera', 'Vivaldi'].includes(
      agent.browser?.name ?? ''
    ),
  };
}

// Usage
function MyComponent() {
  const agent = useExtendedUserAgent();

  return (
    <div>
      {agent.isChromiumBased && <p>Chromium-based browser detected</p>}
      {agent.isTabletDevice && <p>Tablet device detected</p>}
    </div>
  );
}
```

### Memoized Detection

```typescript
import { useMemo } from 'react';
import { useUserAgent } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

function useMemoizedUserAgent() {
  const agent = useUserAgent();

  const memoizedAgent = useMemo(() => ({
    agent,
    isMobile: agent.device?.isMobile ?? false,
    isIOS: agent.device?.platform === 'iOS',
    isAndroid: agent.device?.platform === 'Android',
    browserName: agent.browser?.name ?? 'Unknown',
  }), [agent]);

  return memoizedAgent;
}
```

### Context Provider Pattern

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useUserAgent } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

const UserAgentContext = createContext<Agent | null>(null);

interface UserAgentProviderProps {
  children: ReactNode;
}

export function UserAgentProvider({ children }: UserAgentProviderProps) {
  const agent = useUserAgent();

  return (
    <UserAgentContext.Provider value={agent}>
      {children}
    </UserAgentContext.Provider>
  );
}

export function useUserAgentContext(): Agent {
  const context = useContext(UserAgentContext);
  if (!context) {
    throw new Error('useUserAgentContext must be used within UserAgentProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <UserAgentProvider>
      <MyComponent />
    </UserAgentProvider>
  );
}

function MyComponent() {
  const agent = useUserAgentContext();
  return <div>{agent.browser?.name}</div>;
}
```

### Comparison Utility

```typescript
import { areAgentsEqual } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

function AgentComparison() {
  const agent1: Agent = {
    browser: { name: 'Chrome', version: '120.0.0.0' },
    device: { isMobile: false, platform: 'Windows', device: 'Desktop PC' },
  };

  const agent2: Agent = {
    browser: { name: 'Chrome', version: '120.0.0.0' },
    device: { isMobile: false, platform: 'Windows', device: 'Desktop PC' },
  };

  const areEqual = areAgentsEqual(agent1, agent2);
  console.log('Agents equal:', areEqual); // true
}
```

## Real-World Examples

### Responsive Layout Selector

```typescript
import { useUserAgent } from 'react-hook-useagent';

type LayoutType = 'mobile' | 'tablet' | 'desktop';

function useLayout(): LayoutType {
  const { deviceType } = useUserAgent();
  return deviceType ?? 'desktop';
}

function ResponsiveApp() {
  const layout = useLayout();

  switch (layout) {
    case 'mobile':
      return <MobileLayout />;
    case 'tablet':
      return <TabletLayout />;
    case 'desktop':
      return <DesktopLayout />;
  }
}

function MobileLayout() {
  return <div>Mobile Layout</div>;
}

function TabletLayout() {
  return <div>Tablet Layout</div>;
}

function DesktopLayout() {
  return <div>Desktop Layout</div>;
}
```

### Browser-Specific Styling

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { BrowserName } from 'react-hook-useagent';

function useBrowserClass(): string {
  const { browser } = useUserAgent();
  const browserName: BrowserName = browser?.name ?? 'Unknown';
  
  const classMap: Record<BrowserName, string> = {
    'Chrome': 'browser-chrome',
    'Firefox': 'browser-firefox',
    'Safari': 'browser-safari',
    'Edge': 'browser-edge',
    'Brave': 'browser-brave',
    'Samsung Internet': 'browser-samsung',
    'Vivaldi': 'browser-vivaldi',
    'Arc': 'browser-arc',
    'Opera': 'browser-opera',
    'Opera15+': 'browser-opera',
    'Opera12-': 'browser-opera-legacy',
    'Chromium': 'browser-chromium',
    'Seamonkey': 'browser-seamonkey',
    'Unknown': 'browser-unknown',
  };

  return classMap[browserName] || 'browser-unknown';
}

function BrowserSpecificComponent() {
  const browserClass = useBrowserClass();

  return (
    <div className={browserClass}>
      <p>This div has browser-specific styling</p>
    </div>
  );
}
```

### Feature Detection Fallback

```typescript
import { useUserAgent } from 'react-hook-useagent';

function useSupportsFeature(feature: string): boolean {
  const { browser } = useUserAgent();

  // Check if browser supports a feature
  const supportMap: Record<string, string[]> = {
    'webp': ['Chrome', 'Edge', 'Firefox', 'Opera', 'Brave'],
    'avif': ['Chrome', 'Edge', 'Opera', 'Brave'],
    'webgl2': ['Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Brave'],
  };

  const supportedBrowsers = supportMap[feature] || [];
  return supportedBrowsers.includes(browser?.name ?? '');
}

function ImageComponent() {
  const supportsWebP = useSupportsFeature('webp');
  const supportsAVIF = useSupportsFeature('avif');

  const imageFormat = supportsAVIF ? 'avif' : supportsWebP ? 'webp' : 'jpg';

  return <img src={`/image.${imageFormat}`} alt="Optimized image" />;
}
```

### Analytics Integration

```typescript
import { useEffect } from 'react';
import { useUserAgent } from 'react-hook-useagent';
import type { Agent } from 'react-hook-useagent';

interface AnalyticsData {
  browser: string;
  browserVersion: string;
  platform: string;
  deviceType: string;
  isMobile: boolean;
  detectionMethod: string;
}

function useAnalytics() {
  const agent: Agent = useUserAgent();

  useEffect(() => {
    if (agent.browser && agent.device) {
      const analyticsData: AnalyticsData = {
        browser: agent.browser.name,
        browserVersion: agent.browser.version,
        platform: agent.device.platform,
        deviceType: agent.deviceType ?? 'unknown',
        isMobile: agent.device.isMobile,
        detectionMethod: agent.detectionMethod ?? 'unknown',
      };

      // Send to analytics service
      console.log('Analytics:', analyticsData);
      // analytics.track('page_view', analyticsData);
    }
  }, [agent]);
}

function AnalyticsApp() {
  useAnalytics();
  return <div>App with analytics</div>;
}
```

### Progressive Enhancement

```typescript
import { useUserAgent } from 'react-hook-useagent';

function useProgressiveEnhancement() {
  const { browser, device } = useUserAgent();

  const capabilities = {
    supportsModernCSS: browser?.name !== 'Opera12-',
    supportsES6: browser?.name !== 'Opera12-',
    supportsWebGL: !device?.isMobile || device?.platform === 'iOS',
    supportsServiceWorker: ['Chrome', 'Edge', 'Firefox', 'Safari'].includes(
      browser?.name ?? ''
    ),
  };

  return capabilities;
}

function ProgressiveApp() {
  const capabilities = useProgressiveEnhancement();

  return (
    <div>
      {capabilities.supportsWebGL ? (
        <WebGLComponent />
      ) : (
        <Canvas2DComponent />
      )}
      
      {capabilities.supportsServiceWorker && (
        <OfflineIndicator />
      )}
    </div>
  );
}

function WebGLComponent() {
  return <div>WebGL Content</div>;
}

function Canvas2DComponent() {
  return <div>Canvas 2D Fallback</div>;
}

function OfflineIndicator() {
  return <div>Offline support enabled</div>;
}
```

### Device-Specific Optimization

```typescript
import { useUserAgent } from 'react-hook-useagent';
import type { UseUserAgentOptions } from 'react-hook-useagent';

function useDeviceOptimization() {
  const options: UseUserAgentOptions = {
    highEntropy: true,
    hints: ['architecture', 'model']
  };

  const agent = useUserAgent(options);

  const optimization = {
    imageQuality: agent.device?.isMobile ? 'medium' : 'high',
    videoQuality: agent.device?.isMobile ? '720p' : '1080p',
    enableAnimations: !agent.device?.isMobile,
    lazyLoadThreshold: agent.device?.isMobile ? 100 : 300,
  };

  return optimization;
}

function OptimizedApp() {
  const optimization = useDeviceOptimization();

  return (
    <div>
      <p>Image Quality: {optimization.imageQuality}</p>
      <p>Video Quality: {optimization.videoQuality}</p>
      <p>Animations: {optimization.enableAnimations ? 'Enabled' : 'Disabled'}</p>
    </div>
  );
}
```

## Best Practices

### Always Handle Undefined

```typescript
// ✅ Good - handles undefined
const browserName = agent.browser?.name ?? 'Unknown';

// ❌ Bad - may throw error
const browserName = agent.browser.name;
```

### Use Type Guards

```typescript
// ✅ Good - type-safe
if (agent.browser && agent.browser.name === 'Chrome') {
  // TypeScript knows browser is defined
  console.log(agent.browser.version);
}

// ❌ Bad - may access undefined
if (agent.browser?.name === 'Chrome') {
  console.log(agent.browser.version); // browser might be undefined
}
```

### Memoize Expensive Computations

```typescript
import { useMemo } from 'react';

// ✅ Good - memoized
const isModernBrowser = useMemo(() => {
  const version = parseInt(agent.browser?.version ?? '0');
  return version >= 90;
}, [agent.browser?.version]);

// ❌ Bad - computed on every render
const isModernBrowser = parseInt(agent.browser?.version ?? '0') >= 90;
```

### Handle SSR Properly

```typescript
// ✅ Good - SSR-safe
if (!isSSR() && agent.browser) {
  // Safe to use browser APIs
  window.localStorage.setItem('browser', agent.browser.name);
}

// ❌ Bad - will fail in SSR
window.localStorage.setItem('browser', agent.browser?.name ?? '');
```

## Additional Resources

- [Main README](./README.md)
- [Migration Guide](./MIGRATION.md)
- [User-Agent Client Hints Specification](https://wicg.github.io/ua-client-hints/)
- [MDN: User-Agent Client Hints API](https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API)
