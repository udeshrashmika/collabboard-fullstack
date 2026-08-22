import { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext(null);
const MAX_HISTORY = 5;

function loadHistory() {
  const stored = localStorage.getItem('collabboard_history');
  return stored ? JSON.parse(stored) : [];
}

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    localStorage.setItem('collabboard_history', JSON.stringify(history));
  }, [history]);

  const visitBoard = (boardId) => {
    setHistory((prev) => {
      const filtered = prev.filter((id) => id !== boardId);
      return [boardId, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const removeFromHistory = (boardId) => {
    setHistory((prev) => prev.filter((id) => id !== boardId));
  };

  return (
    <HistoryContext.Provider value={{ history, visitBoard, removeFromHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside a HistoryProvider');
  return ctx;
}
