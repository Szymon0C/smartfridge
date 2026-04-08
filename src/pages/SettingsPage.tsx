import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../lib/supabase';
import type { FreshnessRule, Household } from '../lib/types';

export default function SettingsPage() {
  const { profile, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const navigate = useNavigate();
  const [household, setHousehold] = useState<Household | null>(null);
  const [rules, setRules] = useState<FreshnessRule[]>([]);

  useEffect(() => {
    if (!profile) return;

    supabase
      .from('households')
      .select('*')
      .eq('id', profile.household_id)
      .single()
      .then(({ data }) => { if (data) setHousehold(data as Household); });

    supabase
      .from('freshness_rules')
      .select('*')
      .or(`household_id.is.null,household_id.eq.${profile.household_id}`)
      .order('category')
      .then(({ data }) => { if (data) setRules(data as FreshnessRule[]); });
  }, [profile]);

  async function updateRule(category: string, days: number) {
    if (!profile) return;
    const existing = rules.find((r) => r.category === category && r.household_id === profile.household_id);
    if (existing) {
      await supabase.from('freshness_rules').update({ default_days: days }).eq('id', existing.id);
    } else {
      await supabase.from('freshness_rules').insert({
        household_id: profile.household_id,
        category,
        default_days: days,
        is_custom: true,
      });
    }
    const { data } = await supabase
      .from('freshness_rules')
      .select('*')
      .or(`household_id.is.null,household_id.eq.${profile.household_id}`)
      .order('category');
    if (data) setRules(data as FreshnessRule[]);
  }

  const mergedRules = Object.values(
    rules.reduce<Record<string, FreshnessRule>>((acc, r) => {
      if (!acc[r.category] || r.household_id) acc[r.category] = r;
      return acc;
    }, {})
  );

  return (
    <div className="page">
      <button className="back-button" onClick={() => navigate('/')}>← Wróć</button>
      <h2>Ustawienia</h2>

      <div className="settings-section">
        <h3>Motyw</h3>
        <button onClick={toggle} className="settings-button">
          {mode === 'dark' ? 'Ciemny (Dark Blue)' : 'Jasny (Light)'} — przełącz
        </button>
      </div>

      <div className="settings-section">
        <h3>Gospodarstwo domowe</h3>
        {household && (
          <>
            <p>Nazwa: <strong>{household.name}</strong></p>
            <p style={{ marginTop: 8 }}>
              Kod zaproszenia: <strong className="invite-code">{household.invite_code}</strong>
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-textSecondary)', marginTop: 4 }}>
              Podaj ten kod drugiej osobie żeby dołączyła do Twojego domu
            </p>
          </>
        )}
      </div>

      <div className="settings-section">
        <h3>Dni świeżości po otwarciu</h3>
        <div className="rules-list">
          {mergedRules.map((r) => (
            <div key={r.category} className="rule-row">
              <span className="rule-category">{r.category}</span>
              <div className="quantity-control" style={{ transform: 'scale(0.85)' }}>
                <button onClick={() => updateRule(r.category, Math.max(1, r.default_days - 1))}>−</button>
                <span>{r.default_days}</span>
                <button onClick={() => updateRule(r.category, r.default_days + 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <button
          onClick={logout}
          className="settings-button"
          style={{ color: 'var(--color-danger)' }}
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
}
