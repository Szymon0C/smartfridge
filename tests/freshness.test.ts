import { describe, it, expect } from 'vitest';
import { getFreshnessStatus, getEffectiveExpiryDate, getDaysUntilExpiry } from '../src/lib/freshness';

describe('getDaysUntilExpiry', () => {
  it('returns positive days for future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(getDaysUntilExpiry(future.toISOString().split('T')[0])).toBe(5);
  });

  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(getDaysUntilExpiry(today)).toBe(0);
  });

  it('returns negative for past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(getDaysUntilExpiry(past.toISOString().split('T')[0])).toBe(-3);
  });
});

describe('getEffectiveExpiryDate', () => {
  it('returns expiry_date when product is closed', () => {
    const result = getEffectiveExpiryDate('2026-04-20', null, 3);
    expect(result).toBe('2026-04-20');
  });

  it('returns min of expiry and opened+freshness when opened', () => {
    const result = getEffectiveExpiryDate('2026-04-20', '2026-04-08T10:00:00Z', 3);
    expect(result).toBe('2026-04-11');
  });

  it('returns expiry when it comes before opened+freshness', () => {
    const result = getEffectiveExpiryDate('2026-04-10', '2026-04-08T10:00:00Z', 30);
    expect(result).toBe('2026-04-10');
  });
});

describe('getFreshnessStatus', () => {
  it('returns danger for expired product', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(getFreshnessStatus(past.toISOString().split('T')[0])).toBe('danger');
  });

  it('returns warning for product expiring within 2 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 1);
    expect(getFreshnessStatus(soon.toISOString().split('T')[0])).toBe('warning');
  });

  it('returns ok for product with more than 2 days', () => {
    const later = new Date();
    later.setDate(later.getDate() + 5);
    expect(getFreshnessStatus(later.toISOString().split('T')[0])).toBe('ok');
  });
});
