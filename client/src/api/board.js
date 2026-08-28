import apiClient from './apiClient';


export const getBoards = async () => {
  const response = await apiClient.get('/boards');
  return response.data.map(board => ({
    ...board,
    name: board.title,
    id: board._id
  }));
};


export const createBoard = async (boardData) => {
  
  const dataToSend = {
    title: boardData.name,
    description: boardData.description,
    color: boardData.color,
  };

  
  if (boardData.dueDate) {
    dataToSend.dueDate = boardData.dueDate;
  }

  
  dataToSend.members = [];
  
  const response = await apiClient.post('/boards', dataToSend);
  return { 
    ...response.data, 
    name: response.data.title, 
    id: response.data._id 
  };
};


export const updateBoard = async (boardId, boardData) => {
  const dataToSend = {
    title: boardData.name,
    description: boardData.description,
    color: boardData.color,
  };

  if (boardData.dueDate) {
    dataToSend.dueDate = boardData.dueDate;
  }

  
  
  const response = await apiClient.put(`/boards/${boardId}`, dataToSend);
  return { 
    ...response.data, 
    name: response.data.title, 
    id: response.data._id 
  };
};


export const deleteBoard = async (boardId) => {
  const response = await apiClient.delete(`/boards/${boardId}`);
  return response.data;
};