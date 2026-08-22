import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuroraGlow, LogoOrbit } from './auth/AuthDecor';
import PasswordInput from './auth/PasswordInput';
import { useAuth } from './AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ password: '', confirmPassword: '' });

  const handleRegister = (e) => {
    e.preventDefault();

    const errors = { password: '', confirmPassword: '' };
    if (password.length < 8) {
      errors.password = 'Use at least 8 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    if (errors.password || errors.confirmPassword) return;

    login({ name, email });
    navigate('/board');
  };

  return (
    <div className="auth-page">
      <div className="auth-scene">
        <AuroraGlow />

        <div className="auth-container">
          <LogoOrbit />

          <div className="auth-header">
            <h1>Join <em>CollabBoard</em></h1>
            <p>Create an account and start collaborating</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full name</label>
              <div className="input-shell">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                </svg>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: '' }));
              }}
              autoComplete="new-password"
              error={fieldErrors.password}
            />

            <PasswordInput
              label="Confirm password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((f) => ({ ...f, confirmPassword: '' }));
              }}
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
            />

            <button type="submit" className="auth-button">
              Create Account
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
