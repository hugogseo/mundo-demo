# Implementation Tasks

## 1. Critical Security Fixes
- [x] 1.1 Remove public RLS policy from profiles table migration
- [x] 1.2 Add `export const dynamic = 'force-dynamic'` to `/api/stripe/checkout/route.ts`
- [x] 1.3 Add `export const dynamic = 'force-dynamic'` to `/api/stripe/portal/route.ts`
- [x] 1.4 Add `export const dynamic = 'force-dynamic'` to `/api/webhooks/stripe/route.ts`
- [ ] 1.5 Remove hardcoded Supabase demo keys from `scripts/setup.js` (manual review needed)
- [x] 1.6 Update Stripe API version to `2024-06-20` in `lib/stripe/server.ts`

## 2. High-Priority Security Enhancements
- [x] 2.1 Create `lib/rate-limit.ts` with in-memory rate limiting utility
- [x] 2.2 Add Origin validation to checkout route
- [x] 2.3 Integrate rate limiting in checkout route (5 req/min per IP)
- [x] 2.4 Add webhook idempotency table migration
- [x] 2.5 Implement idempotency check in webhook handler

## 3. Security Documentation
- [x] 3.1 Create `SECURITY.md` with pre-deployment checklist
- [x] 3.2 Create `SETUP_CHECKLIST.md` for first-time buyers
- [x] 3.3 Update `.env.example` with security warnings about `NEXT_PUBLIC_*` vs secrets
- [ ] 3.4 Add "Security Considerations" section to `README.md` (pending)

## 4. Validation & Testing
- [x] 4.1 Run `openspec validate security-mvp-for-gumroad-launch --strict` ✅ PASSED
- [ ] 4.2 Test webhook idempotency (send duplicate Stripe events) - Manual testing
- [ ] 4.3 Test rate limiting (exceed 5 requests in 1 minute) - Manual testing
- [ ] 4.4 Verify RLS policies block unauthorized access - Manual testing
- [ ] 4.5 Test setup flow with new `SETUP_CHECKLIST.md` - Manual testing

## 5. ZIP Preparation
- [x] 5.1 Update version to `v1.0.0` in `package.json`
- [x] 5.2 Create `CHANGELOG.md` documenting security fixes
- [ ] 5.3 Generate ZIP with all updated files - Ready for Gumroad
- [ ] 5.4 Beta test with 2 external reviewers - Pending
