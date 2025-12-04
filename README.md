# React Hook User Agent

A modern React Hook for detecting browser, device, and rendering engine information using the W3C User-Agent Client Hints API with automatic fallback to User-Agent string parsing.

## Features

- 🚀 **Modern API First**: Uses [User-Agent Client Hints API](https://wicg.github.io/ua-client-hints/) when available
- 🔄 **Automatic Fallback**: Gracefully falls back to User-Agent string parsing for older browsers
- 🎯 **Accurate Detection**: Supports modern browsers including Edge, Brave, Samsung Internet, Vivaldi, and Arc
- 📱 **Device Classification**: Distinguishes between mobile phones, tablets, and desktops
- 🔒 **Privacy-Conscious**: Respects browser privacy features with optional high-entropy data requests
- 🌐 **SSR-Safe**: Handles server-side rendering environments gracefully
- 📦 **TypeScript Support**: Full type definitions included
- ⚡ **Performance Optimized**: Single detection per mount, efficient state updates

## Installation

**NPM:**

```bash
npm install react-hook-useagent
```

**Yarn:**

```bash
yarn add react-hook-useagent
```

**Bun:**

```bash
bun add react-hook-useagent
```

## Quick Start

```typescript
import { useUserAgent } from "react-hook-useagent";

function MyComponent() {
  const agent = useUserAgent();

  return (
    <div>
      <p>Browser: {agent.browser?.name} {agent.browser?.version}</p>
      <p>Platform: {agent.device?.platform}</p>
      <p>Mobile: {agent.device?.isMobile ? 'Yes' : 'No'}</p>
      <p>Device Type: {agent.deviceType}</p>
    </div>
  );
}
```

## Usage

### Basic Usage

```typescript
import { useUserAgent } from "react-hook-useagent";

const MyComponent: React.FC = () => {
  const agent = useUserAgent();
  
  // Access individual properties
  console.log(agent.browser?.name);        // "Chrome"
  console.log(agent.browser?.version);     // "120.0.0.0"
  console.log(agent.device?.isMobile);     // false
  console.log(agent.device?.platform);     // "Windows"
  console.log(agent.deviceType);           // "desktop"
  console.log(agent.renderingEngine?.name); // "Blink"
};
```

### Destructuring

```typescript
const { device, browser, renderingEngine, deviceType } = useUserAgent();

if (device?.isMobile) {
  // Mobile-specific logic
}

if (browser?.name === "Safari") {
  // Safari-specific logic
}
```

### High Entropy Values

Request detailed device information (requires user permission in some browsers):

```typescript
const agent = useUserAgent({ highEntropy: true });

console.log(agent.device?.architecture);    // "x86"
console.log(agent.device?.model);           // "Pixel 5"
console.log(agent.device?.platformVersion); // "13.0.0"
console.log(agent.browser?.fullVersion);    // "120.0.6099.109"
```

### Specific High Entropy Hints

Request only specific high-entropy values:

```typescript
const agent = useUserAgent({
  highEntropy: true,
  hints: ['architecture', 'model']
});
```

Available hints:
- `architecture` - CPU architecture (e.g., "x86", "arm")
- `model` - Device model (e.g., "Pixel 5")
- `platform` - Detailed platform info
- `platformVersion` - Platform version
- `uaFullVersion` - Full browser version

### SSR (Server-Side Rendering)

The hook is SSR-safe and returns undefined values during server-side rendering:

```typescript
import { useUserAgent, isSSR } from "react-hook-useagent";

function MyComponent() {
  const agent = useUserAgent();
  
  if (isSSR()) {
    return <div>Loading...</div>;
  }
  
  return <div>Browser: {agent.browser?.name}</div>;
}
```

## Return Values

The `useUserAgent` hook returns an `Agent` object with the following structure:

```typescript
{
  device?: {
    isMobile: boolean;
    platform: "Android" | "iOS" | "Windows" | "Linux" | "Mac OS" | "Chrome OS" | "Unknown";
    device: "Android" | "iPhone" | "iPad" | "iPod" | "Desktop PC" | "Tablet" | "Unknown";
    // High-entropy values (optional)
    architecture?: string;      // e.g., "x86", "arm"
    model?: string;             // e.g., "Pixel 5"
    platformVersion?: string;   // e.g., "13.0.0"
  };
  browser?: {
    name: "Chrome" | "Edge" | "Firefox" | "Safari" | "Brave" | "Samsung Internet" | 
          "Vivaldi" | "Arc" | "Opera" | "Chromium" | "Seamonkey" | "Opera15+" | 
          "Opera12-" | "Unknown";
    version: string;
    fullVersion?: string;       // From high-entropy Client Hints
  };
  renderingEngine?: {
    name: "Blink" | "Gecko" | "WebKit" | "Unknown";
    version: string;
  };
  detectionMethod?: "client-hints" | "user-agent-string" | "ssr";
  deviceType?: "mobile" | "tablet" | "desktop";
}
```

## User-Agent Client Hints API

### What is Client Hints?

The [User-Agent Client Hints API](https://wicg.github.io/ua-client-hints/) is a modern W3C standard that provides structured browser and device information in a privacy-preserving manner. It replaces the legacy User-Agent string with a more controlled API.

### Why Client Hints?

- **Privacy**: Reduces passive fingerprinting by limiting default information
- **Structured Data**: Provides clean, structured data instead of parsing strings
- **Future-Proof**: Aligns with browser vendors' privacy initiatives
- **Opt-in Details**: Detailed information requires explicit permission

### How It Works

1. **Low-Entropy Values** (default): Basic information provided automatically
   - Browser brands and versions
   - Mobile flag
   - Platform

2. **High-Entropy Values** (opt-in): Detailed information requiring permission
   - Device architecture
   - Device model
   - Platform version
   - Full browser version

### Browser Support

| Browser | Client Hints Support | High Entropy Support |
|---------|---------------------|---------------------|
| Chrome 90+ | ✅ Yes | ✅ Yes |
| Edge 90+ | ✅ Yes | ✅ Yes |
| Opera 76+ | ✅ Yes | ✅ Yes |
| Brave 1.26+ | ✅ Yes | ✅ Yes |
| Samsung Internet 15+ | ✅ Yes | ✅ Yes |
| Firefox | ❌ No | ❌ No |
| Safari | ❌ No | ❌ No |

**Note**: When Client Hints is not available, the library automatically falls back to User-Agent string parsing, ensuring compatibility with all browsers.

### Privacy Implications

**Low-Entropy Data** (no permission required):
- Browser name and major version
- Mobile/desktop flag
- Platform name

**High-Entropy Data** (may require permission):
- Exact device model
- CPU architecture
- Full version numbers
- Detailed platform version

⚠️ **Privacy Best Practice**: Only request high-entropy values when absolutely necessary for your use case. Excessive data collection may trigger browser permission prompts and impact user trust.

## Fallback Behavior

The library implements a progressive enhancement strategy:

1. **Client Hints Available**: Uses `navigator.userAgentData` for modern, structured data
2. **Client Hints Unavailable**: Falls back to parsing `navigator.userAgent` string
3. **SSR Environment**: Returns undefined values, detection occurs on client-side

This ensures your application works across all browsers and environments without any code changes.

## Browser Detection

### Supported Browsers

The library accurately detects:

- **Chrome** - Google Chrome
- **Edge** - Microsoft Edge (Chromium-based)
- **Firefox** - Mozilla Firefox
- **Safari** - Apple Safari
- **Brave** - Brave Browser
- **Samsung Internet** - Samsung's mobile browser
- **Vivaldi** - Vivaldi Browser
- **Arc** - Arc Browser
- **Opera** - Opera (15+ and legacy 12-)
- **Chromium** - Chromium-based browsers
- **Seamonkey** - Seamonkey Browser

### Chrome Disambiguation

The library correctly distinguishes Chrome from other Chromium-based browsers (Edge, Brave, Opera, etc.) to avoid false positives.

## Device Detection

### Device Types

- **Mobile**: Smartphones (`deviceType: "mobile"`, `isMobile: true`)
- **Tablet**: Tablets including iPads (`deviceType: "tablet"`, `isMobile: false`)
- **Desktop**: Desktop computers (`deviceType: "desktop"`, `isMobile: false`)

### iPad Detection

Modern iPads (iPadOS 13+) masquerade as Mac computers in their User-Agent string. The library uses `navigator.maxTouchPoints` to accurately detect iPads:

```typescript
const agent = useUserAgent();

if (agent.device?.device === "iPad") {
  // iPad-specific logic
}
```

### Android Tablet Detection

The library distinguishes Android tablets from phones by checking for "Android" without "Mobile" in the User-Agent string.

## Rendering Engines

Detected rendering engines:

- **Blink**: Chromium-based browsers (Chrome, Edge, Brave, Opera, Vivaldi)
- **Gecko**: Firefox, Seamonkey
- **WebKit**: Safari

**Note**: Modern Edge uses Blink, not EdgeHTML. Legacy EdgeHTML detection is maintained for older Edge versions.

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { 
  useUserAgent, 
  Agent, 
  BrowserInfo, 
  DeviceInfo, 
  RenderingEngineInfo,
  UseUserAgentOptions 
} from "react-hook-useagent";

const agent: Agent = useUserAgent();
const browser: BrowserInfo | undefined = agent.browser;
```

## Advanced Usage

### Utility Functions

```typescript
import { isSSR, areAgentsEqual } from "react-hook-useagent";

// Check if running in SSR
if (isSSR()) {
  // Server-side logic
}

// Compare agent objects
if (areAgentsEqual(agent1, agent2)) {
  // Agents are equal
}
```

### Low-Level Detection Functions

For advanced use cases, you can use the low-level detection functions directly:

```typescript
import { 
  detectFromClientHints,
  detectBrowser,
  detectDevice,
  detectRenderingEngine 
} from "react-hook-useagent";

// Direct Client Hints detection
if ('userAgentData' in navigator) {
  const agent = await detectFromClientHints(navigator.userAgentData);
}

// Direct UA string detection
const browser = detectBrowser(window.navigator);
const device = detectDevice(window.navigator);
const engine = detectRenderingEngine(browser?.name, window.navigator);
```

## Migration from v1.x

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions.

**Quick Summary**: v2.0 is backward compatible. No code changes required for basic usage. New features are opt-in.

## Performance

- **Single Detection**: Detection runs exactly once per component mount
- **Efficient Updates**: State updates only occur when agent data changes
- **No Re-renders**: Optimized comparison prevents unnecessary re-renders
- **Async Handling**: High-entropy requests don't block initial render

## Best Practices

1. **Prefer Feature Detection**: Use User-Agent detection only when feature detection isn't possible
2. **Minimize High-Entropy Requests**: Only request detailed data when necessary
3. **Handle Undefined Values**: Always check for undefined properties
4. **SSR Awareness**: Use `isSSR()` utility for conditional logic
5. **Privacy First**: Be transparent about data collection with users

## Examples

### Responsive Design

```typescript
function ResponsiveComponent() {
  const { deviceType } = useUserAgent();
  
  if (deviceType === 'mobile') {
    return <MobileLayout />;
  } else if (deviceType === 'tablet') {
    return <TabletLayout />;
  }
  return <DesktopLayout />;
}
```

### Browser-Specific Fixes

```typescript
function BrowserSpecificComponent() {
  const { browser } = useUserAgent();
  
  const className = browser?.name === 'Safari' 
    ? 'safari-fix' 
    : 'default';
  
  return <div className={className}>Content</div>;
}
```

### Analytics

```typescript
function AnalyticsWrapper() {
  const agent = useUserAgent();
  
  useEffect(() => {
    if (agent.browser && agent.device) {
      analytics.track('page_view', {
        browser: agent.browser.name,
        platform: agent.device.platform,
        deviceType: agent.deviceType,
      });
    }
  }, [agent]);
  
  return <App />;
}
```

## Development

### Running Tests

This project uses [Vitest](https://vitest.dev/) for testing, including both unit tests and property-based tests using [fast-check](https://fast-check.dev/).

**Run all tests once:**
```bash
npm test
# or
bun test
```

**Run tests in watch mode:**
```bash
npm run test:watch
# or
bun run test:watch
```

**Run tests with UI:**
```bash
npm run test:ui
# or
bun run test:ui
```

**Run tests with coverage:**
```bash
npm run test:coverage
# or
bun run test:coverage
```

### Test Structure

The test suite includes:

- **Unit Tests** (`src/__tests__/unit/`): Test specific examples and edge cases
  - `browsers.test.ts` - Browser detection tests
  - `devices.test.ts` - Device detection tests
  - `engines.test.ts` - Rendering engine tests
  - `hook.test.ts` - React hook behavior tests

- **Property-Based Tests** (`src/__tests__/properties/`): Test universal properties across many inputs
  - `browsers.property.test.ts` - Browser detection properties
  - `devices.property.test.ts` - Device detection properties
  - `engines.property.test.ts` - Engine detection properties
  - `detection.property.test.ts` - General detection properties
  - `compatibility.property.test.ts` - Cross-browser compatibility
  - `errors.property.test.ts` - Error handling properties
  - `highEntropy.property.test.ts` - High-entropy Client Hints
  - `performance.property.test.ts` - Performance characteristics

Property-based tests use fast-check to generate hundreds of random inputs and verify that correctness properties hold across all of them.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Resources

- [User-Agent Client Hints Specification](https://wicg.github.io/ua-client-hints/)
- [MDN: User-Agent Client Hints API](https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API)
- [Chrome Platform Status: User-Agent Reduction](https://chromestatus.com/feature/5704553745874944)

---

Hope this helps someone! 🙌

Happy coding 👨‍💻
