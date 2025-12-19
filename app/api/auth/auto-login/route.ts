import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Solo permitir esto en desarrollo
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 });
    }

    const email = 'hugogseo@gmail.com';
    const supabase = await createAdminClient();

    try {
        // Generar el enlace de login directamente desde el servidor
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: 'http://localhost:3001/dashboard'
            }
        });

        if (error) {
            // Si el usuario no existe, lo creamos primero
            if (error.message.includes('User not found')) {
                await supabase.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: { full_name: 'Hugo Admin' }
                });
                // Reintentar generar link
                const retry = await supabase.auth.admin.generateLink({
                    type: 'magiclink',
                    email: email,
                    options: { redirectTo: 'http://localhost:3001/dashboard' }
                });
                if (retry.error) throw retry.error;

                // Asegurar que sea Admin (Enterprise)
                await supabase
                    .from('profiles')
                    .upsert({
                        id: retry.data.user.id,
                        email: email,
                        membership_tier: 'enterprise',
                        full_name: 'Hugo Admin'
                    } as any);

                return NextResponse.redirect(retry.data.properties.action_link);
            }
            throw error;
        }

        // 3. Asegurar que sea Admin (Enterprise + is_admin si existe)
        try {
            await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: email,
                    membership_tier: 'enterprise',
                    is_admin: true,
                    full_name: 'Hugo Admin'
                } as any);
        } catch (e) {
            // Fallback si la columna is_admin no existe aún en la base de datos
            await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: email,
                    membership_tier: 'enterprise',
                    full_name: 'Hugo Admin'
                } as any);
        }

        // Redirigir directamente al enlace de acción
        return NextResponse.redirect(data.properties.action_link);

    } catch (error: any) {
        return NextResponse.json({
            error: 'Error al auto-loguear',
            details: error.message,
            tip: 'Asegúrate de que hugogseo@gmail.com esté registrado o corre npx supabase start'
        }, { status: 500 });
    }
}
