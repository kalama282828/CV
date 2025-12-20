// import React from 'react';
import { useAdmin } from '../context/AdminContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Kullanıcılar', icon: '👥' },
  { id: 'subscriptions', label: 'Abonelikler', icon: '💳' },
  { id: 'payments', label: 'Ödemeler', icon: '💰' },
  { id: 'pricing', label: 'Fiyatlandırma', icon: '🏷️' },
  { id: 'templates', label: 'Şablonlar', icon: '📄' },
  { id: 'settings', label: 'Site Ayarları', icon: '⚙️' },
];

export function Sidebar({ activeTab, setActiveTab }: Props) {
  const { logout, siteSettings } = useAdmin();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📄</span>
          <span className="logo-text">{siteSettings.siteName}</span>
        </div>
        <span className="admin-badge">Admin</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <span>🚪</span> Çıkış Yap
        </button>
      </div>
    </div>
  );
}
