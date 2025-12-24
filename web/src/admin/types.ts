// Admin panel için tip tanımları
// Not: Bu tipler artık AdminContext.tsx'de tanımlanıyor
// Bu dosya geriye dönük uyumluluk için korunuyor

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  plan: 'free' | 'pro' | 'business';
  hasPurchased: boolean;
  createdAt: string;
  lastLogin?: string | null;
  cvCount: number;
  status: 'active' | 'inactive' | 'banned';
}

export interface Subscription {
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
}

export interface Payment {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  type: 'subscription' | 'one-time';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | null;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  footerText: string;
  maintenanceMode: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
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

export interface Template {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  isActive: boolean;
  isPremium: boolean;
  usageCount: number;
}
