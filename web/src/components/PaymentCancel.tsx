import { useNavigate } from 'react-router-dom';

export function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
        <h1 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '8px' }}>
          Ödeme İptal Edildi
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Ödeme işlemi tamamlanmadı. Dilediğiniz zaman tekrar deneyebilirsiniz.
        </p>
        
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            💡 CV'nizi ücretsiz olarak HTML formatında indirebilirsiniz.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            CV Oluşturmaya Devam Et
          </button>
          
          <button
            onClick={() => {
              navigate('/app');
              // Trigger payment modal after navigation
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('openPaymentModal'));
              }, 500);
            }}
            style={{
              background: 'transparent',
              color: '#6366f1',
              border: '2px solid #6366f1',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
}
