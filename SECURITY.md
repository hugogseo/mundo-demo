# Security Best Practices

This guide helps you deploy the boilerplate securely to production.

## 🔒 Pre-Deployment Checklist

### 1. Rotate All Keys

- [ ] **Supabase**: Create a new production project (don't use demo keys)
  - Go to [supabase.com](https://supabase.com) → Create Project
  - Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copy `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

- [ ] **Stripe**: Switch from test to live mode
  - Go to [Stripe Dashboard](https://dashboard.stripe.com)
  - Switch to **Live Mode** (toggle in top-left)
  - Copy live API keys: `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Generate webhook secret: Dashboard → Webhooks → Add Endpoint
  - Copy `STRIPE_WEBHOOK_SECRET`

- [ ] **Vercel**: Set production environment variables
  - Go to Vercel project → Settings → Environment Variables
  - Add all keys from above (separate from preview/development)

### 2. Review Database Security

- [ ] **RLS Policies**: Verify Row Level Security is enabled
  ```bash
  # Check in Supabase SQL Editor:
  SELECT * FROM pg_tables WHERE schemaname = 'public';
  # All tables should have RLS enabled
  ```

- [ ] **Public Policies**: Confirm no overly permissive policies
  - ✅ Users can only view/update their own profile
  - ✅ Users can only view their own subscriptions
  - ❌ No `USING (true)` policies that expose all data

- [ ] **Service Role**: Verify service role is only used server-side
  - Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code
  - Only use in server actions, API routes, and edge functions

### 3. Configure Webhooks

- [ ] **Stripe Webhook Endpoint**
  - Dashboard → Webhooks → Add Endpoint
  - URL: `https://your-domain.com/api/webhooks/stripe`
  - Events to subscribe:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_failed`
  - Copy webhook secret and add to `STRIPE_WEBHOOK_SECRET`

- [ ] **Test Webhook Delivery**
  - Send test event from Stripe dashboard
  - Check Vercel logs for successful processing
  - Verify subscription created in Supabase

### 4. Environment Variables

- [ ] **Production vs Preview**
  - Set different keys for production and preview environments
  - Prevent accidental test charges on production

- [ ] **Secrets Management**
  - Never commit `.env` or `.env.local` to Git
  - Use Vercel's environment variable UI (encrypted at rest)
  - Rotate keys every 90 days

### 5. API Security

- [ ] **CORS**: Verify Origin validation in checkout route
  - Only your domain can initiate checkout
  - Prevents CSRF attacks from other sites

- [ ] **Rate Limiting**: Checkout endpoint limits 5 requests/min per IP
  - Prevents abuse and DoS attacks
  - Returns HTTP 429 when exceeded

- [ ] **Webhook Signature Verification**: Enabled by default
  - All webhooks are verified using `STRIPE_WEBHOOK_SECRET`
  - Invalid signatures are rejected with HTTP 400

### 6. Monitoring & Logging

- [ ] **Error Tracking**: Set up Sentry or similar
  ```bash
  npm install @sentry/nextjs
  # Configure in next.config.ts
  ```

- [ ] **Stripe Dashboard**: Monitor webhook delivery
  - Dashboard → Webhooks → View recent deliveries
  - Check for failed events and retry

- [ ] **Vercel Logs**: Monitor API route errors
  - Vercel Dashboard → Project → Logs
  - Filter by `/api/webhooks/stripe` and `/api/stripe/checkout`

### 7. Custom Domain

- [ ] **SSL Certificate**: Vercel provides automatic HTTPS
  - Add custom domain in Vercel project settings
  - Wait for DNS propagation (5-30 minutes)

- [ ] **Email Verification**: Update auth email sender
  - Supabase → Auth → Email Templates
  - Update sender to your domain

---

## 🚨 Common Security Mistakes

### ❌ Using Demo Keys in Production
```env
# WRONG - Demo keys exposed to all users
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ✅ Correct Approach
```env
# RIGHT - Production keys from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### ❌ Exposing Service Role Key to Client
```typescript
// WRONG - Service role key visible in browser
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ❌ NEVER!
);
```

### ✅ Correct Approach
```typescript
// RIGHT - Only use in server components/routes
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Server-only
);
```

---

### ❌ Forgetting Webhook Signature Verification
```typescript
// WRONG - Trusts webhook without verification
export async function POST(request: NextRequest) {
  const event = await request.json(); // ❌ No signature check
  // Process event...
}
```

### ✅ Correct Approach
```typescript
// RIGHT - Verify signature before processing
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  // Process event...
}
```

---

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email **security@yourdomain.com** instead of opening a public issue.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge your report within 48 hours and provide a timeline for remediation.

---

## 📚 Additional Resources

- [Supabase Security Guide](https://supabase.com/docs/guides/security)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
