import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';
import { getPriceId } from '@/lib/stripe/config';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { tier, period } = body;

    if (!tier || !['pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "enterprise".' },
        { status: 400 },
      );
    }

    if (!period || !['monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid billing period. Must be "monthly" or "yearly".' },
        { status: 400 },
      );
    }

    const priceId = getPriceId(tier as 'pro' | 'enterprise', period as 'monthly' | 'yearly');

    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, membership_tier, stripe_price_id, status')
      .eq('user_id', user.id)
      .maybeSingle() as {
      data: {
        stripe_customer_id: string;
        stripe_subscription_id: string | null;
        membership_tier: string;
        stripe_price_id: string | null;
        status: string;
      } | null;
    };

    let customerId: string;

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id;

      if (existingSubscription.stripe_subscription_id && existingSubscription.status === 'active') {
        const currentPriceId = existingSubscription.stripe_price_id;
        const newPriceId = priceId;

        if (currentPriceId === newPriceId) {
          const billingPortalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${request.nextUrl.origin}/dashboard`,
          });

          return NextResponse.json({
            url: billingPortalSession.url,
            isPortal: true,
          });
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(
            existingSubscription.stripe_subscription_id,
          );

          await stripe.subscriptions.update(existingSubscription.stripe_subscription_id, {
            items: [
              {
                id: subscription.items.data[0].id,
                price: newPriceId,
              },
            ],
            proration_behavior: 'create_prorations',
            metadata: {
              user_id: user.id,
              tier,
              period,
            },
          });

          revalidatePath('/dashboard');

          return NextResponse.json({
            url: `${request.nextUrl.origin}/dashboard?upgraded=true`,
            isUpgrade: true,
          });
        } catch (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
      }
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // @ts-ignore
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'incomplete',
        membership_tier: 'free',
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        tier,
        period,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
