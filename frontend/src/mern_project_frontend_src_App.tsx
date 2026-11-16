import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { MainApp } from './components/MainApp';
import './styles/theme.css';

export const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'main'>('login');
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Check if user session exists
    const storedId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('userName');
    if (storedId && storedName) {
      setUser({ id: storedId, name: storedName });
      setView('main');
    }
  }, []);

  const handleLoginSuccess = (userData: { id: string; name: string }) => {
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name);
    setUser(userData);
    setView('main');
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setUser(null);
    setView('login');
  };

  if (view === 'main' && user) {
    return <MainApp user={user} onLogout={handleLogout} />;
  }

  if (view === 'register') {
    return <Register onNavigateLogin={() => setView('login')} />;
  }

  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onNavigateRegister={() => setView('register')}
    />
  );
};

export default App;
