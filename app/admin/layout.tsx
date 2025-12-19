import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get current session properly using anon client + cookies
  const supabaseAnon = await createClient();
  const { data: { user } } = await supabaseAnon.auth.getUser();

  if (!user) {
    console.log('AdminLayout [Session]: NO USER FOUND. Redirecting to login.');
    redirect('/auth/login');
  }

  const userEmail = user.email?.toLowerCase();
  console.log(`AdminLayout [Session]: User detected -> ${userEmail}`);

  // 2. Get profile flags using admin client (bypasses RLS)
  const supabaseAdmin = await createAdminClient();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() as any;

  if (profileError) {
    console.error('AdminLayout [DB]: Error fetching profile:', profileError);
  }

  const isMasterAdmin = userEmail === 'hugogseo@gmail.com' || userEmail === 'hugogseo@gmil.com';
  const hasAdminFlag = profile?.is_admin === true || profile?.membership_tier === 'enterprise';

  console.log(`AdminLayout [Auth]: isMaster=${isMasterAdmin}, hasFlag=${hasAdminFlag}, tier=${profile?.membership_tier}`);

  if (!isMasterAdmin && !hasAdminFlag) {
    console.warn(`AdminLayout [Auth]: ACCESS DENIED for ${userEmail}. Bouncing to dashboard.`);
    redirect('/dashboard');
  }

  console.log(`AdminLayout [Auth]: ACCESS GRANTED for ${userEmail}.`);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-72 bg-gray-900 text-white border-r border-indigo-500/20 shadow-2xl flex flex-col">
        <div className="p-8 border-b border-white/5">
          <Link href="/admin" className="block">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white hover:text-indigo-400 transition-colors">
              Cancun Admin <span className="text-indigo-500">v1.2</span>
            </h2>
          </Link>
          <div className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
            Sistema en Línea
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3">
          <a href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all font-bold">
            <span className="text-lg">📊</span> Dashboard
          </a>
          <a href="/admin/services" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all font-bold">
            <span className="text-lg">🏨</span> Servicios
          </a>
          <a href="/admin/deals" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all font-bold">
            <span className="text-lg">⚡</span> Ofertas Flash
          </a>
          <a href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all font-bold">
            <span className="text-lg">💰</span> Reservas
          </a>
          <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all font-bold">
            <span className="text-lg">👥</span> Usuarios
          </a>
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">H</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{profile.email}</p>
              <Link href="/dashboard" className="text-[10px] text-indigo-400 font-bold uppercase hover:text-indigo-300">Volver al Personal Dashboard</Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
