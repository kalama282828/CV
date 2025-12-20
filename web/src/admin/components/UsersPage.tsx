import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { User } from '../types';

export function UsersPage() {
  const { users, updateUser, deleteUser } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, editingUser);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      deleteUser(id);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Kullanıcılar</h1>
        <span className="count-badge">{users.length} kullanıcı</span>
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
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar">{user.name.charAt(0)}</div>
                    <div>
                      <div className="name">{user.name}</div>
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
                    <button className="btn-icon danger" onClick={() => handleDeleteUser(user.id)} title="Sil">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
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
                  value={editingUser.name}
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
                    onChange={e => setEditingUser({ ...editingUser, plan: e.target.value as User['plan'] })}
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
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as User['status'] })}
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
              <button className="btn secondary" onClick={() => setEditingUser(null)}>İptal</button>
              <button className="btn primary" onClick={handleSaveUser}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
