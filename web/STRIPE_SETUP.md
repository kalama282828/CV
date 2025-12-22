# Stripe Entegrasyonu Kurulum Rehberi

## 1. Stripe Hesabı Oluşturma

1. [Stripe Dashboard](https://dashboard.stripe.com/register) adresinden hesap oluşturun
2. Hesabınızı doğrulayın

## 2. API Anahtarlarını Alma

1. [API Keys](https://dashboard.stripe.com/apikeys) sayfasına gidin
2. **Publishable key** (pk_test_...) ve **Secret key** (sk_test_...) anahtarlarını kopyalayın

## 3. Environment Variables

### Vercel'de Ayarlama

1. Vercel Dashboard > Project > Settings > Environment Variables
2. Aşağıdaki değişkenleri ekleyin:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### Lokal Geliştirme

`web/.env` dosyasına ekleyin:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

## 4. Supabase Edge Functions

### Secret Key Ekleme

Supabase Dashboard > Project Settings > Edge Functions > Secrets:

```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Edge Functions Deploy

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Login
supabase login

# Functions deploy
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

## 5. Webhook Yapılandırması

1. [Stripe Webhooks](https://dashboard.stripe.com/webhooks) sayfasına gidin
2. "Add endpoint" tıklayın
3. Endpoint URL:
   ```
   https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```
4. Events seçin:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Webhook signing secret'ı kopyalayın ve Supabase secrets'a ekleyin

## 6. Veritabanı Kurulumu

Supabase SQL Editor'da çalıştırın:

```sql
-- web/src/lib/payments.sql dosyasının içeriği
```

```sql
-- web/src/lib/stripe_settings.sql dosyasının içeriği
```

## 7. Test Etme

### Test Kartları

| Senaryo | Kart Numarası |
|---------|---------------|
| Başarılı ödeme | 4242 4242 4242 4242 |
| Reddedilen kart | 4000 0000 0000 0002 |
| 3D Secure | 4000 0025 0000 3155 |

- Son kullanma: Gelecekteki herhangi bir tarih
- CVC: Herhangi 3 rakam
- Posta kodu: Herhangi 5 rakam

### Test Akışı

1. `/app` sayfasına gidin
2. "PDF İndir" butonuna tıklayın
3. Ödeme modalında "Güvenli Ödeme" tıklayın
4. Stripe Checkout'ta test kartı ile ödeme yapın
5. Başarılı ödeme sonrası `/payment/success` sayfasına yönlendirileceksiniz
6. PDF indirme özelliği aktif olacak

## 8. Canlıya Alma

1. Stripe Dashboard'da "Activate your account" tamamlayın
2. Live API anahtarlarını alın (pk_live_..., sk_live_...)
3. Vercel ve Supabase'de live anahtarları ayarlayın
4. Webhook endpoint'i live mode için güncelleyin

## Sorun Giderme

### Ödeme başlatılamıyor
- `VITE_STRIPE_PUBLISHABLE_KEY` doğru ayarlandığından emin olun
- Browser console'da hata mesajlarını kontrol edin

### Webhook çalışmıyor
- Webhook URL'in doğru olduğundan emin olun
- Stripe Dashboard'da webhook delivery loglarını kontrol edin
- `STRIPE_WEBHOOK_SECRET` doğru ayarlandığından emin olun

### Ödeme durumu güncellenmiyor
- Supabase Edge Function loglarını kontrol edin
- `payments` tablosunun oluşturulduğundan emin olun
- RLS politikalarının doğru ayarlandığından emin olun
