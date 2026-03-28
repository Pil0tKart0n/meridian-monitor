# Meridian Monitor

> Geopolitische Intelligence-Plattform mit Echtzeit-Eskalationsindex. Verstehe die Risiken, bevor sie Schlagzeilen werden.

## Was ist Meridian Monitor?

Meridian Monitor aggregiert und analysiert geopolitische Nachrichten aus 30+ internationalen Quellen in Echtzeit. Im Zentrum steht der **Global Escalation Index (GEI)** --- ein datengetriebener Konfliktindex, der die aktuelle Eskalationslage auf einer Skala von 0 bis 100 bewertet.

Keine Meinungen. Keine Panik. Datenbasierte Analyse.

## Features

### Global Escalation Index (GEI)
- Echtzeit-Konfliktindex (0--100) basierend auf 5 Kategorien: Militaer, Diplomatie, Konfliktereignisse, Wirtschaft, Nuklear/Strategie
- Transparente Methodik --- du siehst genau, welche Events den Index bewegen
- Historische Trends: 7-Tage, 30-Tage, 90-Tage Verlauf
- Push-Alerts bei signifikanten Veraenderungen

### Live-News-Feed
- Automatische Aggregation aus Reuters, BBC, Al Jazeera, Times of Israel, Al-Monitor und 25+ weiteren Quellen
- KI-gestuetzte Zusammenfassungen und Duplikat-Erkennung
- Quellenvergleich: dieselbe Story aus westlichen, arabischen, israelischen, russischen und chinesischen Medien

### Interaktive Konfliktkarte
- Echtzeit-Heatmap aktiver Konfliktzonen
- Truppenbewegungen, Luftangriffe, Raketenbeschuss visualisiert
- Timeline-Scrubber: wie hat sich die Lage entwickelt?
- Handelsrouten-Overlay (Suezkanal, Rotes Meer, Strasse von Hormuz)

### Wirtschafts-Impact-Dashboard
- VIX (Angstindex), Oelpreis, Gold, Defense-Stocks in Echtzeit
- Korrelation zwischen geopolitischen Events und Marktreaktionen
- Supply-Chain-Risk-Alerts fuer Energiemaerkte und Handelsrouten

### OSINT-Integration
- Telegram-Kanal-Monitoring (OSINT-Community)
- Think-Tank-Analysen (Brookings, CSIS, RAND, Chatham House)
- UN/OCHA Humanitaere Daten
- Satellitenbilder-Referenzen

## Preise

| | Free | Premium | Professional |
|---|---|---|---|
| **Preis** | Kostenlos | 9,99 EUR/Monat | 29,99 EUR/Monat |
| News-Feed | 24-48h Verzoegerung | Echtzeit | Echtzeit |
| GEI | Aktueller Wert | + History & Trends | + Rohdaten-Export |
| Konfliktkarte | Basis-Ansicht | Vollstaendig interaktiv | + API-Zugang |
| Briefings | Woechentlich | Taeglich | + Quartals-Forecasting |
| Werbung | Ja | Werbefrei | Werbefrei |
| Alerts | --- | Push-Alerts | + Custom Rules |
| Community | --- | Zugang | Priority |

## Quick Start (Development)

```bash
# Repository klonen
git clone https://github.com/[username]/meridian-monitor.git
cd meridian-monitor

# Dependencies installieren
npm install

# Environment konfigurieren
cp .env.example .env.local
# API Keys eintragen (siehe .env.example fuer Details)

# Development Server starten
npm run dev

# Tests ausfuehren
npm run test

# Lint & Typecheck
npm run lint && npm run typecheck
```

## Tech Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, tRPC, Node.js Cron-Jobs |
| Database | PostgreSQL (Supabase), Redis (Upstash) |
| Auth | NextAuth.js |
| Payments | Stripe |
| Maps | MapLibre GL JS |
| Charts | Recharts |
| i18n | next-intl (DE + EN) |
| Data Pipeline | GDELT, ACLED, RSS, FRED, Telegram Bot API |
| Deployment | Vercel + Supabase + Railway |

## Datenquellen

Meridian Monitor bezieht Daten aus oeffentlich zugaenglichen Quellen:

- **GDELT Project** --- Globale Event-Datenbank, aktualisiert alle 15 Minuten
- **ACLED** --- Kuratierte Konfliktereignis-Daten
- **30+ RSS-Feeds** --- Internationale Nachrichtenagenturen und regionale Medien
- **FRED / Yahoo Finance** --- Wirtschaftsindikatoren und Marktdaten
- **UN OCHA ReliefWeb** --- Humanitaere Lageberichte
- **Telegram** --- OSINT-Community-Kanaele (oeffentlich)

## Projektstruktur

```
src/
  app/                   # Next.js App Router (Pages, Layouts)
  components/            # UI-Komponenten
  lib/                   # Shared Utilities, Types, Config
  server/                # Backend-Logik (tRPC Router, Services)
  pipeline/              # Data Pipeline (Scraper, Aggregator, GEI Calculator)
  i18n/                  # Translations (DE, EN)
docs/                    # Dokumentation, ADRs, Contracts
features/                # Feature Specs
tests/                   # E2E Tests
```

## Lizenz

MIT

## Status

Phase 0 --- Kickoff abgeschlossen. Phase 1 (Discovery) in Arbeit.
