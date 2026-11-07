import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '../../../lib/stripe';

const PLAN_CATALOG = {
  'seeker-pro': {
    name: 'HireLoop Pro (Job Seeker)',
    amount: 1900,
    priceId: 'price_1UZ56fBipP3qNP05X9F1Gwlq', // User's created stripe price ID
  },
  'seeker-premium': {
    name: 'HireLoop Premium (Job Seeker)',
    amount: 3900,
  },
  'recruiter-growth': {
    name: 'HireLoop Growth (Recruiter)',
    amount: 4900,
  },
  'recruiter-enterprise': {
    name: 'HireLoop Enterprise (Recruiter)',
    amount: 14900,
  },
};

export async function POST(request) {
  try {
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let planId = 'seeker-pro';
    let userEmail = '';

    if (request) {
      try {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          planId = formData.get('planId') || planId;
          userEmail = formData.get('userEmail') || userEmail;
        } else {
          const body = await request.json().catch(() => ({}));
          planId = body.planId || planId;
          userEmail = body.userEmail || userEmail;
        }
      } catch (err) {
        console.warn('Form data read note:', err);
      }
    }

    const planConfig = PLAN_CATALOG[planId] || PLAN_CATALOG['seeker-pro'];

    const lineItem = planConfig.priceId
      ? { price: planConfig.priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planConfig.name,
            },
            unit_amount: planConfig.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        };

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'subscription',
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      customer_email: userEmail || undefined,
      metadata: {
        planId: planId,
        userEmail: userEmail,
      },
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
