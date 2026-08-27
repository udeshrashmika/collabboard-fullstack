import express from "express";

import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  moveTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

/**
 * GET  /api/tasks
 * POST /api/tasks
 */
router
  .route("/")
  .get(getTasks)
  .post(createTask);

/**
 * PATCH /api/tasks/:taskId/move
 *
 * Must be declared before /:taskId for clarity.
 */
router.patch("/:taskId/move", moveTask);

/**
 * GET    /api/tasks/:taskId
 * PATCH  /api/tasks/:taskId
 * DELETE /api/tasks/:taskId
 */
router
  .route("/:taskId")
  .get(getTaskById)
  .patch(updateTask)
  .delete(deleteTask);

export default router;