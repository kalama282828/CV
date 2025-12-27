import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { pricingPlansService, type PricingPlan } from '../lib/database';

// LandingPage - Türkçe ana sayfa komponenti
export function LandingPage() {
  const navigate = useNavigate();
  const { settings, loading } = useSiteSettings();
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  // Fiyat planlarını veritabanından yükle
  useEffect(() => {
    const loadPricingPlans = async () => {
      const { data } = await pricingPlansService.getAllPlans();
      if (data) {
        setPricingPlans(data);
      }
    };
    loadPricingPlans();
  }, []);

  // Plana göre fiyat bilgisi al
  const getPlanPrice = (planId: string, type: 'monthly' | 'yearly' = 'monthly') => {
    const plan = pricingPlans.find(p => p.id === planId);
    if (!plan) return type === 'monthly' ? settings.oneTimePrice : settings.oneTimePrice;
    return type === 'monthly' ? plan.monthly_price : plan.yearly_price;
  };

  // Plana göre özellik listesi al
  const getPlanFeatures = (planId: string) => {
    const plan = pricingPlans.find(p => p.id === planId);
    return plan?.features || [];
  };

  const handleGetStarted = () => {
    try {
      const userData = localStorage.getItem('cv-user-data');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.isLoggedIn) { navigate('/app'); return; }
      }
    } catch { /* ignore */ }
    navigate('/kayit');
  };

  const handlePurchase = (plan: 'one-time' | 'pro' | 'business') => {
    // Seçilen planı localStorage'a kaydet
    localStorage.setItem('selected-plan', plan);
    // Kayıt sayfasına yönlendir
    navigate('/kayit?plan=' + plan);
  };

  // Veri yüklenene kadar loading göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="landing-page bg-[#f6f6f8] dark:bg-[#101622] text-[#111318] dark:text-white min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#f0f2f4] dark:bg-gray-900/90 dark:border-gray-800">
        <div className="px-4 md:px-10 lg:px-40 flex justify-center py-0">
          <div className="flex flex-col max-w-[960px] flex-1">
            <div className="flex items-center justify-between whitespace-nowrap py-3">
              <div className="flex items-center gap-4 text-[#111318] dark:text-white cursor-pointer">
                {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-auto" /> : <div className="size-8 flex items-center justify-center" style={{ color: settings.primaryColor }}><span className="material-symbols-outlined" style={{ fontSize: '32px' }}>description</span></div>}
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">{settings.siteName}</h2>
              </div>
              <div className="flex items-center gap-8">
                <nav className="hidden md:flex items-center gap-9">
                  <a className="text-[#111318] dark:text-gray-200 text-sm font-medium hover:text-[#135bec]" href="#features">{settings.navFeatures}</a>
                  <a className="text-[#111318] dark:text-gray-200 text-sm font-medium hover:text-[#135bec]" href="#pricing">{settings.navPricing}</a>
                  <a className="text-[#111318] dark:text-gray-200 text-sm font-medium hover:text-[#135bec]" href="#about">{settings.navAbout}</a>
                </nav>
                <div className="flex items-center gap-4">
                  <a className="hidden sm:block text-[#111318] dark:text-gray-200 text-sm font-medium hover:text-[#135bec]" href="/giris">{settings.navLogin}</a>
                  <button onClick={handleGetStarted} className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 text-white text-sm font-bold hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}><span>{settings.navGetStarted}</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900 py-10 md:py-20">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="max-w-[960px] w-full">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
                <div className="flex flex-col gap-6 flex-1 text-left">
                  <h1 className="text-[#111318] dark:text-white text-4xl font-black leading-tight md:text-5xl">{settings.heroTitle}</h1>
                  <h2 className="text-[#616f89] dark:text-gray-400 text-lg">{settings.heroSubtitle}</h2>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={handleGetStarted} className="flex min-w-[120px] items-center justify-center rounded-lg h-12 px-6 text-white font-bold shadow-lg" style={{ backgroundColor: settings.primaryColor }}>{settings.heroButtonText}</button>
                    <button className="flex min-w-[120px] items-center justify-center rounded-lg h-12 px-6 border border-[#dbdfe6] dark:border-gray-700 text-[#111318] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800">{settings.heroSecondaryButtonText}</button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#616f89]">
                    <div className="flex -space-x-2">
                      <img alt="Kullanıcı" className="w-6 h-6 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk3rv6AZ5-VKKQN1ehUhyS0v6Y7AYcwJl9s6-Er79P77MnZLwaoKk09MpPmNngkmivXj7MvVpi_tHROIGAnXyj57v4cPJg-EeYdJ4-equ-jrYThKfapzuJHMxm9bGdcYNOhMqVJe8IBcCdWwNOeb28SUkBB-9hBd4r9PIMX3iz5OVFbwYrca1jDzv9byD8Oy8fQmcs0g1k4muUq_MOzduXFMvv0KR9dCaF9GLr2K8-DEMYm7QB1I-RLF87rLmvEkBHzijSrzyCNOh-" />
                      <img alt="Kullanıcı" className="w-6 h-6 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEBY5JIQd9OqoKc4x-o3IhGrDBpmwfnVostY_Lr9inH5kNFat8m0BIF3rZ_zPqQXOX-b_BpbxBWMgIjmk1Oz5E0AgeBFBqTVl4yIsI0N-ZWulP2Mmv2be1dtY2hdG0fNLDnWjNOM0kIIW3CSdFVZ2UkYFrRWPuX_F9yeOFHQ2dhl8tnOdgkkUnFacPMOQxHE-clX4UnzdhvDCYf-nrewnVmgYQ0mxHZId8dVt-Bcrq91pmd5ES2ityNcChal9mqw0xgs-CvxYVua-g" />
                      <img alt="Kullanıcı" className="w-6 h-6 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcqZzcE3WtGvdzQK-RnAxHuDZkZDPGIqCwBW18ad2Bv6EOJV2riUWVoJtxYUAbcteQLVwKliMALL-OZ3qr69nSAiOF71DKCmfJjI84Id81tFZPisfIxCbHnanrt-sDBXvXu84aMS_f0evMeWrq3hBvdN6ugi5NQVNcAeQEH4bhwVzt6uLD61bsoTkIwdtvMYHYeYKTBPW2Z79yez9FPp8jqVCIWNMvoJlKXtgM2ojme1CrXhiHNn--nT2VE2ZJnbZtj1qzot1NkSmt" />
                    </div>
                    <span>{settings.heroTrustText}</span>
                  </div>
                </div>
                <div className="w-full flex-1">
                  <div className="w-full bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl aspect-[4/3] bg-gray-100 dark:bg-gray-800" style={{ backgroundImage: `url("${settings.heroImage}")` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-[#f6f6f8] dark:bg-gray-800/50 py-16">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="max-w-[960px] w-full flex flex-col gap-10">
              <div className="flex flex-col gap-4 text-center md:text-left">
                <h2 className="text-[#111318] dark:text-white text-3xl font-bold">{settings.featuresTitle}</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-base max-w-[720px]">{settings.featuresSubtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}15`, color: settings.primaryColor }}><span className="material-symbols-outlined text-[28px]">check_circle</span></div>
                  <h3 className="text-[#111318] dark:text-white text-lg font-bold">{settings.feature1Title}</h3>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm">{settings.feature1Description}</p>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}15`, color: settings.primaryColor }}><span className="material-symbols-outlined text-[28px]">lightbulb</span></div>
                  <h3 className="text-[#111318] dark:text-white text-lg font-bold">{settings.feature2Title}</h3>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm">{settings.feature2Description}</p>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}15`, color: settings.primaryColor }}><span className="material-symbols-outlined text-[28px]">download</span></div>
                  <h3 className="text-[#111318] dark:text-white text-lg font-bold">{settings.feature3Title}</h3>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm">{settings.feature3Description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white dark:bg-gray-900 py-16">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="max-w-[960px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <h2 className="text-[#111318] dark:text-white text-3xl font-bold">{settings.howItWorksTitle}</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-base mb-4">{settings.howItWorksSubtitle}</p>
                <div className="grid grid-cols-[40px_1fr] gap-x-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center" style={{ color: settings.primaryColor }}><span className="material-symbols-outlined text-[20px]">upload_file</span></div>
                    <div className="w-[2px] bg-[#f0f2f4] dark:bg-gray-800 h-10 grow my-2"></div>
                  </div>
                  <div className="flex flex-col pb-8">
                    <h3 className="text-[#111318] dark:text-white text-lg font-bold mb-1">{settings.step1Title}</h3>
                    <p className="text-[#616f89] dark:text-gray-400 text-sm">{settings.step1Description}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center" style={{ color: settings.primaryColor }}><span className="material-symbols-outlined text-[20px]">edit_document</span></div>
                    <div className="w-[2px] bg-[#f0f2f4] dark:bg-gray-800 h-10 grow my-2"></div>
                  </div>
                  <div className="flex flex-col pb-8">
                    <h3 className="text-[#111318] dark:text-white text-lg font-bold mb-1">{settings.step2Title}</h3>
                    <p className="text-[#616f89] dark:text-gray-400 text-sm">{settings.step2Description}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center" style={{ color: settings.primaryColor }}><span className="material-symbols-outlined text-[20px]">download_done</span></div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[#111318] dark:text-white text-lg font-bold mb-1">{settings.step3Title}</h3>
                    <p className="text-[#616f89] dark:text-gray-400 text-sm">{settings.step3Description}</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative w-full aspect-[3/4] bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-[#dbdfe6] dark:border-gray-700 shadow-xl">
                  <img alt="CV düzenleme" className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjnEk7rpnUH6tU0cx86qQ3kwYKWGVkMS3g1nE6Rhxl7vv0RALCDQKJ5Vff1f-r1ZzQtaT8IwgsL0C2AAsqApLAfktyxoQzTiuU2bSXwOFToXIZk5KtLewwb0yVF7Tv7dJP6sz8wNSY8jDlYVHU12M2jO0IiSMpQbV8dUc-gVqF_FvTe6-U7sKKiCE681_vc90CmiDU9w-N1uhvRVZ6hsGjJkW1uYOYO2TsaFVJvKiUt8fWC9LIbSIUApZ7XaC5y-3wEWC-A-Q6kho7" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-[#f6f6f8] dark:bg-gray-800/50 py-16">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="max-w-[960px] w-full flex flex-col gap-10">
              <div className="flex flex-col gap-4 text-center">
                <h2 className="text-[#111318] dark:text-white text-3xl font-bold">{settings.testimonialsTitle}</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-base">{settings.testimonialsSubtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-3">
                    <img alt="Kullanıcı" className="w-10 h-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk3rv6AZ5-VKKQN1ehUhyS0v6Y7AYcwJl9s6-Er79P77MnZLwaoKk09MpPmNngkmivXj7MvVpi_tHROIGAnXyj57v4cPJg-EeYdJ4-equ-jrYThKfapzuJHMxm9bGdcYNOhMqVJe8IBcCdWwNOeb28SUkBB-9hBd4r9PIMX3iz5OVFbwYrca1jDzv9byD8Oy8fQmcs0g1k4muUq_MOzduXFMvv0KR9dCaF9GLr2K8-DEMYm7QB1I-RLF87rLmvEkBHzijSrzyCNOh-" />
                    <div>
                      <p className="text-[#111318] dark:text-white font-medium">Ahmet Y.</p>
                      <p className="text-[#616f89] dark:text-gray-400 text-sm">Yazılım Mühendisi</p>
                    </div>
                  </div>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm">"Bu araç sayesinde 2 hafta içinde hayallerimin işini buldum. ATS uyumlu şablonlar gerçekten fark yarattı!"</p>
                  <div className="flex gap-1" style={{ color: settings.primaryColor }}>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-3">
                    <img alt="Kullanıcı" className="w-10 h-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEBY5JIQd9OqoKc4x-o3IhGrDBpmwfnVostY_Lr9inH5kNFat8m0BIF3rZ_zPqQXOX-b_BpbxBWMgIjmk1Oz5E0AgeBFBqTVl4yIsI0N-ZWulP2Mmv2be1dtY2hdG0fNLDnWjNOM0kIIW3CSdFVZ2UkYFrRWPuX_F9yeOFHQ2dhl8tnOdgkkUnFacPMOQxHE-clX4UnzdhvDCYf-nrewnVmgYQ0mxHZId8dVt-Bcrq91pmd5ES2ityNcChal9mqw0xgs-CvxYVua-g" />
                    <div>
                      <p className="text-[#111318] dark:text-white font-medium">Zeynep K.</p>
                      <p className="text-[#616f89] dark:text-gray-400 text-sm">Pazarlama Uzmanı</p>
                    </div>
                  </div>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm">"Akıllı öneriler özelliği harika! CV'mi profesyonel bir şekilde yazmama çok yardımcı oldu."</p>
                  <div className="flex gap-1" style={{ color: settings.primaryColor }}>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-center gap-3">
                    <img alt="Kullanıcı" className="w-10 h-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcqZzcE3WtGvdzQK-RnAxHuDZkZDPGIqCwBW18ad2Bv6EOJV2riUWVoJtxYUAbcteQLVwKliMALL-OZ3qr69nSAiOF71DKCmfJjI84Id81tFZPisfIxCbHnanrt-sDBXvXu84aMS_f0evMeWrq3hBvdN6ugi5NQVNcAeQEH4bhwVzt6uLD61bsoTkIwdtvMYHYeYKTBPW2Z79yez9FPp8jqVCIWNMvoJlKXtgM2ojme1CrXhiHNn--nT2VE2ZJnbZtj1qzot1NkSmt" />
                    <div>
                      <p className="text-[#111318] dark:text-white font-medium">Mehmet A.</p>
                      <p className="text-[#616f89] dark:text-gray-400 text-sm">Finans Analisti</p>
                    </div>
                  </div>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm">"Kullanımı çok kolay ve sonuçlar profesyonel. Kesinlikle tavsiye ederim!"</p>
                  <div className="flex gap-1" style={{ color: settings.primaryColor }}>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-white dark:bg-gray-900 py-16">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="max-w-[960px] w-full flex flex-col gap-10">
              <div className="flex flex-col gap-4 text-center">
                <h2 className="text-[#111318] dark:text-white text-3xl font-bold">{settings.navPricing}</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-base">İhtiyacınıza uygun planı seçin</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                  <h3 className="text-[#111318] dark:text-white text-xl font-bold">Tek Seferlik</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" style={{ color: settings.primaryColor }}>{getPlanPrice('one-time')}₺</span>
                    <span className="text-[#616f89] dark:text-gray-400 text-sm">/ tek seferlik</span>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm text-[#616f89] dark:text-gray-400">
                    {getPlanFeatures('one-time').length > 0 ? (
                      getPlanFeatures('one-time').map((feature, i) => (
                        <li key={i} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>{feature}</li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>1 CV indirme</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>Tüm şablonlar</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>PDF & Word formatı</li>
                      </>
                    )}
                  </ul>
                  <button onClick={handleGetStarted} className="mt-4 flex items-center justify-center rounded-lg h-10 px-4 border border-[#dbdfe6] dark:border-gray-700 text-[#111318] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800">Ücretsiz Başla</button>
                  <p className="text-xs text-center text-[#616f89]">PDF indirirken ödeme yapılır</p>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border-2 bg-white dark:bg-gray-900 p-6 relative" style={{ borderColor: settings.primaryColor }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: settings.primaryColor }}>Popüler</div>
                  <h3 className="text-[#111318] dark:text-white text-xl font-bold">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" style={{ color: settings.primaryColor }}>{getPlanPrice('pro')}₺</span>
                    <span className="text-[#616f89] dark:text-gray-400 text-sm">/ aylık</span>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm text-[#616f89] dark:text-gray-400">
                    {getPlanFeatures('pro').length > 0 ? (
                      getPlanFeatures('pro').map((feature, i) => (
                        <li key={i} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>{feature}</li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>Sınırsız CV</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>Premium şablonlar</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>Akıllı öneriler</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>Öncelikli destek</li>
                      </>
                    )}
                  </ul>
                  <button onClick={() => handlePurchase('pro')} className="mt-4 flex items-center justify-center rounded-lg h-10 px-4 text-white font-bold" style={{ backgroundColor: settings.primaryColor }}>Pro'ya Geç</button>
                </div>
                <div className="flex flex-col gap-4 rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                  <h3 className="text-[#111318] dark:text-white text-xl font-bold">İşletme</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" style={{ color: settings.primaryColor }}>{getPlanPrice('business')}₺</span>
                    <span className="text-[#616f89] dark:text-gray-400 text-sm">/ aylık</span>
                  </div>
                  <ul className="flex flex-col gap-2 text-sm text-[#616f89] dark:text-gray-400">
                    {getPlanFeatures('business').length > 0 ? (
                      getPlanFeatures('business').map((feature, i) => (
                        <li key={i} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>{feature}</li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>Takım yönetimi</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>Özel şablonlar</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>API erişimi</li>
                        <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check</span>7/24 destek</li>
                      </>
                    )}
                  </ul>
                  <button onClick={() => handlePurchase('business')} className="mt-4 flex items-center justify-center rounded-lg h-10 px-4 border border-[#dbdfe6] dark:border-gray-700 text-[#111318] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800">Satın Al</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16" style={{ backgroundColor: settings.primaryColor }}>
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="max-w-[960px] w-full text-center">
              <h2 className="text-white text-3xl font-bold mb-4">{settings.ctaTitle}</h2>
              <p className="text-white/80 text-lg mb-8">{settings.ctaSubtitle}</p>
              <button onClick={handleGetStarted} className="inline-flex items-center justify-center rounded-lg h-12 px-8 bg-white font-bold shadow-lg hover:bg-gray-100" style={{ color: settings.primaryColor }}>{settings.ctaButtonText}</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="bg-[#111318] text-white py-12">
        <div className="px-4 md:px-10 lg:px-40 flex justify-center">
          <div className="max-w-[960px] w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-auto" /> : <span className="material-symbols-outlined text-[28px]" style={{ color: settings.primaryColor }}>description</span>}
                  <span className="font-bold text-lg">{settings.siteName}</span>
                </div>
                <p className="text-gray-400 text-sm">{settings.siteDescription}</p>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-bold mb-2">{settings.footerProductTitle || 'Ürün'}</h4>
                {settings.footerProductLink1Text && <a href={settings.footerProductLink1Url || '#'} className="text-gray-400 text-sm hover:text-white">{settings.footerProductLink1Text}</a>}
                {settings.footerProductLink2Text && <a href={settings.footerProductLink2Url || '#'} className="text-gray-400 text-sm hover:text-white">{settings.footerProductLink2Text}</a>}
                {settings.footerProductLink3Text && <a href={settings.footerProductLink3Url || '#'} className="text-gray-400 text-sm hover:text-white">{settings.footerProductLink3Text}</a>}
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-bold mb-2">{settings.footerCompanyTitle || 'Şirket'}</h4>
                {settings.footerCompanyLink1Text && <a href={settings.footerCompanyLink1Url || '#'} className="text-gray-400 text-sm hover:text-white">{settings.footerCompanyLink1Text}</a>}
                {settings.footerCompanyLink2Text && <a href={settings.footerCompanyLink2Url || '#'} className="text-gray-400 text-sm hover:text-white">{settings.footerCompanyLink2Text}</a>}
                {settings.footerCompanyLink3Text && <a href={settings.footerCompanyLink3Url || '#'} className="text-gray-400 text-sm hover:text-white">{settings.footerCompanyLink3Text}</a>}
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-bold mb-2">İletişim</h4>
                <a href={`mailto:${settings.contactEmail}`} className="text-gray-400 text-sm hover:text-white">{settings.contactEmail}</a>
                <a href={`tel:${settings.contactPhone}`} className="text-gray-400 text-sm hover:text-white">{settings.contactPhone}</a>
                <div className="flex gap-3 mt-2">
                  {settings.socialLinks.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[20px]">public</span></a>}
                  {settings.socialLinks.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[20px]">public</span></a>}
                  {settings.socialLinks.linkedin && <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-[20px]">public</span></a>}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400 text-sm">{settings.footerText}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
