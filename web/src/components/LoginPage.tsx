import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { pricingPlansService, type PricingPlan } from '../lib/database';
import type { SubscriptionPlan } from '../lib/stripe';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useSiteSettings();
  const { signIn, signInWithGoogle, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  // Fiyat planlarını yükle
  useEffect(() => {
    const loadPricing = async () => {
      const { data } = await pricingPlansService.getAllPlans();
      if (data) setPricingPlans(data);
    };
    loadPricing();
  }, []);

  // Seçilen plan (URL'den veya localStorage'dan)
  const selectedPlan = searchParams.get('plan') || localStorage.getItem('selected-plan');

  // Plan bilgisini göster - önce pricing_plans tablosundan, yoksa settings'den
  const getPlanInfo = (): { name: string; price: number; isSubscription: boolean; subscriptionPlan?: SubscriptionPlan } | null => {
    const proPlan = pricingPlans.find(p => p.id === 'pro');
    const businessPlan = pricingPlans.find(p => p.id === 'business');
    
    switch (selectedPlan) {
      case 'pro': 
        return { 
          name: 'Pro Plan', 
          price: proPlan?.monthly_price || settings.proMonthlyPrice || 99.99, 
          isSubscription: true, 
          subscriptionPlan: 'pro' 
        };
      case 'business': 
        return { 
          name: 'İşletme Plan', 
          price: businessPlan?.monthly_price || settings.businessMonthlyPrice || 249.99, 
          isSubscription: true, 
          subscriptionPlan: 'business' 
        };
      default: return null;
    }
  };
  const planInfo = getPlanInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? 'E-posta veya şifre hatalı' 
          : error.message);
      } else {
        // Seçilen plan varsa ödeme modalını aç
        if (selectedPlan && (selectedPlan === 'pro' || selectedPlan === 'business')) {
          setShowPaymentModal(true);
        } else {
          navigate('/app');
        }
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // Google login sonrası redirect olacak, plan kontrolü App.tsx'de yapılacak
    } catch {
      setError('Google ile giriş yapılamadı.');
    }
  };

  const handlePaymentSuccess = () => {
    // Ödeme başarılı, planı temizle ve app'e yönlendir
    localStorage.removeItem('selected-plan');
    setShowPaymentModal(false);
    navigate('/app');
  };

  const handlePaymentClose = () => {
    // Ödeme iptal, planı temizle ve app'e yönlendir
    localStorage.removeItem('selected-plan');
    setShowPaymentModal(false);
    navigate('/app');
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column: Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#135bec] items-center justify-center overflow-hidden">
        <img 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" 
          alt="Modern office architecture"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgCHz_EKV56nnUVtu7b7ifFnpQkRZWL0zmpGbjb0_Eij-guHqSZQXM8BUP99d6HhNaP5-XsEdb54R6CxrS2VuptKQT_P5V2au-oGwpF4A_SF5qqpPi0x5w2fgjBtKKVytGtH3XJyXWFEBz2MoDpvf34DpCSC9qQvdme7jOGHCS6JzbWnT87j-F8IGmHwEpNQsKEaXaKnkpzCwpKO4s_LW1qdMNXz4tAGDzlF9KsTx7UnCE1cjBpzi5iz8NKEwO5xgdV6gpVAa1cQ--"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#135bec]/90 to-[#135bec]/40"></div>
        
        <div className="relative z-10 max-w-lg px-12 text-white">
          <div className="mb-8 size-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">description</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Profesyonel hikayenizi hassasiyetle oluşturun.
          </h1>
          <p className="text-lg lg:text-xl text-blue-100 font-medium leading-relaxed">
            Akıllı CV oluşturucumuzla kariyerlerini hızlandıran binlerce iş arayana katılın.
          </p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-[#135bec]" alt="User 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD-vQ-xQX2qFGUYtXrbMIvgC4496S9bCbZ0Broz4kmUpUwbVoopGn0pnlicwaKMNVRgUWjKyyEgR0QhNfyduTRRBL5buqFKg9nau9hfDiNGTksU_nNleRb3R5mQJf3Iqzj2JlN_R1Y8d1lc_p_yAW-0yZu4kBA8SjStO-Wk01Zxu9QMbjY2JeqH2mfS62cmP8iEkaP5Xl6dXp9r-s7mC9PRzG0m0q8MD2p1hEjDontCCuO-7M01B-fOBRptvWE2vX8T5UBhZilMzdp" />
              <img className="w-10 h-10 rounded-full border-2 border-[#135bec]" alt="User 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFdgc6QA7PJswrYDpnbLmRRY2uMAwNvBW3SeAAmYVBgyF9cO_cQhVexH7UPqkoSqKewS4JQWBM-FHJ7MFQ6ltx2TGZUWUGv2zrCtOPP8yh8TTDAtkIGAMVZTo_xk3SDIl9wftW08qCD6QWocZ-JGFUUKhZoyLZ7yji9rStOkHmM74Bch9EGB6MhgdyOxSl421CYL1lSHj2vBkEJHmdIU2NmD8p0TA-PD1p70GfLrB0jWBwiENkkF7TibTIOOO3xa-GpGWPuNbDyN0m" />
              <img className="w-10 h-10 rounded-full border-2 border-[#135bec]" alt="User 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlhfLbJ0-PrrrqVfiyCI9R2cDH-5X1NC-yD--1T2E7NBq2P9LnNVinZHPbfd-61DOtpR6cJKcD2j6XUm_G40Q6ZieuU8wJcjytQCx7e3VsF8VWrCL6snc42K7nJ9qywH7rDt_1p4juGgYgiwTe73TAOp66fCy53OkEiH9qRkAlEJXoEtOhuMbElLOSQR6Y5sw9d3TzFwsH7nJx65K7nXqr7uk9V-u5zxezZUsIks2SWwnszn2YzVX7XIDgDmkYlMxtp2tqCe2-fr0m" />
              <div className="w-10 h-10 rounded-full border-2 border-[#135bec] bg-white text-[#135bec] flex items-center justify-center text-xs font-bold">+2k</div>
            </div>
            <p className="text-blue-100 text-sm font-medium">Dünya çapında profesyoneller tarafından güveniliyor</p>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-[#101622]">
        <div className="w-full max-w-[440px] flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8" style={{ color: settings.primaryColor }}>
            <span className="material-symbols-outlined text-[32px]">description</span>
            <h2 className="text-[#111318] dark:text-white text-xl font-bold">{settings.siteName}</h2>
          </div>

          {/* Page Heading */}
          <div className="mb-8">
            <p className="text-[#111318] dark:text-white tracking-tight text-[32px] font-bold leading-tight mb-2">
              Geleceğinizi inşa edin.
            </p>
            <p className="text-[#616f89] dark:text-slate-400 text-base font-normal">
              CV paneline erişmek için giriş yapın.
            </p>
          </div>

          {/* Selected Plan Banner */}
          {planInfo && (
            <div className="mb-6 p-4 rounded-lg border-2 border-[#135bec] bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#135bec] font-bold text-sm">Seçilen Plan</p>
                  <p className="text-[#111318] dark:text-white font-bold text-lg">{planInfo.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#135bec] font-bold text-2xl">{planInfo.price}₺</p>
                  <p className="text-[#616f89] text-xs">/ aylık</p>
                </div>
              </div>
              <p className="text-[#616f89] dark:text-slate-400 text-xs mt-2">
                Giriş yaptıktan sonra ödeme sayfasına yönlendirileceksiniz.
              </p>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <label className="flex flex-col flex-1">
              <p className="text-[#111318] dark:text-slate-200 text-sm font-semibold pb-2">E-posta Adresi</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input 
                  className="flex w-full min-w-0 flex-1 rounded-lg rounded-r-none text-[#111318] dark:text-white dark:bg-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 border border-[#dbdfe6] dark:border-gray-700 bg-white focus:border-[#135bec] h-12 placeholder:text-[#616f89] p-4 border-r-0 text-base transition-all"
                  placeholder="ornek@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="text-[#616f89] flex border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1a2332] items-center justify-center pr-4 pl-2 rounded-r-lg border-l-0">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
              </div>
            </label>

            {/* Password Field */}
            <label className="flex flex-col flex-1">
              <p className="text-[#111318] dark:text-slate-200 text-sm font-semibold pb-2">Şifre</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input 
                  className="flex w-full min-w-0 flex-1 rounded-lg rounded-r-none text-[#111318] dark:text-white dark:bg-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 border border-[#dbdfe6] dark:border-gray-700 bg-white focus:border-[#135bec] h-12 placeholder:text-[#616f89] p-4 border-r-0 text-base transition-all"
                  placeholder="********"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#616f89] flex border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1a2332] items-center justify-center pr-4 pl-2 rounded-r-lg border-l-0 hover:text-[#135bec] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </label>

            {/* Forgot Password */}
            <div className="flex justify-end -mt-1">
              <a className="text-[#135bec] text-sm font-medium hover:underline" href="#">Şifremi Unuttum?</a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-[#135bec] text-white text-base font-bold hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md hover:shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Veya şununla devam et</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg h-12 border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1a2332] hover:bg-gray-50 dark:hover:bg-[#252f40] transition-colors text-[#111318] dark:text-white font-medium text-sm"
            >
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-GD5L3_2b2Ru-v9dc8uMf6b2bak0b_5r6zInOhGJPDMTIfLBljuo4-fkgWz-ESOqHI2ocjcrFxsCi1TmAIWn-_9XcR8VLhDUo7R9d0-bzb4UvwUvHOe6uuw5KlHWu8f3mXttLNZfQW5t-DdoWfCGh06EUqbb9UrUWdFipYXPFrAY_e4g8lRmh70L5YpzIALZPggHNyz6s50TwKTeb-m87KM2xMx8KChRMb_v_x0xBExnVAC2Yh5CgX8uYmlIEqY50_CsfHvay-YZS" />
              Google ile Giriş Yap
            </button>
          </div>

          {/* Footer Sign Up */}
          <div className="mt-8 text-center">
            <p className="text-[#616f89] dark:text-slate-400 text-sm">
              Hesabınız yok mu? 
              <a className="text-[#135bec] font-bold hover:underline ml-1" href={selectedPlan ? `/kayit?plan=${selectedPlan}` : '/kayit'}>Hesap Oluştur</a>
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {planInfo && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          onPaymentSuccess={handlePaymentSuccess}
          amount={planInfo.price}
          planName={planInfo.name}
          userEmail={email}
          paymentType={planInfo.isSubscription ? 'subscription' : 'one-time'}
          subscriptionPlan={planInfo.subscriptionPlan}
          currentPlan={profile?.plan || 'free'}
        />
      )}
    </div>
  );
}
