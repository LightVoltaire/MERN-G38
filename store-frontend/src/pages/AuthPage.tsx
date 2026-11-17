import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { setSession } from '../utils/session';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000').replace(/\/$/, '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/register' : '/api/login';
    const body = isRegister
      ? { username, password, firstName, lastName, email }
      : { username, password };

    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Authentication failed.');
        return;
      }

      const userId = data.userId ?? data.id ?? data._id;
      if (!userId) {
        setError('The server response did not include a user ID.');
        return;
      }
      setSession({ userId: String(userId), username: data.username ?? username });
      navigate('/home');
    } catch {
      setError('Could not connect to the server. Check that the backend is running.');
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
      <div className="text-center mb-4">
        <h1 className="display-4 fw-bold">Secret Shop</h1>
        <p className="text-muted">The Grand Action Figure Repository &amp; Marketplace</p>
      </div>
      <div className="card shadow p-4 w-100" style={{ maxWidth: '420px' }}>
        <ul className="nav nav-pills nav-fill mb-4">
          <li className="nav-item">
            <button type="button" className={`nav-link ${!isRegister ? 'active' : ''}`} onClick={() => { setIsRegister(false); setError(''); }}>Login</button>
          </li>
          <li className="nav-item">
            <button type="button" className={`nav-link ${isRegister ? 'active' : ''}`} onClick={() => { setIsRegister(true); setError(''); }}>Register</button>
          </li>
        </ul>
        <form onSubmit={handleSubmit}>
          {isRegister && <>
            <div className="mb-3"><label className="form-label">First Name</label><input className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
            <div className="mb-3"><label className="form-label">Last Name</label><input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
            <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          </>}
          <div className="mb-3"><label className="form-label">Username</label><input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="btn btn-dark w-100">{isRegister ? 'Create Account' : 'Enter Secret Shop'}</button>
          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
        </form>
      </div>
    </div>
  );
}
