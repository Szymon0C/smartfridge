import { useState, useEffect, useCallback } from 'react';
import { darkBlueTheme, lightTheme, applyTheme } from '../styles/themes';

type ThemeMode = 'dark' | 'light';

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'dark';
  });

  useEffect(() => {
    applyTheme(mode === 'dark' ? darkBlueTheme : lightTheme);
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { mode, toggle };
}
