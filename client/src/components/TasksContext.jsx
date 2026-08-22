import { createContext, useContext, useState, useEffect } from 'react';

const TasksContext = createContext(null);

function loadTasks() {
  const stored = localStorage.getItem('collabboard_tasks');
  return stored ? JSON.parse(stored) : [];
}

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks);

  useEffect(() => {
    localStorage.setItem('collabboard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const getTasksForBoard = (boardId) => tasks.filter((t) => t.boardId === boardId);

  const createTask = (boardId, data) => {
    const task = {
      id: crypto.randomUUID(),
      boardId,
      title: data.title,
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || '',
      assignee: data.assignee || '',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
    return task;
  };

  const updateTask = (id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const moveTask = (id, status) => {
    updateTask(id, { status });
  };

  return (
    <TasksContext.Provider value={{ getTasksForBoard, createTask, updateTask, deleteTask, moveTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside a TasksProvider');
  return ctx;
}
