---
description: Refine or extend an existing generated SaaS via natural-language deltas
allowed-tools: Read, Grep, Glob, Write, Edit
---

# /refine-saas — Agentic SaaS Refinement

Iterate on a generated SaaS by describing changes in natural language. The orchestrator computes deltas and updates only affected files.

## Inputs
- Delta description (required): e.g. "Add recurring billing to invoices"
- Options (optional):
  - `dryRun`: yes/no (default: yes)
  - `scope`: directories to affect (default: `app, lib, supabase`)

## Steps

### 1) Load Previous Context
- Read `agentic/last-intent.txt` if available
- Read recent artifacts (look for files with agentic-generated markers/paths)

### 2) Parse Delta
- Use `lib/agentic/intent-parser.ts` to parse new requirements
- Merge with previous intent (preserve existing entities/operations)
- Produce a delta plan (what changes, what remains)

### 3) Orchestrate Delta Generation
- Run `lib/agentic/orchestrator.ts` with merged intent
- Collect artifacts and annotate as `added/modified/removed`
- Display plan summary and impacted paths

### 4) Apply Changes (Dry Run by default)
- If `dryRun=yes`, show diffs only
- If user confirms, write changes:
  - Create new files
  - Patch modified files (minimal edits)
  - Do not delete files unless explicitly confirmed

### 5) Validate
- Propose (do not auto-run):
  - Type check: `npm run -s build` (no emit)
  - Lint: `npm run -s lint`
  - Tests: `npm run -s test:ci`
- If errors, show minimal diffs and propose fixes

### 6) Update Intent & Checkpoint
- Save merged intent to `agentic/last-intent.txt`
- Save checkpoint metadata for resuming later

## Safety
- Default to dry-run; never overwrite unrelated code
- Limit scope to `scope` directories
- Show diffs for all modified files
- Keep an audit log of applied deltas
