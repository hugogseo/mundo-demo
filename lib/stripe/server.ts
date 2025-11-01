/**
 * Stripe Server-side Client
 * Use this in Server Components, Route Handlers, and Server Actions
 */

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  appInfo: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Boilerplate',
    version: '0.1.0',
  },
});
