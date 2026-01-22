# Developer Onboarding

<!--
UPDATE TRIGGERS:
- Setup process changes
- New dependencies added
- When user asks "how to start", "onboarding", "new developer"
-->

## Prerequisites

Before you begin, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Access to the repository
- [ ] Access to Supabase project (ask team lead)
- [ ] [Other prerequisites]

---

## Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone <repo-url>
cd project-name

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values (see environments.md)

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

---

## First Steps

### 1. Understand the Project

Read these files in order:
1. `README.md` - Project overview
2. `.documentation/briefing.md` - Architecture and tech stack
3. `.documentation/state.md` - Current focus and active tasks

### 2. Run the Test Suite

```bash
npm test
```

All tests should pass. If not, check troubleshooting.md.

### 3. Explore the Codebase

Key directories:
| Directory | Contains |
|-----------|----------|
| `src/app/` | Pages and API routes |
| `src/components/` | React components |
| `src/lib/` | Utilities and helpers |
| `src/hooks/` | Custom React hooks |

### 4. Make Your First Change

1. Create a branch: `git checkout -b your-name/first-change`
2. Make a small change (e.g., fix a typo, add a comment)
3. Run tests: `npm test`
4. Commit: `git commit -m "My first change"`
5. Push: `git push origin your-name/first-change`
6. Create a Pull Request

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git checkout develop
git pull

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes, commit often
git add .
git commit -m "Descriptive message"

# 4. Push and create PR
git push origin feature/your-feature
```

### Code Review Process

1. Create PR against `develop`
2. Request review from team member
3. Address feedback
4. Merge when approved

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Homepage |
| `src/lib/supabase.ts` | Database client |
| `src/middleware.ts` | Auth middleware |
| `tailwind.config.ts` | Styling config |

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run with coverage

# Code Quality
npm run lint         # Check for lint errors
npm run lint:fix     # Auto-fix lint errors
npm run type-check   # Check TypeScript types

# Database
npm run db:push      # Push migrations
npm run db:generate  # Generate types
```

---

## Getting Help

### Documentation
- `.documentation/` - Project-specific docs
- `README.md` - Quick reference

### Team
- Slack: #team-channel
- Team Lead: [name]
- Code questions: [name]

### External Resources
- [Next.js docs](https://nextjs.org/docs)
- [Supabase docs](https://supabase.com/docs)
- [Tailwind docs](https://tailwindcss.com/docs)

---

## Troubleshooting First-Time Setup

### npm install fails

```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Dev server won't start

1. Check `.env.local` exists and has all required vars
2. Check port 3000 is available
3. See troubleshooting.md for more

### Database connection fails

1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is active
3. Ask team lead for access if needed
