import { describe, it, expect } from 'vitest';
import { darkBlueTheme, lightTheme } from '../src/styles/themes';

describe('themes', () => {
  it('dark blue theme has required color tokens', () => {
    expect(darkBlueTheme.bg).toBe('#1a1a2e');
    expect(darkBlueTheme.card).toBe('#16213e');
    expect(darkBlueTheme.accent).toBe('#64b5f6');
    expect(darkBlueTheme.ok).toBe('#66bb6a');
    expect(darkBlueTheme.warning).toBe('#ffa726');
    expect(darkBlueTheme.danger).toBe('#ef5350');
    expect(darkBlueTheme.text).toBe('#e8e8e8');
  });

  it('light theme has required color tokens', () => {
    expect(lightTheme.bg).toBe('#f5f7f0');
    expect(lightTheme.card).toBe('#e8eddf');
    expect(lightTheme.accent).toBe('#5a8a5a');
    expect(lightTheme.text).toBe('#2d3a2d');
  });
});
