import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export function LoginPage() {
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!login(email, password)) {
      setError('Geçersiz email veya şifre');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">📄</span>
            <span className="logo-text">CV Maker</span>
          </div>
          <h1>Admin Paneli</h1>
          <p>Yönetim paneline erişmek için giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@cvmaker.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn primary large full-width">
            Giriş Yap
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-info">
            Demo: <code>admin@cvmaker.com</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
