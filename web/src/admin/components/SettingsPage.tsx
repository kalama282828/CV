import { useState, useEffect } from 'react';
import { useSiteSettings, type SiteSettings } from '../../context/SiteSettingsContext';


const defaultSettings: SiteSettings = {
  siteName: 'CV Builder',
  siteDescription: 'Profesyonel CV oluşturma platformu',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#135bec',
  secondaryColor: '#1e3a5f',
  contactEmail: 'info@cvbuilder.com',
  contactPhone: '+90 212 123 4567',
  socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
  footerText: '© 2024 CV Builder. Tüm hakları saklıdır.',
  maintenanceMode: false,
  heroTitle: 'Dakikalar İçinde İş Kazandıran CV Oluşturun',
  heroSubtitle: 'ATS uyumlu CV oluşturucumuzla hayalinizdeki işe ulaşan binlerce profesyonele katılın.',
  heroImage: '',
  heroButtonText: 'CV Oluştur',
  heroSecondaryButtonText: 'Örnekleri Gör',
  heroTrustText: '10.000+ iş arayan tarafından güveniliyor',
  featuresTitle: 'Neden Bizi Seçmelisiniz?',
  featuresSubtitle: 'Araçlarımız, akıllı özelliklerle daha hızlı işe girmenize yardımcı olmak için tasarlandı.',
  feature1Title: 'ATS Uyumlu',
  feature1Description: 'Büyük işverenler tarafından kullanılan Başvuru Takip Sistemlerini geçmek için özel olarak tasarlanmış şablonlar.',
  feature2Title: 'Akıllı Öneriler',
  feature2Description: 'Deneyiminizi yazarken, iş unvanınıza özel uzman tavsiyeleri ve hazır ifadeler alın.',
  feature3Title: 'Anında Dışa Aktarma',
  feature3Description: 'Tamamlanmış CV\'nizi tek tıklamayla PDF veya Word formatında indirin.',
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
  stripePublishableKey: '',
  stripeMode: 'test',
};

const STORAGE_KEY = 'site-settings';


export function SettingsPage() {
  const { settings: contextSettings, updateSettings: updateContextSettings, saveToDatabase } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return defaultSettings;
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [landingSubTab, setLandingSubTab] = useState('hero');

  // Sync with context settings
  useEffect(() => {
    setSettings(prev => ({ ...prev, ...contextSettings }));
  }, [contextSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // Update context
      updateContextSettings(settings);
      // Save to Supabase with current settings
      await saveToDatabase(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Veritabanına kaydedilirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: '🏠 Genel' },
    { id: 'branding', label: '🎨 Marka' },
    { id: 'landing', label: '📄 Ana Sayfa' },
    { id: 'footer', label: '🦶 Footer' },
    { id: 'stripe', label: '💳 Stripe' },
    { id: 'contact', label: '📞 İletişim' },
    { id: 'social', label: '🔗 Sosyal Medya' },
    { id: 'advanced', label: '⚙️ Gelişmiş' },
  ];

  const landingSubTabs = [
    { id: 'hero', label: '🎯 Hero' },
    { id: 'features', label: '✨ Özellikler' },
    { id: 'howItWorks', label: '📋 Nasıl Çalışır' },
    { id: 'testimonials', label: '💬 Referanslar' },
    { id: 'cta', label: '🚀 CTA' },
    { id: 'navigation', label: '🧭 Navigasyon' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Site Ayarları</h1>
        {saved && <span className="saved-badge">✓ Kaydedildi</span>}
      </div>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <h2>Genel Ayarlar</h2>
            <div className="form-group">
              <label>Site Adı</label>
              <input type="text" value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Site Açıklaması</label>
              <textarea value={settings.siteDescription} onChange={e => setSettings({ ...settings, siteDescription: e.target.value })} rows={3} />
            </div>
          </div>
        )}


        {activeTab === 'branding' && (
          <div className="settings-section">
            <h2>Marka Ayarları</h2>
            <div className="form-group">
              <label>Logo URL</label>
              <input type="text" value={settings.logoUrl} onChange={e => setSettings({ ...settings, logoUrl: e.target.value })} />
              {settings.logoUrl && <div className="preview-image"><img src={settings.logoUrl} alt="Logo" style={{ maxHeight: 60 }} /></div>}
            </div>
            <div className="form-group">
              <label>Favicon URL</label>
              <input type="text" value={settings.faviconUrl} onChange={e => setSettings({ ...settings, faviconUrl: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ana Renk</label>
                <div className="color-input">
                  <input type="color" value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} />
                  <input type="text" value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>İkincil Renk</label>
                <div className="color-input">
                  <input type="color" value={settings.secondaryColor} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} />
                  <input type="text" value={settings.secondaryColor} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'landing' && (
          <div className="settings-section">
            <h2>Ana Sayfa İçeriği</h2>
            <div className="landing-subtabs">
              {landingSubTabs.map(tab => (
                <button key={tab.id} className={`subtab ${landingSubTab === tab.id ? 'active' : ''}`} onClick={() => setLandingSubTab(tab.id)}>{tab.label}</button>
              ))}
            </div>

            {landingSubTab === 'hero' && (
              <div className="subsection">
                <h3>🎯 Hero Bölümü</h3>
                <div className="form-group"><label>Ana Başlık</label><input type="text" value={settings.heroTitle} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })} /></div>
                <div className="form-group"><label>Alt Başlık</label><textarea value={settings.heroSubtitle} onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })} rows={3} /></div>
                <div className="form-group"><label>Hero Görsel URL</label><input type="text" value={settings.heroImage} onChange={e => setSettings({ ...settings, heroImage: e.target.value })} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Ana Buton</label><input type="text" value={settings.heroButtonText} onChange={e => setSettings({ ...settings, heroButtonText: e.target.value })} /></div>
                  <div className="form-group"><label>İkincil Buton</label><input type="text" value={settings.heroSecondaryButtonText} onChange={e => setSettings({ ...settings, heroSecondaryButtonText: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Güven Metni</label><input type="text" value={settings.heroTrustText} onChange={e => setSettings({ ...settings, heroTrustText: e.target.value })} /></div>
              </div>
            )}


            {landingSubTab === 'features' && (
              <div className="subsection">
                <h3>✨ Özellikler Bölümü</h3>
                <div className="form-group"><label>Bölüm Başlığı</label><input type="text" value={settings.featuresTitle} onChange={e => setSettings({ ...settings, featuresTitle: e.target.value })} /></div>
                <div className="form-group"><label>Bölüm Alt Başlığı</label><input type="text" value={settings.featuresSubtitle} onChange={e => setSettings({ ...settings, featuresSubtitle: e.target.value })} /></div>
                <div className="feature-card"><h4>Özellik 1</h4>
                  <div className="form-group"><label>Başlık</label><input type="text" value={settings.feature1Title} onChange={e => setSettings({ ...settings, feature1Title: e.target.value })} /></div>
                  <div className="form-group"><label>Açıklama</label><textarea value={settings.feature1Description} onChange={e => setSettings({ ...settings, feature1Description: e.target.value })} rows={2} /></div>
                </div>
                <div className="feature-card"><h4>Özellik 2</h4>
                  <div className="form-group"><label>Başlık</label><input type="text" value={settings.feature2Title} onChange={e => setSettings({ ...settings, feature2Title: e.target.value })} /></div>
                  <div className="form-group"><label>Açıklama</label><textarea value={settings.feature2Description} onChange={e => setSettings({ ...settings, feature2Description: e.target.value })} rows={2} /></div>
                </div>
                <div className="feature-card"><h4>Özellik 3</h4>
                  <div className="form-group"><label>Başlık</label><input type="text" value={settings.feature3Title} onChange={e => setSettings({ ...settings, feature3Title: e.target.value })} /></div>
                  <div className="form-group"><label>Açıklama</label><textarea value={settings.feature3Description} onChange={e => setSettings({ ...settings, feature3Description: e.target.value })} rows={2} /></div>
                </div>
              </div>
            )}

            {landingSubTab === 'howItWorks' && (
              <div className="subsection">
                <h3>📋 Nasıl Çalışır Bölümü</h3>
                <div className="form-group"><label>Bölüm Başlığı</label><input type="text" value={settings.howItWorksTitle} onChange={e => setSettings({ ...settings, howItWorksTitle: e.target.value })} /></div>
                <div className="form-group"><label>Bölüm Alt Başlığı</label><input type="text" value={settings.howItWorksSubtitle} onChange={e => setSettings({ ...settings, howItWorksSubtitle: e.target.value })} /></div>
                <div className="feature-card"><h4>Adım 1</h4>
                  <div className="form-group"><label>Başlık</label><input type="text" value={settings.step1Title} onChange={e => setSettings({ ...settings, step1Title: e.target.value })} /></div>
                  <div className="form-group"><label>Açıklama</label><textarea value={settings.step1Description} onChange={e => setSettings({ ...settings, step1Description: e.target.value })} rows={2} /></div>
                </div>
                <div className="feature-card"><h4>Adım 2</h4>
                  <div className="form-group"><label>Başlık</label><input type="text" value={settings.step2Title} onChange={e => setSettings({ ...settings, step2Title: e.target.value })} /></div>
                  <div className="form-group"><label>Açıklama</label><textarea value={settings.step2Description} onChange={e => setSettings({ ...settings, step2Description: e.target.value })} rows={2} /></div>
                </div>
                <div className="feature-card"><h4>Adım 3</h4>
                  <div className="form-group"><label>Başlık</label><input type="text" value={settings.step3Title} onChange={e => setSettings({ ...settings, step3Title: e.target.value })} /></div>
                  <div className="form-group"><label>Açıklama</label><textarea value={settings.step3Description} onChange={e => setSettings({ ...settings, step3Description: e.target.value })} rows={2} /></div>
                </div>
              </div>
            )}


            {landingSubTab === 'testimonials' && (
              <div className="subsection">
                <h3>💬 Referanslar Bölümü</h3>
                <div className="form-group"><label>Bölüm Başlığı</label><input type="text" value={settings.testimonialsTitle} onChange={e => setSettings({ ...settings, testimonialsTitle: e.target.value })} /></div>
                <div className="form-group"><label>Bölüm Alt Başlığı</label><input type="text" value={settings.testimonialsSubtitle} onChange={e => setSettings({ ...settings, testimonialsSubtitle: e.target.value })} /></div>
              </div>
            )}

            {landingSubTab === 'cta' && (
              <div className="subsection">
                <h3>🚀 CTA Bölümü</h3>
                <div className="form-group"><label>Başlık</label><input type="text" value={settings.ctaTitle} onChange={e => setSettings({ ...settings, ctaTitle: e.target.value })} /></div>
                <div className="form-group"><label>Alt Başlık</label><input type="text" value={settings.ctaSubtitle} onChange={e => setSettings({ ...settings, ctaSubtitle: e.target.value })} /></div>
                <div className="form-group"><label>Buton Metni</label><input type="text" value={settings.ctaButtonText} onChange={e => setSettings({ ...settings, ctaButtonText: e.target.value })} /></div>
                <div className="form-group"><label>Footer Metni</label><input type="text" value={settings.footerText} onChange={e => setSettings({ ...settings, footerText: e.target.value })} /></div>
              </div>
            )}

            {landingSubTab === 'navigation' && (
              <div className="subsection">
                <h3>🧭 Navigasyon Metinleri</h3>
                <div className="form-row">
                  <div className="form-group"><label>Özellikler</label><input type="text" value={settings.navFeatures} onChange={e => setSettings({ ...settings, navFeatures: e.target.value })} /></div>
                  <div className="form-group"><label>Fiyatlandırma</label><input type="text" value={settings.navPricing} onChange={e => setSettings({ ...settings, navPricing: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Hakkımızda</label><input type="text" value={settings.navAbout} onChange={e => setSettings({ ...settings, navAbout: e.target.value })} /></div>
                  <div className="form-group"><label>Giriş Yap</label><input type="text" value={settings.navLogin} onChange={e => setSettings({ ...settings, navLogin: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Başla Butonu</label><input type="text" value={settings.navGetStarted} onChange={e => setSettings({ ...settings, navGetStarted: e.target.value })} /></div>
              </div>
            )}
          </div>
        )}


        {activeTab === 'stripe' && (
          <div className="settings-section">
            <h2>💳 Stripe Ödeme Ayarları</h2>
            
            {/* Warning if not configured */}
            {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <strong style={{ color: '#92400e' }}>Stripe Yapılandırılmamış</strong>
                  <p style={{ color: '#92400e', fontSize: '14px', marginTop: '4px' }}>
                    Ödeme almak için Stripe API anahtarlarını yapılandırmanız gerekiyor.
                    <code style={{ 
                      background: '#fef9c3', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      marginLeft: '4px'
                    }}>
                      VITE_STRIPE_PUBLISHABLE_KEY
                    </code> environment variable'ını ayarlayın.
                  </p>
                </div>
              </div>
            )}

            <div className="feature-card">
              <h4>🔑 API Anahtarları</h4>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Stripe Dashboard'dan API anahtarlarınızı alın: 
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', marginLeft: '4px' }}>
                  dashboard.stripe.com/apikeys
                </a>
              </p>
              
              <div className="form-group">
                <label>Publishable Key (Genel Anahtar)</label>
                <input 
                  type="text" 
                  value={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''} 
                  disabled
                  placeholder="pk_test_... veya pk_live_..."
                  style={{ background: '#f3f4f6' }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Bu değer .env dosyasından okunur. Değiştirmek için VITE_STRIPE_PUBLISHABLE_KEY'i güncelleyin.
                </small>
              </div>

              <div className="form-group">
                <label>Secret Key (Gizli Anahtar)</label>
                <input 
                  type="password" 
                  value="••••••••••••••••••••"
                  disabled
                  style={{ background: '#f3f4f6' }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Gizli anahtar Supabase Edge Functions'da saklanır. Güvenlik için burada gösterilmez.
                </small>
              </div>
            </div>

            <div className="feature-card">
              <h4>🧪 Test Modu</h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') ? '#dcfce7' : '#fee2e2',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>
                  {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') ? '🧪' : '🔴'}
                </span>
                <div>
                  <strong>
                    {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') 
                      ? 'Test Modu Aktif' 
                      : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')
                        ? 'Canlı Mod Aktif'
                        : 'Yapılandırılmamış'}
                  </strong>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                    {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')
                      ? 'Test kartları ile ödeme yapabilirsiniz. Gerçek para çekilmez.'
                      : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')
                        ? 'Gerçek ödemeler alınıyor. Dikkatli olun!'
                        : 'Stripe API anahtarı ayarlanmamış.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <h4>💰 Ödeme Bilgileri</h4>
              <div className="form-group">
                <label>Tek Seferlik PDF Fiyatı</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>₺</span>
                  <input 
                    type="number" 
                    value={settings.oneTimePrice} 
                    onChange={e => setSettings({ ...settings, oneTimePrice: Number(e.target.value) })}
                    style={{ width: '120px' }}
                  />
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    = {(settings.oneTimePrice * 100).toLocaleString()} kuruş
                  </span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <h4>🔗 Webhook Yapılandırması</h4>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                Stripe Dashboard'da webhook endpoint'i ekleyin:
              </p>
              <div style={{
                background: '#f3f4f6',
                padding: '12px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                wordBreak: 'break-all'
              }}>
                {import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook
              </div>
              <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Events: checkout.session.completed, checkout.session.expired, payment_intent.payment_failed
              </small>
            </div>

            <div className="feature-card">
              <h4>🧪 Test Kartları</h4>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                Test modunda aşağıdaki kartları kullanabilirsiniz:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                  <span>✅ Başarılı ödeme:</span>
                  <code style={{ fontFamily: 'monospace' }}>4242 4242 4242 4242</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                  <span>❌ Reddedilen kart:</span>
                  <code style={{ fontFamily: 'monospace' }}>4000 0000 0000 0002</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                  <span>🔐 3D Secure:</span>
                  <code style={{ fontFamily: 'monospace' }}>4000 0025 0000 3155</code>
                </div>
              </div>
              <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Son kullanma: Gelecekteki herhangi bir tarih, CVC: Herhangi 3 rakam
              </small>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="settings-section">
            <h2>Footer Linkleri</h2>
            
            <div className="feature-card">
              <h4>📦 Ürün Sütunu</h4>
              <div className="form-group">
                <label>Sütun Başlığı</label>
                <input type="text" value={settings.footerProductTitle || 'Ürün'} onChange={e => setSettings({ ...settings, footerProductTitle: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Link 1 Metin</label><input type="text" value={settings.footerProductLink1Text || ''} onChange={e => setSettings({ ...settings, footerProductLink1Text: e.target.value })} /></div>
                <div className="form-group"><label>Link 1 URL</label><input type="text" value={settings.footerProductLink1Url || ''} onChange={e => setSettings({ ...settings, footerProductLink1Url: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Link 2 Metin</label><input type="text" value={settings.footerProductLink2Text || ''} onChange={e => setSettings({ ...settings, footerProductLink2Text: e.target.value })} /></div>
                <div className="form-group"><label>Link 2 URL</label><input type="text" value={settings.footerProductLink2Url || ''} onChange={e => setSettings({ ...settings, footerProductLink2Url: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Link 3 Metin</label><input type="text" value={settings.footerProductLink3Text || ''} onChange={e => setSettings({ ...settings, footerProductLink3Text: e.target.value })} /></div>
                <div className="form-group"><label>Link 3 URL</label><input type="text" value={settings.footerProductLink3Url || ''} onChange={e => setSettings({ ...settings, footerProductLink3Url: e.target.value })} /></div>
              </div>
            </div>

            <div className="feature-card">
              <h4>🏢 Şirket Sütunu</h4>
              <div className="form-group">
                <label>Sütun Başlığı</label>
                <input type="text" value={settings.footerCompanyTitle || 'Şirket'} onChange={e => setSettings({ ...settings, footerCompanyTitle: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Link 1 Metin</label><input type="text" value={settings.footerCompanyLink1Text || ''} onChange={e => setSettings({ ...settings, footerCompanyLink1Text: e.target.value })} /></div>
                <div className="form-group"><label>Link 1 URL</label><input type="text" value={settings.footerCompanyLink1Url || ''} onChange={e => setSettings({ ...settings, footerCompanyLink1Url: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Link 2 Metin</label><input type="text" value={settings.footerCompanyLink2Text || ''} onChange={e => setSettings({ ...settings, footerCompanyLink2Text: e.target.value })} /></div>
                <div className="form-group"><label>Link 2 URL</label><input type="text" value={settings.footerCompanyLink2Url || ''} onChange={e => setSettings({ ...settings, footerCompanyLink2Url: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Link 3 Metin</label><input type="text" value={settings.footerCompanyLink3Text || ''} onChange={e => setSettings({ ...settings, footerCompanyLink3Text: e.target.value })} /></div>
                <div className="form-group"><label>Link 3 URL</label><input type="text" value={settings.footerCompanyLink3Url || ''} onChange={e => setSettings({ ...settings, footerCompanyLink3Url: e.target.value })} /></div>
              </div>
            </div>

            <div className="form-group">
              <label>Footer Alt Metin (Copyright)</label>
              <input type="text" value={settings.footerText} onChange={e => setSettings({ ...settings, footerText: e.target.value })} />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="settings-section">
            <h2>İletişim Bilgileri</h2>
            <div className="form-group"><label>E-posta</label><input type="email" value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} /></div>
            <div className="form-group"><label>Telefon</label><input type="text" value={settings.contactPhone} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} /></div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="settings-section">
            <h2>Sosyal Medya</h2>
            <div className="form-group"><label>Facebook</label><input type="text" value={settings.socialLinks.facebook || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} /></div>
            <div className="form-group"><label>Twitter</label><input type="text" value={settings.socialLinks.twitter || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })} /></div>
            <div className="form-group"><label>Instagram</label><input type="text" value={settings.socialLinks.instagram || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} /></div>
            <div className="form-group"><label>LinkedIn</label><input type="text" value={settings.socialLinks.linkedin || ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, linkedin: e.target.value } })} /></div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="settings-section">
            <h2>Gelişmiş Ayarlar</h2>
            <div className="form-group">
              <label className="checkbox-label"><input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} /><span>🔧 Bakım Modu</span></label>
            </div>
            <div className="danger-zone">
              <h3>⚠️ Tehlikeli Bölge</h3>
              <button className="btn danger" onClick={() => { if (confirm('Sıfırlamak istediğinize emin misiniz?')) { setSettings(defaultSettings); localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings)); } }}>🗑️ Sıfırla</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button className="btn primary large" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
        </button>
      </div>
    </div>
  );
}
