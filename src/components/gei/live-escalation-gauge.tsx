"use client";

import { useEffect, useState } from "react";
import { EscalationGauge } from "./escalation-gauge";

interface GeiData {
  score: number;
  change: number;
  level: string;
  primaryDriver: string;
  categories: {
    military: number;
    diplomatic: number;
    conflict: number;
    economic: number;
    nuclear: number;
  };
  updatedAt: string;
}

export function LiveEscalationGauge({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<GeiData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchGei();
    // Refresh every 5 minutes
    const interval = setInterval(fetchGei, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchGei() {
    try {
      const res = await fetch("/api/gei");
      if (!res.ok) throw new Error("Failed to fetch GEI");
      const json = await res.json();
      setData(json.data);
      setError(false);
    } catch {
      setError(true);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-6 text-center text-muted">
        <p>GEI konnte nicht geladen werden.</p>
        <button
          type="button"
          onClick={fetchGei}
          className="mt-2 text-sm text-accent hover:text-accent-hover"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-6 animate-pulse">
        <div className="mx-auto w-48 h-48 rounded-full bg-border" />
      </div>
    );
  }

  return (
    <EscalationGauge
      score={data.score}
      change={data.change}
      primaryDriver={data.primaryDriver}
      compact={compact}
    />
  );
}
