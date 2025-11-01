---
name: security-hardening
description: Security pass on Next.js routes and middleware. Use when adding API endpoints or before production deployments. Focus on CSRF, rate limit, headers, secret hygiene.
allowed-tools: Read, Grep, Glob
---

# Security Hardening

## Checklist
- POST routes: verify Origin/Referer and authenticated session
- Add basic rate limit for `/api/stripe/checkout`
- Webhook: `dynamic = 'force-dynamic'`, minimal logging (no secrets)
- Env sanity: service role only on server, no `NEXT_PUBLIC_*` secrets
- Optional: CSP/security headers in Next config/middleware

## Steps
1. Scan `/app/api/*` for POST handlers without origin checks.
2. Propose patch snippets for each.
3. Document changes in README/SECURITY.md.
