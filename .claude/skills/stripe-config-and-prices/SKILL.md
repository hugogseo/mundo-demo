---
name: stripe-config-and-prices
description: Create/update Stripe products and prices, sync IDs into /lib/stripe/config.ts and docs. Use when adding tiers, changing pricing, or fixing API version mismatches.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Stripe Config & Prices

## Tasks
- Create products/prices (CLI or dashboard instructions)
- Update environment variables and `/lib/stripe/config.ts`
- Check `apiVersion` alignment in `lib/stripe/server.ts` vs account
- Add test plan changes to PAYMENTS.md

## Steps
1. Read `/lib/stripe/config.ts` to map new price IDs.
2. Verify `lib/stripe/server.ts` apiVersion matches account; propose alignment.
3. Update `PAYMENTS.md` tables and examples.
4. If upgrading plans, adjust `/app/api/stripe/checkout/route.ts` validations.
