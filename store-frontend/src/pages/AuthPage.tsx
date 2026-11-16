import { setSession } from '../utils/session';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegister ? '/api/register' : '/api/login';
    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        return;
      }

      setSession({ userId: data.userId, username: data.username });
      navigate('/home');
    } catch {
      setError('Server connection error.');
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
      <div className="text-center mb-4">
        <h1 className="display-4 fw-bold">Secret Shop</h1>
        <p className="text-muted">The Grand Action Figure Repository & Marketplace</p>
      </div>

      <div className="card shadow p-4 w-100" style={{ maxWidth: '420px' }}>
        <ul className="nav nav-pills nav-fill mb-4">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setError(''); }}
            >
              Login
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setError(''); }}
            >
              Register
            </button>
          </li>
        </ul>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100">
            {isRegister ? 'Create Account' : 'Enter Secret Shop'}
          </button>
          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
        </form>
      </div>
    </div>
  );
}