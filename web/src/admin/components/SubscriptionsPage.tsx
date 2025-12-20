import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Subscription } from '../types';

export function SubscriptionsPage() {
  const { subscriptions, updateSubscription, cancelSubscription } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

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

  const handleSave = () => {
    if (editingSub) {
      updateSubscription(editingSub.id, editingSub);
      setEditingSub(null);
    }
  };

  const handleCancel = (id: string) => {
    if (confirm('Bu aboneliği iptal etmek istediğinizden emin misiniz?')) {
      cancelSubscription(id);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Abonelikler</h1>
        <div className="header-stats">
          <span className="count-badge">{subscriptions.length} abonelik</span>
          <span className="revenue-badge">₺{totalRevenue.toLocaleString()} aktif gelir</span>
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
            {filteredSubs.map(sub => (
              <tr key={sub.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar">{sub.userName.charAt(0)}</div>
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
                      <button className="btn-icon danger" onClick={() => handleCancel(sub.id)} title="İptal Et">❌</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
                    onChange={e => setEditingSub({ ...editingSub, status: e.target.value as Subscription['status'] })}
                  >
                    <option value="active">Aktif</option>
                    <option value="cancelled">İptal</option>
                    <option value="expired">Süresi Dolmuş</option>
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
              <button className="btn secondary" onClick={() => setEditingSub(null)}>İptal</button>
              <button className="btn primary" onClick={handleSave}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
