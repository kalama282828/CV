import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  footerText: string;
  maintenanceMode: boolean;
  // Landing page content
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroButtonText: string;
  heroSecondaryButtonText: string;
  heroTrustText: string;
  // Features section
  featuresTitle: string;
  featuresSubtitle: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  // How it works section
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
  // Testimonials section
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  // CTA section
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  // Navigation
  navFeatures: string;
  navPricing: string;
  navAbout: string;
  navLogin: string;
  navGetStarted: string;
  // Pricing
  oneTimePrice: number;
  proMonthlyPrice: number;
  proYearlyPrice: number;
  businessMonthlyPrice: number;
  businessYearlyPrice: number;
  // Footer Links
  footerProductTitle: string;
  footerProductLink1Text: string;
  footerProductLink1Url: string;
  footerProductLink2Text: string;
  footerProductLink2Url: string;
  footerProductLink3Text: string;
  footerProductLink3Url: string;
  footerCompanyTitle: string;
  footerCompanyLink1Text: string;
  footerCompanyLink1Url: string;
  footerCompanyLink2Text: string;
  footerCompanyLink2Url: string;
  footerCompanyLink3Text: string;
  footerCompanyLink3Url: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'CV Builder',
  siteDescription: 'Profesyonel CV oluşturma platformu',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#135bec',
  secondaryColor: '#1e3a5f',
  contactEmail: 'info@cvbuilder.com',
  contactPhone: '+90 212 123 4567',
  socialLinks: {
    facebook: 'https://facebook.com/cvbuilder',
    twitter: 'https://twitter.com/cvbuilder',
    instagram: 'https://instagram.com/cvbuilder',
    linkedin: 'https://linkedin.com/company/cvbuilder',
  },
  footerText: '© 2024 CV Builder. Tüm hakları saklıdır.',
  maintenanceMode: false,
  // Hero section
  heroTitle: 'Dakikalar İçinde İş Kazandıran CV Oluşturun',
  heroSubtitle: 'ATS uyumlu CV oluşturucumuzla hayalinizdeki işe ulaşan binlerce profesyonele katılın. Tasarım becerisi gerekmez.',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeiKmpNkTOPzGns2h7uj92K5YM3lx4iaGHEWN0q9uKyjNCj55t_jYzLKaFF4nXPSCWW4-2_ywWTJZz9ebK5BX8l50jjztvIsRNhrVGVGY5Js3pYGiXIa40_hbu770-GETfefWPsvgX7hA30KqOLvNlt5hxTjp609lgj3SL6rQ17kyLwFoRqD7ElPqG2j_efWYfqZ4L4wwnaHzaSZaqsqXSsGMobexMlLqLzU7SccgNC46OIifBPmQlaQjTjx5cf7Ze1XxZ2HVFxx60',
  heroButtonText: 'CV Oluştur',
  heroSecondaryButtonText: 'Örnekleri Gör',
  heroTrustText: '10.000+ iş arayan tarafından güveniliyor',
  // Features section
  featuresTitle: 'Neden Bizi Seçmelisiniz?',
  featuresSubtitle: 'Araçlarımız, akıllı özelliklerle daha hızlı işe girmenize yardımcı olmak için tasarlandı.',
  feature1Title: 'ATS Uyumlu',
  feature1Description: 'Büyük işverenler tarafından kullanılan Başvuru Takip Sistemlerini geçmek için özel olarak tasarlanmış ve test edilmiş şablonlar.',
  feature2Title: 'Akıllı Öneriler',
  feature2Description: 'Deneyiminizi yazarken, iş unvanınıza özel uzman tavsiyeleri ve hazır ifadeler alın.',
  feature3Title: 'Anında Dışa Aktarma',
  feature3Description: 'Tamamlanmış CV\'nizi tek tıklamayla PDF veya Word formatında indirin, başvuruya hazır.',
  // How it works section
  howItWorksTitle: '3 Basit Adımda CV\'nizi Oluşturun',
  howItWorksSubtitle: 'Saatlerce formatlama ile uğraşmayın. Deneyiminize odaklanın, tasarımı bize bırakın.',
  step1Title: 'Yükle veya Sıfırdan Başla',
  step1Description: 'Eski özgeçmişinizi yükleyerek bilgileri otomatik doldurun veya boş bir şablonla başlayın.',
  step2Title: 'Akıllı Araçlarla Düzenle',
  step2Description: 'İçeriği özelleştirin, renkleri değiştirin ve tek tıklamayla şablonları değiştirin.',
  step3Title: 'İndir ve Başvur',
  step3Description: 'Cilalı CV\'nizi hemen alın ve hayalinizdeki işlere başvurmaya başlayın.',
  // Testimonials section
  testimonialsTitle: 'Kullanıcılarımız Ne Diyor',
  testimonialsSubtitle: 'İşe giren insanların başarı hikayelerine katılın.',
  // CTA section
  ctaTitle: 'Hayalinizdeki İşe Bir Adım Daha Yaklaşın',
  ctaSubtitle: 'Profesyonel CV\'nizi dakikalar içinde oluşturun ve güvenle başvurmaya başlayın.',
  ctaButtonText: 'Ücretsiz Başla',
  // Navigation
  navFeatures: 'Özellikler',
  navPricing: 'Fiyatlandırma',
  navAbout: 'Hakkımızda',
  navLogin: 'Giriş Yap',
  navGetStarted: 'Başla',
  // Pricing
  oneTimePrice: 50,
  proMonthlyPrice: 99.99,
  proYearlyPrice: 999.99,
  businessMonthlyPrice: 249.99,
  businessYearlyPrice: 2499.99,
  // Footer Links
  footerProductTitle: 'Ürün',
  footerProductLink1Text: 'Özellikler',
  footerProductLink1Url: '#features',
  footerProductLink2Text: 'Fiyatlandırma',
  footerProductLink2Url: '#pricing',
  footerProductLink3Text: 'Şablonlar',
  footerProductLink3Url: '#',
  footerCompanyTitle: 'Şirket',
  footerCompanyLink1Text: 'Hakkımızda',
  footerCompanyLink1Url: '#about',
  footerCompanyLink2Text: 'Blog',
  footerCompanyLink2Url: '#',
  footerCompanyLink3Text: 'Kariyer',
  footerCompanyLink3Url: '#',
};

const STORAGE_KEY = 'site-settings';

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Update favicon
    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Update document title
    document.title = settings.siteName;
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    // Return default settings if not in provider
    return { settings: defaultSettings, updateSettings: () => {} };
  }
  return context;
}

// Helper to get settings without hook (for non-React code)
export function getSiteSettings(): SiteSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}
