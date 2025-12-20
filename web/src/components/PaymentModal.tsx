interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
  price?: number;
}

export function PaymentModal({ isOpen, onClose, onPayment, price = 50 }: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-simple" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-icon">📄</div>
        
        <h2>CV İndirme</h2>
        <p className="modal-subtitle">Tek Seferlik Premium</p>
        
        {/* Price Card */}
        <div className="price-card">
          <div className="price-amount">₺{price}</div>
          <div className="price-badge">TEK SEFERLİK</div>
        </div>
        
        {/* Features */}
        <div className="feature-grid">
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
        </div>
        
        <button className="btn-pay" onClick={onPayment}>
          Hemen Öde →
        </button>
        
        <button className="btn-cancel" onClick={onClose}>
          Daha Sonra
        </button>
        
        <div className="modal-security">
          🔒 Güvenli ödeme altyapısı
        </div>
      </div>
    </div>
  );
}
