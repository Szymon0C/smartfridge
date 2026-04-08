import type { Product } from '../lib/types';
import { getEffectiveExpiryDate, getFreshnessStatus, getFreshnessLabel } from '../lib/freshness';
import { getCategoryInfo } from '../lib/categories';
import FreshnessIndicator from './FreshnessIndicator';

interface Props {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: Props) {
  const effectiveExpiry = getEffectiveExpiryDate(
    product.expiry_date,
    product.opened_at,
    product.freshness_days
  );
  const status = getFreshnessStatus(effectiveExpiry);
  const label = getFreshnessLabel(effectiveExpiry, product.opened_at);
  const cat = getCategoryInfo(product.category);

  return (
    <button className={`product-card product-card--${status}`} onClick={onClick}>
      <span className="product-emoji">{cat.emoji}</span>
      <div className="product-info">
        <span className="product-name">{product.name}</span>
        <span className="product-meta">
          {product.location} {product.quantity > 1 ? `x${product.quantity}` : ''}
        </span>
      </div>
      <div className="product-status">
        <FreshnessIndicator status={status} />
        <span className={`product-label product-label--${status}`}>{label}</span>
      </div>
    </button>
  );
}
