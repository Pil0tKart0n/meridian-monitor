import { NextResponse } from "next/server";
import { calculateGei, type ScoredEvent } from "@/pipeline/gei-calculator";

/**
 * GET /api/gei
 *
 * Returns the current Global Escalation Index.
 * In production, this reads from the database.
 * For MVP/demo, returns calculated data from demo events.
 */
export async function GET() {
  try {
    // Demo events for MVP — in production, these come from the database
    const demoEvents: ScoredEvent[] = generateDemoEvents();
    const gei = calculateGei(demoEvents);

    // Calculate yesterday's score for trend
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEvents = demoEvents.filter(
      (e) => e.eventDate <= yesterday
    );
    const yesterdayGei = calculateGei(yesterdayEvents, yesterday);
    const change = gei.overallScore - yesterdayGei.overallScore;

    return NextResponse.json({
      data: {
        score: gei.overallScore,
        change,
        level: getLevel(gei.overallScore),
        primaryDriver: gei.primaryDriver,
        categories: {
          military: gei.militaryScore,
          diplomatic: gei.diplomaticScore,
          conflict: gei.conflictScore,
          economic: gei.economicScore,
          nuclear: gei.nuclearScore,
        },
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API /api/gei] Error:", error);
    return NextResponse.json(
      { error: "Failed to calculate GEI" },
      { status: 500 }
    );
  }
}

function getLevel(score: number): string {
  if (score >= 81) return "critical";
  if (score >= 61) return "severe";
  if (score >= 41) return "high";
  if (score >= 21) return "elevated";
  return "low";
}

function generateDemoEvents(): ScoredEvent[] {
  const events: ScoredEvent[] = [];
  const now = new Date();

  // Simulate realistic conflict events over the past 30 days
  const scenarios: Array<{
    category: ScoredEvent["category"];
    score: number;
    daysAgo: number;
  }> = [
    // Recent military activity
    { category: "MILITARY", score: 6, daysAgo: 0 },
    { category: "MILITARY", score: 4, daysAgo: 1 },
    { category: "MILITARY", score: 7, daysAgo: 2 },
    { category: "MILITARY", score: 3, daysAgo: 3 },
    { category: "MILITARY", score: 5, daysAgo: 5 },
    { category: "MILITARY", score: 8, daysAgo: 7 },
    { category: "MILITARY", score: 4, daysAgo: 10 },
    { category: "MILITARY", score: 3, daysAgo: 14 },
    { category: "MILITARY", score: 5, daysAgo: 20 },

    // Diplomatic signals
    { category: "DIPLOMATIC", score: 3, daysAgo: 0 },
    { category: "DIPLOMATIC", score: -2, daysAgo: 2 },
    { category: "DIPLOMATIC", score: 4, daysAgo: 4 },
    { category: "DIPLOMATIC", score: 5, daysAgo: 6 },
    { category: "DIPLOMATIC", score: -3, daysAgo: 8 },
    { category: "DIPLOMATIC", score: 2, daysAgo: 12 },
    { category: "DIPLOMATIC", score: 6, daysAgo: 15 },

    // Conflict events
    { category: "CONFLICT", score: 5, daysAgo: 0 },
    { category: "CONFLICT", score: 7, daysAgo: 1 },
    { category: "CONFLICT", score: 4, daysAgo: 3 },
    { category: "CONFLICT", score: 6, daysAgo: 5 },
    { category: "CONFLICT", score: 3, daysAgo: 8 },
    { category: "CONFLICT", score: 5, daysAgo: 12 },
    { category: "CONFLICT", score: 8, daysAgo: 18 },

    // Economic stress
    { category: "ECONOMIC", score: 3, daysAgo: 0 },
    { category: "ECONOMIC", score: 4, daysAgo: 3 },
    { category: "ECONOMIC", score: 2, daysAgo: 7 },
    { category: "ECONOMIC", score: 5, daysAgo: 14 },

    // Nuclear/strategic
    { category: "NUCLEAR", score: 2, daysAgo: 1 },
    { category: "NUCLEAR", score: 4, daysAgo: 5 },
    { category: "NUCLEAR", score: 3, daysAgo: 10 },
    { category: "NUCLEAR", score: 6, daysAgo: 21 },
  ];

  for (const scenario of scenarios) {
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() - scenario.daysAgo);
    events.push({
      score: scenario.score,
      category: scenario.category,
      eventDate,
    });
  }

  return events;
}
