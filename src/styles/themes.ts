export interface Theme {
  bg: string;
  card: string;
  accent: string;
  ok: string;
  warning: string;
  danger: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const darkBlueTheme: Theme = {
  bg: '#1a1a2e',
  card: '#16213e',
  accent: '#64b5f6',
  ok: '#66bb6a',
  warning: '#ffa726',
  danger: '#ef5350',
  text: '#e8e8e8',
  textSecondary: '#888',
  border: '#2a2a4a',
};

export const lightTheme: Theme = {
  bg: '#f5f7f0',
  card: '#e8eddf',
  accent: '#5a8a5a',
  ok: '#5a8a5a',
  warning: '#d4890a',
  danger: '#c0392b',
  text: '#2d3a2d',
  textSecondary: '#666',
  border: '#ccc',
};

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}
