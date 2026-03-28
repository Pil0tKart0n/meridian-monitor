import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Lock, BarChart3, DollarSign, Fuel, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Wirtschafts-Dashboard — Meridian Monitor",
  description: "Geopolitische Wirtschaftsindikatoren: VIX, Oelpreis, Gold, Defense-Stocks und ihre Korrelation mit dem Eskalationsindex.",
};

export default function EconomyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wirtschafts-Impact</h1>
            <p className="text-muted mt-2">
              Wie geopolitische Spannungen die globalen Maerkte beeinflussen.
            </p>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <IndicatorCard
              icon={BarChart3}
              label="VIX Angstindex"
              value="24.5"
              change="+18%"
              changeType="negative"
              description="3-Monats-Hoch"
            />
            <IndicatorCard
              icon={Fuel}
              label="Brent Crude"
              value="$87.30"
              change="+4.2%"
              changeType="negative"
              description="Pro Barrel"
            />
            <IndicatorCard
              icon={DollarSign}
              label="Gold"
              value="$2,340"
              change="+2.1%"
              changeType="positive"
              description="Safe-Haven-Nachfrage"
            />
            <IndicatorCard
              icon={Shield}
              label="Defense ETF (ITA)"
              value="$142.80"
              change="+6.3%"
              changeType="positive"
              description="All-Time-High"
            />
          </div>

          {/* Premium Gate */}
          <div className="rounded-2xl bg-surface border border-border p-8 text-center space-y-6">
            <div className="space-y-3">
              <Lock className="h-10 w-10 text-muted mx-auto" />
              <h2 className="text-xl font-bold">Detaillierte Charts und Korrelationsanalyse</h2>
              <p className="text-muted max-w-lg mx-auto">
                Historische Verlaeufe, GEI-vs-Markt-Korrelation, Supply-Chain-Risk-Alerts
                und Rohdaten-Export sind Professional-Features.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-accent text-gray-950 rounded-xl font-semibold hover:bg-accent-hover transition-colors"
            >
              Professional starten
            </Link>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-surface border border-border p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Fuel className="h-5 w-5 text-amber-400" />
                Energiemaerkte
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Huthi-Angriffe im Roten Meer haben zu Umleitungen ueber das Kap der Guten Hoffnung gefuehrt.
                Versicherungspraemien fuer Frachtschiffe sind um 300% gestiegen.
                Die Strasse von Hormuz bleibt der kritischste Engpass — 20% des weltweiten Oels passieren hier.
              </p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Ruestungsindustrie
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Defense-Stocks (Lockheed Martin, Raytheon, BAE Systems) erreichen Allzeithochs.
                Die globalen Ruestungsausgaben sind 2025 auf ueber $2.4 Billionen gestiegen.
                NATO-Mitglieder erhoehen ihre Verteidigungsbudgets auf das 2%-Ziel.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function IndicatorCard({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  description,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  description: string;
}) {
  return (
    <div className="rounded-xl bg-surface border border-border p-5">
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        <span
          className={`text-sm font-medium ${
            changeType === "negative" ? "text-red-400" : "text-green-400"
          }`}
        >
          {change}
        </span>
        <span className="text-xs text-muted">{description}</span>
      </div>
    </div>
  );
}
