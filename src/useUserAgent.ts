import { useEffect, useState } from "react";
import type { Agent, UseUserAgentOptions, NavigatorUAData } from "./types";
import { isSSR } from "./utils/ssr";
import { areAgentsEqual } from "./utils/comparison";
import { detectFromClientHints } from "./detectors/clientHints";
import { detectBrowser, detectDevice, detectRenderingEngine } from "./detectors/userAgentString";
import { getDeviceTypeClassification } from "./detectors/device";

/**
 * -----------------------------------------------------------
 *  Use User Agent
 * -----------------------------------------------------------
 * Detects the user agent and returns an object with the current
 * `device`, the `browser` and the `renderingEngine` the user is
 * using.
 *
 * This hook uses the modern User-Agent Client Hints API when available,
 * falling back to traditional User-Agent string parsing for older browsers.
 * It handles SSR environments gracefully and performs detection exactly
 * once per component mount.
 *
 * *Type*: React Hook
 *
 * @param options - Optional configuration for detection behavior
 * @param options.highEntropy - Request detailed device information (requires user permission)
 * @param options.hints - Specific high entropy hints to request
 * @returns The user agent object
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const agent = useUserAgent();
 * 
 * // With high entropy values
 * const agent = useUserAgent({ highEntropy: true });
 * 
 * // With specific hints
 * const agent = useUserAgent({ 
 *   highEntropy: true, 
 *   hints: ['architecture', 'model'] 
 * });
 * ```
 * -----------------------------------------------------------
 */
export const useUserAgent = (options?: UseUserAgentOptions) => {
  const [agent, setAgent] = useState<Agent>({
    device: undefined,
    browser: undefined,
    renderingEngine: undefined,
  });

  useEffect(() => {
    // Check if running in SSR environment
    if (isSSR()) {
      // Return empty agent data for SSR
      const ssrAgent: Agent = {
        device: undefined,
        browser: undefined,
        renderingEngine: undefined,
        detectionMethod: 'ssr',
      };
      
      if (!areAgentsEqual(agent, ssrAgent)) {
        setAgent(ssrAgent);
      }
      return;
    }

    // Detection runs exactly once per mount
    const detectAgent = async () => {
      const navigator = window.navigator;
      let detectedAgent: Agent;

      // Check if Client Hints API is available
      const userAgentData = (navigator as any).userAgentData as NavigatorUAData | undefined;
      
      if (userAgentData) {
        // Use Client Hints API as primary detection method
        const result = detectFromClientHints(userAgentData, options);
        
        // Handle both sync and async results
        if (result instanceof Promise) {
          detectedAgent = await result;
        } else {
          detectedAgent = result;
        }
      } else {
        // Fallback to User-Agent string parsing
        const browser = detectBrowser(navigator);
        const device = detectDevice(navigator);
        const renderingEngine = detectRenderingEngine(browser?.name, navigator);
        
        detectedAgent = {
          browser,
          device,
          renderingEngine,
          detectionMethod: 'user-agent-string',
          deviceType: device ? getDeviceTypeClassification(device.isMobile, device.device) : undefined,
        };
      }

      // Only update state if agent data has changed
      if (!areAgentsEqual(agent, detectedAgent)) {
        setAgent(detectedAgent);
      }
    };

    detectAgent();
    
    // Empty dependency array ensures detection runs exactly once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return agent;
};
