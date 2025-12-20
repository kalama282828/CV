# Supabase Kurulum Rehberi

Bu rehber, CV Builder projesinin Supabase veritabanı kurulumunu açıklar.

## 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adı ve şifre belirleyin
4. Region olarak en yakın lokasyonu seçin (örn: Frankfurt)

## 2. Veritabanı Tablolarını Oluşturma

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. `web/src/lib/database.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'a yapıştırın ve **Run** butonuna tıklayın

Bu SQL scripti şu tabloları oluşturacak:
- `profiles` - Kullanıcı profilleri (auth.users ile bağlantılı)
- `cvs` - Kullanıcı CV'leri
- `subscriptions` - Abonelikler
- `payments` - Ödemeler
- `site_settings` - Site ayarları
- `pricing_plans` - Fiyatlandırma planları
- `templates` - CV şablonları

## 3. Environment Variables

`web/.env` dosyasını oluşturun veya güncelleyin:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Bu değerleri Supabase Dashboard > Settings > API bölümünden alabilirsiniz.

## 4. Row Level Security (RLS)

SQL scripti otomatik olarak RLS politikalarını oluşturur:
- Kullanıcılar sadece kendi verilerini görebilir/düzenleyebilir
- Admin kullanıcılar tüm verilere erişebilir
- Site ayarları ve fiyatlandırma planları herkese açık (okuma)

## 5. Admin Kullanıcı Oluşturma

İlk admin kullanıcıyı oluşturmak için:

1. Normal kayıt işlemi yapın
2. Supabase Dashboard > Table Editor > profiles tablosuna gidin
3. Kullanıcınızın `role` alanını `admin` veya `super_admin` olarak değiştirin

## 6. Tablolar ve Alanlar

### profiles
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | auth.users ile bağlantılı |
| email | TEXT | E-posta |
| name | TEXT | Ad Soyad |
| phone | TEXT | Telefon |
| plan | TEXT | free/pro/business |
| has_purchased | BOOLEAN | Satın alma durumu |
| cv_count | INTEGER | CV sayısı |
| status | TEXT | active/inactive/banned |
| role | TEXT | user/admin/super_admin |

### cvs
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Primary key |
| user_id | UUID | Kullanıcı ID |
| title | TEXT | CV başlığı |
| template | TEXT | Şablon adı |
| personal_info | JSONB | Kişisel bilgiler |
| work_experience | JSONB | İş deneyimleri |
| education | JSONB | Eğitim bilgileri |
| skills | JSONB | Yetenekler |

### subscriptions
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Primary key |
| user_id | UUID | Kullanıcı ID |
| plan | TEXT | pro/business |
| billing_cycle | TEXT | monthly/yearly |
| amount | DECIMAL | Tutar |
| status | TEXT | active/cancelled/expired |
| start_date | TIMESTAMPTZ | Başlangıç tarihi |
| end_date | TIMESTAMPTZ | Bitiş tarihi |

### payments
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Primary key |
| user_id | UUID | Kullanıcı ID |
| type | TEXT | subscription/one-time |
| amount | DECIMAL | Tutar |
| status | TEXT | completed/pending/failed/refunded |
| method | TEXT | credit_card/bank_transfer/paypal |

## 7. Otomatik Trigger'lar

- **handle_new_user**: Yeni kullanıcı kaydında otomatik profil oluşturur
- **update_updated_at**: Tüm tablolarda güncelleme tarihini otomatik günceller

## 8. Test Etme

1. Uygulamayı başlatın: `npm run dev`
2. Kayıt olun ve giriş yapın
3. Admin paneline gidin: `/admin`
4. Site ayarlarını değiştirin ve kaydedin
5. Supabase Dashboard'da `site_settings` tablosunu kontrol edin

## Sorun Giderme

### "relation does not exist" hatası
SQL scriptini çalıştırdığınızdan emin olun.

### RLS politika hatası
Kullanıcının doğru role sahip olduğundan emin olun.

### Bağlantı hatası
`.env` dosyasındaki URL ve key değerlerini kontrol edin.
