import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function AdminServicesPage() {
    const supabase = await createClient();

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

    async function addService(formData: FormData) {
        'use server';
        const supabase = await createClient();
        const name = formData.get('name') as string;
        const type = formData.get('type') as any;
        const base_price = parseFloat(formData.get('base_price') as string);
        const discount_price = parseFloat(formData.get('discount_price') as string);
        const description = formData.get('description') as string;
        const max_guests = parseInt(formData.get('max_guests') as string) || 4;
        const imagesRaw = formData.get('images') as string;
        const images = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(s => s !== "") : [];

        const { error } = await supabase.from('services').insert({
            name,
            type,
            base_price,
            discount_price,
            description,
            max_guests,
            images,
            location: 'Cancun',
        } as any);

        if (!error) revalidatePath('/admin/services');
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-indigo-500 pb-2">Gestión de Servicios</h1>
            </div>

            {/* Formulario rápido para añadir */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-lg font-semibold mb-6 text-indigo-700">Añadir Nuevo Servicio</h2>
                <form action={addService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Servicio</label>
                        <input name="name" placeholder="Ej: Hotel Xcaret Arte" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                        <select name="type" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required>
                            <option value="hotel">🏨 Hotel</option>
                            <option value="tour">🗿 Tour</option>
                            <option value="transfer">🚐 Traslado</option>
                            <option value="yacht">🛥️ Yate</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Máx. Huéspedes</label>
                        <input name="max_guests" type="number" defaultValue="4" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Precio Base (Público)</label>
                        <input name="base_price" type="number" step="0.01" placeholder="99.99" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Precio Membresía</label>
                        <input name="discount_price" type="number" step="0.01" placeholder="79.99" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">URLs de Imágenes (Separadas por coma)</label>
                        <input name="images" placeholder="URL1, URL2..." className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1 md:col-span-2 lg:col-span-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                        <textarea name="description" placeholder="Describe el servicio, exclusividades, etc." className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 outline-none" required />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 active:scale-[0.98]">
                            Crear Servicio y Publicar
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla de servicios */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicio</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacidad</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Membresía</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {(services as any[])?.map((service) => (
                            <tr key={service.id} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-inner">
                                            {service.images?.[0] ? (
                                                <img src={service.images[0]} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300 text-xl font-bold bg-gray-50">
                                                    ?
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{service.name}</div>
                                            <div className="text-xs text-gray-500 truncate w-48">{service.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-600 capitalize">{service.type}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-600">{service.max_guests} pax</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-green-600">${service.discount_price}</div>
                                    <div className="text-xs text-gray-400 line-through">${service.base_price}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold italic">Activo</span>
                                </td>
                            </tr>
                        ))}
                        {(!services || services.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No hay servicios registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
