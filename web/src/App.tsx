import { useState, useEffect, useCallback, useRef } from 'react';
import type { CVData, TemplateName, PersonalInfo, WorkExperience, Education, Skill, Language, AdditionalInfo } from './types';
import { translations } from './types';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { ExperienceForm } from './components/ExperienceForm';
import { EducationForm } from './components/EducationForm';
import { SkillsForm } from './components/SkillsForm';
import { AdditionalInfoForm } from './components/AdditionalInfoForm';
import { Preview } from './components/Preview';
import { TemplateSelector } from './components/TemplateSelector';
import { PaymentModal } from './components/PaymentModal';
import { StripeTestBanner } from './components/StripeTestBanner';
import { useSiteSettings } from './context/SiteSettingsContext';
import { useAuth } from './context/AuthContext';
import { stripePaymentsService, cvsService, profilesService, subscriptionsService, pricingPlansService, type PricingPlan } from './lib/database';
import './App.css';

const STORAGE_KEY = 'cv-generator-data';

export type PlanType = 'free' | 'pro' | 'business';

const initialData: CVData = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
  },
  photo: '',
  summary: '',
  workExperience: [],
  education: [],
  skills: [],
  additionalInfo: {
    languages: '',
    certificates: '',
    awards: '',
    references: '',
  },
};

function loadSavedData(): { cvData: CVData; template: TemplateName; language: Language } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        cvData: parsed.cvData || initialData,
        template: parsed.template || 'classic',
        language: parsed.language || 'en',
      };
    }
  } catch {
    console.log('No saved data found');
  }
  return { cvData: initialData, template: 'classic', language: 'en' };
}

// CV verisini veritabanı formatına dönüştür
function cvDataToDbFormat(cvData: CVData, template: TemplateName, language: Language) {
  return {
    title: cvData.personalInfo.name ? `${cvData.personalInfo.name} - CV` : 'Untitled CV',
    template,
    language,
    personal_info: cvData.personalInfo as unknown as Record<string, unknown>,
    photo: cvData.photo || null,
    summary: cvData.summary || null,
    work_experience: cvData.workExperience as unknown as Record<string, unknown>[],
    education: cvData.education as unknown as Record<string, unknown>[],
    skills: cvData.skills as unknown as Record<string, unknown>[],
    additional_info: (cvData.additionalInfo || {}) as unknown as Record<string, unknown>,
  };
}

// Veritabanı formatından CV verisine dönüştür
function dbFormatToCvData(dbData: {
  personal_info: Record<string, unknown>;
  photo: string | null;
  summary: string | null;
  work_experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  additional_info: Record<string, unknown>;
  template: string;
  language: string;
}): { cvData: CVData; template: TemplateName; language: Language } {
  return {
    cvData: {
      personalInfo: dbData.personal_info as unknown as PersonalInfo,
      photo: dbData.photo || '',
      summary: dbData.summary || '',
      workExperience: dbData.work_experience as unknown as WorkExperience[],
      education: dbData.education as unknown as Education[],
      skills: dbData.skills as unknown as Skill[],
      additionalInfo: dbData.additional_info as unknown as AdditionalInfo,
    },
    template: (dbData.template as TemplateName) || 'classic',
    language: (dbData.language as Language) || 'tr',
  };
}

function App() {
  const { settings } = useSiteSettings();
  const { user, signOut } = useAuth();
  const [cvData, setCvData] = useState<CVData>(() => loadSavedData().cvData);
  const [template, setTemplate] = useState<TemplateName>(() => loadSavedData().template);
  const [language, setLanguage] = useState<Language>(() => loadSavedData().language);
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  
  // User/Payment state - Başlangıçta free/false, veritabanından güncellenecek
  const [plan, setPlan] = useState<PlanType>('free');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [paymentChecked, setPaymentChecked] = useState(false);
  
  // Pricing state
  const [oneTimePrice, setOneTimePrice] = useState<number | null>(null);
  
  // CV database state
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Debounce ref for auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fiyat planlarını yükle
  useEffect(() => {
    const loadPricing = async () => {
      const { data } = await pricingPlansService.getAllPlans();
      if (data) {
        const oneTimePlan = data.find((p: PricingPlan) => p.id === 'one-time');
        if (oneTimePlan) {
          setOneTimePrice(oneTimePlan.monthly_price);
        }
      }
    };
    loadPricing();
  }, []);

  // Kullanıcı giriş yaptığında CV'yi veritabanından yükle
  useEffect(() => {
    const loadUserCV = async () => {
      if (!user?.id) {
        setDataLoaded(true);
        return;
      }
      
      try {
        // Kullanıcının CV'lerini getir
        const { data: cvs, error } = await cvsService.getUserCVs(user.id);
        
        if (error) {
          console.error('CV yükleme hatası:', error);
          setDataLoaded(true);
          return;
        }
        
        // En son güncellenen CV'yi yükle
        if (cvs && cvs.length > 0) {
          const latestCv = cvs[0];
          const { cvData: loadedData, template: loadedTemplate, language: loadedLanguage } = dbFormatToCvData(latestCv);
          
          setCvData(loadedData);
          setTemplate(loadedTemplate);
          setLanguage(loadedLanguage);
          setCurrentCvId(latestCv.id);
          console.log('CV veritabanından yüklendi:', latestCv.id);
        }
      } catch (err) {
        console.error('CV yükleme hatası:', err);
      } finally {
        setDataLoaded(true);
      }
    };
    
    loadUserCV();
  }, [user?.id]);

  // Kullanıcı profili ve abonelik durumunu kontrol et
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) {
        setPaymentChecked(true);
        return;
      }
      
      try {
        // Profil bilgisini al
        const { data: profile } = await profilesService.getProfile(user.id);
        if (profile) {
          setPlan((profile.plan as PlanType) || 'free');
          setHasPurchased(profile.has_purchased === true);
        }
        
        // Aktif abonelik kontrolü
        const { data: subscription } = await subscriptionsService.getUserSubscription(user.id);
        if (subscription && subscription.status === 'active') {
          setHasActiveSubscription(true);
          setPlan(subscription.plan as PlanType);
        }
        
        // Tek seferlik ödeme kontrolü (email ile)
        if (user.email) {
          setUserEmail(user.email);
          const hasPayment = await stripePaymentsService.checkPaymentStatus(user.email);
          if (hasPayment) {
            setHasPurchased(true);
          }
        }
      } catch (err) {
        console.error('Kullanıcı durumu kontrol hatası:', err);
      } finally {
        setPaymentChecked(true);
      }
    };
    
    // URL'de session_id varsa ödeme başarılı
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      stripePaymentsService.getPaymentBySessionId(sessionId).then(({ data }) => {
        if (data?.status === 'completed') {
          setHasPurchased(true);
          // Profili güncelle
          if (user?.id) {
            profilesService.updateProfile(user.id, { has_purchased: true });
          }
        }
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
    
    checkUserStatus();
  }, [user]);

  // CV'yi veritabanına kaydet (debounced)
  const saveCvToDatabase = useCallback(async () => {
    if (!user?.id || !dataLoaded) return;
    
    setIsSaving(true);
    
    try {
      const cvDbData = cvDataToDbFormat(cvData, template, language);
      
      if (currentCvId) {
        // Mevcut CV'yi güncelle
        const { error } = await cvsService.updateCV(currentCvId, cvDbData);
        if (error) {
          console.error('CV güncelleme hatası:', error);
        } else {
          setLastSaved(new Date());
          console.log('CV güncellendi:', currentCvId);
        }
      } else {
        // Yeni CV oluştur
        const { data: newCv, error } = await cvsService.createCV(user.id, cvDbData);
        if (error) {
          console.error('CV oluşturma hatası:', error);
        } else if (newCv) {
          setCurrentCvId(newCv.id);
          setLastSaved(new Date());
          console.log('Yeni CV oluşturuldu:', newCv.id);
        }
      }
    } catch (err) {
      console.error('CV kaydetme hatası:', err);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, cvData, template, language, currentCvId, dataLoaded]);

  // Auto-save CV data to localStorage (always)
  useEffect(() => {
    const dataToSave = { cvData, template, language };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [cvData, template, language]);

  // Auto-save CV data to database (debounced, only for logged-in users)
  useEffect(() => {
    if (!user?.id || !dataLoaded) return;
    
    // Debounce: 2 saniye bekle
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCvToDatabase();
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cvData, template, language, user?.id, dataLoaded, saveCvToDatabase]);

  // PDF indirme yetkisi: SADECE aktif abonelik VEYA tek seferlik ödeme yapmış
  // NOT: plan === 'pro' || plan === 'business' kontrolü kaldırıldı çünkü 
  // bu değerler sadece abonelik varsa geçerli olmalı
  const canExportPDF = hasActiveSubscription || hasPurchased;
  
  // Debug log
  console.log('Payment status:', { 
    plan, 
    hasPurchased, 
    hasActiveSubscription, 
    paymentChecked, 
    canExportPDF,
    userId: user?.id,
    currentCvId 
  });

  const tabs = [
    { id: 'personal', label: 'Kişisel Bilgiler' },
    { id: 'experience', label: 'Deneyim' },
    { id: 'education', label: 'Eğitim' },
    { id: 'skills', label: 'Beceriler' },
    { id: 'additional', label: 'Ek Bilgiler' },
  ];

  const handleExportHTML = () => {
    const html = generateHTML(cvData, template, language);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cvData.personalInfo.name || 'cv'}_${language}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Veritabanı kontrolü tamamlanmadan işlem yapma
    if (!paymentChecked) {
      return;
    }
    
    if (!canExportPDF) {
      setShowPaymentModal(true);
      return;
    }
    exportPDF();
  };

  const exportPDF = () => {
    const html = generatePDFHTML(cvData, template, language);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  const handlePaymentSuccess = () => {
    // Called when payment is successful (demo mode or after redirect)
    setHasPurchased(true);
    setShowPaymentModal(false);
    
    // Profili güncelle
    if (user?.id) {
      profilesService.updateProfile(user.id, { has_purchased: true });
    }
    
    // Export PDF after payment
    setTimeout(() => {
      exportPDF();
    }, 100);
  };

  const handleSaveJSON = () => {
    const json = JSON.stringify(cvData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setCvData(data);
        } catch {
          alert('Geçersiz JSON dosyası');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app">
      {/* Stripe Test Mode Banner */}
      <StripeTestBanner />

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        price={oneTimePrice ?? 0}
        userEmail={userEmail || cvData.personalInfo.email}
        currentPlan={plan}
      />

      <header className="header">
        <h1>{settings.siteName}</h1>
        <div className="header-actions">
          {/* Plan Badge */}
          {(hasActiveSubscription || plan === 'pro' || plan === 'business') && (
            <span className="plan-badge">{plan.toUpperCase()} ∞</span>
          )}
          {hasPurchased && !hasActiveSubscription && plan === 'free' && (
            <span className="plan-badge purchased">PDF ✓</span>
          )}
          
          {/* Save Status */}
          {user && (
            <span className="save-status" style={{ 
              fontSize: '12px', 
              color: isSaving ? '#f59e0b' : lastSaved ? '#10b981' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isSaving ? '💾 Kaydediliyor...' : lastSaved ? `✓ ${lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>
          )}
          
          {/* Language Selector */}
          <div className="language-selector">
            <button 
              className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
              onClick={() => setLanguage('tr')}
            >
              🇹🇷 TR
            </button>
            <button 
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              🇬🇧 EN
            </button>
          </div>
          <label className="btn btn-secondary">
            JSON Yükle
            <input type="file" accept=".json" onChange={handleLoadJSON} hidden />
          </label>
          <button className="btn btn-secondary" onClick={handleSaveJSON}>
            JSON Kaydet
          </button>
          <button className="btn btn-secondary" onClick={handleExportHTML}>
            HTML İndir
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExportPDF}
            disabled={!paymentChecked}
            style={{ opacity: !paymentChecked ? 0.6 : 1 }}
          >
            {!paymentChecked ? '⏳ Kontrol ediliyor...' : (
              <>📄 PDF İndir {!canExportPDF && oneTimePrice !== null && `(₺${oneTimePrice})`}</>
            )}
          </button>
          
          {/* Çıkış Butonu */}
          {user && (
            <button 
              className="btn btn-secondary" 
              onClick={async () => {
                await signOut();
                window.location.href = '/';
              }}
              title="Çıkış Yap"
              style={{ marginLeft: '8px' }}
            >
              🚪 Çıkış
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <div className="editor">
          <nav className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="form-container">
            {activeTab === 'personal' && (
              <PersonalInfoForm
                data={cvData.personalInfo}
                summary={cvData.summary}
                onChange={(personalInfo: PersonalInfo, summary?: string) =>
                  setCvData({ ...cvData, personalInfo, summary })
                }
              />
            )}
            {activeTab === 'experience' && (
              <ExperienceForm
                experiences={cvData.workExperience}
                onChange={(workExperience: WorkExperience[]) =>
                  setCvData({ ...cvData, workExperience })
                }
              />
            )}
            {activeTab === 'education' && (
              <EducationForm
                education={cvData.education}
                onChange={(education: Education[]) => setCvData({ ...cvData, education })}
              />
            )}
            {activeTab === 'skills' && (
              <SkillsForm
                skills={cvData.skills}
                onChange={(skills: Skill[]) => setCvData({ ...cvData, skills })}
              />
            )}
            {activeTab === 'additional' && (
              <AdditionalInfoForm
                data={cvData.additionalInfo || { languages: '', certificates: '', awards: '', references: '' }}
                photo={cvData.photo}
                onChange={(additionalInfo: AdditionalInfo, photo?: string) =>
                  setCvData({ ...cvData, additionalInfo, photo: photo !== undefined ? photo : cvData.photo })
                }
              />
            )}
          </div>
        </div>

        <div className="preview-panel">
          <TemplateSelector selected={template} onChange={setTemplate} />
          <Preview data={cvData} template={template} language={language} />
        </div>
      </main>

      {/* Mobile Preview Toggle Button */}
      <button 
        className="preview-toggle" 
        onClick={() => setShowMobilePreview(true)}
        title="Önizleme"
      >
        👁️
      </button>

      {/* Mobile Preview Overlay */}
      <div className={`preview-overlay ${showMobilePreview ? 'active' : ''}`}>
        <div className="preview-overlay-header">
          <h3>CV Önizleme</h3>
          <button 
            className="preview-overlay-close"
            onClick={() => setShowMobilePreview(false)}
          >
            ✕
          </button>
        </div>
        <div className="preview-overlay-content">
          <TemplateSelector selected={template} onChange={setTemplate} />
          <Preview data={cvData} template={template} language={language} />
        </div>
      </div>
    </div>
  );
}


// Professional ATS HTML generator
function generateHTML(data: CVData, _template: TemplateName, lang: Language = 'en'): string {
  const t = translations[lang];
  
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr === 'present') return t.present;
    const [year, month] = dateStr.split('-');
    const months = lang === 'tr' 
      ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${data.personalInfo.name || 'CV'} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.5; padding: 30px 40px; font-size: 10px; color: #333; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .header-info { flex: 1; }
    h1 { font-size: 32px; color: #1a5fb4; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; font-weight: bold; }
    .job-title { font-size: 14px; font-weight: bold; color: #333; text-transform: uppercase; margin-bottom: 6px; }
    .contact { font-size: 10px; color: #555; }
    .photo { width: 80px; height: 100px; background: #e5e7eb; border: 1px solid #d1d5db; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 12px; font-weight: bold; color: #1a5fb4; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #1a5fb4; padding-bottom: 3px; margin-bottom: 6px; }
    .entry { margin-bottom: 14px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: bold; font-size: 11px; color: #333; }
    .entry-date { font-size: 10px; font-weight: bold; color: #333; }
    .entry-subtitle { font-size: 10px; color: #555; font-style: italic; }
    ul { margin: 4px 0 0 14px; }
    li { font-size: 10px; margin-bottom: 1px; color: #444; line-height: 1.4; }
    .skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px 10px; font-size: 10px; color: #444; }
    p { font-size: 10px; line-height: 1.6; text-align: justify; }
    .bold { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-info">
      <h1>${data.personalInfo.name || 'AD SOYAD'}</h1>
      <div class="job-title">${data.personalInfo.title || (lang === 'tr' ? 'UNVAN' : 'JOB TITLE')}</div>
      <p class="contact">${[data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email].filter(Boolean).join(' | ') || 'Adres | Telefon | E-posta'}</p>
    </div>
    ${data.photo ? `<img src="${data.photo}" style="width: 80px; height: 100px; object-fit: cover; border: 1px solid #d1d5db;" />` : '<div class="photo"></div>'}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.summary}</h2>
    <p>${data.summary || (lang === 'tr' ? 'Profesyonel özetinizi buraya yazın...' : 'Write your professional summary here...')}</p>
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.experience}</h2>
    ${data.workExperience.length > 0 ? data.workExperience.map(exp => `
      <div class="entry">
        <div class="entry-header">
          <div><span class="entry-title">${exp.title}</span>, <span class="bold">${exp.company}</span>${exp.location ? `, ${exp.location}` : ''}</div>
          <span class="entry-date">${formatDate(exp.startDate)} — ${formatDate(exp.endDate)}</span>
        </div>
        ${exp.description.length > 0 ? `<ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('') : `<p style="color: #888; font-style: italic;">${lang === 'tr' ? 'Henüz deneyim eklenmedi' : 'No experience added yet'}</p>`}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.education}</h2>
    ${data.education.length > 0 ? data.education.map(edu => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">${edu.degree} - ${edu.field}</span>
          <span class="entry-date">${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}</span>
        </div>
        <div class="entry-subtitle">${edu.institution}</div>
      </div>
    `).join('') : `<p style="color: #888; font-style: italic;">${lang === 'tr' ? 'Henüz eğitim eklenmedi' : 'No education added yet'}</p>`}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.skills}</h2>
    ${data.skills.length > 0 ? `<div class="skills-grid">${data.skills.map(s => `<span>${s.name}</span>`).join('')}</div>` : `<p style="color: #888; font-style: italic;">${lang === 'tr' ? 'Henüz beceri eklenmedi' : 'No skills added yet'}</p>`}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.additional}</h2>
    <ul>
      <li><span class="bold">${t.languages}:</span> ${data.additionalInfo?.languages || (lang === 'tr' ? 'Belirtilmedi' : 'Not specified')}</li>
      <li><span class="bold">${t.certificates}:</span> ${data.additionalInfo?.certificates?.split('\n').filter(Boolean).join(', ') || '-'}</li>
      <li><span class="bold">${t.awards}:</span> ${data.additionalInfo?.awards?.split('\n').filter(Boolean).join(', ') || '-'}</li>
    </ul>
  </div>
  
  <div class="section">
    <h2 class="section-title">${lang === 'tr' ? 'REFERANSLAR' : 'REFERENCES'}</h2>
    ${data.additionalInfo?.references 
      ? data.additionalInfo.references.split('\n').filter(Boolean).map(r => `<div style="margin-bottom: 4px;">${r}</div>`).join('')
      : `<p style="font-weight: bold;">${lang === 'tr' ? 'Talep üzerine referans verilecektir' : 'References available upon request'}</p>`}
  </div>
</body>
</html>`;
}

// PDF-optimized HTML generator with A4 format
function generatePDFHTML(data: CVData, template: TemplateName, lang: Language = 'en'): string {
  const t = translations[lang];
  
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr === 'present') return t.present;
    const [year, month] = dateStr.split('-');
    const months = lang === 'tr' 
      ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };

  const referencesText = data.additionalInfo?.references 
    ? data.additionalInfo.references.split('\n').filter(Boolean).map(r => `<div style="margin-bottom: 4pt;">${r}</div>`).join('')
    : `<p style="font-weight: bold;">${lang === 'tr' ? 'Talep üzerine referans verilecektir' : 'References available upon request'}</p>`;

  // PASTEL TEMPLATE
  if (template === 'pastel') {
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${data.personalInfo.name || 'CV'} - Resume</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    html { height: 100%; }
    body { font-family: Arial, sans-serif; line-height: 1.4; font-size: 10pt; color: #333; width: 210mm; min-height: 297mm; margin: 0 auto; background: linear-gradient(135deg, #e8f4f8 0%, #f5e6f0 50%, #fef9e7 100%) !important; padding: 15mm; }
    @media print { 
      html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      body { background: linear-gradient(135deg, #e8f4f8 0%, #f5e6f0 50%, #fef9e7 100%) !important; }
    }
    .header { display: flex; gap: 20pt; align-items: flex-start; margin-bottom: 16pt; }
    .photo { width: 25mm; height: 25mm; border-radius: 50%; object-fit: cover; border: 3pt solid #fff; box-shadow: 0 2pt 8pt rgba(0,0,0,0.1); }
    .contact { font-size: 9pt; color: #555; line-height: 1.6; }
    h1 { font-size: 20pt; color: #2c3e50; font-weight: bold; margin-bottom: 8pt; }
    .section { margin-bottom: 12pt; }
    .section-header { display: flex; align-items: center; margin-bottom: 8pt; }
    .section-label { font-size: 9pt; color: #7f8c8d; min-width: 80pt; }
    .section-line { flex: 1; height: 1pt; background: #ddd; margin-left: 10pt; }
    .section-content { padding-left: 90pt; }
    .entry { margin-bottom: 10pt; }
    .entry-title { font-weight: bold; font-size: 10pt; color: #333; }
    .entry-date { font-size: 8pt; color: #7f8c8d; margin-top: 2pt; }
    ul { margin: 4pt 0 0 14pt; }
    li { font-size: 9pt; margin-bottom: 2pt; color: #444; }
    .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4pt 20pt; font-size: 9pt; }
    .skill-item { display: flex; align-items: center; gap: 6pt; }
    .skill-bullet { color: #7f8c8d; }
    p { font-size: 9pt; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="header">
    ${data.photo ? `<img class="photo" src="${data.photo}" />` : '<div class="photo" style="background: #fff; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 8pt;">Photo</div>'}
    <div class="contact">
      <div>${data.personalInfo.location}</div>
      <div>${data.personalInfo.phone}</div>
      <div>${data.personalInfo.email}</div>
      ${data.personalInfo.militaryStatus ? `<div>${lang === 'tr' ? 'Askerlik' : 'Military'}: ${data.personalInfo.militaryStatus}</div>` : ''}
    </div>
  </div>
  
  <h1>${data.personalInfo.name || 'Ad Soyad'}, ${data.personalInfo.title || 'Unvan'}</h1>
  ${data.summary ? `<p style="margin-bottom: 16pt; color: #555;">${data.summary}</p>` : ''}
  
  ${data.skills.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <span class="section-label">${t.skills}</span>
      <div class="section-line"></div>
    </div>
    <div class="section-content">
      <div class="skills-grid">
        ${data.skills.map(s => `<div class="skill-item"><span class="skill-bullet">○</span><span>${s.name}</span></div>`).join('')}
      </div>
    </div>
  </div>
  ` : ''}
  
  <div class="section">
    <div class="section-header">
      <span class="section-label">${lang === 'tr' ? 'İş Geçmişi' : 'Employment History'}</span>
      <div class="section-line"></div>
    </div>
    <div class="section-content">
      ${data.workExperience.map(exp => `
        <div class="entry">
          <div class="entry-title">${exp.title} at ${exp.company}, ${exp.location || data.personalInfo.location}</div>
          <div class="entry-date">${formatDate(exp.startDate)} — ${formatDate(exp.endDate)}</div>
          ${exp.description.length > 0 ? `<ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="section">
    <div class="section-header">
      <span class="section-label">${t.education}</span>
      <div class="section-line"></div>
    </div>
    <div class="section-content">
      ${data.education.map(edu => `
        <div class="entry">
          <div class="entry-title">${edu.degree}, ${edu.institution}, ${edu.field}</div>
          <div class="entry-date">${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}</div>
        </div>
      `).join('')}
    </div>
  </div>
  
  ${(data.additionalInfo?.languages || data.additionalInfo?.certificates || data.additionalInfo?.awards) ? `
  <div class="section">
    <div class="section-header">
      <span class="section-label">${t.additional}</span>
      <div class="section-line"></div>
    </div>
    <div class="section-content">
      ${data.additionalInfo?.languages ? `<div style="margin-bottom: 6pt;"><b>${t.languages}:</b> ${data.additionalInfo.languages}</div>` : ''}
      ${data.additionalInfo?.certificates ? `<div style="margin-bottom: 6pt;"><b>${t.certificates}:</b> ${data.additionalInfo.certificates.split('\n').filter(Boolean).join(', ')}</div>` : ''}
      ${data.additionalInfo?.awards ? `<div><b>${t.awards}:</b> ${data.additionalInfo.awards.split('\n').filter(Boolean).join(', ')}</div>` : ''}
    </div>
  </div>
  ` : ''}
  
  <div class="section">
    <div class="section-header">
      <span class="section-label">${lang === 'tr' ? 'Referanslar' : 'References'}</span>
      <div class="section-line"></div>
    </div>
    <div class="section-content">
      ${referencesText}
    </div>
  </div>
</body>
</html>`;
  }

  // CLASSIC, MODERN, MINIMAL templates
  const templateStyles: Record<string, string> = {
    classic: `
      h1 { font-size: 24pt; color: #1a5fb4; text-transform: uppercase; letter-spacing: 1pt; margin-bottom: 3pt; font-weight: bold; }
      .job-title { font-size: 11pt; font-weight: bold; color: #333; text-transform: uppercase; margin-bottom: 4pt; }
      .section-title { font-size: 11pt; font-weight: bold; color: #1a5fb4; text-transform: uppercase; letter-spacing: 0.5pt; border-bottom: 2pt solid #1a5fb4; padding-bottom: 2pt; margin-bottom: 6pt; }
    `,
    modern: `
      body { font-family: Georgia, serif; }
      h1 { font-size: 22pt; color: #000; font-weight: normal; margin-bottom: 3pt; }
      .job-title { font-size: 12pt; font-weight: bold; color: #333; margin-bottom: 4pt; }
      .section-title { font-size: 11pt; font-weight: bold; color: #000; border-bottom: 1pt solid #000; padding-bottom: 2pt; margin-bottom: 6pt; }
      .header { border-bottom: 1pt solid #333; padding-bottom: 10pt; }
    `,
    minimal: `
      body { font-family: Georgia, serif; }
      h1 { font-size: 22pt; color: #000; text-transform: uppercase; letter-spacing: 2pt; margin-bottom: 3pt; font-weight: bold; text-align: center; }
      .job-title { font-size: 11pt; color: #555; margin-bottom: 4pt; text-align: center; }
      .contact { text-align: center; }
      .header { text-align: center; border-bottom: 1pt solid #ccc; padding-bottom: 12pt; }
      .section-title { font-size: 10pt; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 1pt; text-align: center; margin-bottom: 8pt; border: none; padding: 0; }
      .section-title::before, .section-title::after { content: ""; display: inline-block; width: 40pt; height: 1pt; background: #ccc; vertical-align: middle; margin: 0 8pt; }
    `
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${data.personalInfo.name || 'CV'} - Resume</title>
  <style>
    @page { size: A4; margin: 15mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.4; font-size: 10pt; color: #333; width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; background: white; }
    .header { display: flex; justify-content: space-between; margin-bottom: 12pt; }
    .header-info { flex: 1; }
    .contact { font-size: 9pt; color: #555; }
    .photo { width: 25mm; height: 32mm; object-fit: cover; border: 1px solid #d1d5db; }
    .section { margin-bottom: 10pt; }
    .entry { margin-bottom: 8pt; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: bold; font-size: 10pt; color: #333; }
    .entry-date { font-size: 9pt; font-weight: bold; color: #333; }
    .entry-subtitle { font-size: 9pt; color: #555; font-style: italic; }
    ul { margin: 3pt 0 0 12pt; }
    li { font-size: 9pt; margin-bottom: 1pt; color: #444; line-height: 1.3; }
    .skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3pt 8pt; font-size: 9pt; color: #444; }
    p { font-size: 9pt; line-height: 1.4; text-align: justify; }
    .bold { font-weight: bold; }
    ${templateStyles[template] || templateStyles.classic}
  </style>
</head>
<body>
  <div class="header">
    <div class="header-info">
      <h1>${data.personalInfo.name || 'AD SOYAD'}</h1>
      <div class="job-title">${data.personalInfo.title || (lang === 'tr' ? 'UNVAN' : 'JOB TITLE')}</div>
      <p class="contact">${[data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email].filter(Boolean).join(' | ') || 'Adres | Telefon | E-posta'}</p>
      ${data.personalInfo.militaryStatus ? `<p class="contact" style="margin-top: 3pt;">${lang === 'tr' ? 'Askerlik Durumu' : 'Military Status'}: ${data.personalInfo.militaryStatus}</p>` : ''}
    </div>
    ${data.photo ? `<img class="photo" src="${data.photo}" />` : ''}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.summary}</h2>
    <p>${data.summary || ''}</p>
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.experience}</h2>
    ${data.workExperience.map(exp => `
      <div class="entry">
        <div class="entry-header">
          <div><span class="entry-title">${exp.title}</span>, <span class="bold">${exp.company}</span>${exp.location ? `, ${exp.location}` : ''}</div>
          <span class="entry-date">${formatDate(exp.startDate)} — ${formatDate(exp.endDate)}</span>
        </div>
        ${exp.description.length > 0 ? `<ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.education}</h2>
    ${data.education.map(edu => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-title">${edu.degree} - ${edu.field}</span>
          <span class="entry-date">${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}</span>
        </div>
        <div class="entry-subtitle">${edu.institution}</div>
      </div>
    `).join('')}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.skills}</h2>
    ${data.skills.length > 0 ? `<div class="skills-grid">${data.skills.map(s => `<span>${s.name}</span>`).join('')}</div>` : ''}
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.additional}</h2>
    <ul>
      <li><span class="bold">${t.languages}:</span> ${data.additionalInfo?.languages || '-'}</li>
      <li><span class="bold">${t.certificates}:</span> ${data.additionalInfo?.certificates?.split('\n').filter(Boolean).join(', ') || '-'}</li>
      <li><span class="bold">${t.awards}:</span> ${data.additionalInfo?.awards?.split('\n').filter(Boolean).join(', ') || '-'}</li>
    </ul>
  </div>
  
  <div class="section">
    <h2 class="section-title">${lang === 'tr' ? 'REFERANSLAR' : 'REFERENCES'}</h2>
    ${referencesText}
  </div>
</body>
</html>`;
}

export default App;
