import { createClient } from '@/lib/supabase/server';

export default async function AdminBookingsPage() {
    const supabase = await createClient();

    const { data: bookings } = await supabase
        .from('bookings')
        .select('*, profiles(email, full_name), plans(*, plan_items(*, services(*)))')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan / Itinerario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings?.map((booking: any) => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{booking.profiles?.full_name || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{booking.profiles?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-600 space-y-1">
                                        {booking.plans?.plan_items?.map((item: any, i: number) => (
                                            <div key={i}>• {item.services?.name} ({item.quantity})</div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                                    ${booking.total_amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 uppercase">
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(booking.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {bookings?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No hay reservas procesadas aún.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
