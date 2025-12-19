import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('membership_tier')
        .eq('id', user.id)
        .single();

    // Protect the marketplace - members only
    if (!profile || profile.membership_tier === 'free') {
        redirect('/pricing');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-black text-indigo-600 tracking-tight">CANCUN<span className="text-orange-500">MEMBERS</span></h1>
                    <nav className="hidden md:flex items-center gap-6 ml-8">
                        <a href="/marketplace" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Catálogo</a>
                        <a href="/marketplace/deals" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Último Minuto</a>
                        <a href="/marketplace/builder" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Mi Plan</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Miembro {profile.membership_tier}</div>
                    <a href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-800">Volver a Cuenta</a>
                </div>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
}
