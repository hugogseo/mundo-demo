const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

// Read .env manually to avoid BOM issues if any
const envConfig = dotenv.parse(fs.readFileSync('.env'));

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
);

async function forceAdmin() {
    const email = 'hugogseo@gmail.com';
    console.log(`Buscando usuario: ${email}...`);

    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
        console.error('Usuario no encontrado.');
        return;
    }

    console.log(`Usuario encontrado ID: ${user.id}. Aplicando flag is_admin...`);

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            is_admin: true,
            membership_tier: 'enterprise'
        })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error actualizando perfil:', updateError);
        // Si el error es que la columna no existe, intentaremos crearla si pudiéramos, 
        // pero aquí no tenemos fácil acceso a ALTER TABLE vía JS sin RPC.
    } else {
        console.log('¡Éxito! El usuario ahora es Admin en la base de datos.');
    }
}

forceAdmin();
