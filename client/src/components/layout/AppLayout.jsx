import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useBoards } from '../BoardsContext.jsx';
import { useHistory } from '../HistoryContext.jsx';
import AccountMenu from './AccountMenu';
import EditAccountModal from '../auth/EditAccountModal';
import ConfirmDialog from '../common/ConfirmDialog';

const navItems = [
  { to: '/board', label: 'My Boards', icon: BoardsIcon },
];

function BoardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function AppLayout() {
  const { user, logout, updateUser, deleteAccount } = useAuth();
  const { boards } = useBoards();
  const { history, removeFromHistory } = useHistory();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveAccount = (updates) => {
    updateUser(updates);
    setEditOpen(false);
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    setDeleteOpen(false);
    navigate('/');
  };

  const recentBoards = history
    .map((id) => boards.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <div className="auth-logo">C</div>
          <span>CollabBoard</span>
        </div>

        <div className="sidebar-scroll">
          <nav className="sidebar-nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {recentBoards.length > 0 && (
            <div className="sidebar-section">
              <span className="sidebar-section-label">Recent</span>
              <div className="sidebar-recent-list">
                {recentBoards.map((b) => (
                  <div key={b.id} className="sidebar-recent-row">
                    <NavLink
                      to={`/board/${b.id}`}
                      className={({ isActive }) => `sidebar-recent-item${isActive ? ' active' : ''}`}
                    >
                      <ClockIcon />
                      <span>{b.name}</span>
                    </NavLink>
                    <button
                      type="button"
                      className="sidebar-recent-remove"
                      aria-label={`Remove ${b.name} from recent`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromHistory(b.id);
                      }}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogoutIcon />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <h2>Workspace</h2>
          <AccountMenu
            user={user}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {editOpen && (
        <EditAccountModal
          user={user}
          onSave={handleSaveAccount}
          onClose={() => setEditOpen(false)}
        />
      )}

      {deleteOpen && (
        <ConfirmDialog
          title="Delete your account?"
          message="You'll be signed out and need to sign up again to log back in. Your boards stay on this device either way, since they aren't tied to your account in this version of the app."
          confirmLabel="Delete account"
          onConfirm={handleDeleteAccount}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}