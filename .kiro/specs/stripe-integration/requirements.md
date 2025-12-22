# Requirements Document

## Introduction

Bu özellik, CV Builder uygulamasına Stripe ödeme entegrasyonu ekleyerek kullanıcıların PDF indirme özelliği için güvenli ödeme yapabilmesini sağlar. Mevcut simüle edilmiş ödeme sistemi yerine gerçek Stripe Checkout entegrasyonu kullanılacaktır.

## Glossary

- **Stripe**: Online ödeme işleme platformu
- **Stripe Checkout**: Stripe'ın barındırılan ödeme sayfası çözümü
- **Payment Intent**: Stripe'da bir ödeme işlemini temsil eden nesne
- **Publishable Key**: İstemci tarafında kullanılan Stripe API anahtarı
- **Secret Key**: Sunucu tarafında kullanılan gizli Stripe API anahtarı
- **Webhook**: Stripe'dan gelen ödeme bildirimleri için endpoint
- **CV Builder**: CV oluşturma web uygulaması
- **PDF İndirme**: Ödeme sonrası kullanıcıya sunulan premium özellik

## Requirements

### Requirement 1

**User Story:** As a user, I want to pay for PDF download feature using my credit card, so that I can securely purchase the premium feature.

#### Acceptance Criteria

1. WHEN a user clicks the "Hemen Öde" button THEN the CV Builder SHALL redirect the user to Stripe Checkout page
2. WHEN the Stripe Checkout page loads THEN the CV Builder SHALL display the correct price from site settings
3. WHEN a user completes payment successfully THEN the CV Builder SHALL redirect the user back to the application with success status
4. WHEN a user cancels payment THEN the CV Builder SHALL redirect the user back to the application without granting access
5. IF the payment fails THEN the CV Builder SHALL display an appropriate error message to the user

### Requirement 2

**User Story:** As a user, I want my payment status to be saved, so that I can access PDF download feature after payment without paying again.

#### Acceptance Criteria

1. WHEN a payment is completed successfully THEN the CV Builder SHALL store the payment status in Supabase database
2. WHEN a user with completed payment visits the application THEN the CV Builder SHALL automatically enable PDF download feature
3. WHEN checking payment status THEN the CV Builder SHALL verify the status from the database on page load
4. WHILE a user has active payment status THEN the CV Builder SHALL hide the price indicator on PDF download button

### Requirement 3

**User Story:** As an admin, I want to configure Stripe settings, so that I can manage payment integration without code changes.

#### Acceptance Criteria

1. WHEN an admin accesses the settings page THEN the CV Builder SHALL provide fields for Stripe API keys configuration
2. WHEN the price is updated in admin settings THEN the CV Builder SHALL use the updated price for Stripe Checkout
3. WHEN Stripe keys are not configured THEN the CV Builder SHALL display a warning message in admin panel

### Requirement 4

**User Story:** As a system, I want to receive payment confirmations via webhooks, so that payment status is reliably updated even if the user closes the browser.

#### Acceptance Criteria

1. WHEN Stripe sends a checkout.session.completed webhook THEN the CV Builder SHALL update the user's payment status in database
2. WHEN processing webhook events THEN the CV Builder SHALL verify the webhook signature for security
3. IF a webhook event is received for an unknown session THEN the CV Builder SHALL log the event and ignore it gracefully

### Requirement 5

**User Story:** As a developer, I want Stripe integration to work in both test and production modes, so that I can safely test payments before going live.

#### Acceptance Criteria

1. WHEN the application runs in development mode THEN the CV Builder SHALL use Stripe test API keys
2. WHEN the application runs in production mode THEN the CV Builder SHALL use Stripe live API keys
3. WHEN test mode is active THEN the CV Builder SHALL display a visual indicator showing test mode status
