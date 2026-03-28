import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Activity, BarChart3, Shield, TrendingUp, Atom, Handshake,
  Crosshair, Clock, Database, Eye,
} from "lucide-react";

export const metadata = {
  title: "GEI-Methodik — Meridian Monitor",
  description: "Transparente Methodik des Global Escalation Index. Datenquellen, Gewichtung, Scoring und Berechnungsmodell.",
};

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-950/30 border border-amber-900/50 px-4 py-1.5 text-sm text-amber-400">
              <Eye className="h-4 w-4" />
              Vollstaendig transparent
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Global Escalation Index — Methodik
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              Der GEI ist ein datengetriebener Konfliktindex auf einer Skala von 0 bis 100.
              Er wird aus fuenf gewichteten Kategorien berechnet und alle 15 Minuten aktualisiert.
              Hier erklaeren wir genau, wie er funktioniert.
            </p>
          </div>

          {/* Categories */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-accent" />
              Fuenf Kategorien, gewichtet
            </h2>

            <div className="space-y-4">
              <CategoryCard
                icon={Crosshair}
                name="Military Activity"
                weight={30}
                color="text-red-400"
                bg="bg-red-950/30"
                indicators={[
                  "Truppenbewegungen und -verlegungen",
                  "Raketentests und Waffensysteme",
                  "Flottenpositionierung in Engpaessen (Hormuz, Rotes Meer)",
                  "Luftangriffe und Drohnenoperationen",
                  "Militaeruebungen nahe Gegner-Grenzen",
                ]}
              />
              <CategoryCard
                icon={Handshake}
                name="Diplomatic Signals"
                weight={25}
                color="text-blue-400"
                bg="bg-blue-950/30"
                indicators={[
                  "Botschafter-Rueckrufe / Ausweisungen",
                  "UN-Sicherheitsrat Vetos und Dringlichkeitssitzungen",
                  "Neue Sanktionen oder Sanktionslockerungen",
                  "Vertragsrueckzuege oder -suspendierungen",
                  "Status diplomatischer Kanaele (offen, eingefroren, Hinterkanal)",
                ]}
              />
              <CategoryCard
                icon={Shield}
                name="Conflict Events"
                weight={25}
                color="text-orange-400"
                bg="bg-orange-950/30"
                indicators={[
                  "Direkte kinetische Konfrontationen zwischen Grossmaechten/Proxies",
                  "Zivile Opferzahlen-Trends (ACLED-Daten)",
                  "Grenzuebergreifende Angriffe",
                  "Proxy-Gruppen-Aktivierung und -Eskalation",
                  "CBRN-Indikatoren (chemisch, biologisch, radiologisch, nuklear)",
                ]}
              />
              <CategoryCard
                icon={TrendingUp}
                name="Economic Stress"
                weight={10}
                color="text-amber-400"
                bg="bg-amber-950/30"
                indicators={[
                  "VIX-Spikes (>25 = erhoeht, >35 = hoch)",
                  "Oelpreis-Schocks (>10% Woechentlich)",
                  "Gold-Nachfrage (Safe-Haven-Indikator)",
                  "Defense-Stock-Surges (Markt preist Konflikt ein)",
                  "Waehrungsflucht aus konfliknahen Oekonomien",
                ]}
              />
              <CategoryCard
                icon={Atom}
                name="Nuclear / Strategic"
                weight={10}
                color="text-purple-400"
                bg="bg-purple-950/30"
                indicators={[
                  "Nuklear-Posture-Aenderungen",
                  "Strategische Bomber-Verlegungen",
                  "ICBM/SLBM-Testaktivitaet",
                  "Nukleare Rhetorik von Staatschefs",
                  "Status von Ruestungskontrollabkommen",
                ]}
              />
            </div>
          </section>

          {/* Scoring */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Activity className="h-6 w-6 text-accent" />
              Event Scoring
            </h2>
            <p className="text-muted leading-relaxed">
              Jedes erkannte Ereignis erhaelt einen Score von -10 (starke Deeskalation) bis +10 (schwere Eskalation):
            </p>
            <div className="rounded-xl bg-surface border border-border p-6 font-mono text-sm space-y-1">
              <p className="text-red-400"> +8 bis +10: Militaerinvasion, Nukleartest, WMD-Einsatz</p>
              <p className="text-red-400/80"> +5 bis +7: Grosser Raketenangriff, Seeblockade, Mobilmachung</p>
              <p className="text-orange-400">+3 bis +4: Truppenaufbau, Sanktionseskalation, Botschafter-Rueckruf</p>
              <p className="text-amber-400"> +1 bis +2: Feindliche Rhetorik, Proxy-Eskalation, Grenzzwischenfall</p>
              <p className="text-gray-400">         0: Status quo</p>
              <p className="text-green-400/80">-1 bis -3: Hinterkanal-Gespraeche, Waffenstillstandsangebot</p>
              <p className="text-green-400"> -5 bis -8: Friedensabkommen, Sanktionslockerung, Truppenrueckzug</p>
            </div>
          </section>

          {/* Decay */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Clock className="h-6 w-6 text-accent" />
              Zeitlicher Verfall
            </h2>
            <p className="text-muted leading-relaxed">
              Ereignisse verlieren ueber Zeit an Gewicht. Wir verwenden einen exponentiellen Verfall
              mit einer <strong className="text-foreground">Halbwertszeit von 14 Tagen</strong>:
            </p>
            <div className="rounded-xl bg-surface border border-border p-6 font-mono text-sm">
              <p>Gewicht = Score × e<sup>(-λ × t)</sup></p>
              <p className="text-muted mt-2">λ = ln(2) / 14 ≈ 0.0495</p>
              <p className="text-muted mt-1">t = Alter des Ereignisses in Tagen</p>
            </div>
            <p className="text-muted leading-relaxed">
              Ein Ereignis mit Score +8 von vor 2 Wochen traegt nur noch +4 bei.
              Nach 90 Tagen fallen Ereignisse vollstaendig aus dem Rolling Window.
            </p>
          </section>

          {/* Data Sources */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Database className="h-6 w-6 text-accent" />
              Datenquellen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SourceCard name="GDELT Project" type="News-Events" frequency="Alle 15 Min." />
              <SourceCard name="ACLED" type="Konfliktereignisse" frequency="Woechentlich" />
              <SourceCard name="30+ RSS-Feeds" type="Nachrichten" frequency="Alle 5 Min." />
              <SourceCard name="FRED / Yahoo Finance" type="Marktdaten" frequency="Taeglich" />
              <SourceCard name="UN OCHA ReliefWeb" type="Humanitaere Berichte" frequency="Taeglich" />
              <SourceCard name="SIPRI / Arms Control" type="Ruestungsdaten" frequency="Monatlich" />
            </div>
          </section>

          {/* Scale */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Skala Interpretation</h2>
            <div className="space-y-3">
              <ScaleRow range="0-20" label="Niedrig" color="bg-green-500" description="Normales geopolitisches Grundrauschen" />
              <ScaleRow range="21-40" label="Erhoeht" color="bg-yellow-500" description="Aktive regionale Konflikte, verstaerkte militaerische Positionierung" />
              <ScaleRow range="41-60" label="Hoch" color="bg-amber-500" description="Mehrere aktive Kriege, nukleare Rhetorik, Grossmacht-Proxy-Konflikte" />
              <ScaleRow range="61-80" label="Schwer" color="bg-orange-500" description="Direkte Konfrontation zwischen Grossmaechten, Mobilmachung" />
              <ScaleRow range="81-100" label="Kritisch" color="bg-red-500" description="Aktive Feindseligkeiten zwischen Nuklearmaechten" />
            </div>
          </section>

          {/* Calibration */}
          <section className="rounded-xl bg-surface border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold">Historische Kalibrierung</h2>
            <p className="text-sm text-muted leading-relaxed">
              Der Index wird gegen historische Ereignisse kalibriert:
              Die Kubakrise (1962) sollte bei 85-90 liegen, der Beginn der russischen Invasion
              in der Ukraine (Februar 2022) bei 55-65, ein durchschnittlicher Tag bei 15-25.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Methodik-Aenderungen werden transparent dokumentiert und angekuendigt.
              Die vollstaendige Berechnungslogik ist Open Source.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function CategoryCard({
  icon: Icon,
  name,
  weight,
  color,
  bg,
  indicators,
}: {
  icon: typeof Crosshair;
  name: string;
  weight: number;
  color: string;
  bg: string;
  indicators: string[];
}) {
  return (
    <div className="rounded-xl bg-surface border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-lg p-2 ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <h3 className="font-semibold">{name}</h3>
        <span className="ml-auto text-sm font-mono text-accent">{weight}%</span>
      </div>
      <ul className="space-y-1.5 text-sm text-muted">
        {indicators.map((indicator) => (
          <li key={indicator} className="flex items-start gap-2">
            <span className="text-border mt-1.5">-</span>
            {indicator}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceCard({ name, type, frequency }: { name: string; type: string; frequency: string }) {
  return (
    <div className="rounded-lg bg-background border border-border p-4">
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-muted mt-1">{type} — {frequency}</p>
    </div>
  );
}

function ScaleRow({ range, label, color, description }: { range: string; label: string; color: string; description: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-surface border border-border p-4">
      <div className={`h-4 w-4 rounded-full ${color} shrink-0`} />
      <div className="w-16 font-mono text-sm font-medium shrink-0">{range}</div>
      <div className="w-20 text-sm font-semibold shrink-0">{label}</div>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
