import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { PricingPlan } from '../types';

export function PricingPage() {
  const { pricingPlans, updatePricingPlan } = useAdmin();
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const handleSave = () => {
    if (editingPlan) {
      updatePricingPlan(editingPlan.id, editingPlan);
      setEditingPlan(null);
    }
  };

  const addFeature = () => {
    if (editingPlan && newFeature.trim()) {
      setEditingPlan({
        ...editingPlan,
        features: [...editingPlan.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: editingPlan.features.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Fiyatlandırma</h1>
        <span className="count-badge">{pricingPlans.length} plan</span>
      </div>

      <div className="pricing-grid">
        {pricingPlans.map(plan => (
          <div key={plan.id} className={`pricing-card ${plan.isPopular ? 'popular' : ''} ${!plan.isActive ? 'inactive' : ''}`}>
            {plan.isPopular && <div className="popular-badge">EN POPÜLER</div>}
            {!plan.isActive && <div className="inactive-badge">PASİF</div>}
            
            <h3>{plan.name}</h3>
            <p className="plan-description">{plan.description}</p>
            
            <div className="plan-prices">
              <div className="price-item">
                <span className="price-label">Aylık</span>
                <span className="price-value">₺{plan.monthlyPrice}</span>
              </div>
              <div className="price-item">
                <span className="price-label">Yıllık</span>
                <span className="price-value">₺{plan.yearlyPrice}</span>
              </div>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>

            <button className="btn primary" onClick={() => setEditingPlan(plan)}>
              Düzenle
            </button>
          </div>
        ))}
      </div>

      {editingPlan && (
        <div className="modal-overlay" onClick={() => setEditingPlan(null)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Plan Düzenle: {editingPlan.name}</h2>
              <button className="close-btn" onClick={() => setEditingPlan(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Plan Adı</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Açıklama</label>
                  <input
                    type="text"
                    value={editingPlan.description}
                    onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Aylık Fiyat (₺)</label>
                  <input
                    type="number"
                    value={editingPlan.monthlyPrice}
                    onChange={e => setEditingPlan({ ...editingPlan, monthlyPrice: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Yıllık Fiyat (₺)</label>
                  <input
                    type="number"
                    value={editingPlan.yearlyPrice}
                    onChange={e => setEditingPlan({ ...editingPlan, yearlyPrice: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingPlan.isPopular}
                      onChange={e => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                    />
                    Popüler olarak işaretle
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingPlan.isActive}
                      onChange={e => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                    />
                    Aktif
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Özellikler</label>
                <div className="features-list">
                  {editingPlan.features.map((feature, i) => (
                    <div key={i} className="feature-item">
                      <span>{feature}</span>
                      <button className="btn-icon danger" onClick={() => removeFeature(i)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="add-feature">
                  <input
                    type="text"
                    placeholder="Yeni özellik ekle..."
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addFeature()}
                  />
                  <button className="btn secondary" onClick={addFeature}>Ekle</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setEditingPlan(null)}>İptal</button>
              <button className="btn primary" onClick={handleSave}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
