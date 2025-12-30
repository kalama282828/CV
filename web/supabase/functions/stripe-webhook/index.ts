// Supabase Edge Function: stripe-webhook
// Deploy with: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe keys from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No stripe-signature header');
      return new Response(
        JSON.stringify({ error: 'No signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      // Use constructEventAsync for Deno environment
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      console.error('Signature:', signature?.substring(0, 50) + '...');
      console.error('Body length:', body.length);
      console.error('Secret starts with:', webhookSecret?.substring(0, 10) + '...');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Checkout session completed:', session.id);
        
        // Update payment status to completed
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent as string,
          })
          .eq('session_id', session.id);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          
          // If payment record doesn't exist, create it
          if (updateError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('payments')
              .insert({
                session_id: session.id,
                email: session.customer_email || session.metadata?.userEmail || 'unknown',
                amount: session.amount_total || 0,
                currency: session.currency || 'try',
                user_id: session.metadata?.userId || null,
                status: 'completed',
                completed_at: new Date().toISOString(),
                stripe_payment_intent: session.payment_intent as string,
                metadata: {
                  stripe_session_id: session.id,
                  customer_email: session.customer_email,
                },
              });
            
            if (insertError) {
              console.error('Error inserting payment record:', insertError);
            }
          }
        }
        
        // Also update user's has_purchased flag if user_id exists
        if (session.metadata?.userId) {
          await supabase
            .from('profiles')
            .update({ has_purchased: true })
            .eq('id', session.metadata.userId);
        }
        
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Checkout session expired:', session.id);
        
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('session_id', session.id);
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('Payment failed:', paymentIntent.id);
        
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent', paymentIntent.id);
        
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        console.log('Charge refunded:', charge.id);
        
        // Update payment status to refunded
        if (charge.payment_intent) {
          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent', charge.payment_intent as string);
        }
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('Subscription event:', event.type, subscription.id);
        
        // Get customer email from Stripe
        let customerEmail = '';
        let userId = subscription.metadata?.userId || null;
        
        if (subscription.customer) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer && !customer.deleted) {
              customerEmail = (customer as Stripe.Customer).email || '';
            }
          } catch (e) {
            console.error('Error fetching customer:', e);
          }
        }
        
        // Get plan info from subscription items
        const item = subscription.items.data[0];
        const priceId = item?.price?.id || '';
        const amount = item?.price?.unit_amount || 0;
        const interval = item?.price?.recurring?.interval || 'month';
        
        // Determine plan type from metadata or price
        let plan: 'pro' | 'business' = 'pro';
        if (subscription.metadata?.plan === 'business' || priceId.includes('business')) {
          plan = 'business';
        }
        
        // Map Stripe status to our status
        let status: 'active' | 'cancelled' | 'expired' | 'pending' = 'pending';
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          status = 'active';
        } else if (subscription.status === 'canceled') {
          status = 'cancelled';
        } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          status = 'expired';
        }
        
        // Check if subscription already exists
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();
        
        if (existingSub) {
          // Update existing subscription
          await supabase
            .from('subscriptions')
            .update({
              status,
              auto_renew: !subscription.cancel_at_period_end,
              end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        } else {
          // Find user by email if userId not in metadata
          if (!userId && customerEmail) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail)
              .maybeSingle();
            
            if (profile) {
              userId = profile.id;
            }
          }
          
          // Create new subscription record
          if (userId) {
            await supabase
              .from('subscriptions')
              .insert({
                user_id: userId,
                plan,
                billing_cycle: interval === 'year' ? 'yearly' : 'monthly',
                amount: amount / 100, // Convert from cents to TL
                status,
                start_date: new Date(subscription.current_period_start * 1000).toISOString(),
                end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                auto_renew: !subscription.cancel_at_period_end,
                stripe_subscription_id: subscription.id,
              });
            
            // Update user's plan
            await supabase
              .from('profiles')
              .update({ plan, has_purchased: true })
              .eq('id', userId);
          }
        }
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('Subscription deleted:', subscription.id);
        
        // Update subscription status to cancelled
        const { data: subData } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
          .select('user_id')
          .maybeSingle();
        
        // Downgrade user to free plan
        if (subData?.user_id) {
          await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', subData.user_id);
        }
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
