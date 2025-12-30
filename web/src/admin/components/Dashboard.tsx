import { useEffect, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';

export function Dashboard() {
  const { dashboardStats, users, subscriptions, payments, loading, refreshAll } = useAdmin();

  // Aktif gelir hesapla: aktif abonelikler + tamamlanmış ödemeler
  const activeRevenue = useMemo(() => {
    const subscriptionRevenue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0);
    
    const paymentRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return subscriptionRevenue + paymentRevenue;
  }, [subscriptions, payments]);

  useEffect(() => {
    refreshAll();
  }, []);

  const recentUsers = users.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#6b7280'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>⏳</span>
          Veriler yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Dashboard</h1>
        <button 
          onClick={refreshAll}
          style={{
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔄 Yenile
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Toplam Kullanıcı</div>
          </div>
          <div className="stat-change positive">+{dashboardStats.newUsersToday} bugün</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats.activeSubscriptions}</div>
            <div className="stat-label">Aktif Abonelik</div>
          </div>
          <div className="stat-change positive">%{dashboardStats.conversionRate} dönüşüm</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">₺{activeRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Aktif Gelir</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">₺{dashboardStats.monthlyRevenue.toLocaleString()}</div>
            <div className="stat-label">Aylık Gelir</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Son Kayıt Olan Kullanıcılar</h3>
            <span className="badge">{users.length} toplam</span>
          </div>
          {recentUsers.length > 0 ? (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>İsim</th>
                  <th>Plan</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{(user.name || user.email).charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="name">{user.name || 'İsimsiz'}</div>
                          <div className="email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`plan-badge ${user.plan}`}>{user.plan}</span></td>
                    <td>{user.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
              Henüz kullanıcı yok
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Son Ödemeler</h3>
            <span className="badge">₺{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
          </div>
          {recentPayments.length > 0 ? (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{payment.userName.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="name">{payment.userName}</div>
                          <div className="email">{payment.type === 'subscription' ? 'Abonelik' : 'Tek Seferlik'}</div>
                        </div>
                      </div>
                    </td>
                    <td>₺{payment.amount}</td>
                    <td><span className={`status-badge ${payment.status}`}>{payment.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
              Henüz ödeme yok
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Plan Dağılımı</h3>
          </div>
          {users.length > 0 ? (
            <div className="plan-distribution">
              <div className="plan-bar">
                <div className="plan-segment free" style={{ width: `${(users.filter(u => u.plan === 'free').length / users.length) * 100}%` }}>
                  <span>Free ({users.filter(u => u.plan === 'free').length})</span>
                </div>
                <div className="plan-segment pro" style={{ width: `${(users.filter(u => u.plan === 'pro').length / users.length) * 100}%` }}>
                  <span>Pro ({users.filter(u => u.plan === 'pro').length})</span>
                </div>
                <div className="plan-segment business" style={{ width: `${(users.filter(u => u.plan === 'business').length / users.length) * 100}%` }}>
                  <span>Business ({users.filter(u => u.plan === 'business').length})</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
              Veri yok
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Abonelik Durumu</h3>
          </div>
          <div className="subscription-stats">
            <div className="sub-stat">
              <span className="sub-count">{subscriptions.filter(s => s.status === 'active').length}</span>
              <span className="sub-label">Aktif</span>
            </div>
            <div className="sub-stat">
              <span className="sub-count">{subscriptions.filter(s => s.status === 'cancelled').length}</span>
              <span className="sub-label">İptal</span>
            </div>
            <div className="sub-stat">
              <span className="sub-count">{subscriptions.filter(s => s.status === 'expired').length}</span>
              <span className="sub-label">Süresi Dolmuş</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
