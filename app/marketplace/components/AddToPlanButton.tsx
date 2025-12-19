'use client';

import { addToPlan } from '@/app/actions/marketplace';
import { useState } from 'react';

export default function AddToPlanButton({ serviceId }: { serviceId: string }) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);

    async function handleAdd() {
        setLoading(true);
        try {
            await addToPlan(serviceId);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch (error) {
            alert('Error al añadir al plan. ¿Tienes una membresía activa?');
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all font-bold ${added
                    ? 'bg-green-500 text-white border-green-500'
                    : 'border-gray-200 text-gray-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm'
                }`}
        >
            {loading ? '...' : added ? '✓' : '+'}
        </button>
    );
}
