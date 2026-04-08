import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">SmartFridge</h1>
        <p className="auth-subtitle">Zaloguj się</p>
        <form onSubmit={handleSubmit}>
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
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logowanie...' : 'Zaloguj'}
          </button>
        </form>
        <p className="auth-switch">
          Nie masz konta?{' '}
          <button onClick={onSwitch} className="auth-link">Zarejestruj się</button>
        </p>
      </div>
    </div>
  );
}
