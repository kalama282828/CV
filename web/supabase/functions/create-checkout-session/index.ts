// Supabase Edge Function: create-checkout-session
// Deploy with: supabase functions deploy create-checkout-session

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  priceAmount: number; // in kuruş (smallest currency unit)
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
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse request body
    const body: RequestBody = await req.json();
    const { priceAmount, userEmail, successUrl, cancelUrl, userId } = body;

    // Validate required fields
    if (!priceAmount || priceAmount <= 0) {
      throw new Error('Invalid price amount');
    }
    if (!successUrl || !cancelUrl) {
      throw new Error('Success and cancel URLs are required');
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'try',
            product_data: {
              name: 'CV Builder - PDF İndirme',
              description: 'Tek seferlik PDF indirme hakkı',
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId || '',
        userEmail: userEmail || '',
      },
    });

    // Initialize Supabase client to save payment record
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Create payment record with pending status
      await supabase.from('payments').insert({
        session_id: session.id,
        email: userEmail || 'unknown',
        amount: priceAmount,
        currency: 'try',
        user_id: userId || null,
        status: 'pending',
        metadata: {
          stripe_session_id: session.id,
        },
      });
    }

    // Return session details
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
    console.error('Error creating checkout session:', error);
    
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
