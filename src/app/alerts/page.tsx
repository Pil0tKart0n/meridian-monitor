import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RedAlertFeed } from "@/components/alerts/red-alert-feed";

export const metadata = {
  title: "Live Raketenalarm — Meridian Monitor",
  description: "Echtzeit Tzeva Adom Raketenalarm-Daten aus Israel. Live-Updates alle 30 Sekunden.",
};

export default function AlertsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Live Raketenalarm</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Echtzeit-Daten aus dem israelischen Zivilschutz-Warnsystem (Pikud HaOref / Tzeva Adom).
              Automatische Aktualisierung alle 30 Sekunden.
            </p>
          </div>

          <RedAlertFeed />

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 text-sm text-zinc-500 space-y-2">
            <p className="font-semibold text-zinc-400">Ueber diese Daten</p>
            <p>
              Die Alarm-Daten stammen von tzevaadom.co.il und basieren auf dem offiziellen
              Warnsystem des israelischen Heimatfront-Kommandos (Pikud HaOref). Jeder Alarm
              wird ausgeloest wenn Raketen oder Geschosse auf israelisches Gebiet abgefeuert werden.
            </p>
            <p>
              Die Staedte-Namen werden im Original (Hebraeisch) angezeigt.
              Alarme mit dem Status &quot;Drill&quot; werden automatisch herausgefiltert.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
