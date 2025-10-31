---
description: Run a security pass on Next.js API routes and middleware focusing on CSRF, rate limiting, and headers
allowed-tools: Read, Grep, Glob, Edit
---

# Security Audit Command

## Tasks
- Scan `/app/api/*` POST handlers for missing Origin/Referer checks
- Recommend rate limiting for `/api/stripe/checkout`
- Ensure webhooks export `dynamic = 'force-dynamic'`

## Steps
1. Grep for POST routes missing Origin checks and propose minimal patches.
2. Recommend or insert a basic rate limiting strategy (library-agnostic snippet).
3. Add a brief summary of findings.

## Checklist
- [ ] POST routes have Origin/Referer validation
- [ ] Webhook route has `dynamic = 'force-dynamic'`
- [ ] Rate limiting strategy documented or implemented
- [ ] No `NEXT_PUBLIC_*` secrets in code
- [ ] Service role keys only in server-side env
