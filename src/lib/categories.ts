export interface CategoryInfo {
  label: string;
  emoji: string;
  defaultFreshnessDays: number;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  'nabiał':       { label: 'Nabiał',       emoji: '🥛', defaultFreshnessDays: 3 },
  'ser twardy':   { label: 'Ser twardy',   emoji: '🧀', defaultFreshnessDays: 7 },
  'ser miękki':   { label: 'Ser miękki',   emoji: '🧀', defaultFreshnessDays: 3 },
  'wędlina':      { label: 'Wędlina',      emoji: '🥩', defaultFreshnessDays: 2 },
  'mięso surowe': { label: 'Mięso surowe', emoji: '🍖', defaultFreshnessDays: 1 },
  'sos w słoiku': { label: 'Sos w słoiku', emoji: '🫙', defaultFreshnessDays: 5 },
  'dżem':         { label: 'Dżem',         emoji: '🍓', defaultFreshnessDays: 14 },
  'sok':          { label: 'Sok',           emoji: '🧃', defaultFreshnessDays: 3 },
  'hummus':       { label: 'Hummus',        emoji: '🫘', defaultFreshnessDays: 3 },
  'konserwy':     { label: 'Konserwy',      emoji: '🥫', defaultFreshnessDays: 2 },
  'warzywa':      { label: 'Warzywa',       emoji: '🥬', defaultFreshnessDays: 5 },
  'owoce':        { label: 'Owoce',         emoji: '🍎', defaultFreshnessDays: 5 },
  'pieczywo':     { label: 'Pieczywo',      emoji: '🍞', defaultFreshnessDays: 2 },
  'napoje':       { label: 'Napoje',        emoji: '🥤', defaultFreshnessDays: 3 },
  'mrożonki':     { label: 'Mrożonki',      emoji: '🧊', defaultFreshnessDays: 30 },
  'inne':         { label: 'Inne',           emoji: '📦', defaultFreshnessDays: 3 },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

export function getCategoryInfo(category: string): CategoryInfo {
  return CATEGORIES[category] || CATEGORIES['inne'];
}
