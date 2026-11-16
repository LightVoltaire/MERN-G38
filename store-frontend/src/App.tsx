import type { ReactNode } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import { getSession } from './utils/session';

// Only shows its page to a logged-in user; everyone else goes to the login page
function RequireLogin({ children }: { children: ReactNode }) {
  return getSession() ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<RequireLogin><HomePage /></RequireLogin>} />
        <Route path="/cart" element={<RequireLogin><CartPage /></RequireLogin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
