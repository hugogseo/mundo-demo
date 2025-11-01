# Supabase Automation Guide

This document explains how to use the automated Supabase initialization script shipped with the agentic boilerplate.

## Overview

The script `npm run agentic:init-supabase` uses the Supabase Management API to:

1. Create (or reuse) a Supabase hosted project
2. Wait until the project is ready
3. Fetch API keys (anon/service)
4. Optionally apply migrations using the Supabase CLI (`supabase db push`)
5. Print environment variables you can plug into Vercel deployment

## Prerequisites

- Supabase account (Pro plan for Management API access)
- Personal access token: https://supabase.com/dashboard/account/tokens
- Organization ID: find in Supabase dashboard URL (e.g., `https://supabase.com/dashboard/org/ORG_ID`)
- Supabase CLI installed locally (`npm i -g supabase`) if you want to auto-apply migrations

## Required Environment Variables

```bash
export SUPABASE_ACCESS_TOKEN=sbp_xxx          # personal access token
export SUPABASE_ORG_ID=org_xxx                # organization ID
export SUPABASE_DB_PASSWORD=StrongPassword123 # database password for new project
```

## Optional Environment Variables

```bash
export SUPABASE_PROJECT_NAME=agentic-saas-db  # defaults to agentic-saas-db
export SUPABASE_REGION=us-east-1             # defaults to us-east-1
export SUPABASE_PLAN=free                    # free or pro
export SUPABASE_PROJECT_REF=abcd1234         # reuse existing project instead of creating
export SUPABASE_APPLY_MIGRATIONS=true        # run `supabase db push` automatically
```

## Run the Script

```bash
npm run agentic:init-supabase
```

Example output:

```
🔧 Agentic Supabase Initialization
✓ Supabase project ref: abcd1234
✓ Supabase project is ready
🔐 API Keys (store securely):
   NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
ℹ️  Skipping migration apply (set SUPABASE_APPLY_MIGRATIONS=true to enable).
```

## Next Steps

1. Copy the printed keys into your environment (or Vercel project settings)
2. Run `npm run agentic:deploy` to deploy your app to Vercel
3. Configure the Stripe webhook after the first deployment

## Troubleshooting

### Permission denied / Unauthorized
- Ensure your Supabase token has access to the selected organization
- Verify token has `write` scope

### Project creation stuck in `restoring`
- Wait a few minutes and rerun the script
- Check Supabase status page: https://status.supabase.com

### CLI not found when applying migrations
- Install Supabase CLI: `npm i -g supabase`
- Ensure it is available on PATH

### Billing restrictions
- Some regions/plans require billing info. Configure billing in Supabase dashboard before creating Pro projects.

## CI/CD Usage

In GitHub Actions or similar environments, add secrets and run:

```yaml
- run: npm run agentic:init-supabase
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    SUPABASE_ORG_ID: ${{ secrets.SUPABASE_ORG_ID }}
    SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

## Related

- `agentic/deploy/DEPLOY_PLAN.md` – detailed checklist
- `DEPLOY.md` – Vercel deployment guide
- `scripts/deploy-vercel.ts` – automated Vercel deploy
