# Security Capability

## Purpose
Define security requirements for production deployment of the SaaS boilerplate, including RLS policies, API route protection, webhook security, and buyer documentation.

## ADDED Requirements

### Requirement: RLS Least Privilege
The database schema SHALL enforce Row Level Security with least-privilege policies.

#### Scenario: User can only access own data
- **GIVEN** a user is authenticated
- **WHEN** they query the `profiles` table
- **THEN** they can only SELECT/UPDATE their own profile row (WHERE auth.uid() = id)
- **AND** they cannot view other users' profiles without explicit policy

#### Scenario: Public profile policy removed
- **GIVEN** the boilerplate is deployed
- **WHEN** inspecting RLS policies on `profiles`
- **THEN** there is NO policy with `USING (true)` that allows public SELECT
- **AND** only authenticated users can view profiles via explicit policies

### Requirement: API Route Dynamic Rendering
All API routes SHALL export `dynamic = 'force-dynamic'` to prevent caching.

#### Scenario: Webhook route is not cached
- **GIVEN** a Stripe webhook event is sent
- **WHEN** the same event is sent twice within 60 seconds
- **THEN** both requests are processed independently (not served from cache)
- **AND** the route exports `export const dynamic = 'force-dynamic'`

#### Scenario: Checkout route is not cached
- **GIVEN** a user initiates checkout
- **WHEN** they refresh the page or retry
- **THEN** a fresh Stripe session is created each time
- **AND** no stale session URLs are returned

### Requirement: Demo Keys Prohibited in Production
The boilerplate SHALL NOT include hardcoded production-usable API keys.

#### Scenario: Setup script uses placeholders
- **GIVEN** a buyer runs `scripts/setup.js`
- **WHEN** the `.env` file is generated
- **THEN** Supabase keys are placeholders (e.g., "# Run 'supabase status' to get this")
- **AND** no hardcoded JWT secrets from Supabase demo are present

#### Scenario: Runtime validation detects demo keys
- **GIVEN** the app is deployed to production (NODE_ENV=production)
- **WHEN** the app starts with demo Supabase keys
- **THEN** the app throws an error and refuses to start
- **AND** the error message instructs the user to rotate keys

### Requirement: Stable Stripe API Version
The Stripe client SHALL use a stable, documented API version.

#### Scenario: API version is 2024-06-20
- **GIVEN** the boilerplate is initialized
- **WHEN** inspecting `lib/stripe/server.ts`
- **THEN** the `apiVersion` is set to `'2024-06-20'`
- **AND** this version is documented in Stripe's official API docs

### Requirement: CSRF Protection for Checkout
The checkout API route SHALL validate the request origin to prevent CSRF attacks.

#### Scenario: Valid origin accepted
- **GIVEN** a user initiates checkout from the app's domain
- **WHEN** the request is sent to `/api/stripe/checkout`
- **THEN** the `Origin` header matches an allowed origin
- **AND** the checkout session is created

#### Scenario: Invalid origin rejected
- **GIVEN** an attacker sends a checkout request from `evil.com`
- **WHEN** the request reaches `/api/stripe/checkout`
- **THEN** the request is rejected with HTTP 403
- **AND** the response body contains `{ error: 'Invalid origin' }`

### Requirement: Rate Limiting for Checkout
The checkout API route SHALL enforce rate limiting to prevent abuse.

#### Scenario: Normal usage allowed
- **GIVEN** a user initiates checkout
- **WHEN** they send 3 requests within 1 minute
- **THEN** all requests are processed successfully

#### Scenario: Excessive requests blocked
- **GIVEN** a user or bot sends 6 requests within 1 minute
- **WHEN** the 6th request is sent
- **THEN** the request is rejected with HTTP 429
- **AND** the response includes `Retry-After: 60` header

### Requirement: Webhook Idempotency
The webhook handler SHALL prevent duplicate processing of the same Stripe event.

#### Scenario: First event processed
- **GIVEN** a Stripe event `evt_123` is sent
- **WHEN** the webhook handler receives it
- **THEN** the event is processed and recorded in `webhook_events` table
- **AND** the subscription is updated in the database

#### Scenario: Duplicate event skipped
- **GIVEN** event `evt_123` was already processed
- **WHEN** Stripe resends the same event
- **THEN** the handler detects the duplicate via `webhook_events` table
- **AND** returns `{ received: true, skipped: true }` without reprocessing

### Requirement: Security Documentation
The boilerplate SHALL include comprehensive security documentation for buyers.

#### Scenario: SECURITY.md checklist exists
- **GIVEN** a buyer downloads the ZIP
- **WHEN** they open `SECURITY.md`
- **THEN** they see a pre-deployment checklist with:
  - Key rotation instructions
  - RLS policy review steps
  - Webhook configuration guidance
  - Monitoring setup recommendations

#### Scenario: SETUP_CHECKLIST.md guides first setup
- **GIVEN** a buyer is setting up for the first time
- **WHEN** they follow `SETUP_CHECKLIST.md`
- **THEN** they complete setup in under 10 minutes
- **AND** all security-critical steps are marked with ⚠️ warnings

#### Scenario: .env.example has security warnings
- **GIVEN** a buyer copies `.env.example` to `.env`
- **WHEN** they read the file
- **THEN** they see clear warnings about `NEXT_PUBLIC_*` vs server-only secrets
- **AND** demo keys are clearly marked as "DO NOT USE IN PRODUCTION"
