# Audio Rules

## Audio Accessibility (HARD RULE)
- **Keine Information NUR über Audio vermitteln** — jedes Audio-Event hat ein visuelles Äquivalent
- Volume-Slider pro Kategorie: Master, Music, SFX, UI (mindestens)
- Mute-Button: sofortige Stille, ein Klick/Tap, kein Ausblenden
- Mono-Downmix muss funktionieren (Phasen-Auslöschung checken)
- `prefers-reduced-motion`: starke Audio-Effekte (Bass-Drops, Stinger) reduzieren
- Kein Autoplay — AudioContext NUR nach User-Gesture initialisieren

## Audio Budgets (HARD RULE)
- Jedes Projekt mit Audio MUSS ein Audio-Budget haben BEVOR Sounds designed werden
- Budget definieren in `docs/contracts/AUDIO-BUDGETS.md`
- Budget-Format: Kategorie + Max-Größe + Format + Bitrate + Voice-Limit + Memory-Limit
- Budget-Verletzung → Fix vor Merge
- **Gleichzeitige Voices begrenzen:** ≤16 Mobile, ≤32 Desktop (eigenes Priority-System)
- **Kein unbounded Audio im RAM** — dekodiertes PCM ist ~10x größer als Datei

## AudioContext Lifecycle (HARD RULE)
- AudioContext NUR nach User-Gesture erstellen/resumieren (click, touch, keydown)
- Tab-Visibility-API: `document.hidden` → `audioContext.suspend()`, sichtbar → `.resume()`
- AudioContext `close()` bei App-Teardown (SPA Route-Change, unmount)
- **Kein `new AudioContext()` pro Sound** — ein globaler Context, wiederverwendet
- Safari-Quirks beachten: strengere Autoplay-Policy, weniger gleichzeitige Voices

## Anti-Ermüdung (HARD RULE)
- Jeder Sound >10x/Minute → mindestens 3 Variationen (besser 5)
- Variationen: Pitch ±50 Cent, Volume ±3dB, Timing ±20ms, Round-Robin-Auswahl
- Musik-Loops: ≥30s Dauer bevor Pattern erkennbar wird
- Ambient-Loops: Silence-Windows einbauen (nicht dauerhaft voll)
- UI-Sounds: weniger ist mehr — dekorative Sounds werden schnell nervend

## Asset Pipeline
- Source-Format: WAV/AIFF (unkomprimiert) als Master in Versionsverwaltung (oder extern)
- Export-Format: OGG (primär) + MP3 (Fallback für Safari <17)
- Feature-Detection im Code: `canPlayType()` für Format-Auswahl
- Audio Sprites für häufige kurze Sounds (reduziert HTTP-Requests)
- Naming: `[category]-[action]-[variant].[format]` (z.B. `ui-click-soft-01.ogg`)
- Kein Clipping: True Peak ≤ -1 dBTP
- Tail-Silence trimmen, Fade-In/Out an Schnittstellen
- Loudness-Normalisierung: konsistent innerhalb Kategorien (LUFS-basiert, nicht Peak)

## Performance
- Kurze Sounds (<5s): AudioBufferSourceNode (Buffering)
- Lange Sounds (Musik, >5s): MediaElementAudioSourceNode (Streaming)
- `decodeAudioData()` in `requestIdleCallback` oder bei App-Start — nie während Gameplay
- AudioNodes nach Verwendung `disconnect()` — verhindert Memory-Leaks
- Audio Pool Pattern für häufig getriggerte Sounds (verhindert GC-Stalls)
- Preloading: P0 (UI) bei App-Start, P1 (SFX) nach User-Gesture, P2 (Musik) lazy/streaming

## Loudness & Mixing
- Loudness-Hierarchie: UI > Gameplay SFX > Ambience > Music (bei Voice-Knappheit)
- Keine plötzlichen Lautstärke-Sprünge zwischen Kategorien
- Ducking: Musik leiser wenn wichtige SFX/Dialog spielen
- Master-Limiter am Ende der Audio-Kette (verhindert Clipping bei Summierung)

## Sonic Consistency
- Alle UI-Sounds in derselben Klangfamilie (Material, Frequenzbereich, Reverb)
- Sonic Palette dokumentieren in `docs/audio/sonic-palette.md`
- Wenn Sonic Palette sich ändert → AuDR erstellen
- Brand-Sounds (Sonic Logo, Jingles) in derselben Tonart

## Testing
- [ ] Alle Sounds aus der Audio-Event-Map zugeordnet
- [ ] Loops nahtlos (kein hörbarer Loop-Point, kein Knacken)
- [ ] Transitions knackfrei (kein Click, kein Gap)
- [ ] Mono-Downmix geprüft (Stereo-Sounds phasen-sicher)
- [ ] Mobile Safari getestet (strengste Autoplay-Policy)
- [ ] Volume-Slider + Mute funktionieren
- [ ] `prefers-reduced-motion` respektiert

## Anti-Patterns (vermeiden)
- **Audio als Afterthought:** "Sounds machen wir am Ende" → Audio in Phase 2 mitplanen
- **Gleicher Sound 100x:** Ohne Variation → Machine Gun Effect → User genervt
- **Autoplay auf Mobile:** Browser blockiert, User frustriert → User-Gesture-Requirement
- **Unkomprimierte WAVs in Production:** 10x zu groß → OGG/MP3 verwenden
- **Alle Sounds bei App-Start laden:** Blockiert Start → Preloading-Strategie
- **`new AudioContext()` pro Sound:** Memory-Leak, Browser-Limit → ein globaler Context
- **Audio-only Information:** Deaf/HoH-User ausgeschlossen → visuelles Äquivalent Pflicht
