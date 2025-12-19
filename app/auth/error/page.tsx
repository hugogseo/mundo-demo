'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Authentication Error
        </h2>
        {message && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {message}
            </p>
          </div>
        )}
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          There was a problem signing you in. This could happen if:
        </p>
        <ul className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
          <li>- The magic link has expired (links are valid for 60 minutes)</li>
          <li>- The link has already been used</li>
          <li>- Your browser or email provider blocked the redirect</li>
        </ul>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/auth/login"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Try Again
        </Link>
        <Link
          href="/"
          className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
