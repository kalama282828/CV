-- Supabase Database Schema for CV Builder
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- =====================================================
-- 1. USERS PROFILE TABLE (auth.users ile bağlantılı)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  has_purchased BOOLEAN DEFAULT FALSE,
  cv_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 2. CVS TABLE (Kullanıcı CV'leri)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Untitled CV',
  template TEXT DEFAULT 'classic',
  language TEXT DEFAULT 'tr',
  personal_info JSONB DEFAULT '{}',
  photo TEXT,
  summary TEXT,
  work_experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  additional_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own CVs" ON public.cvs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all CVs" ON public.cvs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- =====================================================
-- 3. SUBSCRIPTIONS TABLE (Abonelikler)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'business')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 4. PAYMENTS TABLE (Ödemeler)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'one-time')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  method TEXT CHECK (method IN ('credit_card', 'bank_transfer', 'paypal', 'stripe')),
  stripe_payment_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- =====================================================
-- 5. SITE_SETTINGS TABLE (Site Ayarları - Tek satır)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT DEFAULT 'CV Builder',
  site_description TEXT DEFAULT 'Profesyonel CV oluşturma platformu',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#135bec',
  secondary_color TEXT DEFAULT '#1e3a5f',
  contact_email TEXT DEFAULT 'info@cvbuilder.com',
  contact_phone TEXT DEFAULT '+90 212 123 4567',
  social_links JSONB DEFAULT '{}',
  footer_text TEXT DEFAULT '© 2024 CV Builder. Tüm hakları saklıdır.',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  hero_button_text TEXT,
  hero_secondary_button_text TEXT,
  hero_trust_text TEXT,
  features_title TEXT,
  features_subtitle TEXT,
  feature1_title TEXT,
  feature1_description TEXT,
  feature2_title TEXT,
  feature2_description TEXT,
  feature3_title TEXT,
  feature3_description TEXT,
  how_it_works_title TEXT,
  how_it_works_subtitle TEXT,
  step1_title TEXT,
  step1_description TEXT,
  step2_title TEXT,
  step2_description TEXT,
  step3_title TEXT,
  step3_description TEXT,
  testimonials_title TEXT,
  testimonials_subtitle TEXT,
  cta_title TEXT,
  cta_subtitle TEXT,
  cta_button_text TEXT,
  nav_features TEXT,
  nav_pricing TEXT,
  nav_about TEXT,
  nav_login TEXT,
  nav_get_started TEXT,
  footer_product_title TEXT,
  footer_product_links JSONB DEFAULT '[]',
  footer_company_title TEXT,
  footer_company_links JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- =====================================================
-- 6. PRICING_PLANS TABLE (Fiyatlandırma Planları)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) DEFAULT 0,
  yearly_price DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pricing plans" ON public.pricing_plans
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pricing plans" ON public.pricing_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- =====================================================
-- 7. TEMPLATES TABLE (CV Şablonları)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read templates" ON public.templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON public.templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );


-- =====================================================
-- 8. FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_cvs_updated_at ON public.cvs;
CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON public.cvs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON public.pricing_plans;
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_templates_updated_at ON public.templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- =====================================================
-- 9. INITIAL DATA
-- =====================================================

-- Insert default site settings
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert default pricing plans
INSERT INTO public.pricing_plans (id, name, description, monthly_price, yearly_price, features, is_popular, sort_order) VALUES
  ('free', 'Ücretsiz', 'Başlangıç için ideal', 0, 0, '["1 CV oluşturma", "Temel şablonlar", "Önizleme"]', false, 1),
  ('one-time', 'Tek Seferlik', 'Sadece PDF indirme', 50, 50, '["PDF indirme", "Tüm şablonlar", "Sınırsız düzenleme", "ATS uyumlu"]', false, 2),
  ('pro', 'Pro', 'Profesyoneller için', 99.99, 999.99, '["Sınırsız CV", "Tüm şablonlar", "PDF indirme", "ATS uyumlu", "Öncelikli destek"]', true, 3),
  ('business', 'Business', 'Şirketler için', 249.99, 2499.99, '["Tüm Pro özellikleri", "Takım yönetimi", "API erişimi", "Özel şablonlar", "7/24 destek"]', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert default templates
INSERT INTO public.templates (id, name, description, is_premium, sort_order) VALUES
  ('classic', 'Klasik', 'Geleneksel ve profesyonel görünüm', false, 1),
  ('modern', 'Modern', 'Çağdaş ve minimalist tasarım', false, 2),
  ('minimal', 'Minimal', 'Sade ve şık görünüm', true, 3),
  ('pastel', 'Pastel', 'Yumuşak renklerle modern tasarım', true, 4)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON public.cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
