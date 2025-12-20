import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export function SettingsPage() {
  const { siteSettings, updateSiteSettings } = useAdmin();
  const [settings, setSettings] = useState(siteSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSiteSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Site Ayarları</h1>
        {saved && <span className="saved-badge">✓ Kaydedildi</span>}
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h2>Genel Ayarlar</h2>
          
          <div className="form-group">
            <label>Site Adı</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={e => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Site Açıklaması</label>
            <textarea
              value={settings.siteDescription}
              onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="text"
              value={settings.logoUrl}
              onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
            />
            <small>Logo dosyasının URL'si veya yolu</small>
          </div>

          <div className="form-group">
            <label>Favicon URL</label>
            <input
              type="text"
              value={settings.faviconUrl}
              onChange={e => setSettings({ ...settings, faviconUrl: e.target.value })}
            />
            <small>Favicon dosyasının URL'si veya yolu</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>Renkler</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ana Renk</label>
              <div className="color-input">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>İkincil Renk</label>
              <div className="color-input">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })}
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="color-preview">
            <div className="preview-box" style={{ backgroundColor: settings.primaryColor }}>
              Ana Renk
            </div>
            <div className="preview-box" style={{ backgroundColor: settings.secondaryColor }}>
              İkincil Renk
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>İletişim Bilgileri</h2>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Sosyal Medya</h2>
          
          <div className="form-group">
            <label>Facebook</label>
            <input
              type="text"
              value={settings.socialLinks.facebook || ''}
              onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="form-group">
            <label>Twitter</label>
            <input
              type="text"
              value={settings.socialLinks.twitter || ''}
              onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="form-group">
            <label>Instagram</label>
            <input
              type="text"
              value={settings.socialLinks.instagram || ''}
              onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="text"
              value={settings.socialLinks.linkedin || ''}
              onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, linkedin: e.target.value } })}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Footer</h2>
          
          <div className="form-group">
            <label>Footer Metni</label>
            <input
              type="text"
              value={settings.footerText}
              onChange={e => setSettings({ ...settings, footerText: e.target.value })}
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Bakım Modu</h2>
          
          <div className="form-group">
            <label className="checkbox-label maintenance">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              <span>Bakım modunu etkinleştir</span>
            </label>
            <small className="warning">⚠️ Bakım modu etkinleştirildiğinde kullanıcılar siteye erişemez</small>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn primary large" onClick={handleSave}>
          💾 Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}
