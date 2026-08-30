import apiClient from './apiClient';

export const getColumns = async (boardId) => {
  const response = await apiClient.get('/columns');

  const columns = Array.isArray(response.data)
    ? response.data
    : response.data?.columns || [];

  if (!boardId) {
    return columns;
  }

  return columns.filter(
    (column) => String(column.boardId) === String(boardId)
  );
};

export const createColumn = async (columnData) => {
  const response = await apiClient.post('/columns', columnData);
  return response.data;
};