import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions/auth';
import Link from 'next/link';
import { PRICING, formatPrice } from '@/lib/stripe/config';
import { ManageSubscriptionButton } from './components/ManageSubscriptionButton';
import { SubscriptionNotifications } from './components/SubscriptionNotifications';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Boilerplate';

  if (!user) {
    redirect('/auth/login');
  }

  let { data: profile } = await (supabase
    .from('profiles') as any)
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Auto-elevate Hugo for development convenience
  const isHugoEmail = user.email === 'hugogseo@gmail.com' || user.email === 'hugogseo@gmil.com';
  if (isHugoEmail && (!profile || profile.membership_tier !== 'enterprise' || !profile.is_admin)) {
    const updatedProfile = {
      id: user.id,
      email: user.email,
      membership_tier: 'enterprise',
      is_admin: true
    };

    try {
      await (supabase.from('profiles') as any).upsert(updatedProfile);
      profile = updatedProfile;
    } catch (e) {
      console.error('Error auto-elevating admin:', e);
      // Fallback update for local object even if upsert fails (though it shouldn't)
      if (!profile) profile = updatedProfile;
    }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle() as any;

  const createdAt = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'Never';

  const currentTier = profile?.membership_tier || 'free';
  const tierInfo = PRICING[currentTier as keyof typeof PRICING];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                {appName}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Pricing
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Welcome to your personal dashboard
            </p>
          </div>

          <Suspense fallback={null}>
            <SubscriptionNotifications />
          </Suspense>

          {profile && (profile.is_admin || profile.membership_tier === 'enterprise') && (
            <div className="mb-8 p-6 bg-indigo-900 rounded-3xl shadow-2xl border-4 border-indigo-500/30 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Consola de Administración</h2>
                  <p className="text-indigo-200 mt-2 font-medium">Gestiona hoteles, tours, usuarios y visualiza las reservas del sistema.</p>
                </div>
                <Link
                  href="/admin"
                  prefetch={false}
                  className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase text-sm hover:bg-indigo-50 transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95"
                >
                  Entrar al Panel de Control →
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    User ID
                  </label>
                  <p className="mt-1 text-xs text-gray-900 dark:text-white font-mono">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Account created
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{createdAt}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last sign in
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{lastSignIn}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscription & Billing
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {tierInfo.name} Plan
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your current membership level
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${subscription?.status === 'active' || currentTier === 'free'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : subscription?.status === 'past_due'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}
                  >
                    {subscription?.status ? subscription.status.replace('_', ' ') : 'Active'}
                  </span>
                </div>

                {subscription && subscription.status === 'active' && (
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Billing Period
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {subscription.stripe_price_id?.includes('month') ? 'Monthly' : 'Yearly'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Next Billing Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {subscription.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                          : 'N/A'}
                      </p>
                    </div>
                    {subscription.cancel_at_period_end && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                          Your subscription will be canceled at the end of the billing period.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Features included:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {tierInfo.features.map(feature => (
                      <li key={feature} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  {currentTier === 'free' ? (
                    <Link
                      href="/pricing"
                      className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Upgrade to Pro or Enterprise
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/pricing"
                        className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        {currentTier === 'pro' ? 'Upgrade to Enterprise' : 'View All Plans'}
                      </Link>
                      {subscription?.stripe_customer_id && <ManageSubscriptionButton />}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Account Status
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-blue-900 dark:text-blue-100">
                    Active
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Email Verified
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-green-900 dark:text-green-100">
                    {user.email_confirmed_at ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Member Since
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-purple-900 dark:text-purple-100">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
