import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBoards } from '../BoardsContext.jsx';
import { useHistory } from '../HistoryContext.jsx';

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
];

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

export default function KanbanBoard() {
  const { boardId } = useParams();
  const { getBoard, moveBoard } = useBoards();
  const { visitBoard } = useHistory();

  useEffect(() => {
    if (boardId) visitBoard(boardId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const board = getBoard(boardId);

  if (!board) {
    return (
      <div className="empty-state">
        <h1>Board not found</h1>
        <p>It may have been deleted.</p>
      </div>
    );
  }

  const status = board.status || 'todo';
  const index = COLUMNS.findIndex((c) => c.id === status);
  const due = formatDate(board.dueDate);
  const members = board.members || [];

  const shift = (delta) => {
    const next = COLUMNS[index + delta];
    if (next) moveBoard(board.id, next.id);
  };

  return (
    <div>
      <Link to="/board" className="back-link">← All boards</Link>

      <div className="kanban-columns">
        {COLUMNS.map((col, colIndex) => (
          <section key={col.id} className="kanban-column">
            <div className="kanban-column-header">
              <h3>{col.label}</h3>
            </div>

            <div className="kanban-column-body">
              {colIndex === index ? (
                <article className="board-detail-card">
                  <div
                    className="board-detail-color"
                    style={{ background: board.color }}
                  />

                  <h4 className="board-detail-title">{board.name}</h4>

                  {board.description && (
                    <p className="board-detail-desc">{board.description}</p>
                  )}

                  <div className="board-detail-meta">
                    {members.length > 0 ? (
                      <div className="avatar-stack">
                        {members.slice(0, 3).map((m) => (
                          <span
                            key={m.id || m.email}
                            className="avatar-stack-item"
                            title={m.email || m.name}
                          >
                            {initials(m.name || m.email)}
                          </span>
                        ))}
                        {members.length > 3 && (
                          <span className="avatar-stack-item avatar-stack-more">
                            +{members.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="board-card-no-members">No members yet</span>
                    )}

                    {due && (
                      <span className="board-due">
                        <CalendarIcon />
                        {due}
                      </span>
                    )}
                  </div>

                  <div className="board-detail-move">
                    <button
                      type="button"
                      className="move-square-btn"
                      disabled={index === 0}
                      aria-label="Move back"
                      onClick={() => shift(-1)}
                    >
                      ‹
                    </button>
                    <span className="board-detail-step">
                      {index + 1} / {COLUMNS.length}
                    </span>
                    <button
                      type="button"
                      className="move-square-btn"
                      disabled={index === COLUMNS.length - 1}
                      aria-label="Move to next column"
                      onClick={() => shift(1)}
                    >
                      ›
                    </button>
                  </div>
                </article>
              ) : (
                <p className="kanban-column-empty">—</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}