import type { Product } from '../lib/types';
import { getEffectiveExpiryDate, getFreshnessStatus, getFreshnessLabel } from '../lib/freshness';
import { getCategoryInfo } from '../lib/categories';
import FreshnessIndicator from './FreshnessIndicator';

interface Props {
  product: Product;
  onBack: () => void;
  onUpdate: (updates: Partial<Product>) => Promise<void>;
}

export default function ProductDetail({ product, onBack, onUpdate }: Props) {
  const effectiveExpiry = getEffectiveExpiryDate(
    product.expiry_date,
    product.opened_at,
    product.freshness_days
  );
  const status = getFreshnessStatus(effectiveExpiry);
  const label = getFreshnessLabel(effectiveExpiry, product.opened_at);
  const cat = getCategoryInfo(product.category);

  return (
    <div className="page">
      <button className="back-button" onClick={onBack}>← Wróć</button>

      <div className="detail-header">
        <span className="detail-emoji">{cat.emoji}</span>
        <h2>{product.name}</h2>
        <p className="detail-meta">{cat.label} · {product.location}</p>
      </div>

      <div className="detail-info">
        <div className="detail-row">
          <span>Data ważności</span>
          <span>{product.expiry_date}</span>
        </div>
        <div className="detail-row">
          <span>Status</span>
          <span className="detail-status">
            <FreshnessIndicator status={status} /> {product.opened_at ? 'Otwarte' : 'Zamknięte'}
          </span>
        </div>
        <div className="detail-row">
          <span>Świeżość</span>
          <span className={`product-label--${status}`}>{label}</span>
        </div>
        {product.opened_at && (
          <div className="detail-row">
            <span>Po otwarciu</span>
            <span>{product.freshness_days} dni</span>
          </div>
        )}
        <div className="detail-row">
          <span>Ilość</span>
          <span>{product.quantity}</span>
        </div>
      </div>

      <div className="detail-actions">
        {!product.opened_at && (
          <button
            className="action-btn action-btn--warning"
            onClick={() => onUpdate({ opened_at: new Date().toISOString() })}
          >
            Otwórz
          </button>
        )}
        <button
          className="action-btn action-btn--ok"
          onClick={() => onUpdate({ status: 'consumed' })}
        >
          Zużyte
        </button>
      </div>
      <div className="detail-actions-secondary">
        <button
          className="action-btn action-btn--danger"
          onClick={() => onUpdate({ status: 'trashed' })}
        >
          Wyrzuć
        </button>
      </div>
    </div>
  );
}
