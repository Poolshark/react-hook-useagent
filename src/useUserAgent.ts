import { useEffect, useState } from "react";
import { detectDevice, detectRenderingEngine, detectBrowser } from "./helpers";

import type { Agent } from "./types";
// Browser → Name and Version
// Rendedring Engine

/**
 * -----------------------------------------------------------
 *  Use User Agent
 * -----------------------------------------------------------
 * @todo - write a description! Don't be lazy!
 *
 * @param params  The input params.
 * @returns       @todo - add return
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
