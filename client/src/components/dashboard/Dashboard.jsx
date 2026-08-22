import { useState } from 'react';
import { useBoards } from '../BoardsContext.jsx';
import { useTasks } from '../TasksContext.jsx';
import BoardCard from './BoardCard';
import BoardModal from './BoardModal';
import ConfirmDialog from '../common/ConfirmDialog';

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function BoardsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export default function Dashboard() {
  const { boards, createBoard, updateBoard, deleteBoard } = useBoards();
  const { getTasksForBoard } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [deletingBoard, setDeletingBoard] = useState(null);
  const [query, setQuery] = useState('');

  const openCreate = () => {
    setEditingBoard(null);
    setModalOpen(true);
  };

  const openEdit = (board) => {
    setEditingBoard(board);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingBoard) {
      updateBoard(editingBoard.id, data);
    } else {
      createBoard(data);
    }
    setModalOpen(false);
    setEditingBoard(null);
  };

  const handleConfirmDelete = () => {
    deleteBoard(deletingBoard.id);
    setDeletingBoard(null);
  };

  const getCounts = (boardId) => {
    const tasks = getTasksForBoard(boardId);
    return {
      todo: tasks.filter((t) => t.status === 'todo').length,
      doing: tasks.filter((t) => t.status === 'doing').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };
  };

  const filteredBoards = boards.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return b.name.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Your boards</h1>
          <p>{boards.length} {boards.length === 1 ? 'board' : 'boards'}</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search boards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <PlusIcon />
            New board
          </button>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BoardsIcon />
          </div>
          <h1>No boards yet</h1>
          <p>Create your first board to start organizing tasks.</p>
          <button type="button" className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={openCreate}>
            <PlusIcon />
            New board
          </button>
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="empty-state">
          <h1>No boards match "{query}"</h1>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="board-grid">
          {filteredBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              taskCounts={getCounts(board.id)}
              onEdit={openEdit}
              onDelete={setDeletingBoard}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <BoardModal
          initialBoard={editingBoard}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingBoard(null); }}
        />
      )}

      {deletingBoard && (
        <ConfirmDialog
          title="Delete this board?"
          message={`"${deletingBoard.name}" and all its tasks will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingBoard(null)}
        />
      )}
    </div>
  );
}
