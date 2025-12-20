import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { siteSettingsService } from '../lib/database';

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
  heroTitle: 'Dakikalar İçinde İş Kazandıran CV Oluşturun',
  heroSubtitle: 'ATS uyumlu CV oluşturucumuzla hayalinizdeki işe ulaşan binlerce profesyonele katılın. Tasarım becerisi gerekmez.',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeiKmpNkTOPzGns2h7uj92K5YM3lx4iaGHEWN0q9uKyjNCj55t_jYzLKaFF4nXPSCWW4-2_ywWTJZz9ebK5BX8l50jjztvIsRNhrVGVGY5Js3pYGiXIa40_hbu770-GETfefWPsvgX7hA30KqOLvNlt5hxTjp609lgj3SL6rQ17kyLwFoRqD7ElPqG2j_efWYfqZ4L4wwnaHzaSZaqsqXSsGMobexMlLqLzU7SccgNC46OIifBPmQlaQjTjx5cf7Ze1XxZ2HVFxx60',
  heroButtonText: 'CV Oluştur',
  heroSecondaryButtonText: 'Örnekleri Gör',
  heroTrustText: '10.000+ iş arayan tarafından güveniliyor',
  featuresTitle: 'Neden Bizi Seçmelisiniz?',
  featuresSubtitle: 'Araçlarımız, akıllı özelliklerle daha hızlı işe girmenize yardımcı olmak için tasarlandı.',
  feature1Title: 'ATS Uyumlu',
  feature1Description: 'Büyük işverenler tarafından kullanılan Başvuru Takip Sistemlerini geçmek için özel olarak tasarlanmış ve test edilmiş şablonlar.',
  feature2Title: 'Akıllı Öneriler',
  feature2Description: 'Deneyiminizi yazarken, iş unvanınıza özel uzman tavsiyeleri ve hazır ifadeler alın.',
  feature3Title: 'Anında Dışa Aktarma',
  feature3Description: 'Tamamlanmış CV\'nizi tek tıklamayla PDF veya Word formatında indirin, başvuruya hazır.',
  howItWorksTitle: '3 Basit Adımda CV\'nizi Oluşturun',
  howItWorksSubtitle: 'Saatlerce formatlama ile uğraşmayın. Deneyiminize odaklanın, tasarımı bize bırakın.',
  step1Title: 'Yükle veya Sıfırdan Başla',
  step1Description: 'Eski özgeçmişinizi yükleyerek bilgileri otomatik doldurun veya boş bir şablonla başlayın.',
  step2Title: 'Akıllı Araçlarla Düzenle',
  step2Description: 'İçeriği özelleştirin, renkleri değiştirin ve tek tıklamayla şablonları değiştirin.',
  step3Title: 'İndir ve Başvur',
  step3Description: 'Cilalı CV\'nizi hemen alın ve hayalinizdeki işlere başvurmaya başlayın.',
  testimonialsTitle: 'Kullanıcılarımız Ne Diyor',
  testimonialsSubtitle: 'İşe giren insanların başarı hikayelerine katılın.',
  ctaTitle: 'Hayalinizdeki İşe Bir Adım Daha Yaklaşın',
  ctaSubtitle: 'Profesyonel CV\'nizi dakikalar içinde oluşturun ve güvenle başvurmaya başlayın.',
  ctaButtonText: 'Ücretsiz Başla',
  navFeatures: 'Özellikler',
  navPricing: 'Fiyatlandırma',
  navAbout: 'Hakkımızda',
  navLogin: 'Giriş Yap',
  navGetStarted: 'Başla',
  oneTimePrice: 50,
  proMonthlyPrice: 99.99,
  proYearlyPrice: 999.99,
  businessMonthlyPrice: 249.99,
  businessYearlyPrice: 2499.99,
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
  saveToDatabase: () => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

// Helper: Convert database format to frontend format
function dbToFrontend(dbSettings: Record<string, unknown>): Partial<SiteSettings> {
  const productLinks = (dbSettings.footer_product_links as { text: string; url: string }[]) || [];
  const companyLinks = (dbSettings.footer_company_links as { text: string; url: string }[]) || [];
  
  return {
    siteName: dbSettings.site_name as string,
    siteDescription: dbSettings.site_description as string,
    logoUrl: (dbSettings.logo_url as string) || '',
    faviconUrl: (dbSettings.favicon_url as string) || '',
    primaryColor: dbSettings.primary_color as string,
    secondaryColor: dbSettings.secondary_color as string,
    contactEmail: dbSettings.contact_email as string,
    contactPhone: dbSettings.contact_phone as string,
    socialLinks: (dbSettings.social_links as SiteSettings['socialLinks']) || {},
    footerText: dbSettings.footer_text as string,
    maintenanceMode: dbSettings.maintenance_mode as boolean,
    heroTitle: (dbSettings.hero_title as string) || defaultSettings.heroTitle,
    heroSubtitle: (dbSettings.hero_subtitle as string) || defaultSettings.heroSubtitle,
    heroImage: (dbSettings.hero_image as string) || defaultSettings.heroImage,
    heroButtonText: (dbSettings.hero_button_text as string) || defaultSettings.heroButtonText,
    heroSecondaryButtonText: (dbSettings.hero_secondary_button_text as string) || defaultSettings.heroSecondaryButtonText,
    heroTrustText: (dbSettings.hero_trust_text as string) || defaultSettings.heroTrustText,
    featuresTitle: (dbSettings.features_title as string) || defaultSettings.featuresTitle,
    featuresSubtitle: (dbSettings.features_subtitle as string) || defaultSettings.featuresSubtitle,
    feature1Title: (dbSettings.feature1_title as string) || defaultSettings.feature1Title,
    feature1Description: (dbSettings.feature1_description as string) || defaultSettings.feature1Description,
    feature2Title: (dbSettings.feature2_title as string) || defaultSettings.feature2Title,
    feature2Description: (dbSettings.feature2_description as string) || defaultSettings.feature2Description,
    feature3Title: (dbSettings.feature3_title as string) || defaultSettings.feature3Title,
    feature3Description: (dbSettings.feature3_description as string) || defaultSettings.feature3Description,
    howItWorksTitle: (dbSettings.how_it_works_title as string) || defaultSettings.howItWorksTitle,
    howItWorksSubtitle: (dbSettings.how_it_works_subtitle as string) || defaultSettings.howItWorksSubtitle,
    step1Title: (dbSettings.step1_title as string) || defaultSettings.step1Title,
    step1Description: (dbSettings.step1_description as string) || defaultSettings.step1Description,
    step2Title: (dbSettings.step2_title as string) || defaultSettings.step2Title,
    step2Description: (dbSettings.step2_description as string) || defaultSettings.step2Description,
    step3Title: (dbSettings.step3_title as string) || defaultSettings.step3Title,
    step3Description: (dbSettings.step3_description as string) || defaultSettings.step3Description,
    testimonialsTitle: (dbSettings.testimonials_title as string) || defaultSettings.testimonialsTitle,
    testimonialsSubtitle: (dbSettings.testimonials_subtitle as string) || defaultSettings.testimonialsSubtitle,
    ctaTitle: (dbSettings.cta_title as string) || defaultSettings.ctaTitle,
    ctaSubtitle: (dbSettings.cta_subtitle as string) || defaultSettings.ctaSubtitle,
    ctaButtonText: (dbSettings.cta_button_text as string) || defaultSettings.ctaButtonText,
    navFeatures: (dbSettings.nav_features as string) || defaultSettings.navFeatures,
    navPricing: (dbSettings.nav_pricing as string) || defaultSettings.navPricing,
    navAbout: (dbSettings.nav_about as string) || defaultSettings.navAbout,
    navLogin: (dbSettings.nav_login as string) || defaultSettings.navLogin,
    navGetStarted: (dbSettings.nav_get_started as string) || defaultSettings.navGetStarted,
    footerProductTitle: (dbSettings.footer_product_title as string) || defaultSettings.footerProductTitle,
    footerProductLink1Text: productLinks[0]?.text || defaultSettings.footerProductLink1Text,
    footerProductLink1Url: productLinks[0]?.url || defaultSettings.footerProductLink1Url,
    footerProductLink2Text: productLinks[1]?.text || defaultSettings.footerProductLink2Text,
    footerProductLink2Url: productLinks[1]?.url || defaultSettings.footerProductLink2Url,
    footerProductLink3Text: productLinks[2]?.text || defaultSettings.footerProductLink3Text,
    footerProductLink3Url: productLinks[2]?.url || defaultSettings.footerProductLink3Url,
    footerCompanyTitle: (dbSettings.footer_company_title as string) || defaultSettings.footerCompanyTitle,
    footerCompanyLink1Text: companyLinks[0]?.text || defaultSettings.footerCompanyLink1Text,
    footerCompanyLink1Url: companyLinks[0]?.url || defaultSettings.footerCompanyLink1Url,
    footerCompanyLink2Text: companyLinks[1]?.text || defaultSettings.footerCompanyLink2Text,
    footerCompanyLink2Url: companyLinks[1]?.url || defaultSettings.footerCompanyLink2Url,
    footerCompanyLink3Text: companyLinks[2]?.text || defaultSettings.footerCompanyLink3Text,
    footerCompanyLink3Url: companyLinks[2]?.url || defaultSettings.footerCompanyLink3Url,
  };
}

// Helper: Convert frontend format to database format
function frontendToDb(settings: SiteSettings): Record<string, unknown> {
  return {
    site_name: settings.siteName,
    site_description: settings.siteDescription,
    logo_url: settings.logoUrl || null,
    favicon_url: settings.faviconUrl || null,
    primary_color: settings.primaryColor,
    secondary_color: settings.secondaryColor,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone,
    social_links: settings.socialLinks,
    footer_text: settings.footerText,
    maintenance_mode: settings.maintenanceMode,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    hero_image: settings.heroImage,
    hero_button_text: settings.heroButtonText,
    hero_secondary_button_text: settings.heroSecondaryButtonText,
    hero_trust_text: settings.heroTrustText,
    features_title: settings.featuresTitle,
    features_subtitle: settings.featuresSubtitle,
    feature1_title: settings.feature1Title,
    feature1_description: settings.feature1Description,
    feature2_title: settings.feature2Title,
    feature2_description: settings.feature2Description,
    feature3_title: settings.feature3Title,
    feature3_description: settings.feature3Description,
    how_it_works_title: settings.howItWorksTitle,
    how_it_works_subtitle: settings.howItWorksSubtitle,
    step1_title: settings.step1Title,
    step1_description: settings.step1Description,
    step2_title: settings.step2Title,
    step2_description: settings.step2Description,
    step3_title: settings.step3Title,
    step3_description: settings.step3Description,
    testimonials_title: settings.testimonialsTitle,
    testimonials_subtitle: settings.testimonialsSubtitle,
    cta_title: settings.ctaTitle,
    cta_subtitle: settings.ctaSubtitle,
    cta_button_text: settings.ctaButtonText,
    nav_features: settings.navFeatures,
    nav_pricing: settings.navPricing,
    nav_about: settings.navAbout,
    nav_login: settings.navLogin,
    nav_get_started: settings.navGetStarted,
    footer_product_title: settings.footerProductTitle,
    footer_product_links: [
      { text: settings.footerProductLink1Text, url: settings.footerProductLink1Url },
      { text: settings.footerProductLink2Text, url: settings.footerProductLink2Url },
      { text: settings.footerProductLink3Text, url: settings.footerProductLink3Url },
    ].filter(l => l.text),
    footer_company_title: settings.footerCompanyTitle,
    footer_company_links: [
      { text: settings.footerCompanyLink1Text, url: settings.footerCompanyLink1Url },
      { text: settings.footerCompanyLink2Text, url: settings.footerCompanyLink2Url },
      { text: settings.footerCompanyLink3Text, url: settings.footerCompanyLink3Url },
    ].filter(l => l.text),
  };
}

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
  const [loading, setLoading] = useState(true);

  // Load settings from Supabase on mount
  useEffect(() => {
    async function loadFromDatabase() {
      try {
        const { data, error } = await siteSettingsService.getSettings();
        if (!error && data) {
          const converted = dbToFrontend(data as unknown as Record<string, unknown>);
          setSettings(prev => ({ ...prev, ...converted }));
        }
      } catch (err) {
        console.error('Failed to load settings from database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFromDatabase();
  }, []);

  // Save to localStorage whenever settings change
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

  const saveToDatabase = async () => {
    const dbData = frontendToDb(settings);
    const { error } = await siteSettingsService.updateSettings(dbData as Parameters<typeof siteSettingsService.updateSettings>[0]);
    if (error) {
      console.error('Failed to save settings to database:', error);
      throw error;
    }
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, saveToDatabase, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return { settings: defaultSettings, updateSettings: () => {}, saveToDatabase: async () => {}, loading: false };
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
