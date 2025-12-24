import { useState, useEffect } from 'react';
import { useAdmin, type AdminSubscription } from '../context/AdminContext';

export function SubscriptionsPage() {
  const { subscriptions, loadSubscriptions, updateSubscription, cancelSubscription, loading } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingSub, setEditingSub] = useState<AdminSubscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(search.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const handleSave = async () => {
    if (!editingSub) return;
    
    setSaving(true);
    try {
      await updateSubscription(editingSub.id, {
        plan: editingSub.plan,
        billing_cycle: editingSub.billingCycle,
        amount: editingSub.amount,
        status: editingSub.status,
        start_date: editingSub.startDate,
        end_date: editingSub.endDate,
        auto_renew: editingSub.autoRenew,
      });
      setEditingSub(null);
    } catch (error) {
      alert('Abonelik güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Bu aboneliği iptal etmek istediğinizden emin misiniz?')) {
      setCancelling(id);
      try {
        await cancelSubscription(id);
      } catch (error) {
        alert('Abonelik iptal edilirken hata oluştu');
      } finally {
        setCancelling(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Abonelikler</h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#6b7280'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>⏳</span>
          Abonelikler yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Abonelikler</h1>
        <div className="header-stats">
          <span className="count-badge">{subscriptions.length} abonelik</span>
          <span className="revenue-badge">₺{totalRevenue.toLocaleString()} aktif gelir</span>
          <button 
            onClick={loadSubscriptions}
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

      <div className="filters">
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="filter-select">
          <option value="all">Tüm Planlar</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="cancelled">İptal</option>
          <option value="expired">Süresi Dolmuş</option>
          <option value="pending">Bekliyor</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Plan</th>
              <th>Dönem</th>
              <th>Tutar</th>
              <th>Başlangıç</th>
              <th>Bitiş</th>
              <th>Otomatik Yenileme</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length > 0 ? (
              filteredSubs.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{sub.userName.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="name">{sub.userName}</div>
                        <div className="email">{sub.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`plan-badge ${sub.plan}`}>{sub.plan}</span></td>
                  <td>{sub.billingCycle === 'monthly' ? 'Aylık' : 'Yıllık'}</td>
                  <td>₺{sub.amount}</td>
                  <td>{sub.startDate}</td>
                  <td>{sub.endDate}</td>
                  <td>{sub.autoRenew ? <span className="badge success">Evet</span> : <span className="badge">Hayır</span>}</td>
                  <td><span className={`status-badge ${sub.status}`}>{sub.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setEditingSub(sub)} title="Düzenle">✏️</button>
                      {sub.status === 'active' && (
                        <button 
                          className="btn-icon danger" 
                          onClick={() => handleCancel(sub.id)} 
                          title="İptal Et"
                          disabled={cancelling === sub.id}
                        >
                          {cancelling === sub.id ? '⏳' : '❌'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  {search || filterPlan !== 'all' || filterStatus !== 'all' 
                    ? 'Filtrelere uygun abonelik bulunamadı' 
                    : 'Henüz abonelik yok'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingSub && (
        <div className="modal-overlay" onClick={() => setEditingSub(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Abonelik Düzenle</h2>
              <button className="close-btn" onClick={() => setEditingSub(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Kullanıcı</label>
                <input type="text" value={editingSub.userName} disabled />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plan</label>
                  <select
                    value={editingSub.plan}
                    onChange={e => setEditingSub({ ...editingSub, plan: e.target.value as 'pro' | 'business' })}
                  >
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dönem</label>
                  <select
                    value={editingSub.billingCycle}
                    onChange={e => setEditingSub({ ...editingSub, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                  >
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tutar (₺)</label>
                  <input
                    type="number"
                    value={editingSub.amount}
                    onChange={e => setEditingSub({ ...editingSub, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Durum</label>
                  <select
                    value={editingSub.status}
                    onChange={e => setEditingSub({ ...editingSub, status: e.target.value as AdminSubscription['status'] })}
                  >
                    <option value="active">Aktif</option>
                    <option value="cancelled">İptal</option>
                    <option value="expired">Süresi Dolmuş</option>
                    <option value="pending">Bekliyor</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={editingSub.startDate}
                    onChange={e => setEditingSub({ ...editingSub, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={editingSub.endDate}
                    onChange={e => setEditingSub({ ...editingSub, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingSub.autoRenew}
                    onChange={e => setEditingSub({ ...editingSub, autoRenew: e.target.checked })}
                  />
                  Otomatik yenileme
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setEditingSub(null)} disabled={saving}>İptal</button>
              <button className="btn primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
