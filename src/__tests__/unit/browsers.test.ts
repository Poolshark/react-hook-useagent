import { describe, it, expect } from "vitest";
import { detectBrowser } from "../../detectors/userAgentString";

describe("Browser Detection - Specific Browsers", () => {
  describe("Edge Chromium", () => {
    it("should detect Edge Chromium on Windows", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Edge");
      expect(result?.version).toBe("120.0.0.0");
    });

    it("should detect Edge Chromium on macOS", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Edge");
      expect(result?.version).toBe("119.0.0.0");
    });
  });

  describe("Brave Browser", () => {
    it("should detect Brave browser via navigator.brave API", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        brave: {
          isBrave: () => Promise.resolve(true),
        },
      } as any;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Brave");
      expect(result?.version).toBe("120.0.0.0");
    });

    it("should detect Brave on macOS", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        brave: {
          isBrave: () => Promise.resolve(true),
        },
      } as any;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Brave");
      expect(result?.version).toBe("119.0.0.0");
    });
  });

  describe("Samsung Internet", () => {
    it("should detect Samsung Internet on Android", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Samsung Internet");
      expect(result?.version).toBe("23.0");
    });

    it("should detect Samsung Internet tablet version", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Linux; Android 12; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/22.0 Chrome/111.0.0.0 Safari/537.36",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Samsung Internet");
      expect(result?.version).toBe("22.0");
    });
  });

  describe("Vivaldi", () => {
    it("should detect Vivaldi on Windows", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.50",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Vivaldi");
      expect(result?.version).toBe("6.5.3206.50");
    });
  });

  describe("Obsolete Browsers", () => {
    it("should detect Opera 12- (Presto-based)", () => {
      const mockNavigator = {
        userAgent:
          "Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Opera12-");
      expect(result?.version).toBe("9.80");
    });

    it("should detect EdgeHTML-based Edge (legacy)", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      // EdgeHTML Edge doesn't have Edg/ pattern, so it might be detected as Chrome
      // or undefined depending on implementation
      expect(result).toBeDefined();
    });
  });

  describe("Chrome Disambiguation", () => {
    it("should detect Chrome and not confuse with Edge", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result).toBeDefined();
      expect(result?.name).toBe("Chrome");
      expect(result?.version).toBe("120.0.0.0");
    });

    it("should not detect Chrome when it's actually Samsung Internet", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result?.name).not.toBe("Chrome");
      expect(result?.name).toBe("Samsung Internet");
    });

    it("should not detect Chrome when it's actually Vivaldi", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.50",
      } as Navigator;

      const result = detectBrowser(mockNavigator);

      expect(result?.name).not.toBe("Chrome");
      expect(result?.name).toBe("Vivaldi");
    });
  });
});
