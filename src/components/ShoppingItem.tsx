import type { ShoppingItem as ShoppingItemType } from '../lib/types';

interface Props {
  item: ShoppingItemType;
  onToggle: (checked: boolean) => void;
  onDelete: () => void;
}

export default function ShoppingItem({ item, onToggle, onDelete }: Props) {
  return (
    <div className={`shopping-item ${item.checked ? 'checked' : ''}`}>
      <button
        className="shopping-checkbox"
        onClick={() => onToggle(!item.checked)}
      >
        {item.checked ? '☑' : '☐'}
      </button>
      <div className="shopping-item-info">
        <span className="shopping-item-name">{item.name}</span>
        {item.quantity > 1 && (
          <span className="shopping-item-qty">x{item.quantity}</span>
        )}
        {item.source !== 'manual' && (
          <span className="shopping-item-source">
            {item.source === 'suggestion' ? '💡' : '📁'}
          </span>
        )}
      </div>
      <button className="shopping-delete" onClick={onDelete}>✕</button>
    </div>
  );
}
