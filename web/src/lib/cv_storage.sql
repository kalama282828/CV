-- CV Storage için ek SQL güncellemeleri
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- =====================================================
-- 1. CVS tablosu için INSERT politikası ekle
-- =====================================================

-- Mevcut politikayı kaldır ve yeniden oluştur
DROP POLICY IF EXISTS "Users can CRUD own CVs" ON public.cvs;

-- SELECT politikası
CREATE POLICY "Users can view own CVs" ON public.cvs
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT politikası
CREATE POLICY "Users can create own CVs" ON public.cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE politikası
CREATE POLICY "Users can update own CVs" ON public.cvs
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE politikası
CREATE POLICY "Users can delete own CVs" ON public.cvs
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. Profiles tablosunda has_purchased alanı kontrolü
-- =====================================================

-- has_purchased alanı yoksa ekle
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'has_purchased'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN has_purchased BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- =====================================================
-- 3. Profiles için INSERT politikası (yeni kullanıcı kaydı için)
-- =====================================================

-- Mevcut INSERT politikasını kontrol et ve ekle
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 4. Service role için tam erişim (Edge Functions için)
-- =====================================================

-- Service role bypass RLS
ALTER TABLE public.cvs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Subscriptions tablosu için aktif abonelik kontrolü
-- =====================================================

-- Aktif abonelik kontrolü için fonksiyon
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND status = 'active' 
    AND end_date > NOW()
  );
END;
$$;

-- =====================================================
-- 6. Kullanıcının PDF indirme yetkisi kontrolü
-- =====================================================

CREATE OR REPLACE FUNCTION public.can_export_pdf(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan TEXT;
  user_purchased BOOLEAN;
  has_subscription BOOLEAN;
BEGIN
  -- Profil bilgisini al
  SELECT plan, has_purchased INTO user_plan, user_purchased
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Pro veya Business planı varsa true
  IF user_plan IN ('pro', 'business') THEN
    RETURN TRUE;
  END IF;
  
  -- Tek seferlik ödeme yapmışsa true
  IF user_purchased = TRUE THEN
    RETURN TRUE;
  END IF;
  
  -- Aktif abonelik varsa true
  SELECT public.has_active_subscription(user_uuid) INTO has_subscription;
  IF has_subscription THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
