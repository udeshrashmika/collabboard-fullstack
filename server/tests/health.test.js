import request from "supertest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("returns server status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});