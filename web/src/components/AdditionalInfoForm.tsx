import { useRef, useCallback } from 'react';
import type { AdditionalInfo } from '../types.ts';

interface Props {
  data: AdditionalInfo;
  photo?: string;
  onChange: (data: AdditionalInfo, photo?: string) => void;
}

export function AdditionalInfoForm({ data, photo, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Güncel data ve photo'yu ref'te tut - asenkron callback'lerde kullanmak için
  const dataRef = useRef(data);
  const photoRef = useRef(photo);
  dataRef.current = data;
  photoRef.current = photo;

  const handleChange = (field: keyof AdditionalInfo, value: string) => {
    // photoRef.current kullanarak güncel photo'yu koru
    onChange({ ...data, [field]: value }, photoRef.current);
  };

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Fotoğraf 2MB\'dan küçük olmalı');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        // dataRef.current kullanarak güncel data'yı al
        onChange(dataRef.current, base64);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const handleRemovePhoto = useCallback(() => {
    onChange(dataRef.current, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <div>
      {/* Photo Upload */}
      <div className="form-group">
        <label>Profil Fotoğrafı</label>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div 
            style={{
              width: 100,
              height: 120,
              border: '2px dashed #d1d5db',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              background: '#f9fafb',
            }}
          >
            {photo ? (
              <img 
                src={photo} 
                alt="Profil" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>
                Fotoğraf<br/>Yok
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
              Fotoğraf Seç
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                hidden
              />
            </label>
            {photo && (
              <button 
                className="btn-delete" 
                onClick={handleRemovePhoto}
                style={{ padding: '6px 12px' }}
              >
                Kaldır
              </button>
            )}
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              Max 2MB, JPG/PNG
            </span>
          </div>
        </div>
      </div>

      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

      {/* Languages */}
      <div className="form-group">
        <label>Diller</label>
        <input
          type="text"
          value={data.languages}
          onChange={(e) => handleChange('languages', e.target.value)}
          placeholder="Türkçe (Ana dil), İngilizce (İleri), Almanca (Orta)"
        />
        <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'block' }}>
          Virgülle ayırarak yazın
        </span>
      </div>

      {/* Certificates */}
      <div className="form-group">
        <label>Sertifikalar</label>
        <textarea
          value={data.certificates}
          onChange={(e) => handleChange('certificates', e.target.value)}
          placeholder="AWS Solutions Architect&#10;Google Cloud Professional&#10;PMP Sertifikası"
          style={{ minHeight: 80 }}
        />
        <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'block' }}>
          Her satıra bir sertifika yazın
        </span>
      </div>

      {/* Awards */}
      <div className="form-group">
        <label>Ödüller / Aktiviteler</label>
        <textarea
          value={data.awards}
          onChange={(e) => handleChange('awards', e.target.value)}
          placeholder="Yılın Çalışanı (2023)&#10;Hackathon Birincisi (2022)&#10;Açık Kaynak Katkıcısı"
          style={{ minHeight: 80 }}
        />
        <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'block' }}>
          Her satıra bir ödül/aktivite yazın
        </span>
      </div>

      {/* References */}
      <div className="form-group">
        <label>Referanslar</label>
        <textarea
          value={data.references || ''}
          onChange={(e) => handleChange('references', e.target.value)}
          placeholder="Ahmet Yılmaz - Müdür, ABC Şirketi - ahmet@abc.com&#10;Mehmet Demir - Direktör, XYZ Ltd - mehmet@xyz.com"
          style={{ minHeight: 80 }}
        />
        <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'block' }}>
          Her satıra bir referans yazın (boş bırakırsanız "Talep üzerine verilecektir" yazılır)
        </span>
      </div>
    </div>
  );
}
