import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

export function PaymentsPage() {
  const { payments, loadPayments, refundPayment, loading } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refunding, setRefunding] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(search.toLowerCase()) ||
                         payment.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || payment.type === filterType;
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCompleted = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);

  const handleRefund = async (id: string) => {
    if (confirm('Bu ödemeyi iade etmek istediğinizden emin misiniz?')) {
      setRefunding(id);
      try {
        await refundPayment(id);
      } catch (error) {
        alert('Ödeme iade edilirken hata oluştu');
      } finally {
        setRefunding(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Ödemeler</h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#6b7280'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>⏳</span>
          Ödemeler yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ödemeler</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="count-badge">{payments.length} ödeme</span>
          <button 
            onClick={loadPayments}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      <div className="payment-stats">
        <div className="payment-stat completed">
          <span className="stat-label">Tamamlanan</span>
          <span className="stat-value">₺{totalCompleted.toLocaleString()}</span>
        </div>
        <div className="payment-stat pending">
          <span className="stat-label">Bekleyen</span>
          <span className="stat-value">₺{totalPending.toLocaleString()}</span>
        </div>
        <div className="payment-stat refunded">
          <span className="stat-label">İade Edilen</span>
          <span className="stat-value">₺{totalRefunded.toLocaleString()}</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
          <option value="all">Tüm Tipler</option>
          <option value="subscription">Abonelik</option>
          <option value="one-time">Tek Seferlik</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">Tüm Durumlar</option>
          <option value="completed">Tamamlandı</option>
          <option value="pending">Bekliyor</option>
          <option value="failed">Başarısız</option>
          <option value="refunded">İade Edildi</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı</th>
              <th>Tip</th>
              <th>Tutar</th>
              <th>Yöntem</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td><code style={{ fontSize: '11px' }}>{payment.id.slice(0, 8)}...</code></td>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{payment.userName.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="name">{payment.userName}</div>
                        <div className="email">{payment.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${payment.type}`}>
                      {payment.type === 'subscription' ? '💳 Abonelik' : '💵 Tek Seferlik'}
                    </span>
                  </td>
                  <td className="amount">₺{payment.amount}</td>
                  <td>
                    {payment.method === 'credit_card' && '💳 Kredi Kartı'}
                    {payment.method === 'bank_transfer' && '🏦 Banka Transferi'}
                    {payment.method === 'stripe' && '💳 Stripe'}
                    {!payment.method && '-'}
                  </td>
                  <td>{payment.date}</td>
                  <td><span className={`status-badge ${payment.status}`}>{payment.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      {payment.status === 'completed' && (
                        <button 
                          className="btn-icon danger" 
                          onClick={() => handleRefund(payment.id)} 
                          title="İade Et"
                          disabled={refunding === payment.id}
                        >
                          {refunding === payment.id ? '⏳' : '↩️'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  {search || filterType !== 'all' || filterStatus !== 'all' 
                    ? 'Filtrelere uygun ödeme bulunamadı' 
                    : 'Henüz ödeme yok'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
