# Knowledgebase

<!--
UPDATE TRIGGERS:
- New components/functions created
- API endpoints added
- Complex logic implemented
- When user says "document this", "how does X work"
- After refactoring
-->

## Business Logic

### LSO Rolling Rules

**Overview:** Regels voor het rollen van opties gebaseerd op ITM/OTM percentage en dag van de week.

#### Maandag t/m Donderdag

| Status | Conditie | Actie |
|--------|----------|-------|
| OTM | Boven strike (any %) | Geen actie nodig |
| 0-5% ITM | Strike - Koers = 0-5% | Geen actie nodig |
| 5-10% ITM | Strike - Koers = 5-10% | Roll 1 week, behoud 1%/week premium, zelfde strike |
| 10-15% ITM | Strike - Koers = 10-15% | Roll 2 weken, behoud 1%/week premium |
| 15-20% ITM | Strike - Koers = 15-20% | Roll 3 weken, behoud 1%/week premium |
| 20%+ ITM | Strike - Koers > 20% | Kortst mogelijke expiry, 1%/week avg, max 6 weken |

#### Vrijdag

| Status | Conditie | Actie |
|--------|----------|-------|
| OTM (ver) | > 1% boven strike | Laat expireren! |
| OTM (dichtbij) | ≤ 1% OTM (min $0.25) | Roll naar kortste termijn voor goede premium |
| ITM | Onder strike | Roll naar kortste termijn voor goede premium |

#### Algemene Regels

1. **ALTIJD zelfde strike:** Roll NOOIT up of down, altijd naar dezelfde strike price
2. **Premium target:** Behoud gemiddeld 1% per week premium
3. **Max rollout:** Nooit meer dan 6 weken, tenzij absoluut onvermijdelijk
4. **21-dagen check:** Bij 4-6 weken uitgerold, ALTIJD 21 dagen voor expiry checken en evt. verder rollen
5. **Bij twijfel/stress:** Roll 1 week

### Theming & Tijd (CET)

- CET timezone hardcoded op Amsterdam (`Europe/Amsterdam`), coördinaten 52.3676 / 4.9041
- Sunrise/sunset berekend client-side (geen API) via NOAA-formule; slaat tijden op in `sunSchedule`
- Theme switch: dag = tussen sunrise en sunset; nacht = anders. Volgende check gepland op eerstvolgende sunrise/sunset.
- Header toont dag/nacht badge + sunrise/sunset tijden in CET

---

## Components

### LSOrollCalculator

**Location:** `components/LSOrollCalculator.jsx`

**Purpose:** Interactieve calculator die het advies berekent voor het rollen van opties op basis van strike price, huidige koers en dag van de week.

**State:**
| State | Type | Description |
|-------|------|-------------|
| `strikePrice` | `string` | De strike price van de optie |
| `currentPrice` | `string` | De huidige koers van het onderliggend |
| `premiums` | `{ week1, week2, week3, weekN }` | Premium per expiry voor vergelijking |
| `customWeeks` | `string` | Aantal weken voor custom expiry (default: 4) |
| `themeMode` | `'day' \| 'night'` | Automatisch ingesteld op basis van CET sunrise/sunset |
| `sunSchedule` | `{ sunrise: Date \| null, sunset: Date \| null }` | Laatste berekende CET zonsopgang/-ondergang |

**Features:**
- Dag-afhankelijke logica (ma-do vs vrijdag)
- Automatische berekening ITM/OTM percentage
- Visuele kalender met target expiry datum
- Roll tiers overview met highlighting
- Auto dag/nacht thema o.b.v. CET zonsopgang/-ondergang (Amsterdam)
- Multi-expiry premium vergelijker (+1wk, +2wk, +3wk, +N wk)
- Automatische beste keuze op basis van hoogste yield/week

**Key Functions:**
- `isFridayCET()` - Controleert of het vrijdag is in CET
- `getNextFriday(weeksOut)` - Berekent de target expiry datum
- `getSunriseSunset(date)` - Berekent CET sunrise/sunset zonder externe API (NOAA-formule)
- `calcSunEventUTC()` - Hulp voor sunrise/sunset (dag van het jaar + geolocatie)
- `calculation` - useMemo hook met ITM/OTM berekeningen
- `handlePremiumChange(key, value)` - Update individuele premium in state
- `premiumComparison` - useMemo hook die alle expiry entries berekent + beste keuze bepaalt

**Usage:**
```jsx
import LSOrollCalculator from '@/components/LSOrollCalculator'

<LSOrollCalculator />
```

---

## Calculations

### ITM Percentage

```
ITM% = ((Strike - Koers) / Strike) * 100
```

Alleen positief als Koers < Strike (in the money voor calls).

### OTM Percentage

```
OTM% = ((Koers - Strike) / Strike) * 100
```

Alleen positief als Koers > Strike (out of the money voor calls).

### CTM (Close to the Money)

Een optie is CTM als:
- OTM percentage ≤ 1%
- Absoluut verschil ≥ $0.25

### Premium per Week Berekening

Bij meerdere weken rollen:
```
Premium % = (Premium $ / Strike $) * 100
Yield/week = Premium % / Aantal weken
Target = ≥ 1% per week
```

**Voorbeeld:** Strike $100, Premium $1.50 voor 2 weken:
- Totaal: 1.50%
- Per week: 0.75%/wk (onder target)

### Premium Vergelijker (v2.0)

Multi-expiry vergelijking met 4 opties:
- +1 wk, +2 wk, +3 wk, +N wk (custom)

Per expiry invullen:
1. Premium in dollars
2. Berekent automatisch: totaal % en %/week
3. **BEST** label bij hoogste yield/week

**State:** `premiums: { week1, week2, week3, weekN }`

**Beste keuze bepaling:**
```javascript
best = entries.filter(valid).reduce((b, c) =>
  c.weeklyYield > b.weeklyYield ? c : b
)
```

---

## Types

**Calculation Object:**
```typescript
interface Calculation {
  percentage: string      // ITM of OTM percentage (2 decimalen)
  absoluteDiff: string    // Absoluut verschil in dollars
  weeksToRoll: number     // Aantal weken te rollen (0 = geen actie)
  tier: string            // Tier label (OTM, CTM, 0-5%, etc.)
  status: string          // 'otm' | 'ctm' | 'itm' | 'itm-safe'
  targetDate: string      // Geformatteerde target datum
  color: string           // HEX kleur voor UI
  icon: string            // Icon voor status
  advice: string          // Menselijk leesbaar advies
}
```
