-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update specific user to be admin (Hugogseo)
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'hugogseo@gmail.com';

-- Enhance services table for multi-photo and guest limits
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 4;

-- RLS Update for Admin Access
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;
CREATE POLICY "Admins can manage all services" ON public.services
    FOR ALL
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

DROP POLICY IF EXISTS "Admins can manage all deals" ON public.last_minute_deals;
CREATE POLICY "Admins can manage all deals" ON public.last_minute_deals
    FOR ALL
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );
