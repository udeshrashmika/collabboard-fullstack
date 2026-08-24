import { createContext, useContext, useState, useEffect } from 'react';

const BoardsContext = createContext(null);

function loadBoards() {
  try {
    const stored = localStorage.getItem('collabboard_boards');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function BoardsProvider({ children }) {
  const [boards, setBoards] = useState(loadBoards);

  useEffect(() => {
    localStorage.setItem('collabboard_boards', JSON.stringify(boards));
  }, [boards]);

  const createBoard = (data) => {
    const board = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || '',
      color: data.color || 'accent',
      members: data.members || [],
      dueDate: data.dueDate || '',
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    setBoards((prev) => [board, ...prev]);
    return board;
  };

  const updateBoard = (id, updates) => {
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBoard = (id) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBoard = (id, status) => {
    updateBoard(id, { status });
  };

  const getBoard = (id) => boards.find((b) => b.id === id) || null;

  return (
    <BoardsContext.Provider
      value={{ boards, createBoard, updateBoard, deleteBoard, moveBoard, getBoard }}
    >
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error('useBoards must be used inside a BoardsProvider');
  return ctx;
}