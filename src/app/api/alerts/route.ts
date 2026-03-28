import { NextResponse } from "next/server";
import { fetchRedAlerts, getAlertStats } from "@/pipeline/red-alerts";

/**
 * GET /api/alerts
 *
 * Returns real-time Israel Red Alert (Tzeva Adom) data.
 * Source: tzevaadom.co.il (no API key, no geo-restriction)
 */
export async function GET() {
  try {
    const alerts = await fetchRedAlerts();
    const stats = getAlertStats(alerts);

    return NextResponse.json({
      data: {
        alerts: alerts.slice(0, 50), // Latest 50
        stats,
      },
      meta: {
        source: "tzevaadom.co.il",
        fetchedAt: new Date().toISOString(),
        total: alerts.length,
      },
    });
  } catch (error) {
    console.error("[API /api/alerts] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
