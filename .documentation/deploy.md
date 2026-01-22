# Deployment Guide

<!--
UPDATE TRIGGERS:
- Deployment procedures change
- New environments added
- When user asks "how do I deploy", "deployment"
- After failed deployments
-->

## Environments

| Environment | URL | Branch | Auto-deploy |
|-------------|-----|--------|-------------|
| Production | https://lso-roll-calculator-u62164.vm.elestio.app | main | Yes |

---

## Pre-Deploy Checklist

### Code Quality
- [ ] App bouwt lokaal (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] App werkt lokaal (`npm run dev`)

### Docker
- [ ] Docker image bouwt lokaal (`docker build -t lso-roll-calculator .`)
- [ ] Container start correct (`docker run -p 3000:3000 lso-roll-calculator`)

---

## Deploy Commands

### Production (Automatisch)

```bash
# Push naar main triggert automatisch een build op Elest.io
git add .
git commit -m "Your commit message"
git push origin main
```

Elest.io zal automatisch:
1. Code pullen van GitHub
2. Docker image bouwen met de custom Dockerfile
3. Container herstarten met nieuwe image

### Lokaal Testen

```bash
# Development mode
npm run dev

# Production build testen
npm run build
npm run start

# Docker testen
docker build -t lso-roll-calculator .
docker run -p 3000:3000 lso-roll-calculator
```

---

## Elest.io Configuratie

### Belangrijke Settings
- **Runtime:** Docker (NIET NodeJs)
- **Repository:** https://github.com/laifehacker/lso-roll-calculator
- **Branch:** main
- **Port:** 3000

### Waarom Docker Runtime?
De NodeJs runtime in Elest.io genereert een eigen Dockerfile die incompatibel is met Next.js standalone mode. Met Docker runtime gebruikt Elest.io de custom Dockerfile in de repository.

---

## Rollback Procedure

### Via Elest.io Dashboard

1. Ga naar Elest.io dashboard
2. Bekijk deployment history
3. Selecteer vorige werkende versie
4. Trigger rebuild

### Via Git

```bash
# Revert laatste commit
git revert HEAD
git push origin main

# Of reset naar specifieke commit
git reset --hard <commit-hash>
git push --force origin main  # Let op: destructief!
```

---

## Post-Deploy Verification

- [ ] Site laadt correct: https://lso-roll-calculator-u62164.vm.elestio.app
- [ ] Calculator functionaliteit werkt
- [ ] Geen console errors
- [ ] Update changelog.md

---

## Monitoring

### Health Check
De Docker container heeft een ingebouwde health check:
```bash
curl -I https://lso-roll-calculator-u62164.vm.elestio.app
```

### Container Logs (via Elest.io terminal)
```bash
docker logs lso-roll-calculator --tail 50
```

---

## Incident Response

### Als Deployment Faalt

1. Check Elest.io build logs
2. Controleer of Docker runtime nog steeds geselecteerd is
3. Test lokaal: `docker build -t test .`
4. Check DEPLOYMENT-STATE.md voor bekende issues

### Als Production Issues

1. Assess severity
2. Rollback indien kritiek
3. Investigate root cause
4. Document in troubleshooting.md
