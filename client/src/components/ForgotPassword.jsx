import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuroraGlow, LogoOrbit } from './auth/AuthDecor';

function CheckCircleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
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

              <form onSubmit={handleSubmit}>
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

                <button type="submit" className="auth-button">
                  Send reset link
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
                  password reset link to that address.
                </p>
              </div>

              <Link to="/" className="auth-button" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                Back to sign in
              </Link>

              <div className="auth-footer">
                Didn't get anything? <button type="button" className="auth-link-button" onClick={() => setSent(false)}>Try a different email</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}