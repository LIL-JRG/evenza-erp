import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe env vars missing' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-11-20' })

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const status = sub.status
        const priceId = sub.items?.data?.[0]?.price?.id || null
        const current_period_start = new Date((sub.trial_start || sub.current_period_start) * 1000).toISOString()
        const current_period_end = new Date((sub.trial_end || sub.current_period_end) * 1000).toISOString()

        let userId: string | null = null

        const { data: existing } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .limit(1)
          .maybeSingle()

        userId = existing?.user_id || null

        if (!userId) {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
          const email = customer.email || undefined
          if (email) {
            const { data: userRow } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('email', email)
              .limit(1)
              .maybeSingle()
            userId = userRow?.id || null
          }
        }

        if (!userId) {
          // We couldn't associate the subscription yet; acknowledge and retry later
          return NextResponse.json({ ok: true })
        }

        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId,
            status,
            current_period_start,
            current_period_end,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const { data: existing } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .limit(1)
          .maybeSingle()

        const userId = existing?.user_id
        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        // Try to attach stripe_customer_id to an existing subscription row (or create one)
        let userId: string | null = null

        const email = session.customer_details?.email || session.customer_email || undefined
        if (email) {
          const { data: userRow } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1)
            .maybeSingle()
          userId = userRow?.id || null
        }

        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: (session.subscription as string) || null,
              stripe_price_id: null,
              status: 'created',
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
        }
        break
      }

      default:
        // Ignore other events
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
