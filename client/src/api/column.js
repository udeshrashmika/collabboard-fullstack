import apiClient from './apiClient';


export const getColumns = async (boardId) => {
  const response = await apiClient.get(`/columns/board/${boardId}`);
  return response.data;
};


export const createColumn = async (columnData) => {
  const response = await apiClient.post('/columns', columnData);
  return response.data;
};


export const updateColumn = async (columnId, columnData) => {
  const response = await apiClient.put(`/columns/${columnId}`, columnData);
  return response.data;
};


export const deleteColumn = async (columnId) => {
  const response = await apiClient.delete(`/columns/${columnId}`);
  return response.data;
};