import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-tab ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Lodówka</span>
      </button>

      <button className="fab" onClick={() => navigate('/add')}>
        <span>+</span>
      </button>

      <button
        className={`nav-tab ${isActive('/shopping') ? 'active' : ''}`}
        onClick={() => navigate('/shopping')}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">Zakupy</span>
      </button>
    </nav>
  );
}
