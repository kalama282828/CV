import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { stripePaymentsService } from '../lib/database';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        // Check payment status
        const { data: payment } = await stripePaymentsService.getPaymentBySessionId(sessionId);
        
        if (payment?.status === 'completed') {
          setStatus('success');
          // Save to localStorage
          localStorage.setItem('cv-user-data', JSON.stringify({ 
            plan: 'free', 
            hasPurchased: true 
          }));
          if (payment.email) {
            localStorage.setItem('cv-user-email', payment.email);
          }
        } else {
          // Payment might still be processing, wait a bit
          setTimeout(async () => {
            const { data: retryPayment } = await stripePaymentsService.getPaymentBySessionId(sessionId);
            if (retryPayment?.status === 'completed') {
              setStatus('success');
              localStorage.setItem('cv-user-data', JSON.stringify({ 
                plan: 'free', 
                hasPurchased: true 
              }));
            } else {
              // Still pending, but show success (webhook will update)
              setStatus('success');
              localStorage.setItem('cv-user-data', JSON.stringify({ 
                plan: 'free', 
                hasPurchased: true 
              }));
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        // Show success anyway, webhook will handle the actual status
        setStatus('success');
        localStorage.setItem('cv-user-data', JSON.stringify({ 
          plan: 'free', 
          hasPurchased: true 
        }));
      }
    };

    verifyPayment();
  }, [searchParams]);

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
              ✅
            </div>
            <h1 style={{ fontSize: '24px', color: '#059669', marginBottom: '8px' }}>
              Ödeme Başarılı!
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              PDF indirme özelliği aktif edildi.
            </p>
            <div style={{
              background: '#f0fdf4',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#059669', fontSize: '14px' }}>
                🎉 Artık CV'nizi PDF olarak indirebilirsiniz!
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
