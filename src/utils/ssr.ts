/**
 * Checks if code is running in a Server-Side Rendering (SSR) environment
 * 
 * This function detects SSR by checking for the absence of the window object,
 * which is only available in browser environments. It handles edge cases for
 * different SSR frameworks (Next.js, Remix, Gatsby, etc.)
 * 
 * The function uses `typeof window === 'undefined'` instead of direct window
 * access to prevent ReferenceError in SSR environments where window is not defined.
 * 
 * @returns true if running in SSR environment (server-side), false if client-side (browser)
 * 
 * @example
 * ```typescript
 * import { isSSR } from 'react-hook-useagent';
 * 
 * if (isSSR()) {
 *   // Skip browser-specific logic during SSR
 *   return defaultValue;
 * }
 * 
 * // Safe to access window, navigator, document, etc.
 * const userAgent = window.navigator.userAgent;
 * ```
 * 
 * @example
 * ```typescript
 * // Next.js usage
 * function MyComponent() {
 *   if (isSSR()) {
 *     return <div>Loading...</div>;
 *   }
 *   
 *   // Client-side only code
 *   const agent = useUserAgent();
 *   return <div>{agent.browser?.name}</div>;
 * }
 * ```
 */
export function isSSR(): boolean {
  // Check if window is undefined (most reliable SSR detection)
  // Using typeof prevents ReferenceError in SSR environments
  return typeof window === 'undefined';
}
