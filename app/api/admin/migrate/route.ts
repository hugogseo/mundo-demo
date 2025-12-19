import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 });
    }

    const supabase = await createAdminClient();

    const sql = `
    -- Add is_admin column to profiles
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

    -- Update specific user to be admin (Hugogseo)
    UPDATE public.profiles SET is_admin = TRUE WHERE email = 'hugogseo@gmail.com';

    -- Logic for User Management and RLS
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
  `;

    try {
        // Note: Supabase JS client doesn't support raw SQL easily unless using a RPC or direct Postgres connection.
        // For local dev, we can try to use the pg client if available, or just use another trick.
        // Since I can't easily run raw SQL from the client without an RPC, 
        // I'll create an RPC in the database via migration if I could, but wait...

        // Most boilerplates have a way to run raw SQL or I can just use the Service Role to bypass RLS 
        // for all my admin operations anyway.

        return NextResponse.json({
            message: 'Por favor, ejecuta el SQL manualmente en http://localhost:54323 (SQL Editor)',
            sql: sql
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
