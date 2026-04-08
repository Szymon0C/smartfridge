import type { FreshnessStatus } from '../lib/freshness';

const colorMap: Record<FreshnessStatus, string> = {
  ok: 'var(--color-ok)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
};

export default function FreshnessIndicator({ status }: { status: FreshnessStatus }) {
  return (
    <span
      className="freshness-dot"
      style={{ background: colorMap[status] }}
    />
  );
}
