import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateGei, type ScoredEvent } from "@/pipeline/gei-calculator";

/**
 * GET /api/gei
 *
 * Returns the current Global Escalation Index.
 * Reads from DB snapshots if available, otherwise calculates from demo data.
 */
export async function GET() {
  try {
    // Try to get latest snapshot from DB
    const latestSnapshot = await db.escalationSnapshot.findFirst({
      orderBy: { timestamp: "desc" },
    }).catch(() => null);

    if (latestSnapshot) {
      // Get previous day's snapshot for trend
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdaySnapshot = await db.escalationSnapshot.findFirst({
        where: { timestamp: { lte: yesterday } },
        orderBy: { timestamp: "desc" },
      }).catch(() => null);

      const change = yesterdaySnapshot
        ? Math.round(latestSnapshot.overallScore - yesterdaySnapshot.overallScore)
        : 0;

      return NextResponse.json({
        data: {
          score: Math.round(latestSnapshot.overallScore),
          change,
          level: getLevel(latestSnapshot.overallScore),
          primaryDriver: latestSnapshot.primaryDriver ?? "Unknown",
          categories: {
            military: Math.round(latestSnapshot.militaryScore),
            diplomatic: Math.round(latestSnapshot.diplomaticScore),
            conflict: Math.round(latestSnapshot.conflictScore),
            economic: Math.round(latestSnapshot.economicScore),
            nuclear: Math.round(latestSnapshot.nuclearScore),
          },
          updatedAt: latestSnapshot.timestamp.toISOString(),
          source: "database",
        },
      });
    }

    // Fallback: calculate from demo events
    const demoEvents = generateDemoEvents();
    const gei = calculateGei(demoEvents);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEvents = demoEvents.filter((e) => e.eventDate <= yesterday);
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
        source: "demo",
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

  const scenarios: Array<{ category: ScoredEvent["category"]; score: number; daysAgo: number }> = [
    { category: "MILITARY", score: 6, daysAgo: 0 }, { category: "MILITARY", score: 4, daysAgo: 1 },
    { category: "MILITARY", score: 7, daysAgo: 2 }, { category: "MILITARY", score: 3, daysAgo: 3 },
    { category: "MILITARY", score: 5, daysAgo: 5 }, { category: "MILITARY", score: 8, daysAgo: 7 },
    { category: "MILITARY", score: 4, daysAgo: 10 }, { category: "MILITARY", score: 3, daysAgo: 14 },
    { category: "DIPLOMATIC", score: 3, daysAgo: 0 }, { category: "DIPLOMATIC", score: -2, daysAgo: 2 },
    { category: "DIPLOMATIC", score: 4, daysAgo: 4 }, { category: "DIPLOMATIC", score: 5, daysAgo: 6 },
    { category: "DIPLOMATIC", score: -3, daysAgo: 8 }, { category: "DIPLOMATIC", score: 6, daysAgo: 15 },
    { category: "CONFLICT", score: 5, daysAgo: 0 }, { category: "CONFLICT", score: 7, daysAgo: 1 },
    { category: "CONFLICT", score: 4, daysAgo: 3 }, { category: "CONFLICT", score: 6, daysAgo: 5 },
    { category: "CONFLICT", score: 5, daysAgo: 12 }, { category: "CONFLICT", score: 8, daysAgo: 18 },
    { category: "ECONOMIC", score: 3, daysAgo: 0 }, { category: "ECONOMIC", score: 4, daysAgo: 3 },
    { category: "ECONOMIC", score: 2, daysAgo: 7 }, { category: "ECONOMIC", score: 5, daysAgo: 14 },
    { category: "NUCLEAR", score: 2, daysAgo: 1 }, { category: "NUCLEAR", score: 4, daysAgo: 5 },
    { category: "NUCLEAR", score: 3, daysAgo: 10 }, { category: "NUCLEAR", score: 6, daysAgo: 21 },
  ];

  for (const s of scenarios) {
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() - s.daysAgo);
    events.push({ score: s.score, category: s.category, eventDate });
  }

  return events;
}
