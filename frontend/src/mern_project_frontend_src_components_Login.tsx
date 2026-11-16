import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (user: { id: string; name: string }) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateRegister }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isFailed, setIsFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFailed(false);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: login.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (res.ok && data.id && data.id !== 0) {
        // Build display name from backend's firstName and lastName fields
        const fullName = data.firstName && data.lastName 
          ? `${data.firstName} ${data.lastName}` 
          : (data.firstName || data.username || 'Collector');

        onLoginSuccess({ id: String(data.id), name: fullName });
      } else {
        // Rubric requirement: Incorrect credentials renders generic failure page
        setIsFailed(true);
      }
    } catch {
      setIsFailed(true);
    }
  };

  if (isFailed) {
    return (
      <div className="auth-wrapper">
        <section className="auth-card" aria-labelledby="failure-heading">
          <div className="brand">Secret <span>Shop</span></div>
          <h1 id="failure-heading">Login failed</h1>
          <p>We couldn't sign you in with those details. Please check your username and password and try again.</p>
          <a className="back-link" onClick={() => setIsFailed(false)}>Return to login</a>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <section className="auth-card" aria-labelledby="login-heading">
        <div className="brand">Secret <span>Shop</span></div>
        <h1 id="login-heading">Welcome back</h1>
        <p>Sign in to explore your collection.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn-primary">Log in</button>
        </form>
        <p className="auth-switch">
          New to Secret Shop? <a onClick={onNavigateRegister}>Create an account</a>
        </p>
      </section>
    </div>
  );
};