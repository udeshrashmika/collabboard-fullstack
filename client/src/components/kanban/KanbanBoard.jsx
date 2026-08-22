import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBoards } from '../BoardsContext.jsx';
import { useTasks } from '../TasksContext.jsx';
import { useHistory } from '../HistoryContext.jsx';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import ConfirmDialog from '../common/ConfirmDialog';

const COLUMNS = [
  { status: 'todo', title: 'To Do' },
  { status: 'doing', title: 'Doing' },
  { status: 'done', title: 'Done' },
];

export default function KanbanBoard() {
  const { boardId } = useParams();
  const { boards } = useBoards();
  const { getTasksForBoard, updateTask, deleteTask, moveTask } = useTasks();
  const { visitBoard } = useHistory();

  const board = boards.find((b) => b.id === boardId);
  const tasks = getTasksForBoard(boardId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  useEffect(() => {
    if (board) visitBoard(boardId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, !!board]);

  if (!board) {
    return (
      <div className="empty-state">
        <h1>Board not found</h1>
        <p>This board may have been deleted.</p>
        <Link to="/board" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
          Back to boards
        </Link>
      </div>
    );
  }

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    updateTask(editingTask.id, data);
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleConfirmDelete = () => {
    deleteTask(deletingTask.id);
    setDeletingTask(null);
  };

  const handleMove = (task, direction) => {
    const order = ['todo', 'doing', 'done'];
    const currentIndex = order.indexOf(task.status);
    const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= order.length) return;
    moveTask(task.id, order[nextIndex]);
  };

  return (
    <div>
      <div className="dashboard-header">
        <Link to="/board" className="back-link">← All boards</Link>
      </div>

      <div className="kanban-columns">
        {COLUMNS.map(({ status, title }) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <h3>{title}</h3>
              </div>

              <div className="kanban-column-body">
                {columnTasks.length === 0 && (
                  <p className="kanban-column-empty">No tasks yet</p>
                )}
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEdit}
                    onDelete={setDeletingTask}
                    onMove={handleMove}
                    canMoveLeft={task.status !== 'todo'}
                    canMoveRight={task.status !== 'done'}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && editingTask && (
        <TaskModal
          boardId={boardId}
          initialTask={editingTask}
          members={board.members}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${deletingTask.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}
