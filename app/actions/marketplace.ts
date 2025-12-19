'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addToPlan(serviceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Debes iniciar sesión');

    // Find or create current active plan
    let { data: plan } = await (supabase
        .from('plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_booked', false)
        .single() as any);

    if (!plan) {
        const { data: newPlan, error } = await (supabase
            .from('plans')
            .insert({ user_id: user.id } as any)
            .select('id')
            .single() as any);

        if (error) throw error;
        plan = newPlan;
    }

    if (!plan) throw new Error('No se pudo crear el plan');

    // Add item to plan
    const { error: itemError } = await (supabase
        .from('plan_items')
        .insert({
            plan_id: plan.id,
            service_id: serviceId,
            quantity: 1
        } as any));

    if (itemError) throw itemError;

    revalidatePath('/marketplace');
    revalidatePath('/marketplace/builder');
    return { success: true };
}

export async function removeFromPlan(itemId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('plan_items')
        .delete()
        .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/marketplace/builder');
    return { success: true };
}

export async function updatePlanItem(itemId: string, quantity: number, metadata: any) {
    const supabase = await createClient();
    const { error } = await ((supabase
        .from('plan_items') as any)
        .update({
            quantity,
            metadata
        } as any)
        .eq('id', itemId));

    if (error) throw error;

    revalidatePath('/marketplace/builder');
    return { success: true };
}
