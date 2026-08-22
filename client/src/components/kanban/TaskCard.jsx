const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function PersonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function TaskCard({ task, onEdit, onDelete, onMove, canMoveLeft, canMoveRight }) {
  const dueLabel = formatDate(task.dueDate);
  const isDone = task.status === 'done';
  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div className={`task-card${isDone ? ' task-done' : ''}`}>
      <div className="task-card-top">
        <span className={`priority-badge priority-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
        <div className="task-card-menu-buttons">
          <button type="button" className="icon-btn icon-btn-sm icon-btn-edit" aria-label="Edit task" onClick={() => onEdit(task)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button type="button" className="icon-btn icon-btn-sm" aria-label="Delete task" onClick={() => onDelete(task)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>

      <p className="task-card-title">{task.title}</p>

      {task.description && <p className="task-card-desc">{task.description}</p>}

      <div className="task-card-footer">
        <div className="task-card-meta">
          {task.assignee && (
            <span className="task-assignee-pill">
              <PersonIcon />
              {task.assignee.split('@')[0]}
            </span>
          )}
          {dueLabel && (
            <span className={`task-due${isOverdue ? ' overdue' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {dueLabel}
            </span>
          )}
        </div>

        <div className="task-move-buttons">
          <button
            type="button"
            className="move-square-btn"
            aria-label="Move to previous column"
            disabled={!canMoveLeft}
            onClick={() => onMove(task, 'left')}
          >
            ‹
          </button>
          {isDone ? (
            <span className="task-done-badge" aria-label="Completed">
              <CheckIcon />
            </span>
          ) : (
            <button
              type="button"
              className="move-square-btn"
              aria-label="Move to next column"
              disabled={!canMoveRight}
              onClick={() => onMove(task, 'right')}
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
