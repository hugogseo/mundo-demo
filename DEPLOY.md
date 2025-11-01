# Deployment Guide

This boilerplate supports automated deployment to Vercel with integrated Supabase and Stripe.

## Quick Start (Automated)

### Prerequisites

1. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Install CLI: `npm i -g vercel`
   - Login: `vercel login`
   - Get token: https://vercel.com/account/tokens

2. **Supabase Project**
   - Create at [supabase.com](https://supabase.com)
   - Note URL and keys

3. **Stripe Account**
   - Create at [stripe.com](https://stripe.com)
   - Get test keys from dashboard

### Environment Setup

Create a `.env.local` file or export these variables:

```bash
# Vercel
export VERCEL_TOKEN=your_vercel_token_here
export VERCEL_ORG_ID=team_xxx              # optional for team projects
export VERCEL_PROJECT_NAME=my-saas-app     # optional custom name

# Supabase
export NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
export SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
export STRIPE_SECRET_KEY=sk_test_xxx
export STRIPE_WEBHOOK_SECRET=whsec_xxx     # get after first deploy

# Optional: Stripe Prices
export NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxx
```

### Deploy

```bash
npm run agentic:deploy
```

The script will:
1. ✅ Create/link Vercel project
2. ✅ Upload environment variables
3. ✅ Trigger preview deployment
4. ✅ Return preview URL

### Post-Deployment

1. **Apply Supabase Migrations**
   - Go to Supabase SQL Editor
   - Run migrations from `supabase/migrations/`

2. **Configure Stripe Webhook**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy webhook secret
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel

3. **Validate & Promote**
   - Test the preview URL
   - Verify auth, CRUD, and payment flows
   - Promote to production in Vercel dashboard

## Manual Deployment

If you prefer manual setup, follow the guide in `agentic/deploy/DEPLOY_PLAN.md` (generated during orchestration).

## Production Checklist

Before going live:

- [ ] Switch to Stripe **live** keys (pk_live_xxx, sk_live_xxx)
- [ ] Update webhook with live secret
- [ ] Configure custom domain in Vercel
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure analytics (Vercel Analytics, Google Analytics, etc.)
- [ ] Review and test all user flows
- [ ] Set up backup strategy for Supabase

## Troubleshooting

### Deployment fails with "Missing environment variable"
Make sure all required env vars are set. Check with:
```bash
echo $VERCEL_TOKEN
echo $NEXT_PUBLIC_SUPABASE_URL
```

### "Project already exists"
Set `VERCEL_PROJECT_ID` to reuse existing project:
```bash
export VERCEL_PROJECT_ID=prj_xxx
npm run agentic:deploy
```

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Verify endpoint URL is correct
- Check Stripe dashboard logs for delivery attempts

### Database connection fails
- Verify Supabase URL and keys are correct
- Check if Supabase project is active (not paused)
- Ensure migrations are applied

## Advanced

### CI/CD Integration

Add to `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run agentic:deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          # ... other secrets
```

### Multiple Environments

Create separate Vercel projects for staging/production:

```bash
# Staging
export VERCEL_PROJECT_ID=prj_staging_xxx
npm run agentic:deploy

# Production
export VERCEL_PROJECT_ID=prj_prod_xxx
npm run agentic:deploy
```

## Support

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
