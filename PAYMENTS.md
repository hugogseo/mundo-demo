# Stripe Integration Guide

## Overview

This boilerplate includes full Stripe integration for subscription management:
- **Checkout**: Create subscription sessions
- **Billing Portal**: Manage subscriptions
- **Webhooks**: Sync subscription data with Supabase

## Setup

### 1. Create Stripe Products

```bash
# Pro Product
stripe products create --name="Pro" --description="Pro tier"

# Enterprise Product
stripe products create --name="Enterprise" --description="Enterprise tier"
```

### 2. Create Prices

```bash
# Pro Monthly ($14.99)
stripe prices create \
  --product=prod_YOUR_ID \
  --unit-amount=1499 \
  --currency=usd \
  --recurring[interval]=month

# Pro Yearly ($143.90 = 20% discount)
stripe prices create \
  --product=prod_YOUR_ID \
  --unit-amount=14390 \
  --currency=usd \
  --recurring[interval]=year

# Enterprise Monthly ($99.99)
stripe prices create \
  --product=prod_YOUR_ID \
  --unit-amount=9999 \
  --currency=usd \
  --recurring[interval]=month

# Enterprise Yearly ($959.90 = 20% discount)
stripe prices create \
  --product=prod_YOUR_ID \
  --unit-amount=95990 \
  --currency=usd \
  --recurring[interval]=year
```

### 3. Update Environment Variables

Add to `.env` and `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRODUCT_PRO=prod_...
STRIPE_PRODUCT_ENTERPRISE=prod_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
```

### 4. Setup Webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret
```

Copy the webhook secret to `.env`.

## API Routes

### POST `/api/stripe/checkout`

Create a checkout session.

**Request:**
```json
{
  "tier": "pro" | "enterprise",
  "period": "monthly" | "yearly"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "isUpgrade": false,
  "isPortal": false
}
```

### POST `/api/stripe/portal`

Get billing portal URL.

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

## Webhook Events

The webhook handler processes:

- `customer.subscription.created` – New subscription
- `customer.subscription.updated` – Subscription changes
- `customer.subscription.deleted` – Subscription canceled
- `invoice.payment_failed` – Payment failed

All events sync with Supabase `subscriptions` table.

## Testing

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## Troubleshooting

### Webhook not received

1. Check webhook secret is correct
2. Verify webhook URL is accessible
3. Check Stripe webhook logs in dashboard

### Subscription not syncing

1. Check webhook handler logs
2. Verify Supabase credentials
3. Check RLS policies on `subscriptions` table

### Price not found

1. Verify price IDs in `.env`
2. Check prices exist in Stripe dashboard
3. Ensure prices are for correct products
