import apiClient from "./apiClient";

export const getTasks = async (filters = {}) => {
  const response = await apiClient.get("/tasks", {
    params: filters,
  });

  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await apiClient.get(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await apiClient.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await apiClient.patch(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const moveTask = async (taskId, columnId) => {
  const response = await apiClient.patch(`/tasks/${taskId}/move`, {
    columnId,
  });

  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};