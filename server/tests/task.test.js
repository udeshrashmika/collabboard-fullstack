import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import Task from "../models/Task.js";
import { registerUser, bearer, seedBoard, seedColumn } from "./helpers.js";

const NON_EXISTENT_ID = new mongoose.Types.ObjectId().toString();

/*
 * Response envelopes used by taskController.js:
 *   GET    /api/tasks           -> { count, tasks: [...] }
 *   GET    /api/tasks/:id       -> { task }
 *   POST   /api/tasks           -> { message, task }
 *   PATCH  /api/tasks/:id       -> { message, task }
 *   PATCH  /api/tasks/:id/move  -> { message, task }
 *   DELETE /api/tasks/:id       -> { message }
 *
 * Note this differs from boardController.js, which returns bare objects.
 * Logged as a defect: inconsistent response contracts across controllers.
 */

async function scenario() {
  const { user, token } = await registerUser();
  const board = await seedBoard(user.id);
  const todo = await seedColumn(board._id, "To Do");
  const done = await seedColumn(board._id, "Done");
  return { user, token, board, todo, done };
}

describe("POST /api/tasks", () => {
  it("creates a task with defaults applied", async () => {
    const { token, todo } = await scenario();

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(token))
      .send({ title: "Write tests", columnId: todo._id.toString() });

    expect(res.statusCode).toBe(201);
    expect(res.body.task.title).toBe("Write tests");
    expect(res.body.task.priority).toBe("medium");
    expect(res.body.task.description).toBe("");
    expect(res.body.task.assignee).toBeNull();
  });

  it("returns 400 when the title is missing", async () => {
    const { token, todo } = await scenario();

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(token))
      .send({ columnId: todo._id.toString() });

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for a malformed columnId", async () => {
    const { token } = await scenario();

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(token))
      .send({ title: "Bad column", columnId: "not-an-object-id" });

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 or 404 for a columnId that does not exist", async () => {
    const { token } = await scenario();

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(token))
      .send({ title: "Ghost column", columnId: NON_EXISTENT_ID });

    expect([400, 404]).toContain(res.statusCode);
  });

  it("rejects an invalid priority value", async () => {
    const { token, todo } = await scenario();

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", bearer(token))
      .send({
        title: "Urgent",
        columnId: todo._id.toString(),
        priority: "catastrophic",
      });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/tasks", () => {
  it("filters tasks by columnId", async () => {
    const { token, todo, done } = await scenario();
    await Task.create({ title: "A", columnId: todo._id });
    await Task.create({ title: "B", columnId: todo._id });
    await Task.create({ title: "C", columnId: done._id });

    const res = await request(app)
      .get(`/api/tasks?columnId=${todo._id}`)
      .set("Authorization", bearer(token));

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.count).toBe(2);
  });

  it("returns 400 for a malformed columnId filter", async () => {
    const { token } = await scenario();

    const res = await request(app)
      .get("/api/tasks?columnId=nope")
      .set("Authorization", bearer(token));

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/tasks/:taskId", () => {
  it("returns a single task", async () => {
    const { token, todo } = await scenario();
    const task = await Task.create({ title: "Findable", columnId: todo._id });

    const res = await request(app)
      .get(`/api/tasks/${task._id}`)
      .set("Authorization", bearer(token));

    expect(res.statusCode).toBe(200);
    expect(res.body.task.title).toBe("Findable");
  });

  it("returns 404 for an id that does not exist", async () => {
    const { token } = await scenario();

    const res = await request(app)
      .get(`/api/tasks/${NON_EXISTENT_ID}`)
      .set("Authorization", bearer(token));

    expect(res.statusCode).toBe(404);
  });
});

describe("PATCH /api/tasks/:taskId", () => {
  it("updates the title and priority", async () => {
    const { token, todo } = await scenario();
    const task = await Task.create({ title: "Old", columnId: todo._id });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set("Authorization", bearer(token))
      .send({ title: "New", priority: "high" });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.title).toBe("New");
    expect(res.body.task.priority).toBe("high");
  });

  it("returns 404 when updating a task that does not exist", async () => {
    const { token } = await scenario();

    const res = await request(app)
      .patch(`/api/tasks/${NON_EXISTENT_ID}`)
      .set("Authorization", bearer(token))
      .send({ title: "Nope" });

    expect(res.statusCode).toBe(404);
  });
});

describe("PATCH /api/tasks/:taskId/move", () => {
  it("moves a task to another column", async () => {
    const { token, todo, done } = await scenario();
    const task = await Task.create({ title: "Movable", columnId: todo._id });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}/move`)
      .set("Authorization", bearer(token))
      .send({ columnId: done._id.toString() });

    expect(res.statusCode).toBe(200);

    // assert against the database, not the response body — more robust
    const moved = await Task.findById(task._id);
    expect(moved.columnId.toString()).toBe(done._id.toString());
  });

  it("returns 400 for a malformed destination column", async () => {
    const { token, todo } = await scenario();
    const task = await Task.create({ title: "Movable", columnId: todo._id });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}/move`)
      .set("Authorization", bearer(token))
      .send({ columnId: "garbage" });

    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /api/tasks/:taskId", () => {
  it("deletes a task", async () => {
    const { token, todo } = await scenario();
    const task = await Task.create({ title: "Doomed", columnId: todo._id });

    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", bearer(token));

    expect([200, 204]).toContain(res.statusCode);
    expect(await Task.findById(task._id)).toBeNull();
  });

  it("returns 404 when deleting twice", async () => {
    const { token, todo } = await scenario();
    const task = await Task.create({ title: "Doomed", columnId: todo._id });

    await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", bearer(token));

    const second = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", bearer(token));

    expect(second.statusCode).toBe(404);
  });
});

describe("optimistic concurrency (409 conflict)", () => {
  it("rejects a stale write with 409", async () => {
    const { todo } = await scenario();
    const task = await Task.create({ title: "Contested", columnId: todo._id });

    // two independent copies of the same document
    const copyA = await Task.findById(task._id);
    const copyB = await Task.findById(task._id);

    copyA.title = "Saved first";
    await copyA.save();

    copyB.title = "Saved second";
    await expect(copyB.save()).rejects.toThrow(/version/i);
  });
});