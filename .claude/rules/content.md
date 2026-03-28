# Content Rules

## Voice Consistency (HARD RULE)
- All user-facing text MUST match the voice profile in `docs/content/voice-and-tone.md`
- No ad-hoc voice decisions — check the Voice Profile before writing user-facing copy
- When in doubt about tone: check the Tone Variation Map for the specific context (onboarding, error, success, destructive action)
- Voice is constant (brand personality). Tone adapts to context. Never confuse the two.

## Terminology (HARD RULE)
- Use ONLY terms defined in `docs/content/terminology.md` — no ad-hoc synonyms
- Neue Terme erfordern ein CDR (Content Decision Record) in `docs/content/decisions/` bevor sie in Code oder UI verwendet werden
- Domain terms map 1:1 to code identifiers (variable names, i18n keys, API fields, DB columns)
- Vor dem Einführen eines neuen user-facing Begriffs: `docs/content/terminology.md` prüfen
- **Konsistenz-Check:** Wenn ein Term an >1 Stelle vorkommt, muss überall dieselbe Schreibweise verwendet werden
- Beispiel: "Workspace" vs. "Arbeitsbereich" — CDR entscheidet, Terminology.md dokumentiert

## Error Messages (HARD RULE)
- Jede Error Message folgt der **PatternFly-Formel: Description + Reason + Resolution**
- **SCHLECHT:** "Error 500" / "Something went wrong" / "Fehler aufgetreten"
- **GUT:** "Änderungen konnten nicht gespeichert werden (Server antwortet nicht). Versuche es in wenigen Sekunden erneut."
- **API→UI Error-Mapping:** Backend liefert maschinenlesbare `errorCode`s (RFC 9457, siehe `backend.md`). Frontend mappt diese auf menschliche Nachrichten. Error-Mapping-Tabelle in `docs/content/patterns/error-messages.md` pflegen:
  ```markdown
  | errorCode | UI-Message (DE) | Severity |
  |-----------|-----------------|----------|
  | AUTH_INVALID_CREDENTIALS | "E-Mail oder Passwort ist falsch. Überprüfe deine Eingaben." | Error |
  | RATE_LIMITED | "Zu viele Versuche. Warte [X] Sekunden und versuche es erneut." | Warning |
  ```
- Zod/Validation-Errors: Machine-Errors am UI-Boundary in menschliche Messages transformieren
- Niemals technische Details an User exponieren (Stack Traces, DB-Fehler, interne Codes)
- Error-Severity-Matrix beachten:
  - **Info** (blau): Nicht-blockierender Kontext
  - **Success** (grün): Aktion abgeschlossen (kurz halten)
  - **Warning** (gelb): Potentielles Problem wenn ignoriert
  - **Error** (rot): Aktion fehlgeschlagen oder blockiert
  - **Critical** (rot, hervorgehoben): Datenverlust oder Sicherheitsrisiko

## Empty States
- Jeder Empty State MUSS Guidance-Text enthalten — niemals nur leerer Bereich oder "Keine Daten"
- **Drei Typen mit unterschiedlichen Zielen:**
  - **First-use:** Willkommen + Motivation für erste Aktion ("Noch keine Projekte. Erstelle dein erstes Projekt.")
  - **No-results:** Alternative vorschlagen ("Keine Ergebnisse für 'xyz'. Versuche einen anderen Suchbegriff.")
  - **Cleared:** Bestätigung + nächster Schritt ("Alles erledigt! Schau später wieder vorbei.")
- Immer einen CTA (Button oder Link) für die nächste Aktion einbauen
- Maximal 1-2 Sätze

## Buttons & CTAs
- **Verb-first, specific outcome:** "Änderungen speichern", "Projekt erstellen", "Account löschen"
- **NICHT:** "OK", "Absenden", "Ja", "Hier klicken", "Submit"
- **Sentence case** (nicht Title Case, nicht UPPERCASE)
- Destructive Actions: explizite Konsequenz im Label ("Projekt unwiderruflich löschen")
- Dialog-Buttons matchen die Headline: Dialog "3 Elemente löschen?" → Button "Elemente löschen" (nicht "Bestätigen")

## Microcopy Standards
Jedes Stück Microcopy wird gegen vier Qualitätsstandards geprüft:
1. **Purposeful** — Dient es einem klaren User-Bedürfnis? Wenn nein, weglassen.
2. **Concise** — Ist jedes Wort nötig? Kürzer formulieren (aber nicht kürzer als nötig).
3. **Conversational** — Klingt es wie ein kompetenter Freund, nicht wie ein Roboter?
4. **Clear** — Ist die Bedeutung sofort klar? Kein Jargon, keine Doppeldeutigkeiten.

## Content-Before-Code (EMPFEHLUNG)
- Für user-facing Stories: Content Spec VOR Implementation
- Content Brief am Issue anhängen bevor Frontend/Backend starten
- Änderungen an bestehender Copy: Content-Artifact updaten + CDR wenn Terminologie sich ändert
- **Reihenfolge:** Content-Struktur definieren → Design-Layout → Implementation

## Documentation Copy
- **README:** User-/Player-Perspektive zuerst, Developer-Perspektive danach. Voice-consistent.
- **CHANGELOG:** User-facing Sprache — was hat sich FÜR DEN USER geändert, nicht welcher Code sich geändert hat
  - **GUT:** "Du kannst jetzt Projekte per Drag & Drop sortieren"
  - **SCHLECHT:** "Added DnD handler to ProjectList component"
- **Release Notes:** Benefits, nicht Features ("Du kannst jetzt..." nicht "Unterstützung für... hinzugefügt")
- **Error Docs:** Fehlercodes mit menschlicher Beschreibung + Resolution

## i18n Content Rules
- Keine String-Concatenation für übersetzbaren Text — immer parametrisiert: `t('greeting', { name })`
- i18n Keys folgen Terminologie-Taxonomy: `[feature].[component].[element]`
  - Beispiel: `checkout.cart.emptyState`, `auth.login.errorInvalidEmail`
- Placeholder-Text in Translations muss realistisch sein (nicht "Lorem ipsum")
- 30% Text-Expansion einplanen (DE vs EN) bei Layout
- ICU MessageFormat für Pluralisierung: `{count, plural, one {# Element} other {# Elemente}}`

## Accessibility Copy
- **Alt-Text:** Beschreibend, nicht dekorativ ("Balkendiagramm zeigt monatlichen Umsatz" nicht "chart.png")
- **ARIA Labels:** Aktions-orientiert ("Dialog schließen", "Navigationsmenü öffnen")
- **Screen Reader Text:** Vollständige Sätze, keine Fragmente
- **Form Error Announcements:** Spezifisch und handlungsorientiert
- **Link-Text:** Beschreibend, nie "hier klicken" oder "mehr erfahren" ohne Kontext

## Notifications
- Vier Typen mit unterschiedlichen Copy-Patterns:
  - **Confirmation:** "{Was erledigt wurde}" — kurz. "Kommentar gepostet"
  - **Update:** "{Wer} {hat was getan} {womit}" — "Alex hat deinen Task kommentiert"
  - **Status:** "{Was passiert}. {ETA wenn relevant}" — "Änderungen werden synchronisiert."
  - **Reminder:** "{Was Aufmerksamkeit braucht}. {Wann/Warum}" — "Dein Test endet in 3 Tagen."

## Content Decision Records (CDR-Pflicht)
- **Terminologie-Änderungen die Code betreffen** → CDR erforderlich
- **Voice/Tone Profile Änderungen** → CDR erforderlich
- **Neue Content Patterns** → CDR erforderlich
- CDRs werden in `docs/content/decisions/` gespeichert
- CDR-Format: siehe `docs/skills/content-strategist/SKILL.md` § CDR-Format
- Nummerierung: CDR-001, CDR-002, etc. (aufsteigend)

## Anti-Patterns (vermeiden)
- **Inkonsistente Terminologie:** Dasselbe Konzept mit verschiedenen Wörtern benennen ("Workspace" / "Arbeitsbereich" / "Bereich")
- **Technischer Jargon in UI:** Interne Begriffe die User nicht verstehen ("Entity", "Payload", "Render")
- **Passive Fehlermeldungen:** "Es ist ein Fehler aufgetreten" (wer? was? und jetzt?)
- **Vibes statt Profil:** "Unsere Sprache ist freundlich" ohne messbare Definition
- **Copy-Paste zwischen Kontexten:** Onboarding-Ton in Fehlermeldungen oder umgekehrt
- **Zombie-Copy:** Placeholder-Text der nie durch echte Inhalte ersetzt wurde
