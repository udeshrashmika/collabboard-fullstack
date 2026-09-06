// server/tests/helpers.js
//
// Small factory helpers so individual test files stay readable.

import request from "supertest";
import app from "../src/app.js";
import Board from "../models/Board.js";
import Column from "../models/Column.js";

export const validUser = (overrides = {}) => ({
  name: "Test User",
  email: `user${Date.now()}${Math.random().toString(16).slice(2)}@example.com`,
  password: "Password123",
  ...overrides,
});

/**
 * Registers a user through the real API and returns { user, token }.
 * Use this whenever a test needs an authenticated caller.
 */
export async function registerUser(overrides = {}) {
  const payload = validUser(overrides);
  const res = await request(app).post("/api/auth/register").send(payload);

  if (res.statusCode !== 201) {
    throw new Error(`registerUser failed: ${res.statusCode} ${res.text}`);
  }

  return { user: res.body.user, token: res.body.token, password: payload.password };
}

/** Convenience: "Bearer <token>" header value. */
export const bearer = (token) => `Bearer ${token}`;

/** Creates a board directly in the DB (faster than going through the API). */
export async function seedBoard(ownerId, title = "Test Board") {
  return Board.create({ title, owner: ownerId });
}

/** Creates a column attached to a board. */
export async function seedColumn(boardId, title = "To Do") {
  return Column.create({ title, boardId });
}
