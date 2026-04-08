import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BottomNav from './BottomNav';

export default function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="top-bar">
        <span className="top-bar-title">SmartFridge</span>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        {menuOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-user">{profile?.display_name}</div>
            <button onClick={() => { navigate('/settings'); setMenuOpen(false); }}>
              Ustawienia
            </button>
            <button onClick={logout}>Wyloguj</button>
          </div>
        )}
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
