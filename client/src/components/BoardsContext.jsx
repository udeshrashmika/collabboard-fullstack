import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getBoards as getBoardsApi,
  createBoard as createBoardApi,
} from '../api/boardApi';

const BoardsContext = createContext(null);

function normalizeBoard(board) {
  return {
    ...board,

    id: board._id || board.id,

    // Existing frontend components expect "name"
    name: board.title || board.name,

    title: board.title || board.name,

    // These fields are not persisted by the current backend yet.
    description: board.description || '',
    color: board.color || 'accent',
    members: board.members || [],
    dueDate: board.dueDate || '',
  };
}

export function BoardsProvider({ children }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBoards = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBoardsApi();

      setBoards(data.map(normalizeBoard));
    } catch (err) {
      console.error('Failed to load boards:', err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load boards'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const createBoard = async (data) => {
    try {
      setError(null);

      if (!data.name?.trim()) {
        throw new Error('Board name is required');
      }

      const payload = {
        title: data.name.trim(),
      };

      const response = await createBoardApi(payload);

      const board = normalizeBoard(response);

      setBoards((prev) => [board, ...prev]);

      return board;
    } catch (err) {
      console.error('Failed to create board:', err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to create board'
      );

      throw err;
    }
  };

  const getBoard = (id) => {
    return (
      boards.find(
        (board) => String(board.id) === String(id)
      ) || null
    );
  };

  /*
   * These operations are intentionally unavailable until the
   * Board backend implements PATCH and DELETE endpoints.
   */
  const updateBoard = async () => {
    throw new Error(
      'Board update API has not been implemented yet'
    );
  };

  const deleteBoard = async () => {
    throw new Error(
      'Board delete API has not been implemented yet'
    );
  };

  const moveBoard = async () => {
    throw new Error(
      'Board status is not supported by the backend'
    );
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <BoardsContext.Provider
      value={{
        boards,
        loading,
        error,

        loadBoards,
        createBoard,
        getBoard,

        updateBoard,
        deleteBoard,
        moveBoard,

        clearError,
      }}
    >
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const ctx = useContext(BoardsContext);

  if (!ctx) {
    throw new Error(
      'useBoards must be used inside a BoardsProvider'
    );
  }

  return ctx;
}