import { createAdminClient } from '@/lib/supabase/server';
import { updateUserRole, suspendUser, activateUser } from '@/app/actions/admin-users';

export default async function AdminUsersPage() {
    const supabase = await createAdminClient();

    // Fetch all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch auth users to see if they are banned
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (error || authError) {
        return <div className="p-8 text-red-600">Error cargando usuarios: {error?.message || authError?.message}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-indigo-500 pb-2">Gestión de Usuarios</h1>
                <p className="text-gray-500">{profiles?.length} usuarios registrados</p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Membresía</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {profiles?.map((profile: any) => {
                            const authUser = users.find(u => u.id === profile.id) as any;
                            const isBanned = !!authUser?.banned_until && new Date(authUser.banned_until) > new Date();

                            return (
                                <tr key={profile.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                                {profile.full_name?.charAt(0) || profile.email?.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{profile.full_name || 'Sin nombre'}</div>
                                                <div className="text-sm text-gray-500">{profile.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <form action={async (formData) => {
                                            'use server';
                                            const tier = formData.get('tier') as string;
                                            await updateUserRole(profile.id, tier, profile.is_admin);
                                        }} className="flex items-center space-x-2">
                                            <select
                                                name="tier"
                                                defaultValue={profile.membership_tier}
                                                className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                            <button type="submit" className="text-xs text-indigo-600 hover:text-indigo-900 font-semibold">Guardar</button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <form action={async (formData) => {
                                            'use server';
                                            const isAdmin = formData.get('isAdmin') === 'on';
                                            await updateUserRole(profile.id, profile.membership_tier, isAdmin);
                                        }} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="isAdmin"
                                                defaultChecked={profile.is_admin}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <button type="submit" className="text-xs text-indigo-600 hover:text-indigo-900 font-semibold">Ok</button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {isBanned ? 'Suspendido' : 'Activo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {isBanned ? (
                                            <form action={async () => {
                                                'use server';
                                                await activateUser(profile.id);
                                            }}>
                                                <button className="text-green-600 hover:text-green-900">Activar</button>
                                            </form>
                                        ) : (
                                            <form action={async () => {
                                                'use server';
                                                await suspendUser(profile.id);
                                            }}>
                                                <button className="text-red-600 hover:text-red-900">Suspender</button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-amber-700">
                            <strong>Nota de Seguridad:</strong> Cambiar el nivel de membresía afecta el acceso al Marketplace.
                            El nivel "Enterprise" es el recomendado para otros administradores, pero asegúrate de marcar también el check de "Admin".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
