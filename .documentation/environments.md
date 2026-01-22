# Environment Configuration

<!--
UPDATE TRIGGERS:
- New env vars added
- Environment configuration changes
- When user asks "environment", "env vars", "setup local"
-->

## Required Environment Variables

Deze applicatie heeft momenteel geen verplichte environment variables. Het is een client-side only calculator.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Auto | Set by Node.js runtime | `production` |
| `PORT` | Auto | Set in Dockerfile | `3000` |
| `HOSTNAME` | Auto | Set in Dockerfile | `0.0.0.0` |
| `TZ` | Auto | Timezone in Docker | `Europe/Amsterdam` |

---

## Environment Files

| File | Purpose | Git |
|------|---------|-----|
| `.env.example` | Template (indien nodig) | Committed |
| `.env.local` | Local development values | Ignored |

---

## Local Development Setup

### 1. Install dependencies

```bash
cd lso-roll-calculator-app
npm install
```

### 2. Start development server

```bash
npm run dev
```

App is beschikbaar op http://localhost:3000

### 3. Build testen

```bash
npm run build
npm run start
```

---

## Production Environment (Elest.io)

| Setting | Value |
|---------|-------|
| Platform | Elest.io |
| Runtime | Docker |
| Branch | main |
| Region | EU |
| Node version | 20 (Alpine) |
| Domain | lso-roll-calculator-u62164.vm.elestio.app |

### Docker Environment Variables

De volgende variabelen zijn ingesteld in de Dockerfile:

```dockerfile
ENV NODE_ENV=production
ENV TZ=Europe/Amsterdam
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
```

---

## Docker Configuration

### Dockerfile Highlights

- **Base image:** node:20-alpine
- **Build type:** Multi-stage (builder + runner)
- **Output:** Next.js standalone
- **User:** Non-root (nextjs, UID 1001)
- **Health check:** wget naar localhost:3000 elke 30s

### Build Command

```bash
docker build -t lso-roll-calculator .
```

### Run Command

```bash
docker run -p 3000:3000 lso-roll-calculator
```

---

## Troubleshooting

### App start niet lokaal

```bash
# Check Node version (moet 18+ zijn)
node --version

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Docker build faalt

```bash
# Check Docker is running
docker info

# Build met verbose output
docker build --progress=plain -t lso-roll-calculator .
```

### Port 3000 in gebruik

```bash
# Check wat port 3000 gebruikt
lsof -i :3000

# Kill process op port 3000
kill -9 $(lsof -t -i:3000)
```
