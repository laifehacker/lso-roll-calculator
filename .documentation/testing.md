# Testing Strategy - LSO Roll Calculator

## Current State

**Tests geïmplementeerd:** Geen
**Test framework:** Niet geconfigureerd

Dit project heeft momenteel geen geautomatiseerde tests. Het is een simpele client-side calculator zonder backend.

---

## Quick Reference

```bash
# Build testen (verifieert dat app compileert)
npm run build

# Lokaal draaien en handmatig testen
npm run dev
# Open http://localhost:3000

# Lint check
npm run lint
```

---

## Handmatige Test Cases

### Calculator Logic

| Test Case | Input | Verwacht Resultaat |
|-----------|-------|-------------------|
| OTM Safe | Strike: 100, Koers: 105 | Groen, "Geen actie nodig", 5% OTM |
| CTM Warning | Strike: 100, Koers: 100.50 | Oranje, +1 week roll, 0.50% OTM |
| ITM 0-5% | Strike: 100, Koers: 97 | Geel, +1 week roll, 3% ITM |
| ITM 5-10% | Strike: 100, Koers: 93 | Geel, +1 week roll, 7% ITM |
| ITM 10-15% | Strike: 100, Koers: 88 | Groen, +2 weken roll, 12% ITM |
| ITM 15-20% | Strike: 100, Koers: 83 | Blauw, +3 weken roll, 17% ITM |
| Deep ITM 20%+ | Strike: 100, Koers: 78 | Paars, +4 weken roll, 22% ITM |
| Lege input | Strike: "", Koers: "" | "Vul strike en koers in" |
| Negatieve waarde | Strike: -100 | Geen berekening |

### Friday Calendar

| Test Case | Verwacht |
|-----------|----------|
| Huidige dag is maandag | "Deze vr" toont aankomende vrijdag |
| Huidige dag is vrijdag | "Deze vr" toont volgende week vrijdag |
| Roll +2 weken | Tweede vrijdag is gehighlight |

### UI/UX

- [ ] Inputs accepteren decimalen (bijv. 99.50)
- [ ] Dollar sign ($) wordt correct getoond
- [ ] Kleuren matchen de tier (groen/oranje/geel/blauw/paars)
- [ ] Mobile responsive (max-width: 28rem)

---

## Deployment Tests

### Pre-deployment Checklist

```bash
# 1. Build moet slagen zonder errors
npm run build

# 2. Geen TypeScript/ESLint errors
npm run lint

# 3. Standalone output gegenereerd
ls -la .next/standalone/server.js
```

### Post-deployment Verification

| Check | URL/Command | Verwacht |
|-------|-------------|----------|
| App laadt | https://lso-roll-calculator-u62164.vm.elestio.app | Calculator UI zichtbaar |
| Health check | `curl -I <url>` | 200 OK |
| Input werkt | Vul waarden in | Berekening verschijnt |
| Datums correct | Check vrijdag kalender | Nederlandse datumnotatie |

---

## Docker Tests

```bash
# Lokaal Docker build testen
docker build -t lso-test .

# Container draaien
docker run -p 3000:3000 lso-test

# Health check
curl http://localhost:3000
```

---

## Toekomstige Test Implementatie

Als tests toegevoegd worden:

### Aanbevolen Setup

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Component Test Voorbeeld

```jsx
// __tests__/LSOrollCalculator.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import LSOrollCalculator from '../components/LSOrollCalculator'

describe('LSOrollCalculator', () => {
  it('calculates ITM correctly', () => {
    render(<LSOrollCalculator />)

    fireEvent.change(screen.getByPlaceholderText('100'), { target: { value: '100' } })
    fireEvent.change(screen.getByPlaceholderText('95'), { target: { value: '95' } })

    expect(screen.getByText('5.00%')).toBeInTheDocument()
    expect(screen.getByText('ITM')).toBeInTheDocument()
  })
})
```

---

## Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| Geen automated tests | Open | Handmatig testen |
| Timezone afhankelijk | Fixed | `TZ=Europe/Amsterdam` in Dockerfile |
| Hydration warnings | N/A | 'use client' toegevoegd |

---

## Test History

| Datum | Test Type | Resultaat | Notes |
|-------|-----------|-----------|-------|
| 2026-01-20 | Manual deploy | ✅ Pass | Handmatige docker-compose werkt |
| 2026-01-20 | Elest.io CI/CD | ❌ Fail | Run command issue |
| 2026-01-20 | Local build | ✅ Pass | `npm run build` succesvol |
