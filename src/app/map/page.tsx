import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnimatedConflictMap } from "@/components/map/animated-conflict-map";
import { ConflictMapInteractive } from "@/components/map/conflict-map-interactive";

export const metadata = {
  title: "Konfliktkarte — Meridian Monitor",
  description: "Interaktive Echtzeit-Konfliktkarte: Wer kontrolliert was, wo wird gekaempft, welche Fraktionen sind aktiv.",
};

export default function MapPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Konfliktkarte</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Echtzeit-Uebersicht aktiver Konfliktzonen, Fraktionen und Versorgungsrouten
            </p>
          </div>

          {/* Main animated map */}
          <AnimatedConflictMap />

          {/* Hotspot detail map below */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-400">Hotspot-Detailansicht</h2>
            <ConflictMapInteractive />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
