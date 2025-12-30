import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import { pricingPlansService, type PricingPlan } from '../lib/database';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useSiteSettings();
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  
  // Seçilen plan (URL'den veya localStorage'dan)
  const selectedPlan = searchParams.get('plan') || localStorage.getItem('selected-plan');

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

  // Plan bilgisini göster - pricing_plans tablosundan çek
  const getPlanInfo = () => {
    const proPlan = pricingPlans.find(p => p.id === 'pro');
    const businessPlan = pricingPlans.find(p => p.id === 'business');
    
    switch (selectedPlan) {
      case 'pro': return { name: 'Pro Plan', price: proPlan?.monthly_price || settings.proMonthlyPrice };
      case 'business': return { name: 'İşletme Plan', price: businessPlan?.monthly_price || settings.businessMonthlyPrice };
      default: return null;
    }
  };
  const planInfo = getPlanInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    if (!acceptTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Bu e-posta adresi zaten kayıtlı.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch {
      setError('Google ile kayıt yapılamadı.');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#101622] p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111318] dark:text-white mb-4">Kayıt Başarılı!</h1>
          <p className="text-[#616f89] dark:text-slate-400 mb-6">
            E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.
          </p>
          {planInfo && (
            <p className="text-[#616f89] dark:text-slate-400 mb-4">
              Seçtiğiniz plan: <strong>{planInfo.name}</strong> - Giriş yaptıktan sonra ödeme yapabilirsiniz.
            </p>
          )}
          <button 
            onClick={() => navigate('/giris')}
            className="bg-[#135bec] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Giriş Sayfasına Git
          </button>
        </div>
      </div>
    );
  }

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
            Kariyerinize bugün başlayın.
          </h1>
          <p className="text-lg lg:text-xl text-blue-100 font-medium leading-relaxed">
            Ücretsiz hesap oluşturun ve profesyonel CV'nizi dakikalar içinde hazırlayın.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="text-blue-100">ATS uyumlu şablonlar</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="text-blue-100">Sınırsız düzenleme</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="text-blue-100">Canlı önizleme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-[#101622]">
        <div className="w-full max-w-[440px] flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8" style={{ color: settings.primaryColor }}>
            <span className="material-symbols-outlined text-[32px]">description</span>
            <h2 className="text-[#111318] dark:text-white text-xl font-bold">{settings.siteName}</h2>
          </div>

          {/* Page Heading */}
          <div className="mb-6">
            <p className="text-[#111318] dark:text-white tracking-tight text-[32px] font-bold leading-tight mb-2">
              Hesap Oluştur
            </p>
            <p className="text-[#616f89] dark:text-slate-400 text-base font-normal">
              Ücretsiz kaydolun ve CV'nizi oluşturmaya başlayın.
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
                Kayıt olduktan sonra ödeme sayfasına yönlendirileceksiniz.
              </p>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Name Field */}
            <label className="flex flex-col flex-1">
              <p className="text-[#111318] dark:text-slate-200 text-sm font-semibold pb-2">Ad Soyad</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input 
                  className="flex w-full min-w-0 flex-1 rounded-lg rounded-r-none text-[#111318] dark:text-white dark:bg-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 border border-[#dbdfe6] dark:border-gray-700 bg-white focus:border-[#135bec] h-12 placeholder:text-[#616f89] p-4 border-r-0 text-base transition-all"
                  placeholder="Ahmet Yılmaz"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="text-[#616f89] flex border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1a2332] items-center justify-center pr-4 pl-2 rounded-r-lg border-l-0">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
              </div>
            </label>

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
                  placeholder="En az 8 karakter"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
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

            {/* Confirm Password Field */}
            <label className="flex flex-col flex-1">
              <p className="text-[#111318] dark:text-slate-200 text-sm font-semibold pb-2">Şifre Tekrar</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input 
                  className="flex w-full min-w-0 flex-1 rounded-lg rounded-r-none text-[#111318] dark:text-white dark:bg-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 border border-[#dbdfe6] dark:border-gray-700 bg-white focus:border-[#135bec] h-12 placeholder:text-[#616f89] p-4 border-r-0 text-base transition-all"
                  placeholder="Şifrenizi tekrar girin"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <div className="text-[#616f89] flex border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1a2332] items-center justify-center pr-4 pl-2 rounded-r-lg border-l-0">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
              </div>
            </label>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 mt-2">
              <input 
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#135bec] border-gray-300 rounded focus:ring-[#135bec]"
              />
              <span className="text-[#616f89] dark:text-slate-400 text-sm">
                <a href="#" className="text-[#135bec] hover:underline">Kullanım Koşulları</a> ve{' '}
                <a href="#" className="text-[#135bec] hover:underline">Gizlilik Politikası</a>'nı kabul ediyorum.
              </span>
            </label>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-[#135bec] text-white text-base font-bold hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md hover:shadow-lg shadow-blue-500/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Veya şununla kaydol</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-3">
            <button 
              type="button"
              onClick={handleGoogleSignUp}
              className="flex w-full items-center justify-center gap-3 rounded-lg h-12 border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1a2332] hover:bg-gray-50 dark:hover:bg-[#252f40] transition-colors text-[#111318] dark:text-white font-medium text-sm"
            >
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-GD5L3_2b2Ru-v9dc8uMf6b2bak0b_5r6zInOhGJPDMTIfLBljuo4-fkgWz-ESOqHI2ocjcrFxsCi1TmAIWn-_9XcR8VLhDUo7R9d0-bzb4UvwUvHOe6uuw5KlHWu8f3mXttLNZfQW5t-DdoWfCGh06EUqbb9UrUWdFipYXPFrAY_e4g8lRmh70L5YpzIALZPggHNyz6s50TwKTeb-m87KM2xMx8KChRMb_v_x0xBExnVAC2Yh5CgX8uYmlIEqY50_CsfHvay-YZS" />
              Google ile Kaydol
            </button>
          </div>

          {/* Footer Login */}
          <div className="mt-6 text-center">
            <p className="text-[#616f89] dark:text-slate-400 text-sm">
              Zaten hesabınız var mı? 
              <a className="text-[#135bec] font-bold hover:underline ml-1" href={selectedPlan ? `/giris?plan=${selectedPlan}` : '/giris'}>Giriş Yap</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
