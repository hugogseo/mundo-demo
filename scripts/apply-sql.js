const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applySql() {
    console.log('--- Aplicando SQL de Migración ---');

    // Leer .env
    const envPath = path.resolve(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const getVal = (key) => {
        const match = envContent.match(new RegExp(`${key}=(.*)`));
        return match ? match[1].trim().replace(/^"|"$/g, '') : null;
    };

    const url = getVal('NEXT_PUBLIC_SUPABASE_URL');
    const key = getVal('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
        console.error('No se encontraron las variables en .env');
        return;
    }

    const supabase = createClient(url, key);

    const sql = `
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
        UPDATE public.profiles SET is_admin = TRUE WHERE email = 'hugogseo@gmail.com';
        ALTER TABLE public.services ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE public.services ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 4;
        
        -- Reiniciar políticas de RLS para Admin
        DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;
        CREATE POLICY "Admins can manage all services" ON public.services FOR ALL USING (
            (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
        );

        DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
        CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (
            (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
        );
    `;

    console.log('Intentando aplicar cambios en la base de datos...');

    // Supabase JS no tiene 'sql' directamente. Usamos un truco: 
    // Intentar leer de la tabla 'profiles' para ver si la columna existe.
    const { data, error } = await supabase.from('profiles').select('is_admin').limit(1);

    if (error && error.message.includes('column "is_admin" does not exist')) {
        console.log('La columna "is_admin" no existe. Por favor, corre este SQL en el SQL Editor de Supabase (http://localhost:54323):');
        console.log(sql);
    } else {
        console.log('La columna parece existir o hubo otro error:', error?.message || 'Ninguno');
        // Intentar al menos el UPDATE por si acaso
        const { error: updError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('email', 'hugogseo@gmail.com');

        if (updError) {
            console.error('Error al actualizar email:', updError.message);
        } else {
            console.log('Update de flag Admin completado.');
        }
    }
}

applySql();
