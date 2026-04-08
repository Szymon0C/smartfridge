import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FridgePage from './pages/FridgePage';
import ShoppingPage from './pages/ShoppingPage';
import AddProductPage from './pages/AddProductPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const auth = useAuthProvider();
  useTheme();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (auth.loading) {
    return <div className="loading-screen"><p>SmartFridge</p></div>;
  }

  if (!auth.user || !auth.profile) {
    return (
      <AuthContext.Provider value={auth}>
        {authView === 'login' ? (
          <LoginPage onSwitch={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitch={() => setAuthView('login')} />
        )}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter basename="/smartfridge">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<FridgePage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
            <Route path="/add" element={<AddProductPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
