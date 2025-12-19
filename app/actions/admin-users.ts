import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, tier: string, isAdmin: boolean) {
    const supabase = await createAdminClient();

    const { error } = await (supabase
        .from('profiles') as any)
        .update({
            membership_tier: tier,
            is_admin: isAdmin
        } as any)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function suspendUser(userId: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h'
    });

    if (error) {
        console.error('Error suspending user:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function activateUser(userId: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
    });

    if (error) {
        console.error('Error activating user:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}
