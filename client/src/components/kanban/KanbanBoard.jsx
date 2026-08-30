import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useBoards } from '../BoardsContext.jsx';
import { useTasks } from '../TasksContext.jsx';
import { useHistory } from '../HistoryContext.jsx';

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
];

function normalizeColumnTitle(title = '') {
  return title.trim().toLowerCase();
}

function getStatusFromColumn(column) {
  const title = normalizeColumnTitle(column?.title);

  if (title === 'to do' || title === 'todo') {
    return 'todo';
  }

  if (
    title === 'doing' ||
    title === 'in progress' ||
    title === 'in-progress'
  ) {
    return 'doing';
  }

  if (title === 'done' || title === 'completed') {
    return 'done';
  }

  return '';
}

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

        <p>
          The board may have been deleted or is not available.
        </p>

        <Link
          to="/board"
          className="btn btn-primary"
        >
          Back to boards
        </Link>
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
            <p className="kanban-board-description">
              {board.description}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={loadTasks}
        >
          Refresh
        </button>
      </div>

      {columnsError && (
        <div className="field-error">
          {columnsError}
        </div>
      )}

      {tasksError && (
        <div className="field-error">
          {tasksError}
        </div>
      )}

      <div className="kanban-board">
        {orderedColumns.map(
          (column, columnIndex) => {
            const columnTasks = boardTasks.filter(
              (task) =>
                String(task.columnId) ===
                String(column._id)
            );

            const status =
              getStatusFromColumn(column);

            return (
              <section
                key={column._id}
                className={`kanban-column kanban-column-${status}`}
              >
                <div className="kanban-column-header">
                  <div className="kanban-column-title-row">
                    <h2>{column.title}</h2>

                    <span className="kanban-column-count">
                      {columnTasks.length}
                    </span>
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

      {modalOpen && (
        <TaskModal
          boardId={boardId}
          initialTask={editingTask}
          members={board.members || []}
          defaultStatus={
            editingTask?.status || 'todo'
          }
          onSave={handleSaveTask}
          onClose={closeModal}
        />
      )}
    </div>
  );
}