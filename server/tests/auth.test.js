import request from "supertest";
import crypto from "node:crypto";
import app from "../src/app.js";
import User from "../models/User.js";
import { validUser, registerUser, bearer } from "./helpers.js";

// POST /api/auth/forgot-password is deliberately not covered — it sends a real
// email. The reset-password tests below generate the token directly on the
// model instead, which exercises the same crypto path.

describe("POST /api/auth/register", () => {
  it("creates an account and returns a token", async () => {
    const payload = validUser();
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(payload.email.toLowerCase());
    expect(res.body.user.id).toBeDefined();
  });

  it("never returns the password hash", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser());

    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user._id).toBeUndefined();
  });

  it("stores the password hashed, not in plain text", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const stored = await User.findOne({ email: payload.email }).select("+password");
    expect(stored.password).not.toBe(payload.password);
    expect(stored.password.startsWith("$2")).toBe(true);
  });

  it.each([
    ["missing name", { name: "" }],
    ["missing email", { email: "" }],
    ["missing password", { password: "" }],
  ])("rejects %s with 400", async (_label, override) => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser(override));

    expect(res.statusCode).toBe(400);
  });

  it("rejects an invalid email format with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser({ email: "not-an-email" }));

    expect(res.statusCode).toBe(400);
  });

  it("rejects a password shorter than 8 characters with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser({ password: "short" }));

    expect(res.statusCode).toBe(400);
  });

  it("rejects a duplicate email with 409", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.statusCode).toBe(409);
  });

  it("normalises the email to lowercase", async () => {
    const payload = validUser({ email: "MiXeD.Case@Example.COM" });
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.body.user.email).toBe("mixed.case@example.com");
  });
});

describe("POST /api/auth/login", () => {
  it("signs in with correct credentials", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("returns 401 for a wrong password", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "WrongPassword1" });

    expect(res.statusCode).toBe(401);
  });

  it("returns the same 401 message for unknown email and wrong password", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "WrongPassword1" });

    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "WrongPassword1" });

    expect(unknownEmail.statusCode).toBe(wrongPassword.statusCode);
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com" });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the signed-in user", async () => {
    const { user, token } = await registerUser();

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", bearer(token));

    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe(user.id);
  });

  it("returns 401 with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 with a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", bearer("this.is.garbage"));

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 when the header is missing the Bearer prefix", async () => {
    const { token } = await registerUser();
    const res = await request(app).get("/api/auth/me").set("Authorization", token);

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 after the account is deleted", async () => {
    const { user, token } = await registerUser();
    await User.findByIdAndDelete(user.id);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", bearer(token));

    expect(res.statusCode).toBe(401);
  });
});

describe("POST /api/auth/reset-password", () => {
  it("resets the password with a valid token", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const user = await User.findOne({ email: payload.email });
    const rawToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const res = await request(app).post("/api/auth/reset-password").send({
      email: payload.email,
      token: rawToken,
      password: "BrandNewPass123",
    });

    expect(res.statusCode).toBe(200);

    const good = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "BrandNewPass123" });
    expect(good.statusCode).toBe(200);

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });
    expect(bad.statusCode).toBe(401);
  });

  it("rejects a token that has already been used", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const user = await User.findOne({ email: payload.email });
    const rawToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const body = { email: payload.email, token: rawToken, password: "FirstReset123" };
    await request(app).post("/api/auth/reset-password").send(body);

    const second = await request(app)
      .post("/api/auth/reset-password")
      .send({ ...body, password: "SecondReset123" });

    expect(second.statusCode).toBe(400);
  });

  it("rejects an expired token", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const user = await User.findOne({ email: payload.email });
    const rawToken = user.createResetToken();
    user.resetTokenExpires = Date.now() - 1000;
    await user.save({ validateBeforeSave: false });

    const res = await request(app).post("/api/auth/reset-password").send({
      email: payload.email,
      token: rawToken,
      password: "NewPassword123",
    });

    expect(res.statusCode).toBe(400);
  });

  it("rejects a forged token", async () => {
    const payload = validUser();
    await request(app).post("/api/auth/register").send(payload);

    const res = await request(app).post("/api/auth/reset-password").send({
      email: payload.email,
      token: crypto.randomBytes(32).toString("hex"),
      password: "NewPassword123",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("routing", () => {
  it("returns the health payload", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("returns 404 for an unknown API route", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});