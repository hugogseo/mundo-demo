'use client';

import { useState } from 'react';

export default function ConfirmBookingButton() {
    const [loading, setLoading] = useState(false);

    async function handleCheckout() {
        setLoading(true);
        try {
            const response = await fetch('/api/marketplace/checkout', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Error al iniciar el checkout');
            }
        } catch (error) {
            alert('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-950"
        >
            {loading ? 'Preparando...' : 'Confirmar Reserva'}
        </button>
    );
}
