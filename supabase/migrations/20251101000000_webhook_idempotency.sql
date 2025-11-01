-- Webhook Idempotency Table
-- Prevents duplicate processing of Stripe webhook events

CREATE TABLE IF NOT EXISTS public.webhook_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at 
    ON public.webhook_events(processed_at);

-- Grant access
GRANT SELECT, INSERT ON public.webhook_events TO service_role;
