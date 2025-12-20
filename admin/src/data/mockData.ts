import type { User, Subscription, Payment, SiteSettings, PricingPlan, DashboardStats, Template } from '../types';

export const mockUsers: User[] = [
  { id: '1', email: 'ahmet@example.com', name: 'Ahmet Yılmaz', phone: '+90 532 123 4567', plan: 'pro', hasPurchased: true, createdAt: '2024-12-01', lastLogin: '2024-12-20', cvCount: 3, status: 'active' },
  { id: '2', email: 'ayse@example.com', name: 'Ayşe Demir', phone: '+90 533 234 5678', plan: 'free', hasPurchased: false, createdAt: '2024-12-05', lastLogin: '2024-12-19', cvCount: 1, status: 'active' },
  { id: '3', email: 'mehmet@example.com', name: 'Mehmet Kaya', phone: '+90 534 345 6789', plan: 'business', hasPurchased: true, createdAt: '2024-11-15', lastLogin: '2024-12-20', cvCount: 5, status: 'active' },
  { id: '4', email: 'fatma@example.com', name: 'Fatma Öztürk', plan: 'free', hasPurchased: true, createdAt: '2024-12-10', lastLogin: '2024-12-18', cvCount: 2, status: 'active' },
  { id: '5', email: 'ali@example.com', name: 'Ali Çelik', phone: '+90 535 456 7890', plan: 'pro', hasPurchased: true, createdAt: '2024-11-20', lastLogin: '2024-12-15', cvCount: 4, status: 'inactive' },
  { id: '6', email: 'zeynep@example.com', name: 'Zeynep Arslan', plan: 'free', hasPurchased: false, createdAt: '2024-12-15', cvCount: 0, status: 'active' },
  { id: '7', email: 'mustafa@example.com', name: 'Mustafa Şahin', phone: '+90 536 567 8901', plan: 'business', hasPurchased: true, createdAt: '2024-10-01', lastLogin: '2024-12-20', cvCount: 8, status: 'active' },
  { id: '8', email: 'elif@example.com', name: 'Elif Yıldız', plan: 'pro', hasPurchased: true, createdAt: '2024-11-25', lastLogin: '2024-12-17', cvCount: 2, status: 'active' },
];

export const mockSubscriptions: Subscription[] = [
  { id: 's1', userId: '1', userName: 'Ahmet Yılmaz', userEmail: 'ahmet@example.com', plan: 'pro', billingCycle: 'yearly', amount: 999.99, status: 'active', startDate: '2024-12-01', endDate: '2025-12-01', autoRenew: true },
  { id: 's2', userId: '3', userName: 'Mehmet Kaya', userEmail: 'mehmet@example.com', plan: 'business', billingCycle: 'monthly', amount: 199.99, status: 'active', startDate: '2024-12-15', endDate: '2025-01-15', autoRenew: true },
  { id: 's3', userId: '5', userName: 'Ali Çelik', userEmail: 'ali@example.com', plan: 'pro', billingCycle: 'monthly', amount: 99.99, status: 'cancelled', startDate: '2024-11-20', endDate: '2024-12-20', autoRenew: false },
  { id: 's4', userId: '7', userName: 'Mustafa Şahin', userEmail: 'mustafa@example.com', plan: 'business', billingCycle: 'yearly', amount: 1999.99, status: 'active', startDate: '2024-10-01', endDate: '2025-10-01', autoRenew: true },
  { id: 's5', userId: '8', userName: 'Elif Yıldız', userEmail: 'elif@example.com', plan: 'pro', billingCycle: 'yearly', amount: 999.99, status: 'active', startDate: '2024-11-25', endDate: '2025-11-25', autoRenew: true },
];

export const mockPayments: Payment[] = [
  { id: 'p1', userId: '1', userName: 'Ahmet Yılmaz', userEmail: 'ahmet@example.com', type: 'subscription', amount: 999.99, status: 'completed', date: '2024-12-01', method: 'credit_card' },
  { id: 'p2', userId: '4', userName: 'Fatma Öztürk', userEmail: 'fatma@example.com', type: 'one-time', amount: 50, status: 'completed', date: '2024-12-10', method: 'credit_card' },
  { id: 'p3', userId: '3', userName: 'Mehmet Kaya', userEmail: 'mehmet@example.com', type: 'subscription', amount: 199.99, status: 'completed', date: '2024-12-15', method: 'credit_card' },
  { id: 'p4', userId: '7', userName: 'Mustafa Şahin', userEmail: 'mustafa@example.com', type: 'subscription', amount: 1999.99, status: 'completed', date: '2024-10-01', method: 'bank_transfer' },
  { id: 'p5', userId: '8', userName: 'Elif Yıldız', userEmail: 'elif@example.com', type: 'subscription', amount: 999.99, status: 'completed', date: '2024-11-25', method: 'credit_card' },
  { id: 'p6', userId: '2', userName: 'Ayşe Demir', userEmail: 'ayse@example.com', type: 'one-time', amount: 50, status: 'pending', date: '2024-12-19', method: 'credit_card' },
];

export const mockSiteSettings: SiteSettings = {
  siteName: 'CV Maker',
  siteDescription: 'Profesyonel CV oluşturma platformu',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  primaryColor: '#2563eb',
  secondaryColor: '#1e3a5f',
  contactEmail: 'info@cvmaker.com',
  contactPhone: '+90 212 123 4567',
  socialLinks: {
    facebook: 'https://facebook.com/cvmaker',
    twitter: 'https://twitter.com/cvmaker',
    instagram: 'https://instagram.com/cvmaker',
    linkedin: 'https://linkedin.com/company/cvmaker',
  },
  footerText: '© 2024 CV Maker. Tüm hakları saklıdır.',
  maintenanceMode: false,
};

export const mockPricingPlans: PricingPlan[] = [
  { id: 'free', name: 'Ücretsiz', description: 'Başlangıç için ideal', monthlyPrice: 0, yearlyPrice: 0, features: ['1 CV oluşturma', 'Temel şablonlar', 'Önizleme'], isPopular: false, isActive: true },
  { id: 'pro', name: 'Pro', description: 'Profesyoneller için', monthlyPrice: 99.99, yearlyPrice: 999.99, features: ['Sınırsız CV', 'Tüm şablonlar', 'PDF indirme', 'ATS uyumlu', 'Öncelikli destek'], isPopular: true, isActive: true },
  { id: 'business', name: 'Business', description: 'Şirketler için', monthlyPrice: 199.99, yearlyPrice: 1999.99, features: ['Tüm Pro özellikleri', 'Takım yönetimi', 'API erişimi', 'Özel şablonlar', '7/24 destek'], isPopular: false, isActive: true },
  { id: 'one-time', name: 'Tek Seferlik', description: 'Sadece PDF indirme', monthlyPrice: 50, yearlyPrice: 50, features: ['PDF indirme', 'Tüm şablonlar', 'Sınırsız düzenleme', 'ATS uyumlu'], isPopular: false, isActive: true },
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 1250,
  activeSubscriptions: 342,
  totalRevenue: 125000,
  monthlyRevenue: 28500,
  newUsersToday: 15,
  newUsersThisWeek: 87,
  conversionRate: 27.4,
  churnRate: 3.2,
};

export const mockTemplates: Template[] = [
  { id: 'classic', name: 'Klasik', description: 'Geleneksel ve profesyonel görünüm', previewUrl: '/templates/classic.png', isActive: true, isPremium: false, usageCount: 4520 },
  { id: 'modern', name: 'Modern', description: 'Çağdaş ve minimalist tasarım', previewUrl: '/templates/modern.png', isActive: true, isPremium: false, usageCount: 3890 },
  { id: 'minimal', name: 'Minimal', description: 'Sade ve şık görünüm', previewUrl: '/templates/minimal.png', isActive: true, isPremium: true, usageCount: 2150 },
  { id: 'pastel', name: 'Pastel', description: 'Yumuşak renklerle modern tasarım', previewUrl: '/templates/pastel.png', isActive: true, isPremium: true, usageCount: 1780 },
];
