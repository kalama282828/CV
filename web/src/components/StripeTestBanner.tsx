import { isStripeTestMode, getStripePublishableKey } from '../lib/stripe';

export function StripeTestBanner() {
  const isConfigured = !!getStripePublishableKey();
  const isTestMode = isStripeTestMode();

  // Only show banner in test mode when Stripe is configured
  if (!isConfigured || !isTestMode) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
      color: '#78350f',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: 500,
      zIndex: 9999,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
    }}>
      <span style={{ fontSize: '16px' }}>🧪</span>
      <span>Stripe Test Modu Aktif - Gerçek ödeme alınmayacak</span>
      <a 
        href="https://stripe.com/docs/testing" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          color: '#78350f',
          textDecoration: 'underline',
          marginLeft: '8px'
        }}
      >
        Test kartları →
      </a>
    </div>
  );
}
