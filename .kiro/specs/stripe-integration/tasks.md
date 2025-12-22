# Implementation Plan

- [x] 1. Veritabanı ve Altyapı Kurulumu
  - [x] 1.1 Supabase'de payments tablosu oluştur
    - SQL migration dosyası oluştur
    - RLS politikalarını ekle
    - Index'leri oluştur
    - _Requirements: 2.1, 4.1_
  - [x] 1.2 Site settings tablosuna Stripe alanları ekle
    - stripe_publishable_key, stripe_mode kolonları
    - _Requirements: 3.1_
  - [x] 1.3 Environment variables yapılandır
    - VITE_STRIPE_PUBLISHABLE_KEY ekle
    - Stripe secret key için Supabase secrets
    - _Requirements: 5.1, 5.2_

- [x] 2. Stripe Servis Katmanı
  - [x] 2.1 Stripe.js kütüphanesini kur ve stripe.ts oluştur
    - npm install @stripe/stripe-js
    - initStripe, redirectToCheckout fonksiyonları
    - _Requirements: 1.1_
  - [x] 2.2 Write property test for price conversion
    - **Property 1: Price Consistency**
    - **Validates: Requirements 1.2, 3.2**
  - [x] 2.3 Database service'e payment fonksiyonları ekle
    - createPaymentRecord, updatePaymentStatus, checkPaymentStatus
    - _Requirements: 2.1, 2.2_
  - [x] 2.4 Write property test for payment status check
    - **Property 4: Payment Status Enables Feature**
    - **Validates: Requirements 2.2**

- [x] 3. Supabase Edge Functions
  - [x] 3.1 create-checkout-session edge function oluştur
    - Stripe Checkout Session oluşturma
    - Price ve metadata ayarlama
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 3.2 stripe-webhook edge function oluştur
    - Webhook signature doğrulama
    - checkout.session.completed event handling
    - Database güncelleme
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 3.3 Write property test for webhook signature validation
    - **Property 7: Webhook Signature Validation**
    - **Validates: Requirements 4.2**

- [x] 4. Frontend Entegrasyonu
  - [x] 4.1 PaymentModal.tsx'i Stripe ile güncelle
    - Stripe Checkout'a yönlendirme
    - Loading state ekleme
    - Error handling
    - _Requirements: 1.1, 1.5_
  - [x] 4.2 App.tsx'de payment status kontrolü ekle
    - Sayfa yüklendiğinde status kontrol
    - canExportPDF state güncelleme
    - _Requirements: 2.2, 2.3_
  - [x] 4.3 Success/Cancel sayfaları oluştur
    - /payment/success route
    - /payment/cancel route
    - _Requirements: 1.3, 1.4_
  - [x] 4.4 Write property test for UI payment status
    - **Property 5: UI Reflects Payment Status**
    - **Validates: Requirements 2.4**

- [x] 5. Admin Panel Güncellemeleri
  - [x] 5.1 SettingsPage'e Stripe ayarları ekle
    - Publishable key input
    - Test/Live mode toggle
    - Yapılandırma uyarısı
    - _Requirements: 3.1, 3.3_
  - [x] 5.2 SiteSettingsContext'e Stripe alanları ekle
    - stripePublishableKey, stripeMode
    - _Requirements: 3.1, 3.2_
  - [x] 5.3 Write property test for environment key selection
    - **Property 8: Environment-Based Key Selection**
    - **Validates: Requirements 5.1, 5.2**

- [x] 6. Test Mode Göstergesi
  - [x] 6.1 Test mode banner komponenti oluştur
    - Stripe test modunda görünür banner
    - _Requirements: 5.3_

- [x] 7. Checkpoint - Tüm testlerin geçtiğinden emin ol
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Deployment ve Yapılandırma
  - [x] 8.1 Vercel environment variables ekle
    - VITE_STRIPE_PUBLISHABLE_KEY
    - _Requirements: 5.1, 5.2_
  - [x] 8.2 Supabase Edge Functions deploy et
    - create-checkout-session
    - stripe-webhook
    - _Requirements: 1.1, 4.1_
  - [x] 8.3 Stripe webhook endpoint yapılandır
    - Stripe Dashboard'da webhook URL ekle
    - checkout.session.completed event seç
    - _Requirements: 4.1_

- [x] 9. Final Checkpoint - Tüm testlerin geçtiğinden emin ol
  - Ensure all tests pass, ask the user if questions arise.
