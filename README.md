# React Hook User Agent

Many React developers encounter the challenge of needing to access information about the current user agent of the application's user. While it's typically advisable to strive for a more generalised approach in developing your application, avoiding reliance on specific user agent fallbacks, there are instances where this is unavoidable.

This React Hook gives you all the information you need, according to the current W3C standard.

- Browser
- Browser Version
- Rendering Engine
- Rendering Engine Verion
- Running on mobile (yes/no)
- Simple detection of Device/OS

### Installation

**NPM:**

```
npm install react-hook-useagent
```

**Yarn:**

```
yarn add react-hook-useagent
```

### Usage

Import into your React component via

```js
import { useUserAgent } from "react-hook-useagent";
```

Get user agent object via

```typescript
const MyAgentSnifferComponent: React.FC = () => {
  const userAgent = useUserAgent();
};
```

You can also extract the individual keys from the `userAgent` object

```typescript
const MyAgentSnifferComponent: React.FC = () => {
  const { device, browser, renderingEngine } = useUserAgent();
};
```

### Return Values

Obviously, getting the exact match of what Device/System/Browser/Version the user is running your app from, is pretty hard to generalise and usually not something you need to be testing for _(a too specialised browser/system fallback might suggest that something is wrong with your approach!)_. In case you need more detailed information, use `window.navigator.agent` and apply to your needs accordingly.

However, the `useUserAgent` hook will return the follwing object

```typescript
{
  device: {
    isMobile: boolean,
    platform: "Android" | "iOS" | "Windows" | "Linux" | "Mac OS",
    device: "Android" | "iPhone" | "iPad" | "iPod" | "Desktop PC"
  },
  browser: {
    name: "Chrome" | "Chromium" | "Firefox" | "Seamonkey" | "Safari" | "Opera15+" | "Opera12-",
    version: string
  },
  renderingEngine: {
    name: "Blink" | "Gecko" | "Presto" | "WebKit" | "EdgeHTML",
    version: number
  }
}
```

Hope this helps someone! 🙌

Happy `coding` 👨‍💻
