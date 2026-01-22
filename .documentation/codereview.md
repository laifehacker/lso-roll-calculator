# Code Review Notes

<!--
UPDATE TRIGGERS:
- After code reviews
- When security vulnerabilities found/fixed
- Before deployments
- When user asks "is this secure", "review code"
- After vibe-coding-guardian runs
-->

## Security Status

**Last Review:** YYYY-MM-DD
**Reviewer:** [name/tool]
**Status:** GREEN / YELLOW / RED

---

## Security Measures Implemented

### Input Validation
- [ ] All user inputs validated with Zod schemas
- [ ] File uploads restricted by type and size
- [ ] Rate limiting on public endpoints

### Database Security
- [ ] RLS enabled on all tables
- [ ] Parameterized queries only (no string concatenation)
- [ ] Sensitive data encrypted at rest

### Authentication & Authorization
- [ ] Auth required on protected routes
- [ ] Role-based access control implemented
- [ ] Session management secure

### Secrets Management
- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] .env files in .gitignore

### API Security
- [ ] CORS configured correctly
- [ ] API keys not exposed to client
- [ ] Error messages don't leak sensitive info

---

## Known Vulnerabilities

| Date | Issue | Severity | Status | Resolution |
|------|-------|----------|--------|------------|
| YYYY-MM-DD | [description] | HIGH/MED/LOW | OPEN/FIXED | [how resolved] |

---

## Architecture Review

### Strengths
- [strength 1]
- [strength 2]

### Concerns
- [concern 1]
- [concern 2]

### Technical Debt
| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| [debt item] | HIGH/MED/LOW | S/M/L | [context] |

---

## Vibe Coding Guardian Reports

### Latest Run: YYYY-MM-DD

**Phase 1 - Architecture:**
- [findings]

**Phase 2 - Build:**
- [findings]

**Phase 3 - Test:**
- [findings]

**Phase 4 - Deploy:**
- [findings]

---

## Code Quality Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Test Coverage | [X]% | 80% |
| Type Coverage | [X]% | 95% |
| Lint Errors | [X] | 0 |

---

## Review History

### YYYY-MM-DD - [Reviewer]
- [what was reviewed]
- [findings]
- [actions taken]
