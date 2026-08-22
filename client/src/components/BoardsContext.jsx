import { createContext, useContext, useState, useEffect } from 'react';

const BoardsContext = createContext(null);

function loadBoards() {
  const stored = localStorage.getItem('collabboard_boards');
  return stored ? JSON.parse(stored) : [];
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

  return (
    <BoardsContext.Provider value={{ boards, createBoard, updateBoard, deleteBoard }}>
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error('useBoards must be used inside a BoardsProvider');
  return ctx;
}
