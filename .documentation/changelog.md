# Changelog

All notable changes to this project are documented in this file.

Format: `[version] - YYYY-MM-DD-HH:mm:ss`

<!--
UPDATE TRIGGERS:
- After every commit
- After deployments
- After bug fixes
- After new features
- When user says "log this", "changelog"
-->

## [2.2.0] - 2026-01-22

### Added
- **Market countdown timer:** Live HH:MM:SS countdown tot beurs sluiting (open) of opening (gesloten)
- Detecteert NYSE/NASDAQ markturen (9:30-16:00 ET)
- Weekend-logica: zaterdag telt naar maandag, zondag telt naar maandag

### Changed
- Header: Zonsopgang/zonsondergang tijden vervangen door market countdown
- Display: Groen "📈 Sluit over:" als beurs open, grijs "⏳ Opent over:" als gesloten

### Removed
- Zonsopgang (🌅) en zonsondergang (🌇) labels uit header
- `formatTimeForZone` functie (niet meer nodig)
- `sunSchedule` state (niet meer nodig voor display)

### Technical Notes
- `getMarketStatus()` berekent open/gesloten status en countdown in seconden
- `formatCountdown(totalSeconds)` formatteert naar HH:MM:SS
- `marketStatus` state met `isOpen` boolean en `secondsRemaining`
- useEffect met 1-seconde interval voor live updates
- Auto-theme switching op sunrise/sunset blijft intact (alleen display verwijderd)

---

## [2.1.0] - 2026-01-22

### Added
- **Theme toggle:** Klikbare dag/nacht badge voor handmatige override
- **Auto button:** Reset naar automatische sunrise/sunset detectie
- **Favicon:** Custom PNG favicon (128x128)

### Changed
- **%/wk nu primair:** Yield per week nu groot weergegeven, totaal % klein met "tot" suffix
- **Contrast fix:** Theme-aware accentkleuren (donker voor dag, helder voor nacht)
- Roll tiers en status cards gebruiken nu `palette.accent*` kleuren

### Technical Notes
- `manualTheme` state: `null` (auto) | `'day'` | `'night'`
- `toggleTheme()` en `resetToAuto()` functies
- `getStatusColors(status, tier)` helper voor theme-aware kleuren
- `themePalette` uitgebreid met `accentGreen`, `accentYellow`, `accentOrange`, `accentBlue`, `accentPurple` + `*Bg` variants

---

## [2.0.0] - 2026-01-22

### Added
- **Premium vergelijker:** Multi-expiry vergelijking (+1wk, +2wk, +3wk, +N wk custom)
- Per expiry: datum, premium invulveld, totaal %, yield per week
- **BEST label:** Automatische markering van hoogste yield/week optie
- Custom weeks input voor flexibele vergelijking (1-52 weken)

### Changed
- Vervangen: enkele "Premium check" → multi-expiry vergelijker
- State: `premiumInput` → `premiums` object + `customWeeks`
- Version bump naar v2.0

### Technical Notes
- `premiums` state: `{ week1, week2, week3, weekN }`
- `premiumComparison` useMemo berekent alle entries + bepaalt beste keuze
- `handlePremiumChange(key, value)` voor individuele premium updates

---

## [Unreleased]

### Added
<!-- New features -->

### Changed
<!-- Changes to existing functionality -->

### Fixed
<!-- Bug fixes -->

### Removed
<!-- Removed features -->

### Security
<!-- Security-related changes -->

### Deprecated
<!-- Features marked for future removal -->

---

## [1.4.0] - 2026-01-22

### Added
- **Premium check:** Invoerveld voor premium % bij roll scenario's met per-week berekening
- **Target feedback:** Groen (≥1%/week behaald) of rood (onder target) met actie-advies
- **Responsive desktop:** Container schaalt van 28rem (mobile) → 32rem → 36rem → 42rem (desktop)
- **Auto dag/nacht thema:** o.b.v. CET zonsopgang/-ondergang (Amsterdam), met badges en tijden in header
- Client-side sunrise/sunset berekening zonder externe API en automatische her-evaluatie

### Changed
- UI palette, kaarten, inputs en kalender schakelen mee met dag/nacht voor betere leesbaarheid
- Header versie naar v1.4 met gecombineerde dag (MA-DO/VRIJDAG) en licht/donker indicatoren
- Inputs en fonts schalen mee op grotere schermen

### Technical Notes
- `premiumInput` state en `premiumCalculation` useMemo voor premium berekening
- CSS media queries voor responsive breakpoints (640px, 768px, 1024px)
- `themePalette` object met day/night kleuren
- `getSunriseSunset()` berekent zonopkomst/-ondergang voor Amsterdam

---

## [1.2.1] - 2026-01-20

### Fixed
- **CTM regel alleen op vrijdag:** OTM op ma-do is nu altijd "geen actie" ongeacht hoe dichtbij
- Bug: Strike 40, Koers 40.25 toonde incorrect "roll" op dinsdag

### Changed
- CTM tier verwijderd uit ma-do roll regels display
- Elestio skill aangemaakt voor CI/CD setup documentatie

---

## [1.2.0] - 2026-01-20

### Added
- Dag-afhankelijke rolling rules (ma-do vs vrijdag)
- Dag indicator in header (MA-DO / VRIJDAG)
- Contextafhankelijk advies per berekening
- "Bij twijfel: roll 1 week" reminder in footer
- "ALTIJD zelfde strike" regel in footer
- 21-dagen check regel voor 4-6 weken rolls

### Changed
- **0-5% ITM op ma-do:** nu "geen actie" (was: roll 1 week)
- **OTM op vrijdag:** nu "laat expireren" (was: geen actie)
- **CTM drempel:** $0.25 minimum (was: $0.10) - alleen vrijdag
- Roll tiers tonen nu dag-specifieke opties
- Version bump naar v1.2

### Technical Notes
- `isFriday()` functie toegevoegd voor dag-detectie
- `rollTiers` array is nu conditioneel op basis van dag
- Nieuwe status `itm-safe` voor 0-5% ITM op ma-do
- Knowledgebase gedocumenteerd met alle rolling rules

---

## [1.1.1] - 2026-01-20

### Fixed
- CI/CD pipeline: Elest.io runtime veranderd van "NodeJs" naar "Docker"
- Automatische deployments werken nu correct

### Technical Notes
- Elest.io genereerde hun eigen incompatibele Dockerfile bij NodeJs runtime
- Met Docker runtime gebruikt Elest.io nu de custom multi-stage Dockerfile
- Geen handmatige interventie meer nodig voor deployments

---

## [1.1.0] - 2026-01-XX

### Added
- Multi-stage Dockerfile met standalone Next.js output
- Health check in Docker container
- DEPLOYMENT-STATE.md documentatie

### Changed
- next.config.js: output ingesteld op 'standalone'

---

## [1.0.0] - 2026-01-XX

### Added
- Initial project setup
- LSO Roll Calculator component
- Next.js 14 applicatie
- Docker support

---

<!--
## Template for new releases:

## [x.y.z] - YYYY-MM-DD-HH:mm:ss

### Added
-

### Changed
-

### Fixed
-

### Removed
-

### Security
-

### Deprecated
-

### Technical Notes
-

-->
