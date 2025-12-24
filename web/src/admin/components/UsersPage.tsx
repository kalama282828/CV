import { useState, useEffect } from 'react';
import { useAdmin, type AdminUser } from '../context/AdminContext';

export function UsersPage() {
  const { users, loadUsers, updateUser, deleteUser, loading } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      await updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        plan: editingUser.plan,
        status: editingUser.status,
        has_purchased: editingUser.hasPurchased,
      });
      setEditingUser(null);
    } catch (error) {
      alert('Kullanıcı güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Bu kullanıcıyı yasaklamak istediğinizden emin misiniz?')) {
      try {
        await deleteUser(id);
      } catch (error) {
        alert('Kullanıcı silinirken hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Kullanıcılar</h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#6b7280'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>⏳</span>
          Kullanıcılar yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Kullanıcılar</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="count-badge">{users.length} kullanıcı</span>
          <button 
            onClick={loadUsers}
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
          placeholder="İsim veya email ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="filter-select">
          <option value="all">Tüm Planlar</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
          <option value="banned">Yasaklı</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Telefon</th>
              <th>Plan</th>
              <th>Ödeme</th>
              <th>CV Sayısı</th>
              <th>Kayıt Tarihi</th>
              <th>Son Giriş</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
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
                  <td>{user.phone || '-'}</td>
                  <td><span className={`plan-badge ${user.plan}`}>{user.plan}</span></td>
                  <td>{user.hasPurchased ? <span className="badge success">Ödedi</span> : <span className="badge">Ödemedi</span>}</td>
                  <td>{user.cvCount}</td>
                  <td>{user.createdAt}</td>
                  <td>{user.lastLogin || '-'}</td>
                  <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setEditingUser(user)} title="Düzenle">✏️</button>
                      <button className="btn-icon danger" onClick={() => handleDeleteUser(user.id)} title="Yasakla">🚫</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  {search || filterPlan !== 'all' || filterStatus !== 'all' 
                    ? 'Filtrelere uygun kullanıcı bulunamadı' 
                    : 'Henüz kullanıcı yok'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Kullanıcı Düzenle</h2>
              <button className="close-btn" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>İsim</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plan</label>
                  <select
                    value={editingUser.plan}
                    onChange={e => setEditingUser({ ...editingUser, plan: e.target.value as AdminUser['plan'] })}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Durum</label>
                  <select
                    value={editingUser.status}
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as AdminUser['status'] })}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="banned">Yasaklı</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingUser.hasPurchased}
                    onChange={e => setEditingUser({ ...editingUser, hasPurchased: e.target.checked })}
                  />
                  Tek seferlik ödeme yaptı
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setEditingUser(null)} disabled={saving}>İptal</button>
              <button className="btn primary" onClick={handleSaveUser} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
