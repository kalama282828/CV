// Supabase Edge Function: create-subscription-checkout
// Deploy with: supabase functions deploy create-subscription-checkout
// Bu fonksiyon Pro/Business aylık abonelik için Stripe Subscription oluşturur

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Stripe'da tanımlı sabit Price ID'leri (Live mode)
const STRIPE_PRICE_IDS = {
  pro: 'price_1SjOALFguK3gL9VbN74aDofF',
  business: 'price_1SjOAvFguK3gL9VbREFzFvac',
};

interface RequestBody {
  plan: 'pro' | 'business';
  priceAmount?: number; // Artık opsiyonel - Stripe'dan fiyat alınacak
  userEmail?: string;
  successUrl: string;
  cancelUrl: string;
  userId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== create-subscription-checkout started ===');
    
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log('STRIPE_SECRET_KEY exists:', !!stripeSecretKey);
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });
    console.log('Stripe initialized');

    // Parse request body
    const body: RequestBody = await req.json();
    const { plan, userEmail, successUrl, cancelUrl, userId } = body;
    console.log('Request body:', { plan, userEmail, successUrl, cancelUrl, userId });

    // Validate required fields
    if (!plan || !['pro', 'business'].includes(plan)) {
      throw new Error('Invalid plan. Must be "pro" or "business"');
    }
    if (!successUrl || !cancelUrl) {
      throw new Error('Success and cancel URLs are required');
    }

    // Validate email if provided
    const validEmail = userEmail && userEmail.includes('@') ? userEmail : undefined;
    console.log('Valid email:', validEmail);

    // Stripe'da tanımlı Price ID'yi al
    const priceId = STRIPE_PRICE_IDS[plan];
    console.log('Using Stripe Price ID:', priceId);

    // Create Stripe Checkout Session for Subscription
    console.log('Creating Stripe subscription checkout session...');
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId, // Stripe'da tanımlı sabit fiyat kullan
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?type=subscription&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        plan,
        userId: userId || '',
        userEmail: validEmail || '',
        type: 'subscription',
      },
      subscription_data: {
        metadata: {
          plan,
          userId: userId || '',
        },
      },
      // İlk ödemenin hemen alınmasını zorla
      payment_method_collection: 'always',
    };

    // Only add customer_email if valid
    if (validEmail) {
      sessionParams.customer_email = validEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Stripe subscription session created:', session.id);

    // Initialize Supabase client to save subscription record
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Create pending subscription record
      console.log('Inserting pending subscription record...');
      const { error: insertError } = await supabase.from('subscriptions').insert({
        user_id: userId || null,
        plan,
        billing_cycle: 'monthly',
        amount: session.amount_total ? session.amount_total / 100 : 0, // Stripe'dan gelen fiyat
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
        auto_renew: true,
        stripe_subscription_id: session.id, // Geçici olarak session ID
      });
      
      if (insertError) {
        console.error('Failed to insert subscription record:', insertError);
      } else {
        console.log('Subscription record inserted successfully');
      }
    }

    // Return session details
    console.log('Returning success response with URL:', session.url);
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('=== ERROR in create-subscription-checkout ===');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
