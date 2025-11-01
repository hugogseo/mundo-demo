---
name: stripe-webhooks-simulator
description: Start/stop Stripe CLI listener and verify local webhook delivery to Next.js. Use when testing subscription flows, checking invalid signatures, or diagnosing missing events. Ensures port 3000 and prints signing secret guidance.
allowed-tools: Read, Grep, Glob
---

# Stripe Webhooks Simulator

## Tasks
- Verify forwarding to http://localhost:3000/api/webhooks/stripe
- Start listener if not running; stop/restart as needed
- Tail logs and surface errors (invalid signature, 400/500)

## Steps
1. Read `stripe-webhook.sh` and STRIPE docs in repo.
2. If script points to :4000, propose fix to :3000 and open a minimal PR.
3. If asked to run: show exact commands to start/stop and where to copy whsec.
4. Tail and summarize `/tmp/stripe-webhook.log` for recent errors.
