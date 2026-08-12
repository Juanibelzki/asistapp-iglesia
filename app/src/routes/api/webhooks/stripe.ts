import { createServerFn } from '@tanstack/react-start'
import stripe from '../../../lib/stripe'
import { readRawBody } from 'h3'

export const POST = createServerFn({ method: 'POST' }).handler(async ({ request }) => {
  const sig = request.headers.get('stripe-signature')
  const body = await readRawBody(request)
  
  if (!sig || !body) return new Response('Bad Request', { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Handle events (checkout.session.completed, customer.subscription.updated/deleted)
  // Logic to update Supabase organization status would go here

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
