---
description: Build a full SaaS from a natural-language description using agentic sub-agents
allowed-tools: Read, Grep, Glob, Write, Edit
---

# /build-saas — Agentic SaaS Builder

Turn a plain-language idea into a working SaaS using the agentic orchestrator and sub-agents (Schema, API, Frontend, Deployment).

## Inputs
- Description (required): e.g. "Freelancers create invoices and clients pay them"
- Options (optional):
  - `withDeployment`: yes/no (default: no)
  - `scope`: directories to affect (default: `app, lib, supabase`)

## Steps

### 1) Collect Intent
- Ask user: "Describe your SaaS in 1–2 sentences"
- Save raw description as `agentic/last-intent.txt`

### 2) Parse Intent
- Read `lib/agentic/intent-parser.ts`
- Extract entities, relationships, operations, and business questions
- Output preview:
  - Entities: [...]
  - Relationships: [...]
  - Operations: [...]
  - Questions: [...]
- If questions exist, ask them in non-technical terms. Use smart defaults when the user skips.

### 3) Orchestrate Sub-Agents (Generate Artifacts)
- Invoke sub-agents in sequence:
  1. **Schema Agent** → generates migrations and RLS policies
  2. **API Agent** → generates API routes (+ Stripe if payments detected)
  3. **Frontend Agent** → generates pages and components
- Show plan summary:
  - Migrations to create: [paths]
  - API routes to add: [paths]
  - Pages/components to add: [paths]
- Preview artifacts before writing

### 4) Confirm and Write Files
- On user confirmation, write artifacts to disk
- Create files exactly at their paths
- Never overwrite unrelated files

### 5) Validate
- Propose (do not auto-run):
  - Type check: `npm run -s build` (no emit)
  - Lint: `npm run -s lint`
  - Tests: `npm run -s test:ci`
- If errors, show minimal diffs and propose fixes

### 6) Optional Deployment
- If `withDeployment=yes`, prepare deployment plan:
  - Map required env vars
  - Summarize steps for Vercel + Supabase
  - Do not mutate external systems without explicit approval

### 7) Summary & Next Steps
- Print created paths and follow-up (pricing, auth, emails)
- Offer `/refine-saas` for iterative changes

## Safety
- Read-first posture; show diffs before writing
- Keep scope to `scope` directories
- Never expose secrets; only use server-side keys in code where required
