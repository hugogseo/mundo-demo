import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Get some stats with safety
    let servicesCount = 0;
    let dealsCount = 0;
    let bookingsCount = 0;
    let usersCount = 0;

    try {
        const { count: sCount } = await supabase.from('services').select('*', { count: 'exact', head: true });
        const { count: dCount } = await supabase.from('last_minute_deals').select('*', { count: 'exact', head: true });
        const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        servicesCount = sCount || 0;
        dealsCount = dCount || 0;
        bookingsCount = bCount || 0;
        usersCount = uCount || 0;
    } catch (e) {
        console.error('Error fetching admin stats. Tables might not exist yet.');
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tight">Centro de Control Admin 🕹️</h1>
                    <p className="text-gray-500 font-medium">Panel Maestro de Cancún Vacation Platform</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/admin/services" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">+ Nuevo Hotel/Tour</Link>
                    <Link href="/admin/users" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-gray-800 transition-all shadow-lg shadow-gray-100">Ver Usuarios</Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:border-indigo-300 transition-colors group">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Servicios</p>
                        <span className="text-2xl group-hover:scale-110 transition-transform">🏨</span>
                    </div>
                    <p className="text-4xl font-black text-indigo-600 mt-2">{servicesCount || 0}</p>
                    <Link href="/admin/services" className="text-[10px] font-bold text-indigo-400 uppercase mt-4 block hover:text-indigo-600">Gestionar Inventario →</Link>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:border-orange-300 transition-colors group">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ofertas Flash</p>
                        <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                    </div>
                    <p className="text-4xl font-black text-orange-500 mt-2">{dealsCount || 0}</p>
                    <Link href="/admin/deals" className="text-[10px] font-bold text-orange-400 uppercase mt-4 block hover:text-orange-600">Ver Ofertas →</Link>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:border-green-300 transition-colors group">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ventas</p>
                        <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
                    </div>
                    <p className="text-4xl font-black text-green-600 mt-2">{bookingsCount || 0}</p>
                    <Link href="/admin/bookings" className="text-[10px] font-bold text-green-400 uppercase mt-4 block hover:text-green-600">Ver Reservas →</Link>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:border-blue-300 transition-colors group">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Usuarios</p>
                        <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
                    </div>
                    <p className="text-4xl font-black text-blue-600 mt-2">{usersCount || 0}</p>
                    <Link href="/admin/users" className="text-[10px] font-bold text-blue-400 uppercase mt-4 block hover:text-blue-600">Gestionar Accesos →</Link>
                </div>
            </div>

            {/* Admin Quick Guides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-24 h-24" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight">Manual de Operaciones</h3>
                    <div className="mt-6 space-y-4">
                        <div className="flex gap-4">
                            <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">1</span>
                            <p className="text-sm text-gray-300">Carga tus **Servicios** (Hoteles, Tours) con fotos reales y precios de membresía.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">2</span>
                            <p className="text-sm text-gray-300">Crea **Ofertas Flash** desde el botón de "Ofertas" para impulsar ventas rápidas.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">3</span>
                            <p className="text-sm text-gray-300">Monitorea las **Reservas** entrantes y contacta a los clientes desde el panel.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 flex flex-col justify-between shadow-lg">
                    <div>
                        <h3 className="text-xl font-black text-indigo-900 italic uppercase">Estado del Sistema</h3>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-indigo-600 font-bold">Base de Datos</span>
                                <span className="bg-green-500 w-2 h-2 rounded-full shadow-lg shadow-green-200"></span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-indigo-600 font-bold">Stripe Webhooks</span>
                                <span className="bg-green-500 w-2 h-2 rounded-full shadow-lg shadow-green-200"></span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-indigo-600 font-bold">Supabase Auth</span>
                                <span className="bg-green-500 w-2 h-2 rounded-full shadow-lg shadow-green-200"></span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-indigo-100 text-[10px] text-center text-indigo-400 font-black uppercase tracking-widest">
                        v1.2.0 - CANCUN VACATION ENGINE
                    </div>
                </div>
            </div>
        </div>
    );
}
