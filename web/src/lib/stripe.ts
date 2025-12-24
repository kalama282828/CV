import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Stripe instance cache
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe publishable key from environment or site settings
 */
export function getStripePublishableKey(): string {
  // First check environment variable
  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (envKey && envKey !== 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY') {
    return envKey;
  }
  return '';
}

/**
 * Initialize Stripe with publishable key
 */
export async function initStripe(): Promise<Stripe | null> {
  const publishableKey = getStripePublishableKey();
  
  if (!publishableKey) {
    console.warn('Stripe publishable key not configured');
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

/**
 * Check if Stripe is in test mode
 */
export function isStripeTestMode(): boolean {
  const key = getStripePublishableKey();
  return key.startsWith('pk_test_');
}

/**
 * Convert price from TRY to kuruş (Stripe uses smallest currency unit)
 */
export function convertToKurus(priceTRY: number): number {
  return Math.round(priceTRY * 100);
}

/**
 * Convert price from kuruş to TRY
 */
export function convertFromKurus(priceKurus: number): number {
  return priceKurus / 100;
}

// =====================================================
// TEK SEFERLİK ÖDEME (One-time payment)
// =====================================================

export interface CheckoutSessionRequest {
  priceAmount: number; // in TRY
  userEmail?: string;
  successUrl: string;
  cancelUrl: string;
  userId?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session via Supabase Edge Function
 */
export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      priceAmount: convertToKurus(request.priceAmount),
      userEmail: request.userEmail,
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
      userId: request.userId,
    },
  });

  if (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return data as CheckoutSessionResponse;
}

/**
 * Start the checkout flow - creates session and redirects
 */
export async function startCheckout(request: CheckoutSessionRequest): Promise<void> {
  const session = await createCheckoutSession(request);
  
  if (session.url) {
    // Direct redirect to Stripe Checkout URL
    window.location.href = session.url;
  } else {
    throw new Error('No checkout URL returned from Stripe');
  }
}

// =====================================================
// AYLIK ABONELİK (Subscription)
// =====================================================

export type SubscriptionPlan = 'pro' | 'business';

export interface SubscriptionCheckoutRequest {
  plan: SubscriptionPlan;
  priceAmount: number; // Monthly price in TRY
  userEmail?: string;
  successUrl: string;
  cancelUrl: string;
  userId?: string;
}

/**
 * Create a Stripe Subscription Checkout Session
 */
export async function createSubscriptionCheckout(
  request: SubscriptionCheckoutRequest
): Promise<CheckoutSessionResponse> {
  const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
    body: {
      plan: request.plan,
      priceAmount: convertToKurus(request.priceAmount),
      userEmail: request.userEmail,
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
      userId: request.userId,
    },
  });

  if (error) {
    console.error('Error creating subscription checkout:', error);
    throw new Error(error.message || 'Failed to create subscription checkout');
  }

  return data as CheckoutSessionResponse;
}

/**
 * Start the subscription checkout flow
 */
export async function startSubscriptionCheckout(request: SubscriptionCheckoutRequest): Promise<void> {
  const session = await createSubscriptionCheckout(request);
  
  if (session.url) {
    window.location.href = session.url;
  } else {
    throw new Error('No checkout URL returned from Stripe');
  }
}
