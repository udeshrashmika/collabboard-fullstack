import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuroraGlow, LogoOrbit } from './auth/AuthDecor';
import PasswordInput from './auth/PasswordInput';
import apiClient from '../api/apiClient';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token');
  const email = params.get('email');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (password !== confirm) {
      return setError('The two passwords do not match.');
    }

    setSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', { email, token, password });
      setDone(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset the password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-scene">
          <div className="auth-container">
            <div className="auth-header">
              <h1>Invalid <em>link</em></h1>
              <p>This reset link is incomplete or malformed.</p>
            </div>
            <div className="auth-footer">
              <Link to="/forgot-password">Request a new one</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-scene">
        <AuroraGlow />

        <div className="auth-container">
          <LogoOrbit />

          {done ? (
            <>
              <div className="auth-header">
                <h1>Password <em>changed</em></h1>
                <p>Taking you to the sign-in page…</p>
              </div>
              <div className="auth-footer">
                <Link to="/">Sign in now</Link>
              </div>
            </>
          ) : (
            <>
              <div className="auth-header">
                <h1>Choose a <em>new password</em></h1>
                <p>Resetting the password for {email}</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <PasswordInput
                  label="New password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete="new-password"
                  disabled={submitting}
                />

                <PasswordInput
                  label="Confirm new password"
                  placeholder="Type it again"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  autoComplete="new-password"
                  disabled={submitting}
                />

                {error && <p className="field-error" role="alert">{error}</p>}

                <button type="submit" className="auth-button" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Reset password'}
                </button>
              </form>

              <div className="auth-footer">
                Remembered it? <Link to="/">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}