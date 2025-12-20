import type { WorkExperience } from '../types.ts';

interface Props {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function ExperienceForm({ experiences, onChange }: Props) {
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: [],
    };
    onChange([...experiences, newExp]);
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    onChange(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      )
    );
  };

  const deleteExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  return (
    <div>
      {experiences.map((exp) => (
        <div key={exp.id} className="entry-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="entry-card-title">
              {exp.title || 'Pozisyon'} - {exp.company || 'Şirket'}
            </div>
            <button
              className="btn-delete"
              onClick={() => deleteExperience(exp.id)}
            >
              Sil
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Şirket *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) =>
                  updateExperience(exp.id, { company: e.target.value })
                }
                placeholder="Şirket Adı"
              />
            </div>
            <div className="form-group">
              <label>Pozisyon *</label>
              <input
                type="text"
                value={exp.title}
                onChange={(e) =>
                  updateExperience(exp.id, { title: e.target.value })
                }
                placeholder="Yazılım Geliştirici"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Başlangıç *</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) =>
                  updateExperience(exp.id, { startDate: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Bitiş</label>
              <input
                type="month"
                value={exp.endDate === 'present' ? '' : exp.endDate}
                onChange={(e) =>
                  updateExperience(exp.id, {
                    endDate: e.target.value || 'present',
                  })
                }
                placeholder="Devam ediyor"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Konum</label>
            <input
              type="text"
              value={exp.location || ''}
              onChange={(e) =>
                updateExperience(exp.id, { location: e.target.value })
              }
              placeholder="İstanbul, Türkiye"
            />
          </div>
          <div className="form-group">
            <label>Açıklama (her satır bir madde)</label>
            <textarea
              value={exp.description.join('\n')}
              onChange={(e) =>
                updateExperience(exp.id, {
                  description: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="• Proje geliştirdim&#10;• Takım liderliği yaptım"
            />
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addExperience}>
        + Deneyim Ekle
      </button>
    </div>
  );
}
