import { describe, it, expect } from "vitest";
import { cn, formatNumber, getEscalationLevel, truncate } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges conflicting tailwind classes", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });
});

describe("formatNumber", () => {
  it("formats numbers with German locale", () => {
    const result = formatNumber(1234.5);
    // German locale uses . as thousands separator and , as decimal
    expect(result).toContain("1");
    expect(result).toContain("234");
  });

  it("formats small numbers", () => {
    expect(formatNumber(42)).toBe("42");
  });
});

describe("getEscalationLevel", () => {
  it("returns Critical for scores >= 81", () => {
    const level = getEscalationLevel(85);
    expect(level.label).toBe("Kritisch");
    expect(level.labelEn).toBe("Critical");
  });

  it("returns Severe for scores 61-80", () => {
    const level = getEscalationLevel(73);
    expect(level.label).toBe("Schwer");
    expect(level.labelEn).toBe("Severe");
  });

  it("returns High for scores 41-60", () => {
    const level = getEscalationLevel(50);
    expect(level.label).toBe("Hoch");
    expect(level.labelEn).toBe("High");
  });

  it("returns Elevated for scores 21-40", () => {
    const level = getEscalationLevel(30);
    expect(level.label).toBe("Erhoeht");
    expect(level.labelEn).toBe("Elevated");
  });

  it("returns Low for scores <= 20", () => {
    const level = getEscalationLevel(15);
    expect(level.label).toBe("Niedrig");
    expect(level.labelEn).toBe("Low");
  });

  it("handles boundary values", () => {
    expect(getEscalationLevel(81).label).toBe("Kritisch");
    expect(getEscalationLevel(80).label).toBe("Schwer");
    expect(getEscalationLevel(61).label).toBe("Schwer");
    expect(getEscalationLevel(60).label).toBe("Hoch");
    expect(getEscalationLevel(41).label).toBe("Hoch");
    expect(getEscalationLevel(40).label).toBe("Erhoeht");
    expect(getEscalationLevel(21).label).toBe("Erhoeht");
    expect(getEscalationLevel(20).label).toBe("Niedrig");
  });

  it("handles zero", () => {
    expect(getEscalationLevel(0).label).toBe("Niedrig");
  });

  it("handles 100", () => {
    expect(getEscalationLevel(100).label).toBe("Kritisch");
  });
});

describe("truncate", () => {
  it("returns short strings unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    expect(truncate("This is a very long string", 15)).toBe("This is a ve...");
  });

  it("handles exact length", () => {
    expect(truncate("exact", 5)).toBe("exact");
  });
});
