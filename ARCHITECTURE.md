# Architecture Overview

## Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Auth**: Supabase Auth (magic link)
- **Database**: Supabase PostgreSQL
- **Payments**: Stripe (subscriptions)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Directory Structure

```
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── auth/
│   │   ├── login/page.tsx      # Login form
│   │   ├── callback/route.ts   # OAuth callback
│   │   └── error/page.tsx      # Error page
│   ├── pricing/page.tsx        # Pricing page
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard
│   │   └── components/
│   │       ├── ManageSubscriptionButton.tsx
│   │       └── SubscriptionNotifications.tsx
│   ├── actions/
│   │   └── auth.ts             # Server actions
│   └── api/
│       ├── stripe/
│       │   ├── checkout/route.ts
│       │   └── portal/route.ts
│       └── webhooks/
│           └── stripe/route.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Middleware client
│   └── stripe/
│       ├── client.ts           # Stripe.js loader
│       ├── server.ts           # Stripe API client
│       └── config.ts           # Products & prices
├── types/
│   └── database.ts             # Supabase types
├── supabase/
│   └── migrations/
│       └── 20251025175702_*.sql
├── middleware.ts               # Route protection
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Data Flow

### Authentication

```
User → /auth/login → Magic Link Email → /auth/callback → Supabase Session → /dashboard
```

### Subscription

```
User → /pricing → Select Tier → /api/stripe/checkout → Stripe Checkout → Success → /dashboard?success=true
```

### Webhook

```
Stripe Event → /api/webhooks/stripe → Verify Signature → Update Supabase → Revalidate Dashboard
```

## Database Schema

### profiles

```sql
id (UUID)
email (TEXT)
full_name (TEXT)
avatar_url (TEXT)
membership_tier (ENUM: free, pro, enterprise)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### subscriptions

```sql
id (UUID)
user_id (UUID) → profiles.id
stripe_customer_id (TEXT)
stripe_subscription_id (TEXT)
stripe_price_id (TEXT)
stripe_product_id (TEXT)
status (ENUM: active, canceled, past_due, etc.)
membership_tier (ENUM: free, pro, enterprise)
current_period_start (TIMESTAMPTZ)
current_period_end (TIMESTAMPTZ)
cancel_at_period_end (BOOLEAN)
canceled_at (TIMESTAMPTZ)
trial_start (TIMESTAMPTZ)
trial_end (TIMESTAMPTZ)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

## Security

### Row Level Security (RLS)

- Users can only view/update their own profile
- Users can only view their own subscriptions
- Service role can manage subscriptions (webhooks)

### Middleware

- Protects `/dashboard` route
- Redirects unauthenticated users to `/auth/login`
- Redirects authenticated users away from `/auth/login`

### API Routes

- Verify user authentication before processing
- Validate Stripe webhook signatures
- Use service role for admin operations

## Environment Variables

### Supabase

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Stripe

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRODUCT_PRO
STRIPE_PRODUCT_ENTERPRISE
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_ENTERPRISE_MONTHLY
STRIPE_PRICE_ENTERPRISE_YEARLY
```

### App

```env
NEXT_PUBLIC_APP_NAME
NODE_ENV
```

## Key Features

### Magic Link Auth

- No passwords required
- Email-based authentication
- Supabase Auth handles verification

### Subscription Management

- Monthly and yearly billing
- Automatic proration on upgrades
- Billing portal for managing subscriptions
- Webhook sync with database

### Pricing Tiers

- **Free**: Limited features
- **Pro**: $14.99/month or $143.90/year
- **Enterprise**: $99.99/month or $959.90/year

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Enable HTTPS
- [ ] Configure Stripe webhook for production
- [ ] Setup email notifications
- [ ] Configure custom domain
- [ ] Enable analytics
- [ ] Setup monitoring and logging
- [ ] Test payment flow end-to-end

## Performance

- Server-side rendering for SEO
- Client-side hydration for interactivity
- Revalidation on webhook events
- Optimized images and fonts
- Code splitting by route

## Monitoring

- Stripe dashboard for payment metrics
- Supabase dashboard for database metrics
- Vercel analytics for performance
- Error tracking with Sentry (optional)

## Future Enhancements

- Email notifications
- Advanced analytics
- Custom branding
- Multi-tenant support
- API for third-party integrations
