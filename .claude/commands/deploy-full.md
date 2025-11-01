---
description: Deploy full stack to Vercel with Supabase and Stripe configured via MCPs
allowed-tools: Read, Edit, Write, MCPTool, RunCommand
---

# Full Stack Deployment

This command orchestrates a complete deployment using Stripe and Supabase MCP servers.

## What it does

1. Validates all prerequisites (env vars, MCPs, migrations)
2. Applies Supabase migrations and verifies schema
3. Configures Stripe webhooks for production
4. Deploys to Vercel with all environment variables
5. Runs post-deployment checks

## Prerequisites

Before deploying, ensure:
- [x] Ran `/setup-supabase` successfully
- [x] Ran `/setup-stripe` successfully  
- [x] Have Vercel account linked
- [x] All environment variables ready
- [x] Git repository is up to date

## Deployment Flow

### Phase 1: Pre-Flight Checks

1. **Verify Environment Variables**
   Required vars:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   STRIPE_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET
   NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
   NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY
   ```

2. **Test Database Connection** (via Supabase MCP)
   - Execute simple query to verify connectivity
   - Check that all migrations are applied

3. **Validate Stripe Configuration** (via Stripe MCP)
   - Verify API keys are live mode (or test if intentional)
   - Check that price IDs exist
   - Confirm webhook endpoint is ready for production URL

### Phase 2: Supabase Production Setup

Using Supabase MCP:

1. **Apply Migrations**
   ```typescript
   // Via MCP: apply_migration for each file in supabase/migrations/
   ```

2. **Enable RLS on All Tables**
   Verify policies:
   - User-scoped data uses `auth.uid()`
   - Service role key for webhooks

3. **Configure Auth**
   - Set production redirect URLs
   - Enable required providers
   - Configure email templates

4. **Generate Production Types**
   ```bash
   npx supabase gen types typescript --project-id PROD_ID > types/database.ts
   ```

### Phase 3: Stripe Production Setup

Using Stripe MCP:

1. **Switch to Live Mode**
   Ensure using live API keys (sk_live_*, pk_live_*)

2. **Create/Update Webhook Endpoint**
   ```typescript
   // Via MCP: create webhook endpoint
   {
     url: "https://your-app.vercel.app/api/stripe/webhook",
     events: [
       "checkout.session.completed",
       "customer.subscription.created",
       "customer.subscription.updated",
       "customer.subscription.deleted",
       "invoice.payment_failed"
     ]
   }
   ```
   Save the webhook secret.

3. **Verify Products and Prices**
   Confirm all price IDs are in live mode.

### Phase 4: Vercel Deployment

1. **Create/Update Vercel Project**
   ```bash
   vercel --prod
   ```
   Or use Vercel dashboard.

2. **Set Environment Variables**
   Via Vercel dashboard or CLI:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   # ... repeat for all vars
   ```

3. **Deploy**
   ```bash
   git push origin main
   ```
   Vercel will auto-deploy (if connected) or run:
   ```bash
   vercel --prod
   ```

4. **Verify Deployment**
   - Check build logs for errors
   - Visit production URL
   - Test key flows

### Phase 5: Post-Deployment Validation

1. **Test Authentication**
   - Sign up new user
   - Verify email confirmation
   - Test login/logout

2. **Test Database Operations**
   - Create a record (tests RLS + insert)
   - Read records (tests RLS + select)
   - Update/delete (tests RLS + modify)

3. **Test Stripe Integration**
   - Visit `/pricing`
   - Start checkout flow
   - Complete test payment (use Stripe test card)
   - Verify webhook received and processed

4. **Monitor Logs**
   - Vercel function logs
   - Supabase logs (via dashboard)
   - Stripe webhook logs

## Rollback Plan

If deployment fails:

1. **Revert Vercel Deployment**
   ```bash
   vercel rollback
   ```

2. **Revert Supabase Migrations** (if needed)
   Use MCP or SQL editor to drop tables/policies

3. **Disable Stripe Webhook**
   Via Stripe dashboard or MCP

## Environment-Specific Notes

### Staging Environment
- Use Supabase preview branch
- Use Stripe test mode
- Set `NEXT_PUBLIC_APP_ENV=staging`

### Production Environment
- Use Supabase main project
- Use Stripe live mode
- Enable monitoring and alerts

## Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase migrations applied successfully
- [ ] Stripe webhook configured with production URL
- [ ] Authentication flows tested
- [ ] Payment flows tested (test mode first)
- [ ] RLS policies verified
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)
- [ ] Performance monitoring enabled
- [ ] Backup strategy confirmed

## Memory

Record deployment details:
- Deployment date and time
- Vercel deployment URL
- Supabase project ID (production)
- Stripe webhook endpoint ID
- Any issues encountered and resolutions
- Performance baseline metrics

## Next Steps

After successful deployment:
1. Set up monitoring alerts
2. Configure custom domain
3. Enable CDN/caching optimizations
4. Schedule regular database backups
5. Plan for scaling (connection pooling, read replicas)
6. Set up staging environment for future changes
