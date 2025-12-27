-- Site Settings tablosuna fiyat alanları ekleme
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Fiyat alanlarını ekle
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS one_time_price DECIMAL(10,2) DEFAULT 50,
ADD COLUMN IF NOT EXISTS pro_monthly_price DECIMAL(10,2) DEFAULT 99.99,
ADD COLUMN IF NOT EXISTS pro_yearly_price DECIMAL(10,2) DEFAULT 999.99,
ADD COLUMN IF NOT EXISTS business_monthly_price DECIMAL(10,2) DEFAULT 249.99,
ADD COLUMN IF NOT EXISTS business_yearly_price DECIMAL(10,2) DEFAULT 2499.99;

-- Mevcut kaydı güncelle (eğer varsa)
UPDATE public.site_settings 
SET 
  one_time_price = COALESCE(one_time_price, 50),
  pro_monthly_price = COALESCE(pro_monthly_price, 99.99),
  pro_yearly_price = COALESCE(pro_yearly_price, 999.99),
  business_monthly_price = COALESCE(business_monthly_price, 249.99),
  business_yearly_price = COALESCE(business_yearly_price, 2499.99)
WHERE id = 1;

-- Yorum ekle
COMMENT ON COLUMN public.site_settings.one_time_price IS 'Tek seferlik PDF indirme fiyatı (TRY)';
COMMENT ON COLUMN public.site_settings.pro_monthly_price IS 'Pro plan aylık fiyatı (TRY)';
COMMENT ON COLUMN public.site_settings.pro_yearly_price IS 'Pro plan yıllık fiyatı (TRY)';
COMMENT ON COLUMN public.site_settings.business_monthly_price IS 'Business plan aylık fiyatı (TRY)';
COMMENT ON COLUMN public.site_settings.business_yearly_price IS 'Business plan yıllık fiyatı (TRY)';
