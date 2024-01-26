import type { Browsers } from "./types";

export const detectBrowser = (navigator: Navigator) => {
  const browserRegexes = new Map<Browsers, RegExp>([
    ["Chrome", /Chrome\/([0-9.]+)/],
    ["Chromium", /Chromium\/([0-9.]+)/],
    ["Firefox", /Firefox\/([0-9.]+)/],
    ["Seamonkey", /Seamonkey\/([0-9.]+)/],
    ["Safari", /Version\/([0-9.]+).*Safari/],
    ["Opera15+", /OPR\/([0-9.]+)/],
    ["Opera12-", /Opera\/([0-9.]+)/],
  ]);

  for (const [browser, regex] of browserRegexes) {
    const match = navigator.userAgent.match(regex);

    if (match) {
      let test = false;

      if (browser === "Chrome") {
        test = /(Chromium\/([0-9.]+))|(Edg.*\/([0-9.]+))/.test(navigator.userAgent);
      }

      if (browser === "Firefox") {
        test = /Seamonkey\/([0-9.]+)/.test(navigator.userAgent);
      }

      if (!test) {
        return {
          name: browser,
          version: match[1],
        };
      }
    }
  }
};

export const detectRenderingEngine = (navigator: Navigator) => {
  const renderingEngineRegexes = new Map([
    ["Blink", /Chrome\/([0-9.]+)/],
    ["Gecko", /Gecko\/([0-9.]+)/],
    ["Presto", /Opera\/([0-9.]+)/],
    ["WebKit", /AppleWebKit\/([0-9.]+)/],
    ["EdgeHTML", /Edge\/([0-9.]+)/],
  ]);

  for (const [engine, regex] of renderingEngineRegexes) {
    const match = navigator.userAgent.match(regex);

    if (match) {
      return {
        name: engine,
        version: match[1],
      };
    }
  }
};

export const detectDevice = (navigator: Navigator) => {
  const mobileRegexes = new Map([
    ["Android", /Android/i],
    ["iOS", /iPhone|iPad|iPod/i],
    ["Windows", /win/i],
    ["Linux", /linux/i],
    ["Mac OSX", /mac/i],
  ]);

  for (const [platform, regex] of mobileRegexes) {
    const match = navigator.userAgent.match(regex);
    if (match) {
      const isMobile = /Mobi/.test(navigator.userAgent);
      return {
        isMobile: isMobile,
        platform: platform,
        device: isMobile ? match[0] : "Desktop PC",
      };
    }
  }
};
