import type { Education } from '../types.ts';

interface Props {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: Props) {
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    };
    onChange([...education, newEdu]);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    onChange(
      education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu))
    );
  };

  const deleteEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
  };

  return (
    <div>
      {education.map((edu) => (
        <div key={edu.id} className="entry-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="entry-card-title">
              {edu.degree || 'Derece'} - {edu.field || 'Bölüm'}
            </div>
            <button
              className="btn-delete"
              onClick={() => deleteEducation(edu.id)}
            >
              Sil
            </button>
          </div>
          <div className="form-group">
            <label>Kurum *</label>
            <input
              type="text"
              value={edu.institution}
              onChange={(e) =>
                updateEducation(edu.id, { institution: e.target.value })
              }
              placeholder="Üniversite Adı"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Derece *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) =>
                  updateEducation(edu.id, { degree: e.target.value })
                }
                placeholder="Lisans"
              />
            </div>
            <div className="form-group">
              <label>Bölüm *</label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) =>
                  updateEducation(edu.id, { field: e.target.value })
                }
                placeholder="Bilgisayar Mühendisliği"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Başlangıç *</label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) =>
                  updateEducation(edu.id, { startDate: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Bitiş *</label>
              <input
                type="month"
                value={edu.endDate}
                onChange={(e) =>
                  updateEducation(edu.id, { endDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>GPA (opsiyonel)</label>
            <input
              type="text"
              value={edu.gpa || ''}
              onChange={(e) =>
                updateEducation(edu.id, { gpa: e.target.value })
              }
              placeholder="3.50"
            />
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addEducation}>
        + Eğitim Ekle
      </button>
    </div>
  );
}
