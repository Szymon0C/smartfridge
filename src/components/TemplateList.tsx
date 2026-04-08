import type { ShoppingTemplate } from '../lib/types';

interface Props {
  templates: ShoppingTemplate[];
  onApply: (template: ShoppingTemplate) => void;
  onDelete: (id: string) => void;
}

export default function TemplateList({ templates, onApply, onDelete }: Props) {
  if (templates.length === 0) {
    return <p className="empty-state" style={{ fontSize: 13 }}>Brak szablonów.</p>;
  }

  return (
    <div className="template-list">
      {templates.map((t) => (
        <div key={t.id} className="template-item">
          <div className="template-info">
            <span className="template-name">{t.name}</span>
            <span className="template-count">{t.items.length} produktów</span>
          </div>
          <button className="template-apply" onClick={() => onApply(t)}>Dodaj</button>
          <button className="shopping-delete" onClick={() => onDelete(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
