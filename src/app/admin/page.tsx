"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Activity, Database, RefreshCw, Zap, FileText,
  CheckCircle, XCircle, Clock,
} from "lucide-react";

interface PipelineStatus {
  articleCount: number;
  latestSnapshot: {
    score: number;
    primaryDriver: string;
    timestamp: string;
  } | null;
}

interface PipelineResult {
  articlesFound: number;
  articlesInserted: number;
  geiScore: number;
  geiLevel: string;
  primaryDriver: string;
  durationSeconds: number;
}

interface SummarizeResult {
  processed: number;
  summarized: number;
  failed: number;
}

export default function AdminPage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/pipeline");
      const data = await res.json();
      setStatus(data.data);
    } catch {
      console.error("Failed to fetch status");
    }
  }

  async function runPipeline() {
    setLoading("pipeline");
    setLastResult(null);
    try {
      const res = await fetch("/api/pipeline", { method: "POST" });
      const data = await res.json();
      const result = data.data as PipelineResult;
      setLastResult(
        `Pipeline fertig: ${result.articlesInserted} Artikel eingefuegt, GEI: ${result.geiScore}/100 (${result.geiLevel}), ${result.durationSeconds}s`
      );
      fetchStatus();
    } catch {
      setLastResult("Pipeline fehlgeschlagen");
    } finally {
      setLoading(null);
    }
  }

  async function runSummarize(limit: number) {
    setLoading("summarize");
    setLastResult(null);
    try {
      const res = await fetch(`/api/pipeline/summarize?limit=${limit}`, { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setLastResult(`Fehler: ${data.error}`);
      } else {
        const result = data.data as SummarizeResult;
        setLastResult(
          `Summarization fertig: ${result.summarized}/${result.processed} Artikel zusammengefasst, ${result.failed} fehlgeschlagen`
        );
      }
      fetchStatus();
    } catch {
      setLastResult("Summarization fehlgeschlagen");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Zap className="h-6 w-6 text-accent" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted mt-1">Pipeline-Management und Datenbank-Status</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 text-sm text-muted mb-2">
                <Database className="h-4 w-4" />
                Artikel in DB
              </div>
              <p className="text-3xl font-bold tabular-nums">
                {status?.articleCount ?? "..."}
              </p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 text-sm text-muted mb-2">
                <Activity className="h-4 w-4" />
                Aktueller GEI
              </div>
              <p className="text-3xl font-bold tabular-nums">
                {status?.latestSnapshot?.score ?? "—"}<span className="text-lg text-muted">/100</span>
              </p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5">
              <div className="flex items-center gap-2 text-sm text-muted mb-2">
                <Clock className="h-4 w-4" />
                Letztes Update
              </div>
              <p className="text-sm font-medium">
                {status?.latestSnapshot?.timestamp
                  ? new Date(status.latestSnapshot.timestamp).toLocaleString("de-DE")
                  : "Noch kein Snapshot"}
              </p>
              {status?.latestSnapshot?.primaryDriver && (
                <p className="text-xs text-muted mt-1">
                  Treiber: {status.latestSnapshot.primaryDriver}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Aktionen</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={runPipeline}
                disabled={loading !== null}
                className="flex items-center gap-3 rounded-xl bg-surface border border-border p-5 hover:border-accent/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="rounded-lg bg-green-950/50 p-2.5">
                  <RefreshCw className={`h-5 w-5 text-green-400 ${loading === "pipeline" ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <p className="font-medium">Pipeline ausfuehren</p>
                  <p className="text-xs text-muted mt-0.5">RSS-Feeds abrufen, kategorisieren, GEI aktualisieren</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => runSummarize(20)}
                disabled={loading !== null}
                className="flex items-center gap-3 rounded-xl bg-surface border border-border p-5 hover:border-accent/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="rounded-lg bg-purple-950/50 p-2.5">
                  <FileText className={`h-5 w-5 text-purple-400 ${loading === "summarize" ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <p className="font-medium">20 Artikel zusammenfassen</p>
                  <p className="text-xs text-muted mt-0.5">GPT-4o-mini Zusammenfassungen (Deutsch)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => runSummarize(50)}
                disabled={loading !== null}
                className="flex items-center gap-3 rounded-xl bg-surface border border-border p-5 hover:border-accent/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="rounded-lg bg-purple-950/50 p-2.5">
                  <FileText className={`h-5 w-5 text-purple-400 ${loading === "summarize" ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <p className="font-medium">50 Artikel zusammenfassen</p>
                  <p className="text-xs text-muted mt-0.5">Groesserer Batch (~$0.05 Kosten)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Result */}
          {lastResult && (
            <div className={`rounded-xl border p-4 text-sm flex items-start gap-3 ${
              lastResult.includes("fehlgeschlagen") || lastResult.includes("Fehler")
                ? "bg-red-950/30 border-red-900/50 text-red-400"
                : "bg-green-950/30 border-green-900/50 text-green-400"
            }`}>
              {lastResult.includes("fehlgeschlagen") || lastResult.includes("Fehler") ? (
                <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              {lastResult}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
