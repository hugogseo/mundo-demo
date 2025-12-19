'use client';

import { updatePlanItem } from '@/app/actions/marketplace';
import { useState, useEffect } from 'react';

export default function PlanItemEditor({
    item
}: {
    item: any
}) {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(item.quantity);
    const [startDate, setStartDate] = useState(item.metadata?.start_date || '');
    const [endDate, setEndDate] = useState(item.metadata?.end_date || '');
    const [travelDate, setTravelDate] = useState(item.metadata?.travel_date || '');

    const isHotel = item.services?.type === 'hotel';
    const maxGuests = item.services?.max_guests || 4;

    const calculateDays = () => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };

    const days = isHotel ? calculateDays() : 1;
    const totalPrice = item.services?.discount_price * quantity * days;

    async function handleUpdate(q: number, sDate: string, eDate: string, tDate: string) {
        setLoading(true);
        try {
            await updatePlanItem(item.id, q, {
                ...item.metadata,
                start_date: sDate,
                end_date: eDate,
                travel_date: tDate,
                total_days: isHotel ? calculateDays() : 1
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Info del Servicio */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                        {item.services?.images?.[0] ? (
                            <img src={item.services.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-3xl">
                                {isHotel ? '🏨' : item.services?.type === 'tour' ? '⛵' : '🚐'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-lg leading-tight">{item.services?.name}</p>
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">{item.services?.type}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.services?.description}</p>
                    </div>
                </div>

                {/* Configuración de Reserva */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-6 w-full lg:w-auto">
                    {/* Fechas */}
                    {isHotel ? (
                        <div className="flex gap-2">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1">Entrada</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        handleUpdate(quantity, e.target.value, endDate, travelDate);
                                    }}
                                    className="text-sm border-gray-200 rounded-xl p-2 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1">Salida</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        handleUpdate(quantity, startDate, e.target.value, travelDate);
                                    }}
                                    className="text-sm border-gray-200 rounded-xl p-2 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col min-w-[140px]">
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1">Fecha de Viaje</label>
                            <input
                                type="date"
                                value={travelDate}
                                onChange={(e) => {
                                    setTravelDate(e.target.value);
                                    handleUpdate(quantity, startDate, endDate, e.target.value);
                                }}
                                className="text-sm border-gray-200 rounded-xl p-2 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    )}

                    {/* Pasajeros */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-gray-400 uppercase mb-1">Pasajeros (Máx {maxGuests})</label>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1">
                            <button
                                onClick={() => {
                                    const q = Math.max(1, quantity - 1);
                                    setQuantity(q);
                                    handleUpdate(q, startDate, endDate, travelDate);
                                }}
                                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 font-bold text-indigo-600"
                            >-</button>
                            <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
                            <button
                                onClick={() => {
                                    const q = Math.min(maxGuests, quantity + 1);
                                    setQuantity(q);
                                    handleUpdate(q, startDate, endDate, travelDate);
                                }}
                                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 font-bold text-indigo-600"
                            >+</button>
                        </div>
                    </div>

                    {/* Precio Final Item */}
                    <div className="flex flex-col items-end min-w-[100px] bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50">
                        <label className="text-[10px] font-black text-indigo-400 uppercase mb-1">{isHotel ? `${days} Noches` : 'Total'}</label>
                        <p className="font-black text-indigo-700 text-xl">${totalPrice.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            {loading && (
                <div className="flex items-center gap-2 mt-4 text-[10px] text-indigo-400 font-bold uppercase animate-pulse">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    Sincronizando cambios...
                </div>
            )}
        </div>
    );
}
