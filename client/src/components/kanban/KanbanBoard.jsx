import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useBoards } from '../BoardsContext.jsx';
import { useTasks } from '../TasksContext.jsx';
import { useHistory } from '../HistoryContext.jsx';

import { getColumns } from '../../api/columnApi';

import TaskCard from './TaskCard.jsx';
import TaskModal from './TaskModal.jsx';

const DEFAULT_ORDER = {
  'to do': 0,
  todo: 0,
  doing: 1,
  'in progress': 1,
  'in-progress': 1,
  done: 2,
  completed: 2,
};

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

  const {
    getBoard,
    loading: boardsLoading,
  } = useBoards();

  const {
    loading: tasksLoading,
    error: tasksError,
    getTasksForBoard,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    loadTasks,
  } = useTasks();

  const { visitBoard } = useHistory();

  const [columns, setColumns] = useState([]);
  const [columnsLoading, setColumnsLoading] = useState(true);
  const [columnsError, setColumnsError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultColumnId, setDefaultColumnId] = useState(null);
  const [saving, setSaving] = useState(false);

  const board = getBoard(boardId);

  useEffect(() => {
    if (boardId) {
      visitBoard(boardId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  useEffect(() => {
    if (!boardId) {
      return;
    }

    let cancelled = false;

    const loadBoardColumns = async () => {
      try {
        setColumnsLoading(true);
        setColumnsError(null);

        const boardColumns = await getColumns(boardId);

        if (!cancelled) {
          setColumns(boardColumns);
        }
      } catch (error) {
        console.error('Failed to load columns:', error);

        if (!cancelled) {
          setColumnsError(
            error?.response?.data?.message ||
              error?.message ||
              'Failed to load board columns'
          );
        }
      } finally {
        if (!cancelled) {
          setColumnsLoading(false);
        }
      }
    };

    loadBoardColumns();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const boardTasks = useMemo(() => {
    return getTasksForBoard(boardId);
  }, [boardId, getTasksForBoard]);

  const orderedColumns = useMemo(() => {
    return [...columns].sort((a, b) => {
      const aOrder =
        DEFAULT_ORDER[normalizeColumnTitle(a.title)] ?? 99;

      const bOrder =
        DEFAULT_ORDER[normalizeColumnTitle(b.title)] ?? 99;

      return aOrder - bOrder;
    });
  }, [columns]);

  const openCreateModal = (columnId) => {
    setEditingTask(null);
    setDefaultColumnId(columnId);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setDefaultColumnId(task.columnId);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingTask(null);
    setDefaultColumnId(null);
  };

  const handleSaveTask = async (data) => {
    try {
      setSaving(true);

      if (editingTask) {
        await updateTask(editingTask.id, {
          title: data.title,
          description: data.description,
          assignee: data.assignee,
          priority: data.priority,
          dueDate: data.dueDate,
        });
      } else {
        await createTask(boardId, {
          title: data.title,
          description: data.description,
          assignee: data.assignee,
          priority: data.priority,
          dueDate: data.dueDate,
          columnId: defaultColumnId,
        });
      }

      setModalOpen(false);
      setEditingTask(null);
      setDefaultColumnId(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleMoveTask = async (task, direction) => {
    const currentIndex = orderedColumns.findIndex(
      (column) =>
        String(column._id) === String(task.columnId)
    );

    if (currentIndex === -1) {
      return;
    }

    const destinationIndex =
      direction === 'left'
        ? currentIndex - 1
        : currentIndex + 1;

    const destinationColumn =
      orderedColumns[destinationIndex];

    if (!destinationColumn) {
      return;
    }

    try {
      await moveTask(task.id, destinationColumn._id);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setColumnsLoading(true);

      const boardColumns = await getColumns(boardId);

      setColumns(boardColumns);

      await loadTasks();
    } catch (error) {
      console.error('Failed to refresh board:', error);
    } finally {
      setColumnsLoading(false);
    }
  };

  if (boardsLoading) {
    return (
      <div className="empty-state">
        <h1>Loading board...</h1>
      </div>
    );
  }

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

  if (columnsLoading || tasksLoading) {
    return (
      <div className="empty-state">
        <h1>{board.name}</h1>
        <p>Loading board tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/board"
        className="back-link"
      >
        ← Back to boards
      </Link>

      <div className="kanban-page-header">
        <div>
          <h1>{board.name}</h1>

          {board.description && (
            <p className="kanban-board-description">
              {board.description}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>

      {columnsError && (
        <p className="field-error">
          {columnsError}
        </p>
      )}

      {tasksError && (
        <p className="field-error">
          {tasksError}
        </p>
      )}

      <div className="kanban-columns">
        {orderedColumns.map((column, columnIndex) => {
          const columnTasks = boardTasks.filter(
            (task) =>
              String(task.columnId) ===
              String(column._id)
          );

          const status = getStatusFromColumn(column);

          return (
            <section
              key={column._id}
              className="kanban-column"
            >
              <div className="kanban-column-header">
                <div>
                  <h3>{column.title}</h3>

                  <span className="kanban-column-count">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Add task to ${column.title}`}
                  title={`Add task to ${column.title}`}
                  onClick={() =>
                    openCreateModal(column._id)
                  }
                >
                  +
                </button>
              </div>

              <div className="kanban-column-body">
                {columnTasks.length === 0 ? (
                  <div className="kanban-empty-column">
                    <p>No tasks yet</p>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        openCreateModal(column._id)
                      }
                    >
                      Add task
                    </button>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{
                        ...task,
                        status,
                      }}
                      onEdit={openEditModal}
                      onDelete={handleDeleteTask}
                      onMove={handleMoveTask}
                      canMoveLeft={columnIndex > 0}
                      canMoveRight={
                        columnIndex <
                        orderedColumns.length - 1
                      }
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
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