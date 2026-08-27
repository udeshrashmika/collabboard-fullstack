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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/board');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Cannot reach the server. Is it running on port 5000?'
            : 'Could not sign in. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
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

          <form onSubmit={handleLogin} noValidate>
            <div className="input-group">
              <label htmlFor="login-email">Email address</label>
              <div className={`input-shell${error ? ' has-error' : ''}`}>
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              disabled={submitting}
            />

            {error && (
              <p className="field-error" role="alert">{error}</p>
            )}

            <div className="form-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-button" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
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