import { describe, it, expect } from "vitest";
import { detectBrowser, detectRenderingEngine } from "../../detectors/userAgentString";

describe("Rendering Engine Detection - Modern Edge", () => {
  describe("Modern Edge (Chromium-based)", () => {
    it("should map modern Edge to Blink, not EdgeHTML", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      } as Navigator;

      const browser = detectBrowser(mockNavigator);
      expect(browser).toBeDefined();
      expect(browser?.name).toBe("Edge");

      const engine = detectRenderingEngine(browser?.name, mockNavigator);
      expect(engine).toBeDefined();
      expect(engine?.name).toBe("Blink");
      expect(engine?.name).not.toBe("EdgeHTML");
    });

    it("should map modern Edge on macOS to Blink", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
      } as Navigator;

      const browser = detectBrowser(mockNavigator);
      expect(browser).toBeDefined();
      expect(browser?.name).toBe("Edge");

      const engine = detectRenderingEngine(browser?.name, mockNavigator);
      expect(engine).toBeDefined();
      expect(engine?.name).toBe("Blink");
    });

    it("should extract version from Chrome version in modern Edge UA", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      } as Navigator;

      const browser = detectBrowser(mockNavigator);
      const engine = detectRenderingEngine(browser?.name, mockNavigator);

      expect(engine).toBeDefined();
      expect(engine?.version).toBe("120.0.0.0");
    });
  });

  describe("Legacy Edge (EdgeHTML-based)", () => {
    it("should handle legacy EdgeHTML Edge gracefully", () => {
      const mockNavigator = {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763",
      } as Navigator;

      const browser = detectBrowser(mockNavigator);
      
      // Legacy Edge might be detected as Chrome or undefined
      // The important thing is we don't crash
      expect(browser).toBeDefined();
      
      if (browser) {
        const engine = detectRenderingEngine(browser.name, mockNavigator);
        // Should not be EdgeHTML since we removed that
        expect(engine?.name).not.toBe("EdgeHTML");
      }
    });
  });
});
