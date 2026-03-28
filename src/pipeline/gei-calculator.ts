/**
 * Global Escalation Index (GEI) Calculator
 *
 * Computes a 0-100 escalation score based on 5 weighted categories:
 * - Military Activity: 30%
 * - Diplomatic Signals: 25%
 * - Conflict Events: 25%
 * - Economic Stress: 10%
 * - Nuclear/Strategic: 10%
 *
 * Uses exponential decay (half-life: 14 days) and a 90-day rolling window.
 */

const CATEGORY_WEIGHTS = {
  MILITARY: 0.30,
  DIPLOMATIC: 0.25,
  CONFLICT: 0.25,
  ECONOMIC: 0.10,
  NUCLEAR: 0.10,
} as const;

// Decay constant for 14-day half-life: lambda = ln(2) / 14
const DECAY_LAMBDA = Math.LN2 / 14;

// 90-day rolling window in milliseconds
const ROLLING_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

interface ScoredEvent {
  score: number;
  category: "MILITARY" | "DIPLOMATIC" | "CONFLICT" | "ECONOMIC" | "NUCLEAR";
  eventDate: Date;
}

interface GeiResult {
  overallScore: number;
  militaryScore: number;
  diplomaticScore: number;
  conflictScore: number;
  economicScore: number;
  nuclearScore: number;
  primaryDriver: string;
}

/**
 * Map article categories to GEI categories
 */
function mapToGeiCategory(category: string): ScoredEvent["category"] | null {
  switch (category) {
    case "MILITARY": return "MILITARY";
    case "DIPLOMATIC": return "DIPLOMATIC";
    case "HUMANITARIAN": return "CONFLICT";
    case "ECONOMIC": return "ECONOMIC";
    case "NUCLEAR": return "NUCLEAR";
    case "CYBER": return "MILITARY";
    default: return null;
  }
}

/**
 * Apply exponential decay to a score based on event age
 */
function applyDecay(score: number, eventDate: Date, now: Date): number {
  const ageDays = (now.getTime() - eventDate.getTime()) / (24 * 60 * 60 * 1000);
  return score * Math.exp(-DECAY_LAMBDA * ageDays);
}

/**
 * Calculate the GEI from a set of scored events
 */
export function calculateGei(events: ScoredEvent[], now = new Date()): GeiResult {
  const cutoff = new Date(now.getTime() - ROLLING_WINDOW_MS);

  // Filter to rolling window
  const windowEvents = events.filter((e) => e.eventDate >= cutoff);

  // Calculate weighted scores per category
  const categoryScores: Record<ScoredEvent["category"], number> = {
    MILITARY: 0,
    DIPLOMATIC: 0,
    CONFLICT: 0,
    ECONOMIC: 0,
    NUCLEAR: 0,
  };

  const categoryCounts: Record<ScoredEvent["category"], number> = {
    MILITARY: 0,
    DIPLOMATIC: 0,
    CONFLICT: 0,
    ECONOMIC: 0,
    NUCLEAR: 0,
  };

  for (const event of windowEvents) {
    const decayedScore = applyDecay(event.score, event.eventDate, now);
    categoryScores[event.category] += decayedScore;
    categoryCounts[event.category]++;
  }

  // Normalize each category to 0-100
  // Use logarithmic scaling to prevent extreme outliers
  const normalizedScores = {
    MILITARY: normalizeScore(categoryScores.MILITARY, categoryCounts.MILITARY),
    DIPLOMATIC: normalizeScore(categoryScores.DIPLOMATIC, categoryCounts.DIPLOMATIC),
    CONFLICT: normalizeScore(categoryScores.CONFLICT, categoryCounts.CONFLICT),
    ECONOMIC: normalizeScore(categoryScores.ECONOMIC, categoryCounts.ECONOMIC),
    NUCLEAR: normalizeScore(categoryScores.NUCLEAR, categoryCounts.NUCLEAR),
  };

  // Weighted sum
  const overall =
    normalizedScores.MILITARY * CATEGORY_WEIGHTS.MILITARY +
    normalizedScores.DIPLOMATIC * CATEGORY_WEIGHTS.DIPLOMATIC +
    normalizedScores.CONFLICT * CATEGORY_WEIGHTS.CONFLICT +
    normalizedScores.ECONOMIC * CATEGORY_WEIGHTS.ECONOMIC +
    normalizedScores.NUCLEAR * CATEGORY_WEIGHTS.NUCLEAR;

  // Find primary driver
  const categoryLabels: Record<ScoredEvent["category"], string> = {
    MILITARY: "Military Activity",
    DIPLOMATIC: "Diplomatic Signals",
    CONFLICT: "Conflict Events",
    ECONOMIC: "Economic Stress",
    NUCLEAR: "Nuclear/Strategic",
  };

  let maxCategory: ScoredEvent["category"] = "MILITARY";
  let maxWeightedScore = 0;
  for (const [cat, score] of Object.entries(normalizedScores)) {
    const weighted = score * CATEGORY_WEIGHTS[cat as keyof typeof CATEGORY_WEIGHTS];
    if (weighted > maxWeightedScore) {
      maxWeightedScore = weighted;
      maxCategory = cat as ScoredEvent["category"];
    }
  }

  return {
    overallScore: Math.round(Math.min(100, Math.max(0, overall))),
    militaryScore: Math.round(normalizedScores.MILITARY),
    diplomaticScore: Math.round(normalizedScores.DIPLOMATIC),
    conflictScore: Math.round(normalizedScores.CONFLICT),
    economicScore: Math.round(normalizedScores.ECONOMIC),
    nuclearScore: Math.round(normalizedScores.NUCLEAR),
    primaryDriver: categoryLabels[maxCategory],
  };
}

/**
 * Normalize accumulated score to 0-100 using sigmoid-like function
 */
function normalizeScore(accumulatedScore: number, eventCount: number): number {
  if (eventCount === 0) return 15; // Baseline — no data doesn't mean no risk

  // Average score per event, then scale
  const avgScore = accumulatedScore / Math.max(eventCount, 1);

  // Sigmoid mapping: avgScore of 0 → 25 (baseline), avgScore of 5 → 75, avgScore of 10 → 95
  const normalized = 100 / (1 + Math.exp(-0.5 * (avgScore - 2)));

  return Math.min(100, Math.max(0, normalized));
}

/**
 * Calculate GEI from database-stored events
 * This is used by the API route
 */
export function calculateGeiFromArticles(
  articles: Array<{ category: string; score: number; eventDate: Date }>
): GeiResult {
  const scoredEvents: ScoredEvent[] = [];

  for (const article of articles) {
    const geiCategory = mapToGeiCategory(article.category);
    if (geiCategory) {
      scoredEvents.push({
        score: article.score,
        category: geiCategory,
        eventDate: article.eventDate,
      });
    }
  }

  return calculateGei(scoredEvents);
}

export { mapToGeiCategory };
export type { ScoredEvent, GeiResult };
