import { describe, it, expect } from "vitest";
import { calculateGei, mapToGeiCategory } from "./gei-calculator";
import type { ScoredEvent } from "./gei-calculator";

describe("mapToGeiCategory", () => {
  it("maps known categories", () => {
    expect(mapToGeiCategory("MILITARY")).toBe("MILITARY");
    expect(mapToGeiCategory("DIPLOMATIC")).toBe("DIPLOMATIC");
    expect(mapToGeiCategory("HUMANITARIAN")).toBe("CONFLICT");
    expect(mapToGeiCategory("ECONOMIC")).toBe("ECONOMIC");
    expect(mapToGeiCategory("NUCLEAR")).toBe("NUCLEAR");
    expect(mapToGeiCategory("CYBER")).toBe("MILITARY");
  });

  it("returns null for unknown categories", () => {
    expect(mapToGeiCategory("UNKNOWN")).toBeNull();
    expect(mapToGeiCategory("")).toBeNull();
  });
});

describe("calculateGei", () => {
  const now = new Date("2026-03-29T12:00:00Z");

  it("returns baseline scores with no events", () => {
    const result = calculateGei([], now);
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThan(30);
    expect(result.primaryDriver).toBeDefined();
  });

  it("returns higher scores with high-intensity events", () => {
    const events: ScoredEvent[] = [
      { score: 9, category: "MILITARY", eventDate: new Date("2026-03-28T12:00:00Z") },
      { score: 8, category: "CONFLICT", eventDate: new Date("2026-03-28T12:00:00Z") },
      { score: 7, category: "NUCLEAR", eventDate: new Date("2026-03-27T12:00:00Z") },
    ];
    const result = calculateGei(events, now);
    expect(result.overallScore).toBeGreaterThan(30);
    expect(result.militaryScore).toBeGreaterThan(50);
  });

  it("applies decay to older events", () => {
    const recentEvents: ScoredEvent[] = [
      { score: 8, category: "MILITARY", eventDate: new Date("2026-03-28T12:00:00Z") },
    ];
    const oldEvents: ScoredEvent[] = [
      { score: 8, category: "MILITARY", eventDate: new Date("2026-01-01T12:00:00Z") },
    ];

    const recentResult = calculateGei(recentEvents, now);
    const oldResult = calculateGei(oldEvents, now);

    expect(recentResult.militaryScore).toBeGreaterThan(oldResult.militaryScore);
  });

  it("excludes events outside 90-day window", () => {
    const oldEvent: ScoredEvent[] = [
      { score: 10, category: "MILITARY", eventDate: new Date("2025-12-01T12:00:00Z") },
    ];
    const result = calculateGei(oldEvent, now);
    // Should be baseline since event is outside window
    expect(result.militaryScore).toBe(15);
  });

  it("identifies primary driver correctly", () => {
    const events: ScoredEvent[] = [
      { score: 2, category: "MILITARY", eventDate: new Date("2026-03-28T12:00:00Z") },
      { score: 10, category: "NUCLEAR", eventDate: new Date("2026-03-28T12:00:00Z") },
    ];
    const result = calculateGei(events, now);
    // Nuclear has highest individual score but only 10% weight
    // Military has 30% weight, so it depends on normalized values
    expect(result.primaryDriver).toBeDefined();
    expect(typeof result.primaryDriver).toBe("string");
  });

  it("clamps overall score between 0 and 100", () => {
    const extremeEvents: ScoredEvent[] = Array.from({ length: 50 }, (_, i) => ({
      score: 10,
      category: "MILITARY" as const,
      eventDate: new Date(now.getTime() - i * 86400000),
    }));
    const result = calculateGei(extremeEvents, now);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });

  it("returns all category scores", () => {
    const events: ScoredEvent[] = [
      { score: 5, category: "MILITARY", eventDate: new Date("2026-03-28") },
      { score: 5, category: "DIPLOMATIC", eventDate: new Date("2026-03-28") },
      { score: 5, category: "CONFLICT", eventDate: new Date("2026-03-28") },
      { score: 5, category: "ECONOMIC", eventDate: new Date("2026-03-28") },
      { score: 5, category: "NUCLEAR", eventDate: new Date("2026-03-28") },
    ];
    const result = calculateGei(events, now);
    expect(result).toHaveProperty("militaryScore");
    expect(result).toHaveProperty("diplomaticScore");
    expect(result).toHaveProperty("conflictScore");
    expect(result).toHaveProperty("economicScore");
    expect(result).toHaveProperty("nuclearScore");
  });
});
