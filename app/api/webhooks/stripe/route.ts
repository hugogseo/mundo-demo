import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

function getTierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
  if (
    priceId === STRIPE_CONFIG.prices.pro.monthly ||
    priceId === STRIPE_CONFIG.prices.pro.yearly
  ) {
    return 'pro';
  }
  if (
    priceId === STRIPE_CONFIG.prices.enterprise.monthly ||
    priceId === STRIPE_CONFIG.prices.enterprise.yearly
  ) {
    return 'enterprise';
  }
  return 'free';
}

function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status,
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' {
  const statusMap: Record<Stripe.Subscription.Status, any> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    past_due: 'past_due',
    trialing: 'trialing',
    unpaid: 'unpaid',
    paused: 'canceled',
  };
  return statusMap[stripeStatus] || 'canceled';
}

function safeTimestampToISO(timestamp: number | null | undefined): string | null {
  if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp)) {
    return null;
  }
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error converting timestamp:', timestamp, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No stripe-signature header found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Idempotency: Check if event was already processed
    const { data: existingEvent } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('id', event.id)
      .maybeSingle();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, skipped: true });
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start?: number | null;
          current_period_end?: number | null;
          trial_start?: number | null;
          trial_end?: number | null;
        };
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const productId = subscription.items.data[0]?.price.product as string;
        const tier = getTierFromPriceId(priceId);
        const effectiveTier = subscription.status === 'canceled' ? 'free' : tier;

        const { error } = await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          stripe_product_id: productId,
          status: mapSubscriptionStatus(subscription.status),
          membership_tier: effectiveTier,
          current_period_start: safeTimestampToISO(subscription.current_period_start),
          current_period_end: safeTimestampToISO(subscription.current_period_end),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: safeTimestampToISO(subscription.canceled_at),
          trial_start: safeTimestampToISO(subscription.trial_start),
          trial_end: safeTimestampToISO(subscription.trial_end),
        });

        if (error) {
          console.error('Error upserting subscription:', error);
        } else {
          console.log(`Subscription ${subscription.id} upserted for user ${userId}`);

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ membership_tier: effectiveTier })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile membership tier:', profileError);
          }

          revalidatePath('/dashboard');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            membership_tier: 'free',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        } else {
          console.log(`Subscription ${subscription.id} canceled for user ${userId}`);

          await supabaseAdmin
            .from('profiles')
            .update({ membership_tier: 'free' })
            .eq('id', userId);

          revalidatePath('/dashboard');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const subscriptionValue = invoice.subscription;
        const subscriptionId =
          typeof subscriptionValue === 'string'
            ? subscriptionValue
            : subscriptionValue && 'id' in subscriptionValue
              ? subscriptionValue.id
              : undefined;

        if (subscriptionId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { type, plan_id, user_id } = session.metadata || {};

        if (type === 'vacation_booking' && plan_id && user_id) {
          // 1. Mark plan as booked
          await supabaseAdmin
            .from('plans')
            .update({ is_booked: true } as any)
            .eq('id', plan_id);

          // 2. Create booking record
          await supabaseAdmin.from('bookings').insert({
            user_id,
            plan_id,
            total_amount: (session.amount_total || 0) / 100,
            status: 'confirmed',
            stripe_payment_id: session.id
          } as any);

          console.log(`Vacation booking confirmed for plan ${plan_id}`);
          revalidatePath('/marketplace/builder');
          revalidatePath('/admin/bookings');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabaseAdmin
      .from('webhook_events')
      .insert({ id: event.id, type: event.type });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
