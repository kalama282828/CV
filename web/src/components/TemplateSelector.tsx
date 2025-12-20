import type { TemplateName } from '../types.ts';

interface Props {
  selected: TemplateName;
  onChange: (template: TemplateName) => void;
}

const templates: { id: TemplateName; label: string }[] = [
  { id: 'classic', label: 'Klasik' },
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'pastel', label: 'Pastel' },
];

export function TemplateSelector({ selected, onChange }: Props) {
  return (
    <div className="template-selector">
      <span style={{ marginRight: '8px', color: '#6b7280' }}>Şablon:</span>
      {templates.map((t) => (
        <button
          key={t.id}
          className={`template-btn ${selected === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
