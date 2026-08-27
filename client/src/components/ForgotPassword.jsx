import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuroraGlow, LogoOrbit } from './auth/AuthDecor';
import { useAuth } from './AuthContext.jsx';

function CheckCircleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Cannot reach the server. Is it running on port 5000?'
            : 'Could not send the reset link. Please try again.')
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
          {!sent ? (
            <>
              <LogoOrbit />

              <div className="auth-header">
                <h1>Forgot <em>password</em></h1>
                <p>Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="input-group">
                  <label htmlFor="forgot-email">Email address</label>
                  <div className={`input-shell${error ? ' has-error' : ''}`}>
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      autoComplete="email"
                      disabled={submitting}
                      required
                    />
                  </div>
                  {error && <p className="field-error" role="alert">{error}</p>}
                </div>

                <button type="submit" className="auth-button" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div className="auth-footer">
                Remembered your password? <Link to="/">Sign in</Link>
              </div>
            </>
          ) : (
            <>
              <div className="auth-success-icon">
                <CheckCircleIcon />
              </div>

              <div className="auth-header">
                <h1>Check your <em>email</em></h1>
                <p>
                  If an account exists for <strong>{email}</strong>, we've sent a
                  password reset link to that address. The link is valid for 30 minutes.
                </p>
              </div>

              <Link
                to="/"
                className="auth-button"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
              >
                Back to sign in
              </Link>

              <div className="auth-footer">
                Didn't get anything?{' '}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => { setSent(false); setError(''); }}
                >
                  Try a different email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}