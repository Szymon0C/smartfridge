import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import { useShoppingList } from '../hooks/useShoppingList';
import { useProducts } from '../hooks/useProducts';
import { useTemplates } from '../hooks/useTemplates';
import ShoppingItem from '../components/ShoppingItem';
import TemplateList from '../components/TemplateList';
import { getEffectiveExpiryDate, getDaysUntilExpiry } from '../lib/freshness';

export default function ShoppingPage() {
  const { items, loading, addItem, toggleItem, deleteItem, clearChecked } = useShoppingList();
  const { products } = useProducts();
  const { templates, deleteTemplate } = useTemplates();
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);

  const suggestions = useMemo(() => {
    const recentlyGone = products.filter((p) => p.status === 'consumed' || p.status === 'trashed');
    const expired = products.filter((p) => {
      if (p.status !== 'active') return false;
      const eff = getEffectiveExpiryDate(p.expiry_date, p.opened_at, p.freshness_days);
      return getDaysUntilExpiry(eff) < 0;
    });

    const names = new Set(items.map((i) => i.name.toLowerCase()));
    const all = [...recentlyGone, ...expired];
    const unique: { name: string; reason: string }[] = [];

    for (const p of all) {
      if (!names.has(p.name.toLowerCase()) && !unique.find((u) => u.name.toLowerCase() === p.name.toLowerCase())) {
        unique.push({
          name: p.name,
          reason: p.status === 'active' ? 'przeterminowane' : p.status === 'trashed' ? 'wyrzucone' : 'zużyte',
        });
      }
    }
    return unique.slice(0, 5);
  }, [products, items]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await addItem(newName.trim(), newQty);
    setNewName('');
    setNewQty(1);
  }

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="page">
      <h2>Lista zakupów</h2>

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h3 className="suggestions-title">Sugestie</h3>
          {suggestions.map((s) => (
            <button
              key={s.name}
              className="suggestion-chip"
              onClick={() => addItem(s.name, 1, 'suggestion')}
            >
              + {s.name} <span className="suggestion-reason">({s.reason})</span>
            </button>
          ))}
        </div>
      )}

      <form className="shopping-add" onSubmit={handleAdd}>
        <input
          className="form-input"
          placeholder="Dodaj produkt..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="shopping-add-btn">+</button>
      </form>

      {loading && <p>Ładowanie...</p>}

      <div className="shopping-list">
        {unchecked.map((item) => (
          <ShoppingItem
            key={item.id}
            item={item}
            onToggle={(c) => toggleItem(item.id, c)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </div>

      {checked.length > 0 && (
        <>
          <div className="shopping-divider">
            <span>Kupione ({checked.length})</span>
            <button className="clear-btn" onClick={clearChecked}>Wyczyść</button>
          </div>
          <div className="shopping-list">
            {checked.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onToggle={(c) => toggleItem(item.id, c)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        </>
      )}

      <div className="templates-section">
        <h3>Szablony</h3>
        <TemplateList
          templates={templates}
          onApply={async (t) => {
            for (const item of t.items) {
              await addItem(item.name, item.quantity, 'template');
            }
          }}
          onDelete={deleteTemplate}
        />
      </div>
    </div>
  );
}
