import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/gei/history
 *
 * Returns GEI historical snapshots.
 * Query params:
 * - days: number (default 30, max 90)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const days = Math.min(parseInt(searchParams.get("days") ?? "30"), 90);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const snapshots = await db.escalationSnapshot.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: "asc" },
      select: {
        timestamp: true,
        overallScore: true,
        militaryScore: true,
        diplomaticScore: true,
        conflictScore: true,
        economicScore: true,
        nuclearScore: true,
        primaryDriver: true,
      },
    });

    return NextResponse.json({
      data: snapshots.map((s) => ({
        timestamp: s.timestamp.toISOString(),
        score: Math.round(s.overallScore),
        military: Math.round(s.militaryScore),
        diplomatic: Math.round(s.diplomaticScore),
        conflict: Math.round(s.conflictScore),
        economic: Math.round(s.economicScore),
        nuclear: Math.round(s.nuclearScore),
        driver: s.primaryDriver,
      })),
      meta: { days, count: snapshots.length },
    });
  } catch (error) {
    console.error("[API /api/gei/history] Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
