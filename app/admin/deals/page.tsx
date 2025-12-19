import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function AdminDealsPage() {
    const supabase = await createClient();

    const { data: services } = await supabase.from('services').select('id, name').eq('is_active', true);
    const { data: deals } = await supabase.from('last_minute_deals').select('*, services(name)').order('created_at', { ascending: false });

    async function addDeal(formData: FormData) {
        'use server';
        const supabase = await createClient();
        const service_id = formData.get('service_id') as string;
        const deal_price = parseFloat(formData.get('deal_price') as string);
        const starts_at = formData.get('starts_at') as string;
        const ends_at = formData.get('ends_at') as string;

        const { error } = await supabase.from('last_minute_deals').insert({
            service_id,
            deal_price,
            starts_at,
            ends_at
        });

        if (!error) revalidatePath('/admin/deals');
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Semanas de Último Minuto</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Crear Oferta Flash</h2>
                <form action={addDeal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select name="service_id" className="p-2 border rounded-md" required>
                        <option value="">Seleccionar Servicio</option>
                        {services?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input name="deal_price" type="number" step="0.01" placeholder="Precio Oferta" className="p-2 border rounded-md" required />
                    <input name="starts_at" type="datetime-local" className="p-2 border rounded-md" required />
                    <input name="ends_at" type="datetime-local" className="p-2 border rounded-md" required />
                    <button type="submit" className="bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700 transition-colors font-semibold lg:col-span-4">
                        Publicar Oferta de Último Minuto
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Especial</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {deals?.map((deal: any) => (
                            <tr key={deal.id}>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{deal.services?.name}</td>
                                <td className="px-6 py-4 text-sm text-orange-600 font-bold">${deal.deal_price}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(deal.ends_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {deals?.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-400">No hay ofertas flash programadas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
