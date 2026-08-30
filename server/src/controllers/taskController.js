import mongoose from "mongoose";

import Task from "../../models/Task.js";
import Column from "../../models/Column.js";
import User from "../../models/User.js";

const PRIORITIES = ["low", "medium", "high"];

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const populateTask = (query) =>
  query
    .populate("columnId", "title boardId")
    .populate("assignee", "name email");

const handleControllerError = (
  error,
  res,
  defaultMessage
) => {
  /*
   * Mongoose optimistic concurrency conflict.
   *
   * This prevents concurrent modifications from
   * silently overwriting each other.
   */
  if (error?.name === "VersionError") {
    return res.status(409).json({
      message:
        "Task was modified by another request. Refresh and try again.",
      conflict: true,
    });
  }

  console.error(defaultMessage, error);

  return res.status(500).json({
    message: defaultMessage,
  });
};

/**
 * GET /api/tasks
 *
 * Optional filters:
 * ?columnId=<columnId>
 * ?assignee=<userId>
 */
export const getTasks = async (req, res) => {
  try {
    const { columnId, assignee } = req.query;

    const filter = {};

    if (columnId) {
      if (!isValidObjectId(columnId)) {
        return res.status(400).json({
          message: "Invalid column ID",
        });
      }

      filter.columnId = columnId;
    }

    if (assignee) {
      if (!isValidObjectId(assignee)) {
        return res.status(400).json({
          message: "Invalid assignee ID",
        });
      }

      filter.assignee = assignee;
    }

    const tasks = await populateTask(
      Task.find(filter).sort({
        createdAt: -1,
      })
    );

    return res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Failed to retrieve tasks"
    );
  }
};

/**
 * POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      columnId,
      assignee,
      priority,
      dueDate,
    } = req.body;

    /*
     * Validate title
     */
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    /*
     * Validate column
     */
    if (!columnId) {
      return res.status(400).json({
        message: "Column ID is required",
      });
    }

    if (!isValidObjectId(columnId)) {
      return res.status(400).json({
        message: "Invalid column ID",
      });
    }

    const column = await Column.findById(
      columnId
    );

    if (!column) {
      return res.status(404).json({
        message: "Column not found",
      });
    }

    /*
     * Validate priority
     */
    if (
      priority !== undefined &&
      !PRIORITIES.includes(priority)
    ) {
      return res.status(400).json({
        message:
          "Priority must be low, medium, or high",
      });
    }

    /*
     * Validate due date
     */
    let parsedDueDate = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);

      if (
        Number.isNaN(parsedDueDate.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }
    }

    /*
     * Validate assignee
     */
    let assigneeId = null;

    if (assignee) {
      if (!isValidObjectId(assignee)) {
        return res.status(400).json({
          message: "Invalid assignee ID",
        });
      }

      const user = await User.findById(
        assignee
      );

      if (!user) {
        return res.status(404).json({
          message: "Assignee not found",
        });
      }

      assigneeId = user._id;
    }

    /*
     * Create task
     */
    const task = await Task.create({
      title: title.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : "",
      columnId: column._id,
      assignee: assigneeId,
      priority: priority || "medium",
      dueDate: parsedDueDate,
    });

    const populatedTask =
      await populateTask(
        Task.findById(task._id)
      );

    return res.status(201).json({
      message:
        "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Failed to create task"
    );
  }
};

/**
 * GET /api/tasks/:taskId
 */
export const getTaskById = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await populateTask(
      Task.findById(taskId)
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      task,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Failed to retrieve task"
    );
  }
};

/**
 * PATCH /api/tasks/:taskId
 */
export const updateTask = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;

    const {
      title,
      description,
      assignee,
      priority,
      dueDate,
    } = req.body;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(
      taskId
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    /*
     * Update title
     */
    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          message:
            "Task title cannot be empty",
        });
      }

      task.title = title.trim();
    }

    /*
     * Update description
     */
    if (description !== undefined) {
      if (
        typeof description !== "string"
      ) {
        return res.status(400).json({
          message:
            "Description must be a string",
        });
      }

      task.description =
        description.trim();
    }

    /*
     * Update priority
     */
    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({
          message:
            "Priority must be low, medium, or high",
        });
      }

      task.priority = priority;
    }

    /*
     * Update due date.
     *
     * null / "" removes the due date.
     */
    if (dueDate !== undefined) {
      if (
        dueDate === null ||
        dueDate === ""
      ) {
        task.dueDate = null;
      } else {
        const parsedDueDate =
          new Date(dueDate);

        if (
          Number.isNaN(
            parsedDueDate.getTime()
          )
        ) {
          return res.status(400).json({
            message: "Invalid due date",
          });
        }

        task.dueDate =
          parsedDueDate;
      }
    }

    /*
     * Update / remove assignee
     */
    if (assignee !== undefined) {
      if (
        assignee === null ||
        assignee === ""
      ) {
        task.assignee = null;
      } else {
        if (
          !isValidObjectId(assignee)
        ) {
          return res.status(400).json({
            message:
              "Invalid assignee ID",
          });
        }

        const user =
          await User.findById(
            assignee
          );

        if (!user) {
          return res.status(404).json({
            message:
              "Assignee not found",
          });
        }

        task.assignee = user._id;
      }
    }

    /*
     * Because optimisticConcurrency is enabled,
     * Mongoose throws VersionError if another
     * request saved this task after we loaded it.
     */
    await task.save();

    const updatedTask =
      await populateTask(
        Task.findById(task._id)
      );

    return res.status(200).json({
      message:
        "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Failed to update task"
    );
  }
};

/**
 * PATCH /api/tasks/:taskId/move
 */
export const moveTask = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;
    const { columnId } = req.body;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    if (!columnId) {
      return res.status(400).json({
        message:
          "Destination column ID is required",
      });
    }

    if (!isValidObjectId(columnId)) {
      return res.status(400).json({
        message:
          "Invalid destination column ID",
      });
    }

    const task =
      await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const destinationColumn =
      await Column.findById(columnId);

    if (!destinationColumn) {
      return res.status(404).json({
        message:
          "Destination column not found",
      });
    }

    if (
      String(task.columnId) ===
      String(destinationColumn._id)
    ) {
      return res.status(400).json({
        message:
          "Task is already in this column",
      });
    }

    const currentColumn =
      await Column.findById(
        task.columnId
      );

    if (!currentColumn) {
      return res.status(404).json({
        message:
          "Current task column not found",
      });
    }

    /*
     * Prevent moving tasks between boards.
     */
    if (
      String(currentColumn.boardId) !==
      String(
        destinationColumn.boardId
      )
    ) {
      return res.status(400).json({
        message:
          "Cannot move task to a column on another board",
      });
    }

    task.columnId =
      destinationColumn._id;

    await task.save();

    const movedTask =
      await populateTask(
        Task.findById(task._id)
      );

    return res.status(200).json({
      message:
        "Task moved successfully",
      task: movedTask,
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Failed to move task"
    );
  }
};

/**
 * DELETE /api/tasks/:taskId
 */
export const deleteTask = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task =
      await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      message:
        "Task deleted successfully",
    });
  } catch (error) {
    return handleControllerError(
      error,
      res,
      "Failed to delete task"
    );
  }
};