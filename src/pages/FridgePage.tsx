import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import { getEffectiveExpiryDate, getFreshnessStatus } from '../lib/freshness';
import type { Product, ProductLocation } from '../lib/types';

const LOCATIONS: (ProductLocation | 'all')[] = ['all', 'lodówka', 'zamrażarka', 'spiżarnia'];
const LOCATION_LABELS: Record<string, string> = {
  all: 'Wszystko',
  'lodówka': 'Lodówka',
  'zamrażarka': 'Zamrażarka',
  'spiżarnia': 'Spiżarnia',
};

const statusOrder = { danger: 0, warning: 1, ok: 2 };

export default function FridgePage() {
  const { products, loading, updateProduct } = useProducts();
  const [filter, setFilter] = useState<ProductLocation | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = products
    .filter((p) => filter === 'all' || p.location === filter)
    .sort((a, b) => {
      const aExp = getEffectiveExpiryDate(a.expiry_date, a.opened_at, a.freshness_days);
      const bExp = getEffectiveExpiryDate(b.expiry_date, b.opened_at, b.freshness_days);
      const aStatus = getFreshnessStatus(aExp);
      const bStatus = getFreshnessStatus(bExp);
      return statusOrder[aStatus] - statusOrder[bStatus] || aExp.localeCompare(bExp);
    });

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onUpdate={async (updates) => {
          await updateProduct(selectedProduct.id, updates);
          setSelectedProduct(null);
        }}
      />
    );
  }

  return (
    <div className="page">
      <div className="filter-bar">
        {LOCATIONS.map((loc) => (
          <button
            key={loc}
            className={`filter-chip ${filter === loc ? 'active' : ''}`}
            onClick={() => setFilter(loc)}
          >
            {LOCATION_LABELS[loc]}
          </button>
        ))}
      </div>

      {loading && <p>Ładowanie...</p>}

      {!loading && filtered.length === 0 && (
        <p className="empty-state">Brak produktów. Kliknij + żeby dodać.</p>
      )}

      <div className="product-list">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
        ))}
      </div>
    </div>
  );
}
