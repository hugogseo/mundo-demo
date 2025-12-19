'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  PRICING,
  formatPrice,
  calculateYearlySavings,
} from '@/lib/stripe/config';

type BillingPeriod = 'monthly' | 'yearly';
type Tier = 'free' | 'pro' | 'enterprise';

type CheckoutResponse =
  | { url: string; isUpgrade?: boolean; isPortal?: boolean }
  | { error: string };

function PricingContent() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [loadingTier, setLoadingTier] = useState<Exclude<Tier, 'free'> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Boilerplate';

  const handleSubscribe = async (
    tier: Exclude<Tier, 'free'>,
    opts?: { skipConfirm?: boolean },
  ) => {
    setLoadingTier(tier);

    if (!opts?.skipConfirm) {
      const tierName = tier === 'pro' ? 'Pro' : 'Enterprise';
      const price = formatPrice(PRICING[tier].price[billingPeriod]);
      const perText = billingPeriod === 'monthly' ? 'month' : 'year';

      const confirmed = confirm(
        `Subscribe to ${tierName} (${billingPeriod}) for ${price}/${perText}?\n\n` +
        'Click OK to continue to checkout.',
      );

      if (!confirmed) {
        setLoadingTier(null);
        return;
      }
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          period: billingPeriod,
        }),
      });

      const data: CheckoutResponse = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          const returnUrl = `/pricing?tier=${tier}&period=${billingPeriod}&checkout=true`;
          router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
          return;
        }

        throw new Error('Failed to create checkout session');
      }

      if ('url' in data) {
        if (data.isUpgrade) {
          alert('Your subscription has been updated! Redirecting to dashboard...');
        } else if (data.isPortal) {
          alert('Redirecting you to the billing portal to manage your subscription.');
        }

        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setLoadingTier(null);
    }
  };

  useEffect(() => {
    const shouldCheckout = searchParams.get('checkout');
    const tierParam = searchParams.get('tier') as Exclude<Tier, 'free'> | null;
    const periodParam = searchParams.get('period') as BillingPeriod | null;

    if (shouldCheckout === 'true' && tierParam && periodParam) {
      setBillingPeriod(periodParam);
      handleSubscribe(tierParam, { skipConfirm: true })
        .catch(console.error)
        .finally(() => router.replace('/pricing', { scroll: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const renderPrice = (tier: Tier) => {
    if (tier === 'free') {
      return (
        <div className="flex items-baseline mb-6">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
          <span className="ml-2 text-gray-500 dark:text-gray-400">/month</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {formatPrice(PRICING[tier].price[billingPeriod])}
          </span>
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            /{billingPeriod === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        {billingPeriod === 'yearly' && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Save
            {' '}
            {formatPrice(
              calculateYearlySavings({
                monthlyPriceInCents: PRICING[tier].price.monthly,
                yearlyPriceInCents: PRICING[tier].price.yearly,
              }),
            )}
            {' '}annually
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              {appName}
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Choose the plan that's right for you
          </p>

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-4">
              <span
                className={`text-sm font-medium ${billingPeriod === 'monthly'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')
                }
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
                role="switch"
                aria-checked={billingPeriod === 'yearly'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${billingPeriod === 'yearly'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                Yearly
                <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Save 20%
                </span>
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Current selection:{' '}
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'} billing
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {(['free', 'pro', 'enterprise'] as Tier[]).map(tier => (
            <div
              key={tier}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 ${tier === 'pro'
                  ? 'border-blue-500 dark:border-blue-400 relative'
                  : 'border-gray-200 dark:border-gray-700'
                }`}
            >
              {tier === 'pro' && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {PRICING[tier].name}
                </h3>

                {renderPrice(tier)}

                <ul className="space-y-4 mb-8 flex-1">
                  {PRICING[tier].features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier === 'free' ? (
                  <Link
                    href="/auth/login"
                    className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Get Started
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubscribe(tier)}
                    disabled={loadingTier === tier}
                    className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-60"
                  >
                    {loadingTier === tier ? 'Redirecting…' : 'Subscribe'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Everything you need to launch
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>✅ Passwordless authentication with Supabase</li>
              <li>✅ Stripe subscriptions with automatic proration</li>
              <li>✅ Tier management (Free, Pro, Enterprise)</li>
              <li>✅ Secure API routes and webhook handling</li>
              <li>✅ Tailwind CSS + responsive components</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Built for speed
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>⚡️ Next.js App Router + server components</li>
              <li>⚡️ Supabase Auth + Row Level Security</li>
              <li>⚡️ Stripe checkout & billing portal</li>
              <li>⚡️ Automated migrations and CLI scripts</li>
              <li>⚡️ Claude Skills for onboarding & maintenance</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            All plans include a 14-day money-back guarantee. Need help choosing?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading pricing...</div>}>
      <PricingContent />
    </Suspense>
  );
}
