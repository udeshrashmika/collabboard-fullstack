import { useId, useState } from 'react';

export default function PasswordInput({
  label,
  error,
  required = true,
  disabled = false,
  id,
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const inputId = id || `password-${autoId}`;

  return (
    <div className="input-group">
      <label htmlFor={inputId}>{label}</label>

      <div className={`input-shell has-toggle${error ? ' has-error' : ''}`}>
        <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M7.5 10V7a4.5 4.5 0 0 1 9 0v3" />
        </svg>

        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...rest}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l18 18" />
              <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a13.4 13.4 0 0 1-3.1 3.9M6.6 6.6C4 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.4-.6" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          )}
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}