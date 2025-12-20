import { useState } from 'react';
import type { Skill, SkillCategory } from '../types.ts';

interface Props {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const categoryLabels: Record<SkillCategory, string> = {
  technical: 'Teknik',
  soft: 'Kişisel',
  language: 'Dil',
  other: 'Diğer',
};

export function SkillsForm({ skills, onChange }: Props) {
  const [newSkill, setNewSkill] = useState('');
  const [category, setCategory] = useState<SkillCategory>('technical');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    onChange([...skills, { name: newSkill.trim(), category }]);
    setNewSkill('');
  };

  const removeSkill = (name: string) => {
    onChange(skills.filter((s) => s.name !== name));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  return (
    <div>
      <div className="skill-input-row">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Beceri adı..."
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={addSkill}>
          Ekle
        </button>
      </div>

      {Object.entries(groupedSkills).map(([cat, catSkills]) => (
        <div key={cat} style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '10px', color: '#374151' }}>
            {categoryLabels[cat as SkillCategory]}
          </h4>
          <div className="skills-list">
            {catSkills.map((skill) => (
              <span key={skill.name} className="skill-tag">
                {skill.name}
                <button onClick={() => removeSkill(skill.name)}>×</button>
              </span>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <p style={{ color: '#9ca3af', marginTop: '20px', textAlign: 'center' }}>
          Henüz beceri eklenmedi. Yukarıdan beceri ekleyebilirsiniz.
        </p>
      )}
    </div>
  );
}
