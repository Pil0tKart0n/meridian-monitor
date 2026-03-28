"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Line,
} from "recharts";
import { TrendingUp, Lock } from "lucide-react";
import Link from "next/link";

interface Snapshot {
  timestamp: string;
  score: number;
  military: number;
  diplomatic: number;
  conflict: number;
  economic: number;
  nuclear: number;
  driver: string;
}

export function GeiHistoryChart({ premium = false }: { premium?: boolean }) {
  const t = useTranslations("gei");
  const [data, setData] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/gei/history?days=30");
      const json = await res.json();
      setData(json.data ?? []);
    } catch {
      console.error("Failed to fetch GEI history");
    } finally {
      setLoading(false);
    }
  }

  if (!premium) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-6 text-center space-y-4">
        <Lock className="h-8 w-8 text-muted mx-auto" />
        <div>
          <p className="font-semibold">{t("history")}</p>
          <p className="text-sm text-muted mt-1">{t("premium_hint")}</p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center px-4 py-2 bg-accent text-gray-950 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors"
        >
          Premium starten
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-6 animate-pulse">
        <div className="h-64 bg-border rounded-lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-6 text-center text-muted">
        <TrendingUp className="h-8 w-8 mx-auto mb-2" />
        <p>Noch keine historischen Daten. Fuehre die Pipeline mehrmals aus um Verlaufsdaten zu sammeln.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          {t("history")} (30 Tage)
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="geiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) => new Date(v).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            }}
            labelFormatter={(v) => new Date(v).toLocaleString("de-DE")}
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                score: "GEI Gesamt",
                military: "Militaerisch",
                diplomatic: "Diplomatisch",
                conflict: "Konflikte",
                economic: "Wirtschaft",
                nuclear: "Nuklear",
              };
              return [String(value), labels[String(name)] ?? String(name)];
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#geiGradient)"
          />
          <Line type="monotone" dataKey="military" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
          <Line type="monotone" dataKey="diplomatic" stroke="#3b82f6" strokeWidth={1} dot={false} strokeDasharray="3 3" />
          <Line type="monotone" dataKey="conflict" stroke="#f97316" strokeWidth={1} dot={false} strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
