import mongoose from "mongoose";

import Task from "../../models/Task.js";
import Column from "../../models/Column.js";
import User from "../../models/User.js";

/**
 * Check whether a value is a valid MongoDB ObjectId.
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/tasks
 *
 * Optional query filters:
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

    const tasks = await Task.find(filter)
      .populate("columnId", "title boardId")
      .populate("assignee", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      message: "Failed to retrieve tasks",
    });
  }
};

/**
 * POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, columnId, assignee } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // Validate column
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

    const column = await Column.findById(columnId);

    if (!column) {
      return res.status(404).json({
        message: "Column not found",
      });
    }

    // Validate assignee if provided
    let assigneeId = null;

    if (assignee) {
      if (!isValidObjectId(assignee)) {
        return res.status(400).json({
          message: "Invalid assignee ID",
        });
      }

      const user = await User.findById(assignee);

      if (!user) {
        return res.status(404).json({
          message: "Assignee not found",
        });
      }

      assigneeId = user._id;
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      columnId: column._id,
      assignee: assigneeId,
    });

    // Populate references before returning
    const populatedTask = await Task.findById(task._id)
      .populate("columnId", "title boardId")
      .populate("assignee", "name email");

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      message: "Failed to create task",
    });
  }
};

/**
 * GET /api/tasks/:taskId
 */
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(taskId)
      .populate("columnId", "title boardId")
      .populate("assignee", "name email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      message: "Failed to retrieve task",
    });
  }
};

/**
 * PATCH /api/tasks/:taskId
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignee } = req.body;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Update title
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }

      task.title = title.trim();
    }

    // Update description
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
        });
      }

      task.description = description.trim();
    }

    // Update/unassign assignee
    if (assignee !== undefined) {
      if (assignee === null || assignee === "") {
        task.assignee = null;
      } else {
        if (!isValidObjectId(assignee)) {
          return res.status(400).json({
            message: "Invalid assignee ID",
          });
        }

        const user = await User.findById(assignee);

        if (!user) {
          return res.status(404).json({
            message: "Assignee not found",
          });
        }

        task.assignee = user._id;
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("columnId", "title boardId")
      .populate("assignee", "name email");

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      message: "Failed to update task",
    });
  }
};

/**
 * PATCH /api/tasks/:taskId/move
 *
 * Moves a task from its current column to another column.
 */
export const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { columnId } = req.body;

    // Validate task ID
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    // Validate destination column
    if (!columnId) {
      return res.status(400).json({
        message: "Destination column ID is required",
      });
    }

    if (!isValidObjectId(columnId)) {
      return res.status(400).json({
        message: "Invalid destination column ID",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const destinationColumn = await Column.findById(columnId);

    if (!destinationColumn) {
      return res.status(404).json({
        message: "Destination column not found",
      });
    }

    // Prevent unnecessary move
    if (task.columnId.toString() === destinationColumn._id.toString()) {
      return res.status(400).json({
        message: "Task is already in this column",
      });
    }

    /*
     * Prevent moving a task to a column belonging
     * to another board.
     */
    const currentColumn = await Column.findById(task.columnId);

    if (!currentColumn) {
      return res.status(404).json({
        message: "Current task column not found",
      });
    }

    if (
      currentColumn.boardId.toString() !==
      destinationColumn.boardId.toString()
    ) {
      return res.status(400).json({
        message: "Cannot move task to a column on another board",
      });
    }

    task.columnId = destinationColumn._id;

    await task.save();

    const movedTask = await Task.findById(task._id)
      .populate("columnId", "title boardId")
      .populate("assignee", "name email");

    return res.status(200).json({
      message: "Task moved successfully",
      task: movedTask,
    });
  } catch (error) {
    console.error("Move task error:", error);

    return res.status(500).json({
      message: "Failed to move task",
    });
  }
};

/**
 * DELETE /api/tasks/:taskId
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      message: "Failed to delete task",
    });
  }
};