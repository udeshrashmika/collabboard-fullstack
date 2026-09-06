import request from "supertest";
import app from "../src/app.js";
import Board from "../models/Board.js";
import { registerUser, bearer, seedBoard } from "./helpers.js";

describe("POST /api/boards", () => {
  it("creates a board", async () => {
    const { user, token } = await registerUser();

    const res = await request(app)
      .post("/api/boards")
      .set("Authorization", bearer(token))
      .send({ title: "Sprint 1", owner: user.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Sprint 1");
    expect(res.body._id).toBeDefined();
  });

  it("returns 400 when the title is missing", async () => {
    const { token } = await registerUser();

    const res = await request(app)
      .post("/api/boards")
      .set("Authorization", bearer(token))
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it("persists the board to the database", async () => {
    const { user, token } = await registerUser();

    await request(app)
      .post("/api/boards")
      .set("Authorization", bearer(token))
      .send({ title: "Persisted", owner: user.id });

    const count = await Board.countDocuments({ title: "Persisted" });
    expect(count).toBe(1);
  });
});

describe("GET /api/boards", () => {
  it("returns an empty array when there are no boards", async () => {
    const { token } = await registerUser();

    const res = await request(app)
      .get("/api/boards")
      .set("Authorization", bearer(token));

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns created boards", async () => {
    const { user, token } = await registerUser();
    await seedBoard(user.id, "Board A");
    await seedBoard(user.id, "Board B");

    const res = await request(app)
      .get("/api/boards")
      .set("Authorization", bearer(token));

    expect(res.body).toHaveLength(2);
    expect(res.body.map((b) => b.title).sort()).toEqual(["Board A", "Board B"]);
  });
});

/*
 * KNOWN GAP — boardRoutes.js and columnRoutes.js are mounted without
 * requireAuth, and getBoards() returns every board regardless of owner.
 * These are marked .failing so the suite stays green today but goes red
 * the moment the fix lands — remove `.failing` at that point.
 */
describe("board authorisation (currently unimplemented)", () => {
  it.failing("rejects an unauthenticated GET /api/boards with 401", async () => {
    const res = await request(app).get("/api/boards");
    expect(res.statusCode).toBe(401);
  });

  it.failing("rejects an unauthenticated POST /api/boards with 401", async () => {
    const res = await request(app).post("/api/boards").send({ title: "Sneaky" });
    expect(res.statusCode).toBe(401);
  });

  it.failing("only returns boards owned by the caller", async () => {
    const alice = await registerUser();
    const bob = await registerUser();

    await seedBoard(alice.user.id, "Alice board");
    await seedBoard(bob.user.id, "Bob board");

    const res = await request(app)
      .get("/api/boards")
      .set("Authorization", bearer(alice.token));

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Alice board");
  });
});

describe("POST /api/columns", () => {
  it("creates a column attached to a board", async () => {
    const { user, token } = await registerUser();
    const board = await seedBoard(user.id);

    const res = await request(app)
      .post("/api/columns")
      .set("Authorization", bearer(token))
      .send({ title: "To Do", boardId: board._id.toString() });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("To Do");
    expect(res.body.boardId).toBe(board._id.toString());
  });

  it("returns 400 when boardId is missing", async () => {
    const { token } = await registerUser();

    const res = await request(app)
      .post("/api/columns")
      .set("Authorization", bearer(token))
      .send({ title: "Orphan column" });

    expect(res.statusCode).toBe(400);
  });
});