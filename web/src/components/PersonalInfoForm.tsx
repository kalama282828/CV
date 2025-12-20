import type { PersonalInfo } from '../types.ts';

interface Props {
  data: PersonalInfo;
  summary?: string;
  onChange: (data: PersonalInfo, summary?: string) => void;
}

export function PersonalInfoForm({ data, summary, onChange }: Props) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value }, summary);
  };

  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label>Ad Soyad *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ahmet Yılmaz"
          />
        </div>
        <div className="form-group">
          <label>Unvan / Pozisyon *</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Yazılım Mühendisi"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>E-posta *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="ahmet@email.com"
          />
        </div>
        <div className="form-group">
          <label>Telefon *</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+90 555 123 4567"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Konum *</label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="İstanbul, Türkiye"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>LinkedIn</label>
          <input
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/ahmetyilmaz"
          />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="ahmetyilmaz.com"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Profesyonel Özet</label>
        <textarea
          value={summary || ''}
          onChange={(e) => onChange(data, e.target.value)}
          placeholder="Kendinizi kısaca tanıtın..."
        />
      </div>
    </div>
  );
}
