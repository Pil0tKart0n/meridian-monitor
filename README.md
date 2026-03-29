# Meridian Monitor

> Geopolitische Intelligence-Plattform mit Echtzeit-Eskalationsindex. Verstehe die Risiken, bevor sie Schlagzeilen werden.

## Was ist Meridian Monitor?

Meridian Monitor aggregiert und analysiert geopolitische Nachrichten aus 30+ internationalen Quellen in Echtzeit. Im Zentrum steht der **Global Escalation Index (GEI)** --- ein datengetriebener Konfliktindex, der die aktuelle Eskalationslage auf einer Skala von 0 bis 100 bewertet.

Keine Meinungen. Keine Panik. Datenbasierte Analyse.

## Features

### WW3 Risk Counter + Nuklear-Risiko
- Sticky Widget oben rechts --- immer im Blick
- WW3-Risiko-Index (0--100%) und Nuklear-Eskalationsstufe
- Expandierbares Panel mit Fortschrittsbalken und Tage-seit-Eskalation-Counter
- Daten basierend auf GDELT, ACLED und SIPRI

### Global Escalation Index (GEI)
- Echtzeit-Konfliktindex (0--100) basierend auf 5 Kategorien: Militaer, Diplomatie, Konfliktereignisse, Wirtschaft, Nuklear/Strategie
- Transparente Methodik --- du siehst genau, welche Events den Index bewegen
- Historische Trends: 7-Tage, 30-Tage, 90-Tage Verlauf
- Push-Alerts bei signifikanten Veraenderungen

### Animierte Konfliktkarte
- SVG-basierte Karte mit Laendersilhouetten (Israel, Jordanien, Libanon, Syrien, Tuerkei, Iran, Jemen, Saudi-Arabien, Aegypten)
- 12 animierte Konfliktereignisse mit Emojis und Faction-Farben
- Animierte Versorgungsrouten (Iran -> Syrien, Iran -> Huthis, Iran -> Hamas)
- Fullscreen-Modus, Hover-Effekte auf Laendern, Detail-Panel bei Klick
- 8 Fraktionen: Israel/IDF, Hamas, Hisbollah, Iran/IRGC, Huthi, NATO/USA, Russland, Tuerkei

### Live-News-Feed
- Automatische Aggregation aus Reuters, BBC, Al Jazeera, Times of Israel, Al-Monitor und 25+ weiteren Quellen
- KI-gestuetzte Zusammenfassungen (GPT-4o-mini) und Duplikat-Erkennung
- 391+ echte Artikel in der Datenbank
- Smart Brevity Cards mit Faktencheck-Layer

### Signal vs. Noise --- Meme-Galerie
- 9 geopolitische Memes mit Faktencheck (Faktenbasiert / Irreführend / Falsch / Satire)
- Masonry-Grid mit Like/Share/Comment, Sort (Hot/Neu/Top), Tag-Filter
- Quellenangaben bei jedem Faktencheck

### Telegram Frontline
- 9 kuratierte Kriegs-/OSINT-Telegram-Kanaele
- Kategorien: Frontline, OSINT, Analyse, Raketenalarm, Drohnen & Tech, Nahost
- Content-Warning-Gate (muss bestaetigt werden)
- Warnstufen pro Kanal: Sicher / Grafisch / Extrem Grafisch

### Wirtschafts-Impact-Dashboard
- VIX (Angstindex), Oelpreis, Gold, Defense-Stocks
- Korrelation zwischen geopolitischen Events und Marktreaktionen

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

## Quick Start (Development)

```bash
# Repository klonen
git clone https://github.com/Pil0tKart0n/meridian-monitor.git
cd meridian-monitor

# Dependencies installieren
npm install

# Datenbank generieren
npm run db:generate

# Environment konfigurieren
cp .env.example .env.local
# API Keys eintragen (OPENAI_API_KEY fuer Zusammenfassungen)

# Development Server starten
npm run dev

# Tests ausfuehren
npm run test

# Lint & Typecheck
npm run lint && npm run typecheck

# Production Build
npm run build
```

## Tech Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend | Next.js 16, React 19, TypeScript (strict), Tailwind CSS 4 |
| Backend | Next.js API Routes, Prisma 6 |
| Database | SQLite (Prisma), 391+ echte Artikel |
| Auth | NextAuth.js v5 (Email/Password) |
| Payments | Stripe (Subscriptions) |
| Animation | Framer Motion, CSS Keyframes |
| Charts | Recharts |
| i18n | next-intl (DE + EN) |
| Data Pipeline | GDELT, RSS (30+ Quellen), OpenAI GPT-4o-mini |
| Testing | Vitest, 25 Unit-Tests |
| Deployment | Vercel (Serverless) |

## Datenquellen

- **GDELT Project** --- Globale Event-Datenbank, aktualisiert alle 15 Minuten
- **30+ RSS-Feeds** --- Reuters, BBC, Al Jazeera, Times of Israel, Al-Monitor und mehr
- **OpenAI GPT-4o-mini** --- KI-Zusammenfassungen und Kategorisierung
- **FRED / Yahoo Finance** --- VIX, Oelpreis, Gold, Defense-Stocks
- **Telegram** --- OSINT-Community-Kanaele (oeffentlich)

## Routen

| Route | Beschreibung |
|-------|-------------|
| `/` | Landing Page mit GEI-Gauge, Features, Pricing |
| `/news` | Live-News-Feed mit Kategorie- und Regionsfilter |
| `/map` | Animierte Konfliktkarte + Hotspot-Details |
| `/memes` | Meme-Galerie + Telegram-Kanaele |
| `/economy` | Wirtschafts-Impact-Dashboard |
| `/alerts` | Red Alert Feed |
| `/methodology` | GEI-Methodik-Transparenz |
| `/pricing` | Abo-Vergleich |
| `/admin` | Admin Dashboard (Pipeline-Steuerung) |

## Projektstruktur

```
src/
  app/                   # Next.js App Router (22 Routen)
  components/
    landing/             # Hero, Features, Alerts, Pricing, Newsletter
    map/                 # Animated Conflict Map, Hotspot Map
    memes/               # Meme Gallery mit Faktencheck
    telegram/            # Telegram Channels mit Warning Gate
    gei/                 # Escalation Gauge, History Chart
    news/                # Breaking Ticker, News Feed, News Cards
    ui/                  # WW3 Counters, Animated Globe, Scroll Reveal
    layout/              # Header, Footer, Bottom Nav
  pipeline/              # Data Pipeline (RSS, GDELT, GEI Calculator, Summarizer)
  lib/                   # Utilities, Auth, DB
  i18n/                  # Translations (DE, EN)
docs/                    # Dokumentation, ADRs
features/                # Feature Specs (9 Epics)
tests/                   # Test Setup
prisma/                  # DB Schema + Seed
```

## Lizenz

MIT

## Status

v0.5.0 --- WW3/Nuklear-Counter, animierte SVG-Konfliktkarte mit Laendersilhouetten, Telegram Frontline (9 Kanaele), 9 Memes mit Faktencheck, 25 Unit-Tests, Security Audit bestanden. 22 Routen, Production Build erfolgreich.
