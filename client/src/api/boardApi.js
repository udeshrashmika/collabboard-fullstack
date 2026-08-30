import apiClient from './apiClient';

export const getBoards = async () => {
  const response = await apiClient.get('/boards');

  return Array.isArray(response.data)
    ? response.data
    : response.data?.boards || [];
};

export const createBoard = async (boardData) => {
  const response = await apiClient.post('/boards', boardData);
  return response.data;
};