# Project State

<!--
UPDATE TRIGGERS:
- Read at session start
- Update after major changes
- Update when user says "remember this"
- After completing significant tasks
-->

## Current Focus

> Currently working on: v2.0 complete - multi-expiry premium vergelijker

## Project Vision

**Project Name:** LSO Roll Calculator

**Purpose:** Calculator tool voor het berekenen van LSO rollen

**Target Users:** LSO medewerkers en planners

**Key Goals:**
1. Accurate berekeningen voor LSO rollen
2. Gebruiksvriendelijke interface
3. Betrouwbare hosting met automatische deployments

## Active Tasks

### In Progress
- [x] CI/CD pipeline werkend maken (DONE - 2026-01-20)
- [x] Documentatie updaten (2026-01-22)

### Up Next
- [ ] Feature requests verzamelen van gebruikers

### Blocked
- Geen blockers

## Recent Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-20 | CTM regel alleen op vrijdag | Ma-do OTM moet altijd "geen actie" zijn |
| 2026-01-20 | 21-dagen check bij 4-6wk rolls | Tijdig verder rollen indien nodig |
| 2026-01-20 | Elestio skill aangemaakt | Herbruikbare CI/CD setup documentatie |
| 2026-01-20 | Elest.io runtime naar Docker | NodeJs runtime genereerde incompatibele Dockerfile |
| 2026-01-20 | Standalone output voor Next.js | Kleinere Docker image, geen npm/next nodig in runtime |

## Blockers / Open Questions

Geen actieve blockers.

## Technical Context

- **Framework:** Next.js 14.2.21
- **Node version:** 20 (Alpine)
- **Database:** Geen (client-side only)
- **Hosting:** Elest.io (Docker runtime)
- **Production URL:** https://lso-roll-calculator-u62164.vm.elestio.app
- **Repository:** https://github.com/laifehacker/lso-roll-calculator
- **Key Dependencies:** React 18, Next.js 14

## Session History

### 2026-01-20
- CI/CD pipeline gefixt door Elest.io runtime te veranderen van NodeJs naar Docker
- Rolling rules v1.2 geimplementeerd:
  - Dag-afhankelijke logica (ma-do vs vrijdag)
  - 0-5% ITM op ma-do: nu "geen actie"
  - OTM op vrijdag: "laat expireren"
- v1.2.1 bugfix: CTM regel alleen op vrijdag
  - Bug: OTM dichtbij strike toonde "roll" op ma-do
  - Fix: Ma-do OTM = altijd geen actie
- Elestio skill aangemaakt (/elestio) voor CI/CD setup
- 21-dagen check regel toegevoegd voor 4-6 weken rolls
- "ALTIJD zelfde strike" regel toegevoegd
- App draait stabiel op productie

### 2026-01-22
- v1.4 complete met alle nieuwe features:
  - **Premium check:** invoerveld bij rollen voor premium %, toont per-week berekening
  - **Target feedback:** groen (≥1%/week) of rood (onder target) met advies
  - **Responsive desktop:** schaling van 28rem (mobile) tot 42rem (desktop)
  - **Dag/nacht mode:** automatisch op basis van CET zonsopgang/-ondergang (Amsterdam)
  - **UI polish:** kaartschaduwen, verbeterde leesbaarheid, sunrise/sunset times in header
  - **Contrast fix:** donkerdere accentkleuren + sterkere tinting voor dagmodus
- v2.0 premium vergelijker:
  - **Multi-expiry:** +1wk, +2wk, +3wk, +N wk (custom) met premium per expiry
  - **Vergelijking:** toont totaal % en %/wk per optie
  - **BEST label:** markeert hoogste yield/week automatisch
  - Vervangt oude enkele premium check

## Notes for Next Session

- CI/CD werkt nu volledig automatisch
- Push naar main triggert automatisch een rebuild
- `/elestio` skill beschikbaar voor nieuwe projecten
- Rolling rules volledig gedocumenteerd in knowledgebase.md
- DEPLOYMENT-STATE.md bevat technische details over de setup
