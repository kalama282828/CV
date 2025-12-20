import React from 'react';
import type { CVData, TemplateName, Language } from '../types.ts';
import { translations } from '../types.ts';

interface Props {
  data: CVData;
  template: TemplateName;
  language: Language;
}

export function Preview({ data, template, language }: Props) {
  switch (template) {
    case 'modern':
      return <ModernTemplate data={data} language={language} />;
    case 'minimal':
      return <MinimalTemplate data={data} language={language} />;
    case 'pastel':
      return <PastelTemplate data={data} language={language} />;
    default:
      return <ClassicTemplate data={data} language={language} />;
  }
}

// ============ CLASSIC TEMPLATE (Blue headers, current design) ============
function ClassicTemplate({ data, language }: { data: CVData; language: Language }) {
  const t = translations[language];
  return (
    <div className="preview-frame">
      <div className="preview-content" style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.5, fontSize: 11, color: '#333', padding: '30px 40px', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#1a5fb4', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: 2 }}>
              {data.personalInfo.name || 'AD SOYAD'}
            </h1>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 6, textTransform: 'uppercase' }}>
              {data.personalInfo.title || 'UNVAN'}
            </div>
            <p style={{ fontSize: 10, color: '#555', margin: 0 }}>
              {[data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email].filter(Boolean).join(' | ') || 'İletişim bilgileri'}
            </p>
          </div>
          <PhotoBox photo={data.photo} />
        </div>
        <ClassicSection title={t.summary}>
          <p style={{ fontSize: 10, margin: 0, lineHeight: 1.6, textAlign: 'justify' }}>{data.summary || '-'}</p>
        </ClassicSection>
        <ClassicSection title={t.experience}>
          {data.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><b>{exp.title}</b>, {exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <span style={{ fontSize: 10, fontWeight: 'bold' }}>{formatDate(exp.startDate, language)} — {formatDate(exp.endDate, language)}</span>
              </div>
              {exp.description.length > 0 && <ul style={{ margin: '4px 0 0 14px', fontSize: 10 }}>{exp.description.map((d, j) => <li key={j}>{d}</li>)}</ul>}
            </div>
          ))}
        </ClassicSection>
        <ClassicSection title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <b>{edu.degree} - {edu.field}</b>
                <span style={{ fontSize: 10, fontWeight: 'bold' }}>{formatDate(edu.startDate, language)} — {formatDate(edu.endDate, language)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#555', fontStyle: 'italic' }}>{edu.institution}</div>
            </div>
          ))}
        </ClassicSection>
        <ClassicSection title={t.skills}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 10px', fontSize: 10 }}>
            {data.skills.map((s, i) => <span key={i}>{s.name}</span>)}
          </div>
        </ClassicSection>
        <ClassicSection title={t.additional}>
          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 10 }}>
            <li><b>{t.languages}:</b> {data.additionalInfo?.languages || '-'}</li>
            <li><b>{t.certificates}:</b> {data.additionalInfo?.certificates?.split('\n').filter(Boolean).join(', ') || '-'}</li>
            <li><b>{t.awards}:</b> {data.additionalInfo?.awards?.split('\n').filter(Boolean).join(', ') || '-'}</li>
          </ul>
        </ClassicSection>
        <ClassicSection title={language === 'tr' ? 'REFERANSLAR' : 'REFERENCES'}>
          {data.additionalInfo?.references ? (
            <div style={{ fontSize: 10 }}>
              {data.additionalInfo.references.split('\n').filter(Boolean).map((ref, i) => (
                <div key={i} style={{ marginBottom: 4 }}>{ref}</div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 10, fontWeight: 'bold' }}>
              {language === 'tr' ? 'Talep üzerine referans verilecektir' : 'References available upon request'}
            </p>
          )}
        </ClassicSection>
      </div>
    </div>
  );
}

function ClassicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 12, fontWeight: 'bold', color: '#1a5fb4', margin: '0 0 6px 0', paddingBottom: 3, borderBottom: '2px solid #1a5fb4', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h2>
      {children}
    </div>
  );
}


// ============ MODERN TEMPLATE (Black/white, dates on left, clean) ============
function ModernTemplate({ data, language }: { data: CVData; language: Language }) {
  const t = translations[language];
  return (
    <div className="preview-frame">
      <div className="preview-content" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5, fontSize: 11, color: '#333', padding: '30px 40px', background: '#fff' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #333', paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 'normal', color: '#000', margin: 0 }}>{data.personalInfo.name || 'Ad Soyad'}</h1>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 4 }}>{data.personalInfo.title || 'Unvan'}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 10, color: '#555' }}>
              <div>{data.personalInfo.location}</div>
              <div>{data.personalInfo.phone}</div>
              <div>{data.personalInfo.email}</div>
              {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
            </div>
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: 16, fontStyle: 'italic', fontSize: 10, lineHeight: 1.6, textAlign: 'justify' }}>
            {data.summary}
          </div>
        )}

        {/* Technical Skills */}
        {data.skills.length > 0 && (
          <ModernSection title={language === 'tr' ? 'Teknik Yetkinlikler' : 'Technical Proficiencies'}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', fontSize: 10 }}>
              {groupSkillsByCategory(data.skills).map(([cat, skills], i) => (
                <React.Fragment key={i}>
                  <div style={{ fontWeight: 'bold' }}>{cat}:</div>
                  <div>{skills.join(', ')}</div>
                </React.Fragment>
              ))}
            </div>
          </ModernSection>
        )}

        {/* Experience */}
        <ModernSection title={t.experience}>
          {data.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{exp.company}</span>
                  {exp.location && <span>, {exp.location}</span>}
                </div>
                <span style={{ fontSize: 10 }}>{formatDate(exp.startDate, language)} – {formatDate(exp.endDate, language)}</span>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: 10, marginTop: 2 }}>{exp.title}</div>
              {exp.description.length > 0 && (
                <ul style={{ margin: '6px 0 0 0', paddingLeft: 16, fontSize: 10 }}>
                  {exp.description.map((d, j) => <li key={j} style={{ marginBottom: 2 }}>◆ {d}</li>)}
                </ul>
              )}
            </div>
          ))}
        </ModernSection>

        {/* Education */}
        <ModernSection title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <b>{edu.degree}, {edu.institution}</b>
                <span style={{ fontSize: 10 }}>{formatDate(edu.startDate, language)} – {formatDate(edu.endDate, language)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#555' }}>{edu.field}</div>
            </div>
          ))}
        </ModernSection>

        {/* Additional */}
        {(data.additionalInfo?.languages || data.additionalInfo?.certificates || data.additionalInfo?.awards) && (
          <ModernSection title={t.additional}>
            <div style={{ fontSize: 10 }}>
              {data.additionalInfo?.languages && <div><b>{t.languages}:</b> {data.additionalInfo.languages}</div>}
              {data.additionalInfo?.certificates && <div><b>{t.certificates}:</b> {data.additionalInfo.certificates.split('\n').filter(Boolean).join(', ')}</div>}
              {data.additionalInfo?.awards && <div><b>{t.awards}:</b> {data.additionalInfo.awards.split('\n').filter(Boolean).join(', ')}</div>}
            </div>
          </ModernSection>
        )}

        {/* References */}
        <ModernSection title={language === 'tr' ? 'Referanslar' : 'References'}>
          {data.additionalInfo?.references ? (
            <div style={{ fontSize: 10 }}>
              {data.additionalInfo.references.split('\n').filter(Boolean).map((ref, i) => (
                <div key={i} style={{ marginBottom: 4 }}>{ref}</div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 10, fontWeight: 'bold' }}>
              {language === 'tr' ? 'Talep üzerine referans verilecektir' : 'References available upon request'}
            </p>
          )}
        </ModernSection>
      </div>
    </div>
  );
}

function ModernSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 13, fontWeight: 'bold', color: '#000', margin: '0 0 8px 0', paddingBottom: 4, borderBottom: '1px solid #000' }}>{title}</h2>
      {children}
    </div>
  );
}


// ============ MINIMAL TEMPLATE (Centered headers, elegant, gray lines) ============
function MinimalTemplate({ data, language }: { data: CVData; language: Language }) {
  const t = translations[language];
  return (
    <div className="preview-frame">
      <div className="preview-content" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5, fontSize: 11, color: '#333', padding: '30px 40px', background: '#fff' }}>
        {/* Header - Centered */}
        <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#000', margin: 0, textTransform: 'uppercase', letterSpacing: 3 }}>
            {data.personalInfo.name || 'AD SOYAD'}
          </h1>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{data.personalInfo.title || 'Unvan'}</div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 8 }}>
            {data.personalInfo.location} • {data.personalInfo.phone} • {data.personalInfo.email}
          </div>
        </div>

        {/* Profile/Summary */}
        {data.summary && (
          <MinimalSection title={language === 'tr' ? 'PROFİL' : 'PROFILE'}>
            <p style={{ fontSize: 10, margin: 0, lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic' }}>{data.summary}</p>
          </MinimalSection>
        )}

        {/* Experience */}
        <MinimalSection title={language === 'tr' ? 'İŞ GEÇMİŞİ' : 'EMPLOYMENT HISTORY'}>
          {data.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14, display: 'flex', gap: 20 }}>
              <div style={{ width: 100, fontSize: 10, color: '#666', flexShrink: 0 }}>
                {formatDate(exp.startDate, language)}<br/>— {formatDate(exp.endDate, language)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>{exp.title}, {exp.company}</b>
                  <span style={{ fontSize: 10, color: '#666' }}>{exp.location || data.personalInfo.location}</span>
                </div>
                {exp.description.length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: 14, fontSize: 10 }}>
                    {exp.description.map((d, j) => <li key={j} style={{ marginBottom: 2 }}>{d}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </MinimalSection>

        {/* Education */}
        <MinimalSection title={t.education}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 10, display: 'flex', gap: 20 }}>
              <div style={{ width: 100, fontSize: 10, color: '#666', flexShrink: 0 }}>
                {formatDate(edu.startDate, language)}<br/>— {formatDate(edu.endDate, language)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>{edu.degree}, {edu.institution}</b>
                  <span style={{ fontSize: 10, color: '#666' }}>{edu.field}</span>
                </div>
              </div>
            </div>
          ))}
        </MinimalSection>

        {/* Skills */}
        <MinimalSection title={t.skills}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 20px', fontSize: 10 }}>
            {data.skills.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', paddingBottom: 2 }}>
                <span>{s.name}</span>
                <span style={{ color: '#666', fontStyle: 'italic' }}>Expert</span>
              </div>
            ))}
          </div>
        </MinimalSection>

        {/* Additional */}
        {(data.additionalInfo?.languages || data.additionalInfo?.certificates || data.additionalInfo?.awards) && (
          <MinimalSection title={t.additional}>
            <div style={{ fontSize: 10, textAlign: 'center' }}>
              {data.additionalInfo?.languages && <div><b>{t.languages}:</b> {data.additionalInfo.languages}</div>}
              {data.additionalInfo?.certificates && <div><b>{t.certificates}:</b> {data.additionalInfo.certificates.split('\n').filter(Boolean).join(', ')}</div>}
              {data.additionalInfo?.awards && <div><b>{t.awards}:</b> {data.additionalInfo.awards.split('\n').filter(Boolean).join(', ')}</div>}
            </div>
          </MinimalSection>
        )}

        {/* References */}
        <MinimalSection title={language === 'tr' ? 'REFERANSLAR' : 'REFERENCES'}>
          {data.additionalInfo?.references ? (
            <div style={{ fontSize: 10, textAlign: 'center' }}>
              {data.additionalInfo.references.split('\n').filter(Boolean).map((ref, i) => (
                <div key={i} style={{ marginBottom: 4 }}>{ref}</div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
              {language === 'tr' ? 'Talep üzerine referans verilecektir' : 'References available upon request'}
            </p>
          )}
        </MinimalSection>
      </div>
    </div>
  );
}

function MinimalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ flex: 1, height: 1, background: '#ccc' }} />
        <h2 style={{ fontSize: 11, fontWeight: 'bold', color: '#333', margin: '0 16px', textTransform: 'uppercase', letterSpacing: 2 }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: '#ccc' }} />
      </div>
      {children}
    </div>
  );
}


// ============ PASTEL TEMPLATE (Gradient sidebar, round photo, soft colors) ============
function PastelTemplate({ data, language }: { data: CVData; language: Language }) {
  const t = translations[language];
  return (
    <div className="preview-frame">
      <div className="preview-content" style={{ 
        fontFamily: 'Arial, sans-serif', 
        lineHeight: 1.5, 
        fontSize: 11, 
        color: '#333', 
        padding: 0,
        background: 'linear-gradient(135deg, #e8f4f8 0%, #f5e6f0 50%, #fef9e7 100%)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with photo and contact */}
        <div style={{ padding: '30px 40px 20px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Round Photo */}
          <div style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '3px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {data.photo ? (
              <img src={data.photo} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 10 }}>Photo</div>
            )}
          </div>
          
          {/* Contact Info */}
          <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>
            <div>{data.personalInfo.location}</div>
            <div>{data.personalInfo.phone}</div>
            <div>{data.personalInfo.email}</div>
            {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
          </div>
        </div>

        {/* Name and Title */}
        <div style={{ padding: '0 40px 20px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#2c3e50', margin: 0 }}>
            {data.personalInfo.name || 'Ad Soyad'}, {data.personalInfo.title || 'Unvan'}
          </h1>
          {/* Summary under name */}
          {data.summary && (
            <p style={{ fontSize: 11, color: '#555', margin: '12px 0 0', lineHeight: 1.6 }}>
              {data.summary}
            </p>
          )}
        </div>

        {/* Skills Section */}
        {data.skills.length > 0 && (
          <PastelSection title={t.skills} language={language}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 30px', fontSize: 10 }}>
              {data.skills.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#7f8c8d' }}>○</span>
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </PastelSection>
        )}

        {/* Employment History */}
        <PastelSection title={language === 'tr' ? 'İş Geçmişi' : 'Employment History'} language={language}>
          {data.workExperience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <b style={{ fontSize: 11 }}>{exp.title} at {exp.company}, {exp.location || data.personalInfo.location}</b>
              </div>
              <div style={{ fontSize: 9, color: '#7f8c8d', marginTop: 2 }}>
                {formatDate(exp.startDate, language)} — {formatDate(exp.endDate, language)}
              </div>
              {exp.description.length > 0 && (
                <ul style={{ margin: '6px 0 0 0', paddingLeft: 16, fontSize: 10 }}>
                  {exp.description.map((d, j) => <li key={j} style={{ marginBottom: 3 }}>{d}</li>)}
                </ul>
              )}
            </div>
          ))}
        </PastelSection>

        {/* Education */}
        <PastelSection title={t.education} language={language}>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <b style={{ fontSize: 11 }}>{edu.degree}, {edu.institution}, {edu.field}</b>
              </div>
              <div style={{ fontSize: 9, color: '#7f8c8d', marginTop: 2 }}>
                {formatDate(edu.startDate, language)} — {formatDate(edu.endDate, language)}
              </div>
            </div>
          ))}
        </PastelSection>

        {/* Additional Info */}
        {(data.additionalInfo?.languages || data.additionalInfo?.certificates || data.additionalInfo?.awards) && (
          <PastelSection title={t.additional} language={language}>
            <div style={{ fontSize: 10 }}>
              {data.additionalInfo?.languages && (
                <div style={{ marginBottom: 8 }}>
                  <b>{t.languages}:</b> {data.additionalInfo.languages}
                </div>
              )}
              {data.additionalInfo?.certificates && (
                <div style={{ marginBottom: 8 }}>
                  <b>{t.certificates}:</b> {data.additionalInfo.certificates.split('\n').filter(Boolean).join(', ')}
                </div>
              )}
              {data.additionalInfo?.awards && (
                <div>
                  <b>{t.awards}:</b> {data.additionalInfo.awards.split('\n').filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </PastelSection>
        )}

        {/* References */}
        <PastelSection title={language === 'tr' ? 'Referanslar' : 'References'} language={language}>
          {data.additionalInfo?.references ? (
            <div style={{ fontSize: 10 }}>
              {data.additionalInfo.references.split('\n').filter(Boolean).map((ref, i) => (
                <div key={i} style={{ marginBottom: 4 }}>{ref}</div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 10, fontWeight: 'bold' }}>
              {language === 'tr' ? 'Talep üzerine referans verilecektir' : 'References available upon request'}
            </p>
          )}
        </PastelSection>
      </div>
    </div>
  );
}

function PastelSection({ title, children }: { title: string; children: React.ReactNode; language?: Language }) {
  return (
    <div style={{ padding: '0 40px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: '#7f8c8d', minWidth: 100 }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: '#ddd', marginLeft: 12 }} />
      </div>
      <div style={{ paddingLeft: 112 }}>
        {children}
      </div>
    </div>
  );
}

// ============ HELPER FUNCTIONS ============
function PhotoBox({ photo }: { photo?: string }) {
  return (
    <div style={{ width: 80, height: 100, backgroundColor: '#e5e7eb', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af', overflow: 'hidden' }}>
      {photo ? <img src={photo} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Photo'}
    </div>
  );
}

function formatDate(dateStr: string, lang: Language): string {
  if (!dateStr) return '';
  if (dateStr === 'present') return translations[lang].present;
  const [year, month] = dateStr.split('-');
  const months = lang === 'tr' 
    ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function groupSkillsByCategory(skills: { name: string; category: string }[]): [string, string[]][] {
  const groups: Record<string, string[]> = {};
  const categoryNames: Record<string, string> = {
    technical: 'Technical',
    soft: 'Soft Skills',
    language: 'Languages',
    other: 'Other'
  };
  skills.forEach(s => {
    const cat = categoryNames[s.category] || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s.name);
  });
  return Object.entries(groups);
}


