import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Subscription, Payment, SiteSettings, PricingPlan, DashboardStats, Template } from '../types';
import { mockUsers, mockSubscriptions, mockPayments, mockSiteSettings, mockPricingPlans, mockDashboardStats, mockTemplates } from '../data/mockData';

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Users
  users: User[];
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Subscriptions
  subscriptions: Subscription[];
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  cancelSubscription: (id: string) => void;
  
  // Payments
  payments: Payment[];
  refundPayment: (id: string) => void;
  
  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => void;
  
  // Pricing Plans
  pricingPlans: PricingPlan[];
  updatePricingPlan: (id: string, updates: Partial<PricingPlan>) => void;
  
  // Dashboard
  dashboardStats: DashboardStats;
  
  // Templates
  templates: Template[];
  updateTemplate: (id: string, updates: Partial<Template>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_AUTH_KEY = 'cv-admin-auth';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(mockSiteSettings);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(mockPricingPlans);
  const [dashboardStats] = useState<DashboardStats>(mockDashboardStats);
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);

  useEffect(() => {
    const auth = localStorage.getItem(ADMIN_AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Demo: admin@cvmaker.com / admin123
    if (email === 'admin@cvmaker.com' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled', autoRenew: false } : s));
  };

  const refundPayment = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'refunded' } : p));
  };

  const updateSiteSettings = (updates: Partial<SiteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...updates }));
  };

  const updatePricingPlan = (id: string, updates: Partial<PricingPlan>) => {
    setPricingPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated, login, logout,
      users, updateUser, deleteUser,
      subscriptions, updateSubscription, cancelSubscription,
      payments, refundPayment,
      siteSettings, updateSiteSettings,
      pricingPlans, updatePricingPlan,
      dashboardStats,
      templates, updateTemplate,
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
