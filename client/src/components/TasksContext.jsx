import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getTasks as fetchTasksApi,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  moveTask as moveTaskApi,
} from '../api/taskApi';

const TasksContext = createContext(null);

function normalizeTask(task) {
  const populatedColumn =
    typeof task.columnId === 'object' &&
    task.columnId !== null
      ? task.columnId
      : null;

  const populatedAssignee =
    typeof task.assignee === 'object' &&
    task.assignee !== null
      ? task.assignee
      : null;

  return {
    ...task,

    id: task._id || task.id,

    columnId: populatedColumn
      ? populatedColumn._id
      : task.columnId,

    boardId: populatedColumn
      ? populatedColumn.boardId
      : task.boardId,

    columnTitle: populatedColumn
      ? populatedColumn.title
      : task.columnTitle,

    assignee: populatedAssignee
      ? populatedAssignee._id
      : task.assignee,

    assigneeDetails:
      populatedAssignee || null,

    priority:
      task.priority || 'medium',

    dueDate:
      task.dueDate || '',
  };
}

export function TasksProvider({
  children,
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await fetchTasksApi();

      const apiTasks =
        response?.tasks || [];

      setTasks(
        apiTasks.map(normalizeTask)
      );
    } catch (err) {
      console.error(
        'Failed to load tasks:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load tasks'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getTasksForBoard = (
    boardId
  ) => {
    if (!boardId) {
      return [];
    }

    return tasks.filter(
      (task) =>
        String(task.boardId) ===
        String(boardId)
    );
  };

  const createTask = async (
    boardId,
    data
  ) => {
    try {
      setError(null);

      if (!data.title?.trim()) {
        throw new Error(
          'Task title is required'
        );
      }

      if (!data.columnId) {
        throw new Error(
          'Column ID is required'
        );
      }

      const payload = {
        title: data.title.trim(),

        description:
          data.description?.trim() ||
          '',

        columnId: data.columnId,

        assignee:
          data.assignee || null,

        priority:
          data.priority || 'medium',

        dueDate:
          data.dueDate || null,
      };

      const response =
        await createTaskApi(
          payload
        );

      const createdTask =
        normalizeTask(
          response.task
        );

      setTasks((prev) => [
        createdTask,
        ...prev,
      ]);

      return createdTask;
    } catch (err) {
      console.error(
        'Failed to create task:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create task';

      setError(message);

      throw err;
    }
  };

  const updateTask = async (
    id,
    updates
  ) => {
    try {
      setError(null);

      if (!id) {
        throw new Error(
          'Task ID is required'
        );
      }

      const payload = {};

      if (
        updates.title !==
        undefined
      ) {
        payload.title =
          updates.title;
      }

      if (
        updates.description !==
        undefined
      ) {
        payload.description =
          updates.description;
      }

      if (
        updates.assignee !==
        undefined
      ) {
        payload.assignee =
          updates.assignee ||
          null;
      }

      if (
        updates.priority !==
        undefined
      ) {
        payload.priority =
          updates.priority;
      }

      if (
        updates.dueDate !==
        undefined
      ) {
        payload.dueDate =
          updates.dueDate ||
          null;
      }

      const response =
        await updateTaskApi(
          id,
          payload
        );

      const updatedTask =
        normalizeTask(
          response.task
        );

      setTasks((prev) =>
        prev.map((task) =>
          String(task.id) ===
          String(id)
            ? updatedTask
            : task
        )
      );

      return updatedTask;
    } catch (err) {
      console.error(
        'Failed to update task:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update task';

      setError(message);

      throw err;
    }
  };

  const deleteTask = async (
    id
  ) => {
    try {
      setError(null);

      if (!id) {
        throw new Error(
          'Task ID is required'
        );
      }

      await deleteTaskApi(id);

      setTasks((prev) =>
        prev.filter(
          (task) =>
            String(task.id) !==
            String(id)
        )
      );
    } catch (err) {
      console.error(
        'Failed to delete task:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete task';

      setError(message);

      throw err;
    }
  };

  const moveTask = async (
    id,
    columnId
  ) => {
    try {
      setError(null);

      if (!id) {
        throw new Error(
          'Task ID is required'
        );
      }

      if (!columnId) {
        throw new Error(
          'Destination column ID is required'
        );
      }

      const response =
        await moveTaskApi(
          id,
          columnId
        );

      const movedTask =
        normalizeTask(
          response.task
        );

      setTasks((prev) =>
        prev.map((task) =>
          String(task.id) ===
          String(id)
            ? movedTask
            : task
        )
      );

      return movedTask;
    } catch (err) {
      console.error(
        'Failed to move task:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to move task';

      setError(message);

      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,

        loadTasks,
        getTasksForBoard,

        createTask,
        updateTask,
        deleteTask,
        moveTask,

        clearError,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx =
    useContext(TasksContext);

  if (!ctx) {
    throw new Error(
      'useTasks must be used inside a TasksProvider'
    );
  }

  return ctx;
}