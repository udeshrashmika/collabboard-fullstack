import { Link } from 'react-router-dom';

const STATUS = {
  todo:  { label: 'To Do', className: 'status-todo' },
  doing: { label: 'Doing', className: 'status-doing' },
  done:  { label: 'Done',  className: 'status-done' },
};

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
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const isOverdue = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

export default function BoardCard({ board, onEdit, onDelete }) {
  const status = STATUS[board.status] ?? STATUS.todo;
  const due = formatDate(board.dueDate);
  const overdue = board.status !== 'done' && isOverdue(board.dueDate);

  const shown = (board.members || []).slice(0, 3);
  const extra = (board.members || []).length - shown.length;

  return (
    <article className="board-card">
      <div className="board-card-color" style={{ background: board.color }} />

      <Link to={`/board/${board.id}`} className="board-card-link">
        <div className="board-card-top">
          <h3>{board.name}</h3>
          <div className="board-card-actions">
            <span className={`status-badge ${status.className}`}>{status.label}</span>
            <button
              type="button"
              className="icon-btn icon-btn-edit"
              aria-label={`Edit ${board.name}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(board); }}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              aria-label={`Delete ${board.name}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(board); }}
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {board.description && <p className="board-card-desc">{board.description}</p>}

        <div className="board-card-footer">
          {shown.length > 0 ? (
            <div className="avatar-stack">
              {shown.map((m) => (
                <span key={m.id || m.email} className="avatar-stack-item" title={m.email || m.name}>
                  {initials(m.name || m.email)}
                </span>
              ))}
              {extra > 0 && <span className="avatar-stack-item avatar-stack-more">+{extra}</span>}
            </div>
          ) : (
            <span className="board-card-no-members">No members yet</span>
          )}

          {due && (
            <span className={`board-due${overdue ? ' overdue' : ''}`}>
              <CalendarIcon />
              {due}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}