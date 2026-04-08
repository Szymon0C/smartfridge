import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [hasCode, setHasCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName, hasCode ? inviteCode : undefined);
    } catch (err: any) {
      setError(err.message || 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">SmartFridge</h1>
        <p className="auth-subtitle">Utwórz konto</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Imię"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Hasło (min. 6 znaków)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="auth-input"
          />
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={hasCode}
              onChange={(e) => setHasCode(e.target.checked)}
            />
            Mam kod zaproszenia
          </label>
          {hasCode && (
            <input
              type="text"
              placeholder="Kod zaproszenia (6 znaków)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              maxLength={6}
              required={hasCode}
              className="auth-input"
            />
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Rejestracja...' : hasCode ? 'Dołącz do domu' : 'Utwórz dom'}
          </button>
        </form>
        <p className="auth-switch">
          Masz już konto?{' '}
          <button onClick={onSwitch} className="auth-link">Zaloguj się</button>
        </p>
      </div>
    </div>
  );
}
