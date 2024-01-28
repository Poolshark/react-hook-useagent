import { useEffect, useState } from "react";
import { detectDevice, detectRenderingEngine, detectBrowser } from "./helpers";

import type { Agent } from "./types";

/**
 * -----------------------------------------------------------
 *  Use User Agent
 * -----------------------------------------------------------
 * Detects the user agent and returns an object with the current
 * `device`, the `browser` and the `renderingEngine` the user is
 * using.
 *
 * *Type*: React Hook
 *
 * @returns The user agent object
 * -----------------------------------------------------------
 */
export const useUserAgent = () => {
  const [agent, setAgent] = useState<Agent>();

  useEffect(() => {
    const navigator = window.navigator;

    const _agent = {
      device: detectDevice(navigator),
      browser: detectBrowser(navigator),
      renderingEngine: detectRenderingEngine(navigator),
    };
    if (JSON.stringify(agent) !== JSON.stringify(_agent)) {
      setAgent(_agent);
    }
  }, [window.navigator.userAgent]);

  return agent;
};
