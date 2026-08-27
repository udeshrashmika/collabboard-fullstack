import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuroraGlow, LogoOrbit } from './auth/AuthDecor';
import PasswordInput from './auth/PasswordInput';
import { useAuth } from './AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');

    const errors = { password: '', confirmPassword: '' };
    if (password.length < 8) {
      errors.password = 'Use at least 8 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    if (errors.password || errors.confirmPassword) return;

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/board');
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Cannot reach the server. Is it running on port 5000?'
            : 'Could not create the account. Please try again.')
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
            <h1>Join <em>CollabBoard</em></h1>
            <p>Create an account and start collaborating</p>
          </div>

          <form onSubmit={handleRegister} noValidate>
            <div className="input-group">
              <label htmlFor="register-name">Full name</label>
              <div className="input-shell">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
                </svg>
                <input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFormError(''); }}
                  autoComplete="name"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="register-email">Email address</label>
              <div className={`input-shell${formError ? ' has-error' : ''}`}>
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <input
                  id="register-email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                  autoComplete="email"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <PasswordInput
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: '' }));
              }}
              autoComplete="new-password"
              error={fieldErrors.password}
              disabled={submitting}
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
              disabled={submitting}
            />

            {formError && <p className="field-error" role="alert">{formError}</p>}

            <button type="submit" className="auth-button" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create Account'}
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