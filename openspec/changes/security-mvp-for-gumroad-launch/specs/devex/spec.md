# devex Specification Delta

## ADDED Requirements

### Requirement: Security Documentation for Buyers
The project SHALL include buyer-facing security documentation for safe deployment.

#### Scenario: SECURITY.md guides pre-deployment
- **GIVEN** a buyer downloads the boilerplate ZIP
- **WHEN** they open `SECURITY.md`
- **THEN** they see a checklist with:
  - Key rotation steps (Supabase, Stripe)
  - RLS policy review guidance
  - Webhook configuration instructions
  - Environment variable security warnings

#### Scenario: SETUP_CHECKLIST.md accelerates first setup
- **GIVEN** a buyer is setting up for the first time
- **WHEN** they follow `SETUP_CHECKLIST.md`
- **THEN** they complete setup in under 10 minutes
- **AND** critical security steps are highlighted with ⚠️ warnings

#### Scenario: .env.example prevents common mistakes
- **GIVEN** a buyer copies `.env.example` to `.env`
- **WHEN** they read the comments
- **THEN** they understand:
  - `NEXT_PUBLIC_*` variables are exposed to the browser
  - Server-only secrets must never use `NEXT_PUBLIC_` prefix
  - Demo keys must be replaced before production deployment
