import { useState, useRef, useEffect } from 'react';

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

export default function AccountMenu({ user, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className="account-menu" ref={ref}>
      <button type="button" className="topbar-user" onClick={() => setOpen((o) => !o)}>
        <div className="topbar-avatar">{initial}</div>
        <span>{user?.name || user?.email}</span>
      </button>

      {open && (
        <div className="account-dropdown">
          <div className="account-dropdown-header">
            <div className="topbar-avatar">{initial}</div>
            <div>
              <p className="account-dropdown-name">{user?.name || 'No name set'}</p>
              <p className="account-dropdown-email">{user?.email}</p>
            </div>
          </div>

          <div className="account-dropdown-divider" />

          <button
            type="button"
            className="account-dropdown-item"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <EditIcon />
            Edit account
          </button>

          <button
            type="button"
            className="account-dropdown-item danger"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <TrashIcon />
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}