-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update specific user to be admin (Hugogseo)
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'hugogseo@gmail.com';

-- Logic for User Management and RLS can be added here or in future migrations
-- For now, let's ensure admins can manage all services
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
