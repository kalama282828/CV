import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Template } from '../../lib/database';

export function TemplatesPage() {
  const { templates, updateTemplate } = useAdmin();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleSave = () => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, editingTemplate);
      setEditingTemplate(null);
    }
  };

  const toggleActive = (id: string, is_active: boolean) => {
    updateTemplate(id, { is_active: !is_active });
  };

  const togglePremium = (id: string, is_premium: boolean) => {
    updateTemplate(id, { is_premium: !is_premium });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Şablonlar</h1>
        <span className="count-badge">{templates.length} şablon</span>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className={`template-card ${!template.is_active ? 'inactive' : ''}`}>
            <div className="template-preview">
              <div className="template-placeholder">
                <span>📄</span>
                <span>{template.name}</span>
              </div>
              {template.is_premium && <div className="premium-badge">PREMIUM</div>}
              {!template.is_active && <div className="inactive-overlay">PASİF</div>}
            </div>
            
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <div className="template-stats">
                <span>📊 {template.usage_count.toLocaleString()} kullanım</span>
              </div>
            </div>

            <div className="template-actions">
              <button 
                className={`toggle-btn ${template.is_active ? 'active' : ''}`}
                onClick={() => toggleActive(template.id, template.is_active)}
              >
                {template.is_active ? '✓ Aktif' : '✗ Pasif'}
              </button>
              <button 
                className={`toggle-btn ${template.is_premium ? 'premium' : ''}`}
                onClick={() => togglePremium(template.id, template.is_premium)}
              >
                {template.is_premium ? '⭐ Premium' : '○ Ücretsiz'}
              </button>
              <button className="btn secondary" onClick={() => setEditingTemplate(template)}>
                Düzenle
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingTemplate && (
        <div className="modal-overlay" onClick={() => setEditingTemplate(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Şablon Düzenle: {editingTemplate.name}</h2>
              <button className="close-btn" onClick={() => setEditingTemplate(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Şablon Adı</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={editingTemplate.description || ''}
                  onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Önizleme URL</label>
                <input
                  type="text"
                  value={editingTemplate.preview_url || ''}
                  onChange={e => setEditingTemplate({ ...editingTemplate, preview_url: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingTemplate.is_active}
                      onChange={e => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                    />
                    Aktif
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingTemplate.is_premium}
                      onChange={e => setEditingTemplate({ ...editingTemplate, is_premium: e.target.checked })}
                    />
                    Premium
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setEditingTemplate(null)}>İptal</button>
              <button className="btn primary" onClick={handleSave}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
