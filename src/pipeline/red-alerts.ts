/**
 * Israel Red Alert (Tzeva Adom) Integration
 *
 * Fetches real-time rocket/missile alert data from tzevaadom.co.il
 * No API key required. No geo-restriction. Accessible worldwide.
 *
 * Source: https://api.tzevaadom.co.il/alerts-history
 */

const TZEVA_ADOM_API = "https://api.tzevaadom.co.il/alerts-history";

interface TzevaAdomAlert {
  time: number;       // Unix timestamp
  cities: string[];   // Affected cities (Hebrew)
  threat: number;     // 0 = standard, 5 = elevated
  isDrill: boolean;
}

interface TzevaAdomGroup {
  id: number;
  description: string | null;
  alerts: TzevaAdomAlert[];
}

export interface RedAlert {
  id: number;
  timestamp: Date;
  cities: string[];
  citiesCount: number;
  threat: number;
  isDrill: boolean;
  timeAgo: string;
}

/**
 * Fetch latest Red Alert data from Tzeva Adom API
 */
export async function fetchRedAlerts(): Promise<RedAlert[]> {
  try {
    const response = await fetch(TZEVA_ADOM_API, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "MeridianMonitor/1.0",
      },
    });

    if (!response.ok) {
      console.error(`[RedAlerts] API error: ${response.status}`);
      return [];
    }

    const data: TzevaAdomGroup[] = await response.json();
    const alerts: RedAlert[] = [];

    for (const group of data) {
      for (const alert of group.alerts) {
        if (alert.isDrill) continue; // Skip drills

        const timestamp = new Date(alert.time * 1000);

        alerts.push({
          id: group.id,
          timestamp,
          cities: alert.cities,
          citiesCount: alert.cities.length,
          threat: alert.threat,
          isDrill: alert.isDrill,
          timeAgo: getTimeAgo(timestamp),
        });
      }
    }

    // Sort newest first
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return alerts;
  } catch (error) {
    console.error("[RedAlerts] Fetch error:", error);
    return [];
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  return `vor ${diffDays} Tagen`;
}

/**
 * Get alert statistics for the GEI
 */
export function getAlertStats(alerts: RedAlert[]) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const last24h = alerts.filter((a) => a.timestamp >= oneDayAgo);
  const lastWeek = alerts.filter((a) => a.timestamp >= oneWeekAgo);

  return {
    total: alerts.length,
    last24h: last24h.length,
    lastWeek: lastWeek.length,
    totalCities24h: last24h.reduce((sum, a) => sum + a.citiesCount, 0),
    latestAlert: alerts[0] ?? null,
    highThreatCount: alerts.filter((a) => a.threat >= 5).length,
  };
}
