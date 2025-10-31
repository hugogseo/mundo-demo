# Project Context

## Purpose
Build an "AI SaaS without effort" boilerplate: Next.js-based AI SaaS with automated setup and operations via Claude Code slash commands, Agent Skills, and optional MCP integrations. Provide production-grade auth (Supabase), subscriptions (Stripe), and a clean DX to ship features fast.

## Tech Stack
- Next.js 16 (App Router), React, TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, RLS, Migrations)
- Stripe (Products, Prices, Checkout, Webhooks)
- Claude Code (Agent Skills; Project Skills in `.claude/skills`; Slash commands in `.claude/commands`)
- Optional MCP servers (DB, GitHub, Vercel)
- Tooling: Node 18+, Docker Desktop, Supabase CLI, Stripe CLI

## Project Conventions

### Code Style
- TypeScript-first; small, focused functions.
- Next.js conventions: server components by default; client components only when required.
- Environment variables:
  - App (SSR/CSR): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.
  - Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`.
- Keep secrets out of `NEXT_PUBLIC_*` and client code.
- Linting via `npm run lint`.

### Architecture Patterns
- App Router with pages/layouts under `/app`.
- API routes under `/app/api/*` (e.g., `/api/webhooks/stripe`, `/api/stripe/checkout`).
- Supabase clients split by context: `lib/supabase/{client,server,middleware}.ts`.
- Stripe server client in `lib/stripe/server.ts`; config in `lib/stripe/config.ts`.
- RLS-enabled schema and policies; enum-driven membership tiers; subscription sync via webhook.
- Skills in `.claude/skills` with `allowed-tools`; scripts are deterministic when needed.
- Optional MCP for read-first access to external systems; elevate only on explicit user request.

### Testing Strategy
- Current: manual verification using Stripe CLI and Supabase local stack.
- Skills-supported checks:
  - `stripe-webhooks-simulator`: forwarding to :3000 and webhook delivery checks.
  - `security-hardening`: CSRF checks, rate limit recommendations, dynamic handlers.
- Planned: add route-level tests for API handlers and webhook idempotency checks.

### Git Workflow
- Trunk-based with short-lived feature branches.
- Open PRs with minimal diffs; reviewers check security and docs sync.
- Optional GitHub MCP to list branches and open PRs from Skills.
- Commit messages: concise, imperative; reference files (path:line) when helpful.

## Domain Context
- Subscription SaaS with tiers (`membership_tier`) and `subscription_status` mapped from Stripe events.
- Business rule: when `cancel_at_period_end=true` keep access until status becomes `canceled`.
- Consider supporting `paused` explicitly rather than mapping to `canceled`.

## Important Constraints
- Security:
  - RLS enabled; public profile policy optional (prefer least-privilege).
  - Webhook route exports `dynamic = 'force-dynamic'`; verify `stripe-signature` header.
  - `/api/stripe/checkout` must validate `Origin` and apply basic rate limiting.
  - Do not expose service_role or Stripe secret keys to the client; anchor secrets in server or MCP.
- Operational:
  - Stripe CLI must forward to `localhost:3000/api/webhooks/stripe`.
  - Align Stripe API version across code and account to avoid payload drift.

## External Dependencies
- Supabase (local via Docker; hosted for prod)
- Stripe API + Stripe CLI
- Vercel (deployment, env, logs)
- GitHub (PR workflow)
- Optional: Notion/Confluence via MCP for docs sync
