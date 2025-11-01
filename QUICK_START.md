# Quick Start Guide

## Prerequisites

- Node.js 18+
- Docker (for Supabase)
- Stripe account

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
node scripts/setup.js
```

This creates `.env` and `.env.local` files.

### 3. Start Supabase

```bash
supabase start
```

This starts a local Supabase instance. Copy the credentials to `.env`.

### 4. Configure Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create Pro and Enterprise products
3. Create monthly and yearly prices for each
4. Copy product and price IDs to `.env`

### 5. Setup Webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret
```

Copy the webhook secret to `.env`.

### 6. Start Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Key Files

- **Auth**: `app/actions/auth.ts` – Magic link authentication
- **Pricing**: `app/pricing/page.tsx` – Pricing page with checkout
- **Dashboard**: `app/dashboard/page.tsx` – User dashboard
- **Stripe Config**: `lib/stripe/config.ts` – Product and price IDs
- **Database**: `supabase/migrations/` – Schema and RLS policies

## Testing

### Test Signup

1. Go to `/auth/login`
2. Enter any email
3. Check terminal for magic link (local dev)
4. Click link to verify

### Test Checkout

1. Go to `/pricing`
2. Select tier and period
3. Click "Subscribe"
4. Use test card: `4242 4242 4242 4242`
5. Check dashboard for subscription

### Test Webhooks

Stripe CLI automatically forwards webhook events to your local server.

## Deployment

### Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Environment Variables (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Troubleshooting

### Supabase won't start

```bash
# Check Docker is running
docker ps

# Reset Supabase
supabase stop
supabase start
```

### Stripe keys not working

1. Verify keys in `.env`
2. Check keys are for correct environment (test vs live)
3. Restart dev server

### Magic link not received

In local dev, check terminal output for the link.

## Next Steps

- Customize pricing tiers in `lib/stripe/config.ts`
- Add more dashboard features
- Setup email notifications
- Deploy to production

See [PAYMENTS.md](./PAYMENTS.md) for detailed Stripe integration.
