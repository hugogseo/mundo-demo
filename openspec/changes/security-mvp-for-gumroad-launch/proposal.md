# Security MVP for Gumroad Launch

## Why

The boilerplate will be distributed as a ZIP file on Gumroad ($79 tier). A security audit revealed **3 critical** and **5 high-severity** vulnerabilities that must be fixed before launch to prevent data leaks, CSRF attacks, and webhook failures in production. Additionally, buyers need clear security documentation to avoid deploying with demo keys or misconfigured RLS policies.

**Business Impact**: Launching with these vulnerabilities risks:
- Reputation damage from buyer-reported security issues
- Support burden from webhook failures and data exposure
- Potential refunds and negative reviews

## What Changes

### Critical Security Fixes (MVP Scope)
1. **Remove public RLS policy** exposing all user profiles (GDPR violation)
2. **Add `dynamic = 'force-dynamic'`** to API routes (prevent webhook caching)
3. **Remove hardcoded Supabase demo keys** from setup script
4. **Update Stripe API version** to stable `2024-06-20`

### High-Priority Fixes (MVP Scope)
5. **Add Origin validation** to checkout route (CSRF protection)
6. **Implement basic rate limiting** for checkout endpoint
7. **Add webhook idempotency** to prevent duplicate subscriptions

### Documentation (MVP Scope)
8. **Create `SECURITY.md`** with pre-deployment checklist
9. **Create `SETUP_CHECKLIST.md`** for first-time setup
10. **Update `.env.example`** with security warnings about `NEXT_PUBLIC_*`

### Out of Scope (Post-Launch)
- Log sanitization (medium severity)
- CSP headers (low severity)
- Comprehensive security tests (low severity)

## Impact

### Affected Specs
- **security** (NEW) - Security requirements for production deployment
- **devex** (MODIFIED) - Enhanced setup documentation and validation

### Affected Code
- `supabase/migrations/20251025175702_*.sql` - RLS policy removal
- `app/api/stripe/checkout/route.ts` - Origin validation, rate limiting, dynamic export
- `app/api/stripe/portal/route.ts` - Dynamic export
- `app/api/webhooks/stripe/route.ts` - Idempotency, dynamic export
- `lib/stripe/server.ts` - API version update
- `scripts/setup.js` - Remove hardcoded keys
- `lib/rate-limit.ts` (NEW) - Rate limiting utility
- `.env.example` - Security warnings
- `SECURITY.md` (NEW) - Security checklist
- `SETUP_CHECKLIST.md` (NEW) - First-time setup guide

### Migration Path
- Existing local dev setups: No breaking changes (demo keys still work locally)
- Production deployments: Buyers must follow new `SECURITY.md` checklist
- ZIP distribution: Include updated files in v1.0.0 release

## Dependencies
- None (all fixes use existing dependencies)

## Success Criteria
1. `openspec validate security-mvp-for-gumroad-launch --strict` passes
2. All 3 critical vulnerabilities resolved
3. All 3 high-priority fixes implemented
4. Security documentation reviewed by 2 beta testers
5. Setup time remains under 10 minutes with new checklist
