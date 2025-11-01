# Setup Checklist — First-Time Setup Guide

Complete this checklist to get your SaaS running in under 10 minutes.

## ⏱️ Estimated Time: 10 minutes

---

## Step 1: Clone & Install (2 min)

```bash
# Clone the repository
git clone <your-repo-url>
cd your-saas-app

# Install dependencies
npm install
```

---

## Step 2: Create Supabase Project (3 min)

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Enter project name (e.g., "my-saas-prod")
4. Set a strong database password
5. Click **Create new project** (wait 2-3 minutes)

Once created:
- Go to **Project Settings** → **API**
- Copy these values:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep secret!)

---

## Step 3: Create Stripe Account (2 min)

1. Go to [stripe.com](https://stripe.com)
2. Click **Sign up**
3. Complete account setup
4. Go to **Developers** → **API Keys**
5. Make sure you're in **Live Mode** (toggle in top-left)
6. Copy these values:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY` (⚠️ keep secret!)

---

## Step 4: Create Stripe Products & Prices (2 min)

1. In Stripe Dashboard, go to **Products**
2. Click **Add product**
3. Create two products:
   - **Pro**: $14.99/month
   - **Enterprise**: $99.99/month

For each product:
- Click **Add pricing** → **Monthly**
- Enter amount (e.g., 1499 for $14.99)
- Click **Save product**
- Copy the **Price ID** (price_xxx)

Update your `.env.local`:
```env
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
```

---

## Step 5: Setup Webhook (1 min)

1. In Stripe Dashboard, go to **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## Step 6: Configure Environment Variables

Create `.env.local` in your project root:

```env
# ⚠️ SUPABASE - Replace with YOUR project values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ STRIPE - Replace with YOUR live keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Prices
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx

# App Name
NEXT_PUBLIC_APP_NAME=My SaaS App
```

---

## Step 7: Apply Database Migrations

```bash
# Run migrations on your Supabase project
supabase db push

# Or manually:
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of supabase/migrations/*.sql
# 3. Paste and run in SQL Editor
```

---

## Step 8: Test Locally

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Test signup, checkout, and subscription flows
```

---

## Step 9: Deploy to Vercel (Optional)

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Go to vercel.com → Import project
# Add environment variables from .env.local
# Click Deploy
```

---

## ⚠️ Security Reminders

- [ ] **Never commit `.env.local`** to Git
- [ ] **Never share `STRIPE_SECRET_KEY`** or `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Use live Stripe keys** in production (not test keys)
- [ ] **Verify webhook signature** in production
- [ ] **Enable RLS policies** on all database tables
- [ ] **Rotate keys every 90 days**

---

## 🐛 Troubleshooting

### "Supabase connection failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not truncated
- Ensure Supabase project is active (not paused)

### "Stripe checkout fails"
- Verify `STRIPE_SECRET_KEY` is live mode (starts with `sk_live_`)
- Check `STRIPE_PRICE_PRO_MONTHLY` exists in Stripe dashboard
- Ensure webhook endpoint is configured

### "Webhooks not received"
- Verify webhook URL is publicly accessible
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Look at Stripe webhook logs for delivery attempts

---

## ✅ You're Done!

Your SaaS is now set up and ready to use. Next steps:

1. **Customize**: Update branding, colors, and copy
2. **Add Features**: Use `/build-saas` command to add more features
3. **Monitor**: Set up error tracking (Sentry) and analytics
4. **Scale**: Monitor usage and upgrade Supabase/Stripe as needed

For more help, see:
- [SECURITY.md](./SECURITY.md) — Security best practices
- [DEPLOY.md](./DEPLOY.md) — Deployment guide
- [PAYMENTS.md](./PAYMENTS.md) — Stripe integration details
