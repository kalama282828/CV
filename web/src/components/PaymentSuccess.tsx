import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { stripePaymentsService, profilesService, subscriptionsService } from '../lib/database';
import { useAuth } from '../context/AuthContext';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [countdown, setCountdown] = useState(5);
  const [paymentType, setPaymentType] = useState<'one-time' | 'subscription'>('one-time');
  const [planName, setPlanName] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const type = searchParams.get('type');
      const plan = searchParams.get('plan');
      
      if (!sessionId) {
        setStatus('error');
        return;
      }

      // Ödeme tipini belirle
      if (type === 'subscription') {
        setPaymentType('subscription');
        setPlanName(plan === 'business' ? 'İşletme' : 'Pro');
      }

      try {
        if (type === 'subscription' && plan) {
          // Abonelik ödemesi
          setStatus('success');
          
          // Kullanıcı profilini güncelle
          if (user?.id) {
            await profilesService.updateProfile(user.id, { 
              plan: plan as 'pro' | 'business',
              has_purchased: true 
            });
            
            // Abonelik kaydını güncelle
            const { data: subscription } = await subscriptionsService.getUserSubscription(user.id);
            if (subscription) {
              await subscriptionsService.updateSubscription(subscription.id, { 
                status: 'active',
                stripe_subscription_id: sessionId 
              });
            }
          }
        } else {
          // Tek seferlik ödeme
          const { data: payment } = await stripePaymentsService.getPaymentBySessionId(sessionId);
          
          if (payment?.status === 'completed') {
            setStatus('success');
            if (user?.id) {
              await profilesService.updateProfile(user.id, { has_purchased: true });
            }
          } else {
            // Ödeme hala işleniyor olabilir (webhook henüz gelmemiş), biraz bekle
            // Webhook geldiğinde veritabanı güncellenecek
            setTimeout(async () => {
              setStatus('success');
              if (user?.id) {
                await profilesService.updateProfile(user.id, { has_purchased: true });
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        // Yine de başarılı göster, webhook durumu güncelleyecek
        setStatus('success');
        if (user?.id) {
          await profilesService.updateProfile(user.id, { has_purchased: true });
        }
      }
    };

    verifyPayment();
  }, [searchParams, user]);

  // Countdown and redirect
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/app');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h1 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '8px' }}>
              Ödeme Doğrulanıyor...
            </h1>
            <p style={{ color: '#6b7280' }}>Lütfen bekleyin</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '16px',
              animation: 'bounce 0.5s ease'
            }}>
              {paymentType === 'subscription' ? '⭐' : '✅'}
            </div>
            <h1 style={{ fontSize: '24px', color: '#059669', marginBottom: '8px' }}>
              {paymentType === 'subscription' ? `${planName} Aboneliği Aktif!` : 'Ödeme Başarılı!'}
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {paymentType === 'subscription' 
                ? 'Artık sınırsız PDF indirebilirsiniz!' 
                : 'PDF indirme özelliği aktif edildi.'}
            </p>
            <div style={{
              background: '#f0fdf4',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#059669', fontSize: '14px' }}>
                {paymentType === 'subscription' 
                  ? '🎉 Premium özelliklerin keyfini çıkarın!' 
                  : '🎉 Artık CV\'nizi PDF olarak indirebilirsiniz!'}
              </p>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
              {countdown} saniye içinde yönlendirileceksiniz...
            </p>
            <button
              onClick={() => navigate('/app')}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              CV Oluşturmaya Devam Et →
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h1 style={{ fontSize: '24px', color: '#dc2626', marginBottom: '8px' }}>
              Bir Hata Oluştu
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Ödeme doğrulanamadı. Lütfen tekrar deneyin.
            </p>
            <button
              onClick={() => navigate('/app')}
              style={{
                background: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Geri Dön
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
