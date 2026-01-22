# LSO Roll Calculator - Deployment State Management

## Huidige Status
- **App**: LIVE op https://lso-roll-calculator-u62164.vm.elestio.app
- **CI/CD**: WORKING (Docker runtime in Elest.io)
- **Laatste update**: 2026-01-20

---

## Wat We Hebben

### Codebase (GitHub)
Repository: https://github.com/laifehacker/lso-roll-calculator

**Bestanden die werken:**
- `components/LSOrollCalculator.jsx` - Met 'use client' directive
- `app/page.js` - Client component
- `app/layout.js` - Met correcte viewport export
- `next.config.js` - Met `output: 'standalone'`
- `package.json` - Met simpele scripts
- `package-lock.json` - Dependencies locked
- `.dockerignore` - Excludes node_modules, .git, etc.
- `Dockerfile` - Multi-stage build met standalone output

### Onze Dockerfile (werkt bij handmatige build)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=Europe/Amsterdam
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
CMD ["node", "server.js"]
```

---

## Opgelost Probleem (Referentie)

<details>
<summary>Wat was het probleem met NodeJs runtime?</summary>

### Wat Elest.io deed (met NodeJs runtime)
1. Elest.io **genereerde hun eigen Dockerfile** - negeerde de onze
2. Hun Dockerfile had `CMD next start -p 3000 --port 3000`
3. `next` was niet in PATH → "next: not found"
4. Run command UI voegde automatisch port `3000` toe als argument

### Pogingen die faalden

| Poging | Run Command | Resultaat |
|--------|-------------|-----------|
| 1 | `npm run start` | Elest.io voegt `3000` toe |
| 2 | `next start -p 3000` | "next: not found" |
| 3 | `npx next start -p 3000` | "npx: not found" |
| 4 | `node_modules/.bin/next start` | "No such file" |

### Root Cause
Elest.io's "Full Stack Node.js" deployment:
1. Bouwt met hun eigen gegenereerde Dockerfile
2. Voegt automatisch port als argument toe aan Run command
3. Hun runtime container heeft geen volledige node_modules

**Oplossing:** Switch naar Docker runtime zodat Elest.io onze Dockerfile gebruikt.
</details>

---

## Hoe Deployment Werkt

### Automatische CI/CD (standaard)
1. Push code naar `main` branch op GitHub
2. Elest.io detecteert de push automatisch
3. Elest.io bouwt de Docker image met onze Dockerfile
4. Container wordt automatisch herstart met nieuwe image

### Waarom het werkt:
- Elest.io runtime is ingesteld op **Docker** (niet NodeJs)
- Onze Dockerfile gebruikt `output: 'standalone'`
- De runner stage heeft `server.js` (standalone Next.js server)
- CMD is `node server.js` - geen npm/next nodig in runtime

---

## Oplossing (Uitgevoerd 2026-01-20)

### Docker Runtime in Elest.io ✅

De CI/CD pipeline werkt nu correct door de Elest.io runtime te veranderen van "NodeJs" naar "Docker".

**Wat is gedaan:**
1. In Elest.io: Build & Deploy > Select RunTime > **Docker**
2. Apply Changes
3. Rebuild

**Resultaat:**
- Elest.io gebruikt nu onze custom multi-stage Dockerfile
- Builds zijn sneller en produceren een kleinere image
- `node server.js` wordt correct uitgevoerd (standalone mode)
- Geen handmatige interventie meer nodig

### Alternatieve opties (niet meer nodig)

<details>
<summary>Optie 2: Shell wrapper (fallback)</summary>

Als Docker method niet werkt, maak een wrapper script:

**Toevoegen aan repo: `start.sh`**
```bash
#!/bin/sh
exec node server.js
```

En in Elest.io Run command: `sh ./start.sh`
</details>

<details>
<summary>Optie 3: Static Website deployment (alternatief)</summary>

Verander naar "Static Website" in plaats van "Full Stack":
- Next.js kan static exporteren
- Geen server nodig
- Maar: verlies je SSR/dynamic features

**Vereist change in next.config.js:**
```js
output: 'export'
```
</details>

---

## Debug Commands (voor troubleshooting)

```bash
# Check container status
docker ps | grep lso-roll-calculator

# Check container logs
docker logs lso-roll-calculator --tail 50

# Check container inhoud
docker exec -it lso-roll-calculator sh -c "ls -la /app && which node"

# Health check
curl -I https://lso-roll-calculator-u62164.vm.elestio.app
```

---

## Samenvatting

| Aspect | Status | Notities |
|--------|--------|----------|
| Code | ✅ Correct | Next.js 14 met standalone output |
| Dockerfile | ✅ Correct | Multi-stage build, health check |
| Elest.io CI/CD | ✅ Werkt | Docker runtime geselecteerd |
| Auto-deploy | ✅ Werkt | Push naar main triggert build |

**Status:** Volledig werkende CI/CD pipeline. Geen handmatige interventie nodig.
