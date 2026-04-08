import { useState } from 'react';
import type { FormEvent } from 'react';
import { CATEGORIES, CATEGORY_KEYS, getCategoryInfo } from '../lib/categories';
import type { ProductLocation } from '../lib/types';

interface ProductFormData {
  name: string;
  barcode: string | null;
  category: string;
  image_url: string | null;
  expiry_date: string;
  freshness_days: number;
  quantity: number;
  location: ProductLocation;
}

interface Props {
  initial?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

const LOCATIONS: ProductLocation[] = ['lodówka', 'zamrażarka', 'spiżarnia'];

export default function AddProductForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [barcode] = useState(initial?.barcode || null);
  const [category, setCategory] = useState(initial?.category || 'inne');
  const [imageUrl] = useState(initial?.image_url || null);
  const [expiryDate, setExpiryDate] = useState(initial?.expiry_date || '');
  const [freshnessDays, setFreshnessDays] = useState(
    initial?.freshness_days ?? getCategoryInfo(initial?.category || 'inne').defaultFreshnessDays
  );
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [location, setLocation] = useState<ProductLocation>(initial?.location || 'lodówka');
  const [loading, setLoading] = useState(false);

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    setFreshnessDays(getCategoryInfo(cat).defaultFreshnessDays);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        barcode,
        category,
        image_url: imageUrl,
        expiry_date: expiryDate,
        freshness_days: freshnessDays,
        quantity,
        location,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      {imageUrl && (
        <div className="form-image">
          <img src={imageUrl} alt={name} />
        </div>
      )}

      <label className="form-label">Nazwa</label>
      <input
        className="form-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nazwa produktu"
        required
      />

      <label className="form-label">Kategoria</label>
      <select
        className="form-input"
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        {CATEGORY_KEYS.map((key) => (
          <option key={key} value={key}>
            {CATEGORIES[key].emoji} {CATEGORIES[key].label}
          </option>
        ))}
      </select>

      <label className="form-label">Data ważności</label>
      <input
        className="form-input"
        type="date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        required
      />

      <label className="form-label">Lokalizacja</label>
      <div className="location-chips">
        {LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            className={`filter-chip ${location === loc ? 'active' : ''}`}
            onClick={() => setLocation(loc)}
          >
            {loc}
          </button>
        ))}
      </div>

      <label className="form-label">Ilość</label>
      <div className="quantity-control">
        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
        <span>{quantity}</span>
        <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>

      <label className="form-label">Dni świeżości po otwarciu</label>
      <input
        className="form-input"
        type="number"
        min={1}
        value={freshnessDays}
        onChange={(e) => setFreshnessDays(parseInt(e.target.value) || 1)}
      />

      <div className="form-actions">
        <button type="button" className="action-btn action-btn--danger" onClick={onCancel}>Anuluj</button>
        <button type="submit" className="action-btn action-btn--ok" disabled={loading}>
          {loading ? 'Dodawanie...' : 'Dodaj'}
        </button>
      </div>
    </form>
  );
}
