import { supabase } from './supabase';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  plan: 'free' | 'pro' | 'business';
  has_purchased: boolean;
  cv_count: number;
  status: 'active' | 'inactive' | 'banned';
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  last_login: string | null;
  updated_at: string;
}

export interface CV {
  id: string;
  user_id: string;
  title: string;
  template: string;
  language: string;
  personal_info: Record<string, unknown>;
  photo: string | null;
  summary: string | null;
  work_experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  additional_info: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'pro' | 'business';
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: { name: string | null; email: string } | null;
}

export interface Payment {
  id: string;
  user_id: string | null;
  subscription_id: string | null;
  type: 'subscription' | 'one-time';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | null;
  stripe_payment_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: Profile;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  social_links: Record<string, string>;
  footer_text: string;
  maintenance_mode: boolean;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image: string | null;
  hero_button_text: string | null;
  hero_secondary_button_text: string | null;
  hero_trust_text: string | null;
  features_title: string | null;
  features_subtitle: string | null;
  feature1_title: string | null;
  feature1_description: string | null;
  feature2_title: string | null;
  feature2_description: string | null;
  feature3_title: string | null;
  feature3_description: string | null;
  how_it_works_title: string | null;
  how_it_works_subtitle: string | null;
  step1_title: string | null;
  step1_description: string | null;
  step2_title: string | null;
  step2_description: string | null;
  step3_title: string | null;
  step3_description: string | null;
  testimonials_title: string | null;
  testimonials_subtitle: string | null;
  cta_title: string | null;
  cta_subtitle: string | null;
  cta_button_text: string | null;
  nav_features: string | null;
  nav_pricing: string | null;
  nav_about: string | null;
  nav_login: string | null;
  nav_get_started: string | null;
  footer_product_title: string | null;
  footer_product_links: { text: string; url: string }[];
  footer_company_title: string | null;
  footer_company_links: { text: string; url: string }[];
  // Fiyat alanları
  one_time_price: number | null;
  pro_monthly_price: number | null;
  pro_yearly_price: number | null;
  business_monthly_price: number | null;
  business_yearly_price: number | null;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  preview_url: string | null;
  is_active: boolean;
  is_premium: boolean;
  usage_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// PROFILES SERVICE
// =====================================================

export const profilesService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data: data as Profile | null, error };
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data: data as Profile | null, error };
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as Profile[] | null, error };
  },

  async updateLastLogin(userId: string) {
    return this.updateProfile(userId, { last_login: new Date().toISOString() });
  },
};

// =====================================================
// CVS SERVICE
// =====================================================

export const cvsService = {
  async getUserCVs(userId: string) {
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    return { data: data as CV[] | null, error };
  },

  async getCV(cvId: string) {
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .single();
    return { data: data as CV | null, error };
  },

  async createCV(userId: string, cvData: Partial<CV>) {
    const { data, error } = await supabase
      .from('cvs')
      .insert({ user_id: userId, ...cvData })
      .select()
      .single();
    return { data: data as CV | null, error };
  },

  async updateCV(cvId: string, updates: Partial<CV>) {
    const { data, error } = await supabase
      .from('cvs')
      .update(updates)
      .eq('id', cvId)
      .select()
      .single();
    return { data: data as CV | null, error };
  },

  async deleteCV(cvId: string) {
    const { error } = await supabase
      .from('cvs')
      .update({ is_active: false })
      .eq('id', cvId);
    return { error };
  },

  async getAllCVs() {
    const { data, error } = await supabase
      .from('cvs')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false });
    return { data, error };
  },
};

// =====================================================
// SUBSCRIPTIONS SERVICE
// =====================================================

export const subscriptionsService = {
  async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return { data: data as Subscription | null, error };
  },

  async getAllSubscriptions() {
    // Önce subscriptions tablosundan çek
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Ayrıca profiles tablosundan pro/business planı olanları çek
    const { data: paidProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('plan', ['pro', 'business'])
      .order('created_at', { ascending: false });
    
    if (subError && profileError) {
      return { data: null, error: subError };
    }

    // Subscriptions tablosundaki user_id'leri topla
    const existingSubUserIds = new Set((subscriptions || []).map(s => s.user_id));
    
    // Profiles'dan gelen verileri subscription formatına çevir
    const profileSubscriptions: Subscription[] = (paidProfiles || [])
      .filter(p => !existingSubUserIds.has(p.id)) // Zaten subscriptions'da olanları atla
      .map(profile => ({
        id: `profile-${profile.id}`,
        user_id: profile.id,
        plan: profile.plan as 'pro' | 'business',
        billing_cycle: 'monthly' as const,
        amount: profile.plan === 'pro' ? 99.99 : 249.99,
        status: 'active' as const,
        start_date: profile.created_at,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: true,
        stripe_subscription_id: null,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        profiles: { name: profile.name, email: profile.email },
      }));

    // Subscriptions tablosundaki verilere profile bilgilerini ekle
    const userIds = [...new Set((subscriptions || []).map(s => s.user_id))];
    let profilesMap: Record<string, { name: string | null; email: string }> = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);
      
      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          acc[p.id] = { name: p.name, email: p.email };
          return acc;
        }, {} as Record<string, { name: string | null; email: string }>);
      }
    }

    const subscriptionsWithProfiles = (subscriptions || []).map(sub => ({
      ...sub,
      profiles: profilesMap[sub.user_id] || null,
    }));

    // İki kaynağı birleştir
    const allSubscriptions = [...subscriptionsWithProfiles, ...profileSubscriptions];

    return { data: allSubscriptions as Subscription[], error: null };
  },

  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    return { data: data as Subscription | null, error };
  },

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();
    return { data: data as Subscription | null, error };
  },

  async cancelSubscription(subscriptionId: string) {
    return this.updateSubscription(subscriptionId, { status: 'cancelled', auto_renew: false });
  },
};

// =====================================================
// PAYMENTS SERVICE
// =====================================================

export const paymentsService = {
  async getUserPayments(userId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data as Payment[] | null, error };
  },

  async getAllPayments() {
    // payments tablosundan tüm ödemeleri çek
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !payments) {
      return { data: null, error };
    }

    // User ID'leri topla ve profiles'dan bilgileri çek
    const userIds = [...new Set(payments.filter(p => p.user_id).map(p => p.user_id))];
    
    let profilesMap: Record<string, { name: string | null; email: string }> = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);
      
      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          acc[p.id] = { name: p.name, email: p.email };
          return acc;
        }, {} as Record<string, { name: string | null; email: string }>);
      }
    }

    // Payments'a profile bilgilerini ekle ve formatla
    const paymentsWithProfiles = payments.map(payment => {
      const profile = payment.user_id && profilesMap[payment.user_id];
      return {
        id: payment.id,
        user_id: payment.user_id,
        subscription_id: null,
        type: (payment.metadata as Record<string, unknown>)?.type === 'subscription' ? 'subscription' : 'one-time' as 'subscription' | 'one-time',
        amount: payment.amount / 100, // Kuruştan TL'ye çevir
        currency: payment.currency || 'try',
        status: payment.status,
        method: 'stripe' as const,
        stripe_payment_id: payment.stripe_payment_intent,
        description: null,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        profiles: profile || { name: null, email: payment.email },
      };
    });

    return { data: paymentsWithProfiles as Payment[], error: null };
  },

  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();
    return { data: data as Payment | null, error };
  },

  async updatePayment(paymentId: string, updates: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();
    return { data: data as Payment | null, error };
  },
};

// =====================================================
// SITE SETTINGS SERVICE
// =====================================================

export const siteSettingsService = {
  async getSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    return { data: data as SiteSettings | null, error };
  },

  async updateSettings(updates: Partial<SiteSettings>) {
    // Önce mevcut kaydı kontrol et
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (existing) {
      // Güncelle
      const { data, error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', 1)
        .select()
        .maybeSingle();
      return { data: data as SiteSettings | null, error };
    } else {
      // Yeni kayıt oluştur
      const { data, error } = await supabase
        .from('site_settings')
        .insert({ id: 1, ...updates })
        .select()
        .maybeSingle();
      return { data: data as SiteSettings | null, error };
    }
  },
};

// =====================================================
// PRICING PLANS SERVICE
// =====================================================

export const pricingPlansService = {
  async getAllPlans() {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return { data: data as PricingPlan[] | null, error };
  },

  async getPlan(planId: string) {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();
    return { data: data as PricingPlan | null, error };
  },

  async updatePlan(planId: string, updates: Partial<PricingPlan>) {
    const { data, error } = await supabase
      .from('pricing_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
    return { data: data as PricingPlan | null, error };
  },

  async createPlan(planData: Omit<PricingPlan, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pricing_plans')
      .insert(planData)
      .select()
      .single();
    return { data: data as PricingPlan | null, error };
  },
};

// =====================================================
// TEMPLATES SERVICE
// =====================================================

export const templatesService = {
  async getAllTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('sort_order', { ascending: true });
    return { data: data as Template[] | null, error };
  },

  async getActiveTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return { data: data as Template[] | null, error };
  },

  async updateTemplate(templateId: string, updates: Partial<Template>) {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();
    return { data: data as Template | null, error };
  },

  async incrementUsage(templateId: string) {
    const { error } = await supabase.rpc('increment_template_usage', { template_id: templateId });
    return { error };
  },
};

// =====================================================
// STRIPE PAYMENTS SERVICE
// =====================================================

export interface StripePayment {
  id: string;
  user_id: string | null;
  session_id: string;
  stripe_payment_intent: string | null;
  email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export const stripePaymentsService = {
  /**
   * Create a new payment record when checkout session is created
   */
  async createPaymentRecord(payment: {
    session_id: string;
    email: string;
    amount: number;
    currency?: string;
    user_id?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        session_id: payment.session_id,
        email: payment.email,
        amount: payment.amount,
        currency: payment.currency || 'try',
        user_id: payment.user_id || null,
        metadata: payment.metadata || {},
        status: 'pending',
      })
      .select()
      .single();
    return { data: data as StripePayment | null, error };
  },

  /**
   * Update payment status (called by webhook)
   */
  async updatePaymentStatus(
    sessionId: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    stripePaymentIntent?: string
  ) {
    const updates: Partial<StripePayment> = { status };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    if (stripePaymentIntent) {
      updates.stripe_payment_intent = stripePaymentIntent;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('session_id', sessionId)
      .select()
      .single();
    return { data: data as StripePayment | null, error };
  },

  /**
   * Get payment by session ID
   */
  async getPaymentBySessionId(sessionId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    return { data: data as StripePayment | null, error };
  },

  /**
   * Get payment by email
   */
  async getPaymentByEmail(email: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('email', email)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return { data: data as StripePayment | null, error };
  },

  /**
   * Check if user has completed payment (by email)
   */
  async checkPaymentStatus(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('payments')
      .select('id')
      .eq('email', email)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
    
    return data !== null;
  },

  /**
   * Check if user has completed payment (by user ID)
   */
  async checkPaymentStatusByUserId(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
    
    return data !== null;
  },

  /**
   * Get all payments for admin dashboard
   */
  async getAllStripePayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as StripePayment[] | null, error };
  },
};

// =====================================================
// DASHBOARD STATS SERVICE
// =====================================================

export const dashboardService = {
  async getStats() {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total revenue
    const { data: revenueData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');
    const totalRevenue = revenueData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: monthlyData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());
    const monthlyRevenue = monthlyData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newUsersToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // New users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: newUsersThisWeek } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    return {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalRevenue,
      monthlyRevenue,
      newUsersToday: newUsersToday || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      conversionRate: totalUsers ? ((activeSubscriptions || 0) / totalUsers * 100).toFixed(1) : 0,
      churnRate: 0, // Would need historical data to calculate
    };
  },
};
