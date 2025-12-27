import { useState } from 'react';
import { startCheckout, startSubscriptionCheckout, getStripePublishableKey, isStripeTestMode, type SubscriptionPlan } from '../lib/stripe';

export type PaymentType = 'one-time' | 'subscription';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  price?: number;
  amount?: number;
  planName?: string;
  userEmail?: string;
  paymentType?: PaymentType;
  subscriptionPlan?: SubscriptionPlan;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  price,
  amount,
  planName = 'CV İndirme',
  userEmail,
  paymentType = 'one-time',
  subscriptionPlan
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use amount if provided, otherwise fall back to price, then default to 50
  const finalPrice = amount ?? price ?? 50;
  const isSubscription = paymentType === 'subscription';

  if (!isOpen) return null;

  const isStripeConfigured = !!getStripePublishableKey();
  const isTestMode = isStripeTestMode();

  const handlePayment = async () => {
    if (!isStripeConfigured) {
      setError('Ödeme sistemi henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUrl = window.location.origin;
      
      if (isSubscription && subscriptionPlan) {
        // Aylık abonelik ödemesi
        // NOT: successUrl'e query param EKLEMİYORUZ çünkü Edge Function zaten ?session_id= ekliyor
        // type ve plan bilgisini Edge Function metadata'dan alacak
        await startSubscriptionCheckout({
          plan: subscriptionPlan,
          priceAmount: finalPrice,
          userEmail,
          successUrl: `${currentUrl}/payment/success`,
          cancelUrl: `${currentUrl}/payment/cancel`,
        });
      } else {
        // Tek seferlik ödeme
        await startCheckout({
          priceAmount: finalPrice,
          userEmail,
          successUrl: `${currentUrl}/payment/success`,
          cancelUrl: `${currentUrl}/payment/cancel`,
        });
      }
      
      // NOT: onPaymentSuccess burada ÇAĞRILMAMALI!
      // Stripe yönlendirmesi yapılacak, ödeme başarılı olursa
      // /payment/success sayfasına dönülecek ve orada işlenecek
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  // Fallback for when Stripe is not configured (demo mode)
  const handleDemoPayment = () => {
    onPaymentSuccess?.();
    onClose();
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-simple" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>×</button>
        
        {/* Test Mode Banner */}
        {isTestMode && isStripeConfigured && (
          <div style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🧪 Test Modu - Gerçek ödeme alınmayacak
          </div>
        )}
        
        <div className="modal-icon">{isSubscription ? '⭐' : '📄'}</div>
        
        <h2>{planName}</h2>
        <p className="modal-subtitle">
          {isSubscription ? 'Aylık Abonelik' : 'Tek Seferlik Premium'}
        </p>
        
        {/* Price Card */}
        <div className="price-card">
          <div className="price-amount">₺{finalPrice}</div>
          <div className="price-badge">
            {isSubscription ? 'AYLIK' : 'TEK SEFERLİK'}
          </div>
        </div>
        
        {/* Features */}
        <div className="feature-grid">
          {isSubscription ? (
            <>
              <div className="feature-item blue">
                <span className="feature-icon">∞</span>
                <span>Sınırsız PDF</span>
              </div>
              <div className="feature-item purple">
                <span className="feature-icon">⭐</span>
                <span>Premium Şablonlar</span>
              </div>
              <div className="feature-item green">
                <span className="feature-icon">🚀</span>
                <span>Öncelikli Destek</span>
              </div>
              <div className="feature-item yellow">
                <span className="feature-icon">🔄</span>
                <span>İstediğin Zaman İptal</span>
              </div>
            </>
          ) : (
            <>
              <div className="feature-item blue">
                <span className="feature-icon">📄</span>
                <span>PDF İndirme</span>
              </div>
              <div className="feature-item purple">
                <span className="feature-icon">⊞</span>
                <span>Tüm Şablonlar</span>
              </div>
              <div className="feature-item green">
                <span className="feature-icon">✏️</span>
                <span>Sınırsız Düzenleme</span>
              </div>
              <div className="feature-item yellow">
                <span className="feature-icon">✓</span>
                <span>ATS Uyumlu</span>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '12px',
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {isStripeConfigured ? (
          <button 
            className="btn-pay" 
            onClick={handlePayment}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px' 
                }}>⏳</span>
                Yönlendiriliyor...
              </>
            ) : (
              <>{isSubscription ? 'Aboneliği Başlat →' : 'Güvenli Ödeme →'}</>
            )}
          </button>
        ) : (
          <button 
            className="btn-pay" 
            onClick={handleDemoPayment}
          >
            Demo: Hemen Öde →
          </button>
        )}
        
        <button className="btn-cancel" onClick={onClose} disabled={loading}>
          Daha Sonra
        </button>
        
        <div className="modal-security">
          🔒 {isStripeConfigured ? 'Stripe ile güvenli ödeme' : 'Güvenli ödeme altyapısı'}
        </div>

        {/* Subscription Info */}
        {isSubscription && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            Aboneliğinizi istediğiniz zaman iptal edebilirsiniz
          </div>
        )}

        {/* Stripe Badge */}
        {isStripeConfigured && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            Powered by <span style={{ fontWeight: 'bold', color: '#635bff' }}>Stripe</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
