-- Site Settings Düzeltme SQL'i
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Önce mevcut RLS politikalarını kaldır (hata verirse devam et)
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can insert site settings" ON public.site_settings;

-- 2. Yeni RLS politikaları (herkes okuyabilir, herkes yazabilir - geliştirme için)
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update site settings" ON public.site_settings
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (true);

-- 3. Mevcut kaydı sil ve yeniden oluştur (varsayılan değerlerle)
DELETE FROM public.site_settings WHERE id = 1;

INSERT INTO public.site_settings (
  id,
  site_name,
  site_description,
  primary_color,
  secondary_color,
  contact_email,
  contact_phone,
  social_links,
  footer_text,
  maintenance_mode,
  hero_title,
  hero_subtitle,
  hero_button_text,
  hero_secondary_button_text,
  hero_trust_text,
  features_title,
  features_subtitle,
  feature1_title,
  feature1_description,
  feature2_title,
  feature2_description,
  feature3_title,
  feature3_description,
  how_it_works_title,
  how_it_works_subtitle,
  step1_title,
  step1_description,
  step2_title,
  step2_description,
  step3_title,
  step3_description,
  testimonials_title,
  testimonials_subtitle,
  cta_title,
  cta_subtitle,
  cta_button_text,
  nav_features,
  nav_pricing,
  nav_about,
  nav_login,
  nav_get_started,
  footer_product_title,
  footer_product_links,
  footer_company_title,
  footer_company_links
) VALUES (
  1,
  'CV Builder',
  'Profesyonel CV oluşturma platformu',
  '#135bec',
  '#1e3a5f',
  'info@cvbuilder.com',
  '+90 212 123 4567',
  '{}',
  '© 2024 CV Builder. Tüm hakları saklıdır.',
  false,
  'Dakikalar İçinde İş Kazandıran CV Oluşturun',
  'ATS uyumlu CV oluşturucumuzla hayalinizdeki işe ulaşan binlerce profesyonele katılın.',
  'CV Oluştur',
  'Örnekleri Gör',
  '10.000+ iş arayan tarafından güveniliyor',
  'Neden Bizi Seçmelisiniz?',
  'Araçlarımız, akıllı özelliklerle daha hızlı işe girmenize yardımcı olmak için tasarlandı.',
  'ATS Uyumlu',
  'Büyük işverenler tarafından kullanılan Başvuru Takip Sistemlerini geçmek için özel olarak tasarlanmış şablonlar.',
  'Akıllı Öneriler',
  'Deneyiminizi yazarken, iş unvanınıza özel uzman tavsiyeleri ve hazır ifadeler alın.',
  'Anında Dışa Aktarma',
  'Tamamlanmış CV''nizi tek tıklamayla PDF veya Word formatında indirin.',
  '3 Basit Adımda CV''nizi Oluşturun',
  'Saatlerce formatlama ile uğraşmayın. Deneyiminize odaklanın, tasarımı bize bırakın.',
  'Yükle veya Sıfırdan Başla',
  'Eski özgeçmişinizi yükleyerek bilgileri otomatik doldurun veya boş bir şablonla başlayın.',
  'Akıllı Araçlarla Düzenle',
  'İçeriği özelleştirin, renkleri değiştirin ve tek tıklamayla şablonları değiştirin.',
  'İndir ve Başvur',
  'Cilalı CV''nizi hemen alın ve hayalinizdeki işlere başvurmaya başlayın.',
  'Kullanıcılarımız Ne Diyor',
  'İşe giren insanların başarı hikayelerine katılın.',
  'Hayalinizdeki İşe Bir Adım Daha Yaklaşın',
  'Profesyonel CV''nizi dakikalar içinde oluşturun ve güvenle başvurmaya başlayın.',
  'Ücretsiz Başla',
  'Özellikler',
  'Fiyatlandırma',
  'Hakkımızda',
  'Giriş Yap',
  'Başla',
  'Ürün',
  '[{"text": "Özellikler", "url": "#features"}, {"text": "Fiyatlandırma", "url": "#pricing"}, {"text": "Şablonlar", "url": "#"}]',
  'Şirket',
  '[{"text": "Hakkımızda", "url": "#about"}, {"text": "Blog", "url": "#"}, {"text": "Kariyer", "url": "#"}]'
);

-- 4. Kontrol et
SELECT * FROM public.site_settings WHERE id = 1;
