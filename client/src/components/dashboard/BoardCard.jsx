import { Link } from 'react-router-dom';

const COLOR_VAR = {
  accent: 'var(--accent)',
  coral: 'var(--cursor-coral)',
  teal: 'var(--cursor-teal)',
  amber: 'var(--cursor-amber)',
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
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function BoardCard({ board, taskCounts, onEdit, onDelete }) {
  const visibleMembers = board.members.slice(0, 3);
  const extraCount = board.members.length - visibleMembers.length;
  const dueLabel = formatDate(board.dueDate);
  const isOverdue = board.dueDate && new Date(board.dueDate) < new Date(new Date().toDateString());
  const total = taskCounts.todo + taskCounts.doing + taskCounts.done;

  let boardStatus = 'To Do';
  if (total === 0) {
    boardStatus = 'Empty';
  } else if (taskCounts.done === total) {
    boardStatus = 'Done';
  } else if (taskCounts.doing > 0 || taskCounts.done > 0) {
    boardStatus = 'Doing';
  }

  const statusColors = {
    'Empty': '#9ca3af',
    'To Do': '#6b7280',
    'Doing': '#3b82f6',
    'Done': '#10b981'
  };

  return (
    <div className="board-card">
      <div className="board-card-color" style={{ backgroundColor: COLOR_VAR[board.color] || COLOR_VAR.accent }} />

      <div className="board-card-top">
        <Link to={`/board/${board.id}`} className="board-card-link">
          <h3>{board.name}</h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: statusColors[boardStatus] + '20',
            color: statusColors[boardStatus],
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {boardStatus}
          </span>

          <div className="board-card-actions">
            <button type="button" className="icon-btn" aria-label="Edit board" onClick={() => onEdit(board)}>
              <EditIcon />
            </button>
            <button type="button" className="icon-btn icon-btn-danger" aria-label="Delete board" onClick={() => onDelete(board)}>
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {board.description && <p className="board-card-desc">{board.description}</p>}

      {total > 0 && (
        <div className="board-progress">
          <div className="board-progress-bar">
            {taskCounts.done > 0 && (
              <span className="board-progress-segment done" style={{ width: `${(taskCounts.done / total) * 100}%` }} />
            )}
            {taskCounts.doing > 0 && (
              <span className="board-progress-segment doing" style={{ width: `${(taskCounts.doing / total) * 100}%` }} />
            )}
            {taskCounts.todo > 0 && (
              <span className="board-progress-segment todo" style={{ width: `${(taskCounts.todo / total) * 100}%` }} />
            )}
          </div>
          <div className="board-progress-labels">
            <span><span className="dot done" /> {taskCounts.done} done</span>
            <span><span className="dot doing" /> {taskCounts.doing} doing</span>
            <span><span className="dot todo" /> {taskCounts.todo} to do</span>
          </div>
        </div>
      )}

      <div className="board-card-footer">
        <div className="avatar-stack">
          {visibleMembers.map((m) => (
            <div key={m.id} className="avatar-stack-item" title={m.email}>
              {m.email.charAt(0).toUpperCase()}
            </div>
          ))}
          {extraCount > 0 && <div className="avatar-stack-item avatar-stack-more">+{extraCount}</div>}
          {board.members.length === 0 && <span className="board-card-no-members">No members yet</span>}
        </div>

        {dueLabel && (
          <span className={`board-due${isOverdue ? ' overdue' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {dueLabel}
          </span>
        )}
      </div>
    </div>
  );
}
