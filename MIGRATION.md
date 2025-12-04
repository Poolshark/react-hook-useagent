# Migration Guide: v1.x to v2.0

This guide helps you upgrade from react-hook-useagent v1.x to v2.0.

## Overview

Version 2.0 modernizes the library to use the W3C User-Agent Client Hints API while maintaining full backward compatibility with v1.x. **No breaking changes** - your existing code will continue to work without modifications.

## What's New in v2.0

### Major Features

1. **User-Agent Client Hints API Support**
   - Modern, privacy-preserving browser detection
   - Structured data instead of string parsing
   - Automatic fallback to UA string for older browsers

2. **Enhanced Browser Detection**
   - Edge (Chromium-based)
   - Brave
   - Samsung Internet
   - Vivaldi
   - Arc

3. **Improved Device Classification**
   - New `deviceType` property: `"mobile"`, `"tablet"`, or `"desktop"`
   - Better iPad detection (including iPadOS 13+)
   - Android tablet distinction

4. **High-Entropy Data (Optional)**
   - Device architecture
   - Device model
   - Platform version
   - Full browser version

5. **New Properties**
   - `detectionMethod`: Indicates which API was used
   - `deviceType`: Simplified device classification
   - `device.architecture`: CPU architecture (high-entropy)
   - `device.model`: Device model (high-entropy)
   - `device.platformVersion`: Platform version (high-entropy)
   - `browser.fullVersion`: Full browser version (high-entropy)

## Breaking Changes

**None!** Version 2.0 is fully backward compatible with v1.x.

## Upgrade Steps

### Step 1: Update Package

```bash
# NPM
npm install react-hook-useagent@latest

# Yarn
yarn upgrade react-hook-useagent

# Bun
bun update react-hook-useagent
```

### Step 2: Verify Existing Code

Your existing code will continue to work without changes:

```typescript
// v1.x code - still works in v2.0
const { device, browser, renderingEngine } = useUserAgent();

console.log(device.isMobile);        // ✅ Works
console.log(browser.name);           // ✅ Works
console.log(browser.version);        // ✅ Works
console.log(renderingEngine.name);   // ✅ Works
```

### Step 3: Adopt New Features (Optional)

Take advantage of new features when ready:

```typescript
// Use new deviceType property
const { deviceType } = useUserAgent();
if (deviceType === 'tablet') {
  // Tablet-specific logic
}

// Request high-entropy data
const agent = useUserAgent({ highEntropy: true });
console.log(agent.device?.architecture); // "x86"
console.log(agent.device?.model);        // "Pixel 5"

// Check detection method
console.log(agent.detectionMethod); // "client-hints" or "user-agent-string"
```

## API Changes

### Hook Signature

**v1.x:**
```typescript
const agent = useUserAgent();
```

**v2.0:**
```typescript
// Still works - backward compatible
const agent = useUserAgent();

// New optional parameters
const agent = useUserAgent({ highEntropy: true });
const agent = useUserAgent({ 
  highEntropy: true, 
  hints: ['architecture', 'model'] 
});
```

### Return Type Changes

All v1.x properties remain unchanged. New properties are optional:

**v1.x Return Type:**
```typescript
{
  device: {
    isMobile: boolean;
    platform: "Android" | "iOS" | "Windows" | "Linux" | "Mac OS";
    device: "Android" | "iPhone" | "iPad" | "iPod" | "Desktop PC";
  };
  browser: {
    name: "Chrome" | "Chromium" | "Firefox" | "Safari" | "Opera15+" | "Opera12-";
    version: string;
  };
  renderingEngine: {
    name: "Blink" | "Gecko" | "WebKit" | "EdgeHTML";
    version: string;
  };
}
```

**v2.0 Return Type:**
```typescript
{
  device?: {
    isMobile: boolean;
    platform: "Android" | "iOS" | "Windows" | "Linux" | "Mac OS" | "Chrome OS" | "Unknown";
    device: "Android" | "iPhone" | "iPad" | "iPod" | "Desktop PC" | "Tablet" | "Unknown";
    // New optional properties
    architecture?: string;
    model?: string;
    platformVersion?: string;
  };
  browser?: {
    name: "Chrome" | "Edge" | "Firefox" | "Safari" | "Brave" | "Samsung Internet" | 
          "Vivaldi" | "Arc" | "Opera" | "Chromium" | "Seamonkey" | "Opera15+" | 
          "Opera12-" | "Unknown";
    version: string;
    // New optional property
    fullVersion?: string;
  };
  renderingEngine?: {
    name: "Blink" | "Gecko" | "WebKit" | "Unknown";
    version: string;
  };
  // New optional properties
  detectionMethod?: "client-hints" | "user-agent-string" | "ssr";
  deviceType?: "mobile" | "tablet" | "desktop";
}
```

### Type Changes

#### Browser Names

**Added:**
- `"Edge"` - Microsoft Edge (Chromium)
- `"Brave"` - Brave Browser
- `"Samsung Internet"` - Samsung Internet
- `"Vivaldi"` - Vivaldi Browser
- `"Arc"` - Arc Browser
- `"Seamonkey"` - Seamonkey Browser
- `"Unknown"` - Unrecognized browsers

**Unchanged:**
- `"Chrome"`
- `"Chromium"`
- `"Firefox"`
- `"Safari"`
- `"Opera15+"`
- `"Opera12-"`

#### Platform Names

**Added:**
- `"Chrome OS"` - Chrome OS
- `"Unknown"` - Unrecognized platforms

**Unchanged:**
- `"Android"`
- `"iOS"`
- `"Windows"`
- `"Linux"`
- `"Mac OS"`

#### Device Names

**Added:**
- `"Tablet"` - Generic tablet
- `"Unknown"` - Unrecognized devices

**Unchanged:**
- `"Android"`
- `"iPhone"`
- `"iPad"`
- `"iPod"`
- `"Desktop PC"`

#### Rendering Engines

**Removed:**
- `"EdgeHTML"` - Legacy Edge engine (modern Edge uses Blink)
- `"Presto"` - Legacy Opera engine

**Added:**
- `"Unknown"` - Unrecognized engines

**Unchanged:**
- `"Blink"`
- `"Gecko"`
- `"WebKit"`

**Note:** EdgeHTML and Presto are still detected for legacy browsers but mapped to "Unknown" in the type system.

## Code Examples

### Before and After

#### Example 1: Basic Usage

**v1.x:**
```typescript
import { useUserAgent } from "react-hook-useagent";

function MyComponent() {
  const { device, browser } = useUserAgent();
  
  return (
    <div>
      <p>Browser: {browser.name}</p>
      <p>Mobile: {device.isMobile ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

**v2.0 (same code works):**
```typescript
import { useUserAgent } from "react-hook-useagent";

function MyComponent() {
  const { device, browser } = useUserAgent();
  
  return (
    <div>
      <p>Browser: {browser?.name}</p>
      <p>Mobile: {device?.isMobile ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

**Note:** Optional chaining (`?.`) is recommended in v2.0 since properties can be undefined in SSR environments.

#### Example 2: Device Detection

**v1.x:**
```typescript
function ResponsiveComponent() {
  const { device } = useUserAgent();
  
  if (device.isMobile) {
    return <MobileView />;
  }
  return <DesktopView />;
}
```

**v2.0 (improved):**
```typescript
function ResponsiveComponent() {
  const { deviceType } = useUserAgent();
  
  if (deviceType === 'mobile') {
    return <MobileView />;
  } else if (deviceType === 'tablet') {
    return <TabletView />;
  }
  return <DesktopView />;
}
```

#### Example 3: Browser-Specific Logic

**v1.x:**
```typescript
function BrowserSpecific() {
  const { browser } = useUserAgent();
  
  const isSafari = browser.name === 'Safari';
  
  return <div className={isSafari ? 'safari' : 'other'}>Content</div>;
}
```

**v2.0 (same code works, now detects more browsers):**
```typescript
function BrowserSpecific() {
  const { browser } = useUserAgent();
  
  const isSafari = browser?.name === 'Safari';
  const isBrave = browser?.name === 'Brave';
  const isEdge = browser?.name === 'Edge';
  
  return <div className={isSafari ? 'safari' : 'other'}>Content</div>;
}
```

### New Features Examples

#### High-Entropy Data

```typescript
function DetailedDeviceInfo() {
  const agent = useUserAgent({ highEntropy: true });
  
  return (
    <div>
      <p>Architecture: {agent.device?.architecture}</p>
      <p>Model: {agent.device?.model}</p>
      <p>Platform Version: {agent.device?.platformVersion}</p>
      <p>Full Browser Version: {agent.browser?.fullVersion}</p>
    </div>
  );
}
```

#### Detection Method

```typescript
function DetectionInfo() {
  const { detectionMethod } = useUserAgent();
  
  return (
    <div>
      <p>Detection Method: {detectionMethod}</p>
      {detectionMethod === 'client-hints' && (
        <p>Using modern Client Hints API ✨</p>
      )}
    </div>
  );
}
```

#### SSR Handling

```typescript
import { useUserAgent, isSSR } from "react-hook-useagent";

function SSRSafeComponent() {
  const agent = useUserAgent();
  
  if (isSSR()) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <p>Browser: {agent.browser?.name}</p>
    </div>
  );
}
```

## TypeScript Migration

### Type Imports

**v1.x:**
```typescript
import { useUserAgent } from "react-hook-useagent";
// Types were inferred
```

**v2.0:**
```typescript
import { 
  useUserAgent,
  Agent,
  BrowserInfo,
  DeviceInfo,
  RenderingEngineInfo,
  UseUserAgentOptions
} from "react-hook-useagent";

// Explicit typing
const agent: Agent = useUserAgent();
const options: UseUserAgentOptions = { highEntropy: true };
```

### Handling Optional Properties

In v2.0, all properties are optional to handle SSR and detection failures:

```typescript
function SafeComponent() {
  const agent = useUserAgent();
  
  // Use optional chaining
  const browserName = agent.browser?.name ?? 'Unknown';
  const isMobile = agent.device?.isMobile ?? false;
  
  // Or check explicitly
  if (agent.browser) {
    console.log(agent.browser.name);
  }
}
```

## Common Migration Patterns

### Pattern 1: Mobile Detection

**v1.x:**
```typescript
const { device } = useUserAgent();
const isMobile = device.isMobile;
```

**v2.0 (recommended):**
```typescript
const { device, deviceType } = useUserAgent();
const isMobile = device?.isMobile ?? false;
const isPhone = deviceType === 'mobile';
const isTablet = deviceType === 'tablet';
```

### Pattern 2: Platform Detection

**v1.x:**
```typescript
const { device } = useUserAgent();
const isIOS = device.platform === 'iOS';
```

**v2.0 (same, with optional chaining):**
```typescript
const { device } = useUserAgent();
const isIOS = device?.platform === 'iOS';
```

### Pattern 3: Browser Version Comparison

**v1.x:**
```typescript
const { browser } = useUserAgent();
const version = parseInt(browser.version);
if (version < 90) {
  // Old browser
}
```

**v2.0 (same, with optional chaining):**
```typescript
const { browser } = useUserAgent();
const version = browser?.version ? parseInt(browser.version) : 0;
if (version < 90) {
  // Old browser
}
```

## Deprecation Notices

### No Deprecations

All v1.x APIs remain supported. No features have been deprecated.

### Future Considerations

- **EdgeHTML**: While still detected, EdgeHTML is obsolete (legacy Edge only)
- **Opera12-**: Legacy Opera versions are rarely encountered
- **Presto**: Legacy Opera rendering engine

These remain in the type system for backward compatibility but are unlikely to be encountered in modern browsers.

## Testing Your Migration

### Verification Checklist

- [ ] Install v2.0 package
- [ ] Run existing tests - all should pass
- [ ] Verify browser detection works in Chrome, Firefox, Safari, Edge
- [ ] Test mobile detection on iOS and Android devices
- [ ] Test SSR if applicable
- [ ] Check TypeScript compilation (no errors)
- [ ] Verify production build works

### Browser Testing

Test in these browsers to verify detection:

- Chrome (should detect as "Chrome" or use Client Hints)
- Edge (should detect as "Edge", not "Chrome")
- Firefox (should detect as "Firefox")
- Safari (should detect as "Safari")
- Brave (should detect as "Brave" if identifiable)
- Samsung Internet (should detect on Samsung devices)

### Device Testing

- Desktop: Should show `deviceType: "desktop"`
- Mobile phone: Should show `deviceType: "mobile"`, `isMobile: true`
- Tablet: Should show `deviceType: "tablet"`, `isMobile: false`
- iPad: Should correctly detect as "iPad" even on iPadOS 13+

## Troubleshooting

### Issue: Properties are undefined

**Cause:** Running in SSR environment or detection failed

**Solution:**
```typescript
import { isSSR } from "react-hook-useagent";

if (isSSR()) {
  // Handle SSR case
}

// Use optional chaining and defaults
const browserName = agent.browser?.name ?? 'Unknown';
```

### Issue: TypeScript errors about optional properties

**Cause:** v2.0 makes all properties optional for safety

**Solution:**
```typescript
// Add optional chaining
agent.browser?.name  // Instead of agent.browser.name

// Or check explicitly
if (agent.browser) {
  console.log(agent.browser.name);
}
```

### Issue: Edge detected as Chrome

**Cause:** Detection order issue (should not happen in v2.0)

**Solution:** Update to latest v2.0 version. Edge detection is prioritized correctly.

### Issue: iPad detected as Mac

**Cause:** iPadOS 13+ masquerades as Mac

**Solution:** v2.0 handles this automatically using `maxTouchPoints`. Ensure you're using v2.0+.

## Getting Help

If you encounter issues during migration:

1. Check this migration guide
2. Review the [README.md](./README.md) for updated documentation
3. Check existing [GitHub Issues](https://github.com/Poolshark/react-hook-useagent/issues)
4. Open a new issue with:
   - Your v1.x code
   - Expected behavior
   - Actual behavior
   - Browser/device information

## Summary

Version 2.0 is a **non-breaking upgrade** that adds modern features while maintaining full backward compatibility. You can upgrade immediately and adopt new features at your own pace.

**Key Takeaways:**
- ✅ No breaking changes
- ✅ Existing code works without modifications
- ✅ New features are opt-in
- ✅ Better browser and device detection
- ✅ Privacy-conscious with Client Hints API
- ✅ SSR-safe by default

Happy upgrading! 🚀
