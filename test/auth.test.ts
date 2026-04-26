import request from "supertest";
import app from "../src/app";
import sequelize from "../src/config/database";
import { User } from "../src/models/user";

describe("Auth endpoints", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const userData = {
    firstName: "test",
    lastName: "user",
    email: "test@mail.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data.user.email).toBe(userData.email);

      const user = await User.findOne({
        where: { email: userData.email },
      });

      expect(user).not.toBeNull();
    });

    it("should not register duplicate email", async () => {
      await request(app).post("/api/auth/register").send(userData);

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(userData);
    });

    it("should login successfully", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data.user.email).toBe(userData.email);

      // cookie refresh token
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fail with non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@mail.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should get current user with valid token", async () => {
      await request(app).post("/api/auth/register").send(userData);

      const loginRes = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userData.email);
    });

    it("should fail without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh access token using cookie", async () => {
      await request(app).post("/api/auth/register").send(userData);

      const loginRes = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      const cookies = loginRes.headers["set-cookie"];

      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
    });

    it("should fail without cookie", async () => {
      const res = await request(app).post("/api/auth/refresh");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      await request(app).post("/api/auth/register").send(userData);

      const loginRes = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      const cookies = loginRes.headers["set-cookie"];

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});