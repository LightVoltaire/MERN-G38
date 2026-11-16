import React, { useState } from 'react';

interface RegisterProps {
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({ text: 'Account created successfully! Redirecting to login...', isError: false });
        setTimeout(() => {
          onNavigateLogin();
        }, 1200);
      } else {
        setStatusMsg({ text: data.error || 'Registration failed.', isError: true });
      }
    } catch {
      setStatusMsg({ text: 'Failed to connect to authentication server.', isError: true });
    }
  };

  return (
    <div className="auth-wrapper">
      <section className="auth-card" aria-labelledby="register-heading">
        <div className="brand">Secret <span>Shop</span></div>
        <h1 id="register-heading">Create your account</h1>
        <p>Join the Secret Shop collector community.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label>
              First Name
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label>
              Last Name
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
          </div>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Username
            <input type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" autoComplete="new-password" minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="btn-primary">Register</button>
        </form>
        {statusMsg && (
          <p className={`auth-message ${statusMsg.isError ? 'error' : 'success'}`}>
            {statusMsg.text}
          </p>
        )}
        <p className="auth-switch">
          Already registered? <a onClick={onNavigateLogin}>Log in</a>
        </p>
      </section>
    </div>
  );
};