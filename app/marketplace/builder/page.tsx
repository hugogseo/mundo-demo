import { createClient } from '@/lib/supabase/server';
import { removeFromPlan } from '@/app/actions/marketplace';
import PlanItemEditor from '../components/PlanItemEditor';
import ConfirmBookingButton from '../components/ConfirmBookingButton';

export default async function PlanBuilderPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: plan } = await supabase
        .from('plans')
        .select('*, plan_items(*, services(*))')
        .eq('user_id', user?.id || '')
        .eq('is_booked', false)
        .single();

    const items = (plan as any)?.plan_items || [];
    const subtotal = items.reduce((acc: number, item: any) => {
        const isHotel = item.services?.type === 'hotel';
        const days = (isHotel && item.metadata?.total_days) ? item.metadata.total_days : 1;
        return acc + (item.services?.discount_price || 0) * item.quantity * days;
    }, 0);

    return (
        <div className="max-w-4xl mx-auto px-8 py-10 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">Arma tu Escapada Perfecta 🏝️</h1>
                <p className="text-gray-500 text-lg">Selecciona los servicios que deseas y nosotros nos encargamos del resto.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Tu Itinerario</h2>

                        {items.length > 0 ? (
                            <div className="space-y-4">
                                {items.map((item: any) => (
                                    <div key={item.id} className="relative group">
                                        <PlanItemEditor item={item} />
                                        <form
                                            action={async () => { 'use server'; await removeFromPlan(item.id); }}
                                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <button className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                                ×
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-4">
                                <div className="text-6xl grayscale opacity-20">🛒</div>
                                <p className="text-gray-400 font-medium">Tu itinerario está vacío.<br />Agrega hoteles o tours desde el catálogo.</p>
                                <a href="/marketplace" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase transition hover:bg-indigo-700 shadow-lg shadow-indigo-100">Explorar Destinos</a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl space-y-6 sticky top-24">
                        <h2 className="text-xl font-bold">Resumen de Pago</h2>
                        <div className="space-y-3 pt-4 border-t border-indigo-800/50">
                            <div className="flex justify-between text-indigo-300">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-indigo-300">
                                <span>Impuestos (16%)</span>
                                <span>${(subtotal * 0.16).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-4">
                                <span>Total</span>
                                <span>${(subtotal * 1.16).toFixed(2)}</span>
                            </div>
                        </div>
                        <ConfirmBookingButton />
                        <p className="text-[10px] text-center text-indigo-400 uppercase font-black">Pagos Seguros vía Stripe</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
