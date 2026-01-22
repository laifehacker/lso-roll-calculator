# Troubleshooting Guide

<!--
UPDATE TRIGGERS:
- After fixing bugs
- When same issue occurs twice
- When user asks "this doesn't work", "error", "help"
- After debugging sessions
-->

## Quick Fixes

### Dev server won't start

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

### Dependencies broken

```bash
# Nuclear option: clean reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### TypeScript errors after pull

```bash
# Regenerate types
npm run type-check
# Or regenerate Supabase types
npm run db:generate
```

### Build fails locally but works in CI

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## Error Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Missing dependency | `npm install` |
| `EADDRINUSE :3000` | Port in use | Kill process or use different port |
| `NEXT_PUBLIC_ not defined` | Missing env var | Check `.env.local` |
| `Hydration mismatch` | Server/client render difference | Check for browser-only code |
| `RLS policy violation` | Database permission denied | Check RLS policies |
| `JWT expired` | Auth token stale | Re-login user |

---

## Common Issues by Category

### Authentication

**User can't log in**
1. Check Supabase Auth settings
2. Verify redirect URLs configured
3. Check browser console for errors
4. Clear cookies and retry

**Session not persisting**
1. Check cookie settings
2. Verify middleware configuration
3. Check for client/server auth sync

---

### Database

**Query returns empty**
1. Check RLS policies (most common)
2. Verify user has correct permissions
3. Check query filters
4. Test in Supabase dashboard

**Migration fails**
1. Check for syntax errors
2. Verify types match
3. Check for foreign key conflicts
4. Review migration order

---

### API Routes

**404 on API route**
1. Check file location (`app/api/route/route.ts`)
2. Verify export (must export HTTP methods)
3. Check for typos in route name

**500 error**
1. Check server logs
2. Verify environment variables
3. Check database connection
4. Review error handling

---

### Styling

**Styles not applying**
1. Check Tailwind class names
2. Verify `tailwind.config.ts` content paths
3. Clear `.next` cache
4. Check for CSS specificity conflicts

**Dark mode broken**
1. Check `class` strategy in tailwind config
2. Verify dark mode classes
3. Check localStorage theme value

---

### Build & Deploy

**Build fails on Vercel**
1. Check build logs for specific error
2. Verify all env vars set in Vercel
3. Compare Node versions (local vs Vercel)
4. Check for case-sensitive import issues

**Environment variables not working**
1. Restart dev server after changes
2. Use `NEXT_PUBLIC_` prefix for client-side
3. Check `.env.local` file exists
4. Verify no spaces around `=`

---

## Debug Checklist

When something breaks:

- [ ] Check browser console for errors
- [ ] Check terminal/server logs
- [ ] Verify environment variables loaded
- [ ] Check network tab for failed requests
- [ ] Review recent changes (`git diff`)
- [ ] Try in incognito/different browser
- [ ] Check if issue exists on other branches
- [ ] Search existing issues/docs

---

## Logging & Debugging

### Add debug logging

```typescript
// Temporary debug
console.log('[DEBUG]', { variable, state })

// Structured logging
console.log(JSON.stringify({ event: 'action', data }, null, 2))
```

### Enable verbose mode

```bash
# Next.js verbose
DEBUG=* npm run dev

# Specific package
DEBUG=supabase:* npm run dev
```

---

## Getting More Help

1. Search this document
2. Check `.documentation/knowledgebase.md`
3. Search GitHub issues
4. Ask in team Slack
5. Check external docs (Next.js, Supabase, etc.)

---

## Issue Log

<!-- Record recurring issues and their solutions -->

### YYYY-MM-DD - [Issue Title]

**Symptoms:** [what happened]

**Root Cause:** [why it happened]

**Solution:** [how to fix]

**Prevention:** [how to avoid in future]
