import { createClient } from '@/lib/supabase/server';
import AddToPlanButton from './components/AddToPlanButton';

export default async function MarketplacePage() {
    const supabase = await createClient();

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('type');

    const { data: deals } = await supabase
        .from('last_minute_deals')
        .select('*, services(*)')
        .gt('ends_at', new Date().toISOString());

    const categories = [
        { name: 'Hoteles', type: 'hotel', icon: '🏨' },
        { name: 'Tours', type: 'tour', icon: '⛵' },
        { name: 'Traslados', type: 'transfer', icon: '🚐' },
        { name: 'Yates', type: 'yacht', icon: '🛥️' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
            {/* Hero / Promo Section */}
            <section className="bg-indigo-900 text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative">
                <div className="z-10 space-y-4 max-w-lg">
                    <span className="bg-orange-500 text-white text-xs font-black px-2 py-1 rounded overflow-hidden">MEMBRESÍAS CANCÚN</span>
                    <h2 className="text-4xl font-black leading-tight">Tu viaje de ensueño al mejor precio garantizado.</h2>
                    <p className="text-indigo-200">Ahorra hasta un 60% en hoteles exclusivos, tours privados y traslados de lujo.</p>
                </div>
                <div className="mt-8 md:mt-0 opacity-20 text-9xl">🌴</div>
            </section>

            {/* Categorías */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <button key={cat.type} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center group">
                        <span className="text-4xl group-hover:scale-110 transition-transform block mb-2">{cat.icon}</span>
                        <span className="font-bold text-gray-800">{cat.name}</span>
                    </button>
                ))}
            </section>

            {/* Ofertas de Último Minuto */}
            {deals && deals.length > 0 && (
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Semanas de Último Minuto ⚡</h3>
                        <a href="/marketplace/deals" className="text-indigo-600 font-bold hover:underline text-sm uppercase tracking-widest">Ver Todo →</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {deals.map((deal: any) => (
                            <div key={deal.id} className="bg-white rounded-2xl border-2 border-orange-100 shadow-xl overflow-hidden group">
                                <div className="aspect-video bg-gray-200 relative">
                                    <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">¡QUEDAN 3 DÍAS!</div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <h4 className="text-xl font-bold text-gray-900">{deal.services?.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 line-through text-lg font-medium">${deal.services?.base_price}</span>
                                        <span className="text-3xl font-black text-orange-600">${deal.deal_price}</span>
                                    </div>
                                    <button className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200">Reservar Ahora</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Todos los Servicios */}
            <section className="space-y-6">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Explora Beneficios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services?.map((service: any) => (
                        <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
                            <div className="aspect-video bg-gray-200"></div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500">{service.type}</span>
                                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Ahorra {Math.round((1 - service.discount_price / service.base_price) * 100)}%</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 leading-tight mb-1">{service.name}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">{service.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Precio Miembro</p>
                                        <p className="text-xl font-black text-indigo-600">${service.discount_price}</p>
                                    </div>
                                    <AddToPlanButton serviceId={service.id} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {services?.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 italic">No hay servicios disponibles en este momento. Vuelve pronto.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
