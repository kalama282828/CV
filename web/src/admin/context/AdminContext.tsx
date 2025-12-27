import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import {
  profilesService,
  subscriptionsService,
  paymentsService,
  siteSettingsService,
  dashboardService,
  templatesService,
  pricingPlansService,
  type Profile,
  type Subscription,
  type SiteSettings,
  type PricingPlan,
  type Template,
} from '../../lib/database';

// Admin panel için tip tanımları
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  plan: 'free' | 'pro' | 'business';
  hasPurchased: boolean;
  createdAt: string;
  lastLogin: string | null;
  cvCount: number;
  status: 'active' | 'inactive' | 'banned';
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'pro' | 'business';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  stripeSubscriptionId: string | null;
}

export interface AdminPayment {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  type: 'subscription' | 'one-time';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  method: string | null;
  stripePaymentId: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  conversionRate: number;
  churnRate: number;
}

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Loading states
  loading: boolean;
  
  // Users
  users: AdminUser[];
  loadUsers: () => Promise<void>;
  updateUser: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Subscriptions
  subscriptions: AdminSubscription[];
  loadSubscriptions: () => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  
  // Payments
  payments: AdminPayment[];
  loadPayments: () => Promise<void>;
  refundPayment: (id: string) => Promise<void>;
  
  // Site Settings
  siteSettings: SiteSettings | null;
  loadSiteSettings: () => Promise<void>;
  updateSiteSettings: (updates: Partial<SiteSettings>) => Promise<void>;
  
  // Pricing Plans
  pricingPlans: PricingPlan[];
  loadPricingPlans: () => Promise<void>;
  updatePricingPlan: (id: string, updates: Partial<PricingPlan>) => Promise<void>;
  
  // Dashboard
  dashboardStats: DashboardStats;
  loadDashboardStats: () => Promise<void>;
  
  // Templates
  templates: Template[];
  loadTemplates: () => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  
  // Refresh all data
  refreshAll: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const defaultStats: DashboardStats = {
  totalUsers: 0,
  activeSubscriptions: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  newUsersToday: 0,
  newUsersThisWeek: 0,
  conversionRate: 0,
  churnRate: 0,
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Auth kontrolü için
  const [loading, setLoading] = useState(false); // Veri yükleme için
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(defaultStats);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Check Supabase auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // 3 saniye sonra authLoading'i kapat (timeout)
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Auth check timeout');
        setAuthLoading(false);
      }, 3000);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (session?.user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.role === 'admin' || profile?.role === 'super_admin') {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
      
      setAuthLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load all data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Supabase ile giriş yap
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        // Kullanıcının admin olup olmadığını kontrol et
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          setIsAuthenticated(true);
          return true;
        } else {
          // Admin değilse çıkış yap
          await supabase.auth.signOut();
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // =====================================================
  // USERS
  // =====================================================
  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await profilesService.getAllProfiles();
      if (error) throw error;
      
      const adminUsers: AdminUser[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        plan: profile.plan,
        hasPurchased: profile.has_purchased,
        createdAt: profile.created_at.split('T')[0],
        lastLogin: profile.last_login?.split('T')[0] || null,
        cvCount: profile.cv_count,
        status: profile.status,
      }));
      
      setUsers(adminUsers);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  }, []);

  const updateUser = async (id: string, updates: Partial<Profile>) => {
    try {
      const { error } = await profilesService.updateProfile(id, updates);
      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Soft delete - status'u banned yap
      const { error } = await profilesService.updateProfile(id, { status: 'banned' });
      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      throw error;
    }
  };

  // =====================================================
  // SUBSCRIPTIONS
  // =====================================================
  const loadSubscriptions = useCallback(async () => {
    try {
      const { data, error } = await subscriptionsService.getAllSubscriptions();
      if (error) throw error;
      
      const adminSubs: AdminSubscription[] = (data || []).map(sub => ({
        id: sub.id,
        userId: sub.user_id,
        userName: sub.profiles?.name || 'Bilinmiyor',
        userEmail: sub.profiles?.email || 'Bilinmiyor',
        plan: sub.plan,
        billingCycle: sub.billing_cycle,
        amount: sub.amount,
        status: sub.status,
        startDate: sub.start_date.split('T')[0],
        endDate: sub.end_date.split('T')[0],
        autoRenew: sub.auto_renew,
        stripeSubscriptionId: sub.stripe_subscription_id,
      }));
      
      setSubscriptions(adminSubs);
    } catch (error) {
      console.error('Abonelikler yüklenirken hata:', error);
    }
  }, []);

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      const { error } = await subscriptionsService.updateSubscription(id, updates);
      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Abonelik güncellenirken hata:', error);
      throw error;
    }
  };

  const cancelSubscription = async (id: string) => {
    try {
      const { error } = await subscriptionsService.cancelSubscription(id);
      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Abonelik iptal edilirken hata:', error);
      throw error;
    }
  };

  // =====================================================
  // PAYMENTS
  // =====================================================
  const loadPayments = useCallback(async () => {
    try {
      const { data, error } = await paymentsService.getAllPayments();
      if (error) throw error;
      
      const adminPayments: AdminPayment[] = (data || []).map(payment => ({
        id: payment.id,
        userId: payment.user_id,
        userName: payment.profiles?.name || 'Misafir',
        userEmail: payment.profiles?.email || 'Bilinmiyor',
        type: payment.type,
        amount: payment.amount,
        status: payment.status,
        date: payment.created_at.split('T')[0],
        method: payment.method,
        stripePaymentId: payment.stripe_payment_id,
      }));
      
      setPayments(adminPayments);
    } catch (error) {
      console.error('Ödemeler yüklenirken hata:', error);
    }
  }, []);

  const refundPayment = async (id: string) => {
    try {
      const { error } = await paymentsService.updatePayment(id, { status: 'refunded' });
      if (error) throw error;
      await loadPayments();
    } catch (error) {
      console.error('Ödeme iade edilirken hata:', error);
      throw error;
    }
  };

  // =====================================================
  // SITE SETTINGS
  // =====================================================
  const loadSiteSettings = useCallback(async () => {
    try {
      const { data, error } = await siteSettingsService.getSettings();
      if (error) throw error;
      setSiteSettings(data);
    } catch (error) {
      console.error('Site ayarları yüklenirken hata:', error);
    }
  }, []);

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    try {
      const { data, error } = await siteSettingsService.updateSettings(updates);
      if (error) throw error;
      setSiteSettings(data);
    } catch (error) {
      console.error('Site ayarları güncellenirken hata:', error);
      throw error;
    }
  };

  // =====================================================
  // PRICING PLANS
  // =====================================================
  const loadPricingPlans = useCallback(async () => {
    try {
      const { data, error } = await pricingPlansService.getAllPlans();
      if (error) throw error;
      setPricingPlans(data || []);
    } catch (error) {
      console.error('Fiyat planları yüklenirken hata:', error);
    }
  }, []);

  const updatePricingPlan = async (id: string, updates: Partial<PricingPlan>) => {
    try {
      const { error } = await pricingPlansService.updatePlan(id, updates);
      if (error) throw error;
      await loadPricingPlans();
    } catch (error) {
      console.error('Fiyat planı güncellenirken hata:', error);
      throw error;
    }
  };

  // =====================================================
  // DASHBOARD STATS
  // =====================================================
  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await dashboardService.getStats();
      setDashboardStats({
        totalUsers: stats.totalUsers,
        activeSubscriptions: stats.activeSubscriptions,
        totalRevenue: stats.totalRevenue,
        monthlyRevenue: stats.monthlyRevenue,
        newUsersToday: stats.newUsersToday,
        newUsersThisWeek: stats.newUsersThisWeek,
        conversionRate: parseFloat(stats.conversionRate as string) || 0,
        churnRate: stats.churnRate,
      });
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenirken hata:', error);
    }
  }, []);

  // =====================================================
  // TEMPLATES
  // =====================================================
  const loadTemplates = useCallback(async () => {
    try {
      const { data, error } = await templatesService.getAllTemplates();
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Şablonlar yüklenirken hata:', error);
    }
  }, []);

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const { error } = await templatesService.updateTemplate(id, updates);
      if (error) throw error;
      await loadTemplates();
    } catch (error) {
      console.error('Şablon güncellenirken hata:', error);
      throw error;
    }
  };

  // =====================================================
  // REFRESH ALL
  // =====================================================
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadSubscriptions(),
        loadPayments(),
        loadSiteSettings(),
        loadPricingPlans(),
        loadDashboardStats(),
        loadTemplates(),
      ]);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadSubscriptions, loadPayments, loadSiteSettings, loadPricingPlans, loadDashboardStats, loadTemplates]);

  return (
    <AdminContext.Provider value={{
      isAuthenticated, authLoading, login, logout,
      loading,
      users, loadUsers, updateUser, deleteUser,
      subscriptions, loadSubscriptions, updateSubscription, cancelSubscription,
      payments, loadPayments, refundPayment,
      siteSettings, loadSiteSettings, updateSiteSettings,
      pricingPlans, loadPricingPlans, updatePricingPlan,
      dashboardStats, loadDashboardStats,
      templates, loadTemplates, updateTemplate,
      refreshAll,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
