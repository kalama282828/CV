import { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UsersPage } from './components/UsersPage';
import { SubscriptionsPage } from './components/SubscriptionsPage';
import { PaymentsPage } from './components/PaymentsPage';
import { PricingPage } from './components/PricingPage';
import { TemplatesPage } from './components/TemplatesPage';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './components/LoginPage';
import './Admin.css';

function AdminPanelContent() {
  const { isAuthenticated } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <UsersPage />;
      case 'subscriptions': return <SubscriptionsPage />;
      case 'payments': return <PaymentsPage />;
      case 'pricing': return <PricingPage />;
      case 'templates': return <TemplatesPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export function AdminPanel() {
  return (
    <AdminProvider>
      <AdminPanelContent />
    </AdminProvider>
  );
}
