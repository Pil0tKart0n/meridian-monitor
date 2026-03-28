import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Map, Lock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Konfliktkarte — Meridian Monitor",
  description: "Interaktive Echtzeit-Konfliktkarte mit Heatmap, Truppenbewegungen und Handelsrouten.",
};

export default function MapPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-950/30 border border-amber-900/50 px-4 py-1.5 text-sm text-amber-400">
            <Map className="h-4 w-4" />
            Coming Soon — Sprint 2
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Interaktive Konfliktkarte
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Echtzeit-Heatmap aktiver Konfliktzonen mit Truppenbewegungen,
            Luftangriffen, Raketenbeschuss und Handelsrouten-Overlay.
          </p>

          {/* Preview mockup */}
          <div className="relative rounded-2xl bg-surface border border-border overflow-hidden aspect-video max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              {/* Simulated map dots */}
              <div className="absolute top-[35%] left-[55%] h-3 w-3 rounded-full bg-red-500/80 animate-ping" />
              <div className="absolute top-[35%] left-[55%] h-3 w-3 rounded-full bg-red-500" />
              <div className="absolute top-[40%] left-[52%] h-2 w-2 rounded-full bg-orange-500/80 animate-ping" style={{ animationDelay: "0.5s" }} />
              <div className="absolute top-[40%] left-[52%] h-2 w-2 rounded-full bg-orange-500" />
              <div className="absolute top-[45%] left-[50%] h-2 w-2 rounded-full bg-amber-500/80 animate-ping" style={{ animationDelay: "1s" }} />
              <div className="absolute top-[45%] left-[50%] h-2 w-2 rounded-full bg-amber-500" />
              <div className="absolute top-[50%] left-[48%] h-2 w-2 rounded-full bg-red-500/80 animate-ping" style={{ animationDelay: "1.5s" }} />
              <div className="absolute top-[50%] left-[48%] h-2 w-2 rounded-full bg-red-500" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Lock className="h-12 w-12 text-muted mx-auto" />
                <div>
                  <p className="text-lg font-semibold">Verfuegbar mit Premium</p>
                  <p className="text-sm text-muted mt-1">
                    MapLibre GL JS mit ACLED + GDELT Echtzeit-Daten
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-3 bg-accent text-gray-950 rounded-xl font-semibold hover:bg-accent-hover transition-colors"
                >
                  Premium starten
                </Link>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left mt-12">
            <div className="rounded-xl bg-surface border border-border p-5">
              <h3 className="font-semibold mb-2">Echtzeit-Heatmap</h3>
              <p className="text-sm text-muted">Konflikintensitaet visualisiert auf Basis von ACLED-Ereignisdaten.</p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5">
              <h3 className="font-semibold mb-2">Timeline-Scrubber</h3>
              <p className="text-sm text-muted">Betrachte die Entwicklung der Lage ueber Tage und Wochen.</p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5">
              <h3 className="font-semibold mb-2">Handelsrouten</h3>
              <p className="text-sm text-muted">Suezkanal, Rotes Meer und Strasse von Hormuz im Ueberblick.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
