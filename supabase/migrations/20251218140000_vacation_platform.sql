-- ============================================================================
-- VACATION PLATFORM ENUMS
-- ============================================================================
CREATE TYPE service_type AS ENUM ('hotel', 'tour', 'transfer', 'yacht');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type service_type NOT NULL,
    location TEXT NOT NULL DEFAULT 'Cancun',
    base_price DECIMAL(12, 2) NOT NULL,
    discount_price DECIMAL(12, 2) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- { people: 2, nights: 4, inclusions: [] }
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- LAST MINUTE DEALS TABLE
-- ============================================================================
CREATE TABLE public.last_minute_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    deal_price DECIMAL(12, 2) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- CART / PLANS TABLE
-- ============================================================================
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Mi Plan de Viaje',
    is_booked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id),
    quantity INTEGER DEFAULT 1 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- specific dates, passengers, etc.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    status booking_status DEFAULT 'pending' NOT NULL,
    stripe_payment_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.last_minute_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Service reading: All members can read active services
CREATE POLICY "Active members can view services"
    ON public.services
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND membership_tier != 'free'
        )
    );

-- Last minute deals: Same as services
CREATE POLICY "Active members can view deals"
    ON public.last_minute_deals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND membership_tier != 'free'
        )
    );

-- Plans & Items: Users manage their own
CREATE POLICY "Users manage their own plans"
    ON public.plans
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own plan items"
    ON public.plan_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.plans 
            WHERE id = plan_id AND user_id = auth.uid()
        )
    );

-- Bookings: Users view their own, service_role manage all
CREATE POLICY "Users can view their own bookings"
    ON public.bookings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage bookings"
    ON public.bookings
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE TRIGGER on_service_updated
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_plan_updated
    BEFORE UPDATE ON public.plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_booking_updated
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.last_minute_deals TO authenticated;
GRANT ALL ON public.plans TO authenticated;
GRANT ALL ON public.plan_items TO authenticated;
GRANT ALL ON public.bookings TO authenticated;

GRANT ALL ON public.services TO service_role;
GRANT ALL ON public.last_minute_deals TO service_role;
GRANT ALL ON public.plans TO service_role;
GRANT ALL ON public.plan_items TO service_role;
GRANT ALL ON public.bookings TO service_role;
