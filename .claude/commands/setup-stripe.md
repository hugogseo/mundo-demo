---
description: Configure Stripe integration with MCP tools and generate payment artifacts
allowed-tools: Read, Edit, Write, MCPTool
---

# Setup Stripe Integration

This command sets up Stripe payment processing using the Stripe MCP server.

## What it does

1. Validates Stripe API keys are configured
2. Creates/updates Stripe webhook endpoints via MCP
3. Generates payment artifacts (checkout, webhooks, pricing page)
4. Updates environment variables template
5. Tests the integration with a test customer/product

## Prerequisites

Before running this command, ensure:
- You have a Stripe account (test mode is fine)
- Stripe MCP server is configured in `.claude.json`
- You have your Stripe API keys ready

## Steps

### 1. Verify MCP Connection
Check that the Stripe MCP server is accessible:
```bash
claude mcp list
```
You should see `stripe` in the list.

### 2. Set Environment Variables
Create or update `.env.local` with:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (will be generated)
```

### 3. Generate Artifacts
Invoke **API Agent** to generate:
- `app/api/stripe/checkout/route.ts` - Checkout session handler
- `app/api/stripe/webhook/route.ts` - Webhook event handler
- Price ID alignment with `lib/stripe/config.ts`
- API version verification

Invoke **Frontend Agent** to generate:
- `app/pricing/page.tsx` - Pricing page with tiers
- `app/pricing/components/CheckoutButton.tsx` - Payment button

### 4. Create Webhook Endpoint (via MCP)
Using Stripe MCP tools, create a webhook endpoint:
- URL: `https://your-app.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

### 5. Create Test Products (via MCP)
Use MCP to create price objects for:
- Pro Monthly: $14.99/month
- Pro Yearly: $144/year  
- Enterprise Monthly: $99/month
- Enterprise Yearly: $999/year

Copy the price IDs to environment variables:
```
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
```

### 6. Test Integration
Run the app locally and test:
```bash
npm run dev
```
Visit `/pricing` and click a checkout button.

## Troubleshooting

**Webhook signature verification fails:**
- Ensure `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret in Stripe dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

**Checkout session not creating:**
- Verify publishable key is correctly set as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Check browser console for CORS or network errors
- Ensure price IDs are valid and not from a different Stripe account

**MCP tools not available:**
- Run `claude mcp list` to verify Stripe MCP is registered
- Check `.claude.json` configuration
- Restart Claude Code if needed

## Next Steps

After setup:
1. Test the full payment flow in Stripe test mode
2. Configure subscription management (customer portal)
3. Set up production webhooks before deploying
4. Enable Stripe tax calculation if needed

## Memory

Save key details for future reference:
- Stripe account ID and mode (test/live)
- Webhook endpoint IDs
- Price IDs for each tier
- Date of last webhook configuration update
