'use client';

import { FormEvent, useState, useTransition } from 'react';
import Link from 'next/link';
import { signInWithMagicLink } from '@/app/actions/auth';

export default function LoginPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signInWithMagicLink(form);
      if ('error' in result) {
        setError(result.error ?? 'Unknown error occurred');
        setSuccess(false);
      } else {
        setError(null);
        setSuccess(true);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We use passwordless magic links. Enter your email to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-base text-gray-900 dark:text-gray-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>

          <input type="hidden" name="redirect" value="/dashboard" />

          <button
            type="submit"
            disabled={pending}
            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-60"
          >
            {pending ? 'Sending magic link…' : 'Email me a magic link'}
          </button>
        </form>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Magic link sent! Check your inbox to continue.
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Having trouble? <Link href="/auth/error" className="text-blue-600 hover:underline">View troubleshooting tips</Link>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
