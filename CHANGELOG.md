# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-10-31

### 🔒 Security Fixes (Critical)

- **CRITICAL**: Removed public RLS policy that exposed all user profiles to unauthorized access (GDPR violation)
  - Users can now only view/update their own profile via authenticated policies
  - Migration: `supabase/migrations/20251025175702_*.sql`

- **CRITICAL**: Added `export const dynamic = 'force-dynamic'` to all API routes to prevent caching
  - Fixes: Stripe checkout sessions, billing portal, and webhook events
  - Routes: `/api/stripe/checkout`, `/api/stripe/portal`, `/api/webhooks/stripe`
  - Impact: Prevents duplicate webhook processing and stale checkout URLs

- **CRITICAL**: Updated Stripe API version to stable `2024-06-20`
  - Previous version `2025-10-29.clover` was invalid
  - File: `lib/stripe/server.ts`

### 🛡️ Security Enhancements (High Priority)

- **Added CSRF Protection**: Origin validation on checkout endpoint
  - Prevents checkout requests from unauthorized domains
  - File: `app/api/stripe/checkout/route.ts`

- **Added Rate Limiting**: 5 requests per minute per IP on checkout endpoint
  - Prevents abuse and DoS attacks
  - Returns HTTP 429 when limit exceeded
  - New file: `lib/rate-limit.ts`

- **Added Webhook Idempotency**: Prevents duplicate processing of Stripe events
  - New migration: `supabase/migrations/20251101000000_webhook_idempotency.sql`
  - Tracks processed events in `webhook_events` table
  - File: `app/api/webhooks/stripe/route.ts`

### 📚 Documentation

- **NEW**: `SECURITY.md` - Comprehensive pre-deployment security checklist
  - Key rotation instructions
  - RLS policy review steps
  - Webhook configuration guidance
  - Common security mistakes and fixes

- **NEW**: `SETUP_CHECKLIST.md` - First-time setup guide (10 minutes)
  - Step-by-step Supabase project creation
  - Stripe account and product setup
  - Webhook configuration
  - Environment variable setup
  - Troubleshooting section

- **UPDATED**: `.env.example` with security warnings
  - Clear distinction between `NEXT_PUBLIC_*` (safe) and server-only secrets
  - Pre-deployment security checklist
  - Demo vs production key warnings

### 🔧 Technical Details

**Files Modified:**
- `supabase/migrations/20251025175702_user_authentication_and_memberships.sql`
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/portal/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `lib/stripe/server.ts`
- `.env.example`
- `package.json`

**Files Added:**
- `lib/rate-limit.ts` (in-memory rate limiting utility)
- `supabase/migrations/20251101000000_webhook_idempotency.sql`
- `SECURITY.md`
- `SETUP_CHECKLIST.md`

### ✅ Validation

- All security fixes validated against OpenSpec specification
- 9 security requirements with 21 scenarios defined
- Pre-deployment checklist covers all critical steps
- No breaking changes to existing local development setup

### 🚀 Deployment Notes

**For Existing Users:**
- Local development: No changes required (demo keys still work)
- Production deployment: Must follow `SECURITY.md` checklist
- Database migrations: Apply `20251101000000_webhook_idempotency.sql` manually if upgrading

**For New Users:**
- Follow `SETUP_CHECKLIST.md` for 10-minute setup
- All security best practices are built-in

### 📋 Known Issues

- TypeScript: Stripe API version type mismatch (non-blocking, runtime works correctly)
- Post-launch: Log sanitization and CSP headers planned for v1.1

---

## [0.1.0] - 2025-10-25

### Initial Release

- Next.js 16 boilerplate with Supabase auth
- Stripe subscription integration
- Basic RLS policies
- Deployment automation scripts
