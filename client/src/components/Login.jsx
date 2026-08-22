import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuroraGlow, LogoOrbit } from './auth/AuthDecor';
import PasswordInput from './auth/PasswordInput';
import { useAuth } from './AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    login({ email });
    navigate('/board');
  };

  return (
    <div className="auth-page">
      <div className="auth-scene">
        <AuroraGlow />

        <div className="auth-container">
          <LogoOrbit />

          <div className="auth-header">
            <h1>Welcome <em>back</em></h1>
            <p>Sign in to your CollabBoard account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email address</label>
              <div className="input-shell">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="form-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-button">
              Sign In
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
