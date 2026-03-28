"use client";

import { useEffect, useState } from "react";
import { Siren, MapPin, Clock, AlertTriangle, RefreshCw } from "lucide-react";

interface Alert {
  id: number;
  timestamp: string;
  cities: string[];
  citiesCount: number;
  threat: number;
  isDrill: boolean;
  timeAgo: string;
}

interface AlertStats {
  total: number;
  last24h: number;
  lastWeek: number;
  totalCities24h: number;
  latestAlert: Alert | null;
  highThreatCount: number;
}

export function RedAlertFeed({ compact = false }: { compact?: boolean }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setAlerts(json.data.alerts ?? []);
      setStats(json.data.stats ?? null);
      setLastUpdate(new Date());
    } catch {
      console.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-2xl bg-red-950/30 border border-red-500/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Siren className="h-5 w-5 text-red-400" />
          <h3 className="font-bold text-red-300 text-sm">Tzeva Adom — Red Alert</h3>
          {stats && stats.last24h > 0 && (
            <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {stats.last24h} heute
            </span>
          )}
        </div>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, i) => (
              <div key={`${alert.id}-${i}`} className="flex items-start gap-2 text-sm">
                <span className="text-red-500 mt-0.5">🚨</span>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 text-xs truncate">{alert.cities.join(", ")}</p>
                  <p className="text-zinc-600 text-[10px]">{alert.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-xs">Aktuell keine aktiven Alarme</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="bg-red-950/50 border-b border-red-500/20 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/20 p-2">
              <Siren className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Tzeva Adom
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              </h3>
              <p className="text-xs text-red-300/60">Israel Raketenalarm — Live</p>
            </div>
          </div>
          <button type="button" onClick={fetchAlerts} className="text-zinc-500 hover:text-white transition-colors" aria-label="Aktualisieren">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 border-b border-zinc-800">
          <div className="px-4 py-3 text-center border-r border-zinc-800">
            <p className="text-xl font-black text-white tabular-nums">{stats.last24h}</p>
            <p className="text-[10px] text-zinc-500">Letzte 24h</p>
          </div>
          <div className="px-4 py-3 text-center border-r border-zinc-800">
            <p className="text-xl font-black text-white tabular-nums">{stats.totalCities24h}</p>
            <p className="text-[10px] text-zinc-500">Staedte betroffen</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xl font-black text-white tabular-nums">{stats.lastWeek}</p>
            <p className="text-[10px] text-zinc-500">Letzte 7 Tage</p>
          </div>
        </div>
      )}

      {/* Alert list */}
      <div className="divide-y divide-zinc-800/50 max-h-[320px] overflow-y-auto">
        {alerts.length > 0 ? (
          alerts.slice(0, 20).map((alert, i) => (
            <div key={`${alert.id}-${i}`} className="px-5 py-3 hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {alert.threat >= 5 ? (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  ) : (
                    <MapPin className="h-4 w-4 text-orange-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 leading-snug">
                    {alert.cities.slice(0, 5).join(", ")}
                    {alert.cities.length > 5 && (
                      <span className="text-zinc-500"> +{alert.cities.length - 5} weitere</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-zinc-600" />
                    <span className="text-[11px] text-zinc-500">{alert.timeAgo}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[11px] text-zinc-500">{alert.citiesCount} Orte</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-zinc-500 text-sm">Aktuell keine aktiven Alarme</p>
            <p className="text-zinc-600 text-xs mt-1">Daten werden alle 30 Sekunden aktualisiert</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {lastUpdate && (
        <div className="px-5 py-2 border-t border-zinc-800 bg-zinc-950/50">
          <p className="text-[10px] text-zinc-600">
            Quelle: tzevaadom.co.il · Aktualisiert: {lastUpdate.toLocaleTimeString("de-DE")}
          </p>
        </div>
      )}
    </div>
  );
}
