export type FreshnessStatus = 'ok' | 'warning' | 'danger';

export function getDaysUntilExpiry(expiryDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr + 'T00:00:00');
  const diffMs = expiry.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getEffectiveExpiryDate(
  expiryDate: string,
  openedAt: string | null,
  freshnessDays: number
): string {
  if (!openedAt) return expiryDate;

  // Parse opened date as local date (ignore timezone offset)
  const openedDateStr = openedAt.split('T')[0];
  const opened = new Date(openedDateStr + 'T00:00:00');
  const openedExpiry = new Date(opened);
  openedExpiry.setDate(openedExpiry.getDate() + freshnessDays);

  const expiryDateObj = new Date(expiryDate + 'T00:00:00');
  const effective = openedExpiry < expiryDateObj ? openedExpiry : expiryDateObj;

  const y = effective.getFullYear();
  const m = String(effective.getMonth() + 1).padStart(2, '0');
  const d = String(effective.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getFreshnessStatus(effectiveExpiryDate: string): FreshnessStatus {
  const days = getDaysUntilExpiry(effectiveExpiryDate);
  if (days < 0) return 'danger';
  if (days <= 2) return 'warning';
  return 'ok';
}

export function getFreshnessLabel(effectiveExpiryDate: string, openedAt: string | null): string {
  const days = getDaysUntilExpiry(effectiveExpiryDate);
  if (days < 0) return 'przeterminowane';
  if (days === 0) return 'wygasa dziś!';
  if (days === 1) return 'wygasa jutro';
  if (openedAt) return `otwarte, ${days} dni`;
  return `${days} dni`;
}
