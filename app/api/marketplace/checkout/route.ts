import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch current plan
        const { data: plan } = await (supabase
            .from('plans')
            .select('*, plan_items(*, services(*))')
            .eq('user_id', user.id)
            .eq('is_booked', false)
            .single() as any);

        if (!plan || !plan.plan_items.length) {
            return NextResponse.json({ error: 'No items in plan' }, { status: 400 });
        }

        // 2. Prepare line items
        const lineItems = plan.plan_items.map((item: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.services.name,
                    description: `${item.services.type.toUpperCase()} - Cancun Membership Discount`,
                },
                unit_amount: Math.round(item.services.discount_price * 100),
            },
            quantity: item.quantity,
        }));

        // 3. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: lineItems,
            success_url: `${request.nextUrl.origin}/marketplace?success=true`,
            cancel_url: `${request.nextUrl.origin}/marketplace/builder?canceled=true`,
            metadata: {
                type: 'vacation_booking',
                plan_id: plan.id,
                user_id: user.id
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
