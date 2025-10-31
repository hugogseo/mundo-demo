---
name: nextjs-frontend-scaffolder
description: Scaffold Next.js pages/routes/layouts with Tailwind, wiring to Supabase auth and current tier UI states. Use when creating new pages or updating pricing/dashboard UX.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Next.js Frontend Scaffolder

## Tasks
- Create `/app/*` pages with SSR-safe components
- Reuse pricing toggles and tier checks
- Integrate "Manage Subscription" flows

## Steps
1. Reuse components/patterns from `/app/pricing/page.tsx` and `/app/dashboard/page.tsx`.
2. Generate skeleton with feature flags by `membership_tier`.
3. Add tests/manual checklist to QUICK_START.md.
