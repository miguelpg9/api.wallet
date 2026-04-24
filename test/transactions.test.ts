import request from "supertest";
import app from "../src/app";
import sequelize from "../src/config/database";
import { Category } from "../src/models/category";

describe("Transactions endpoints", () => {
  let token: string;
  let userId: string;
  let categoryId: string;
  let categoryIdUser2: string;
  let transactionIdUser2: string;

  const userData = {
    firstName: "test",
    lastName: "user",
    email: "test@mail.com",
    password: "password123",
  };

  const userData2 = {
    firstName: "test2",
    lastName: "user2",
    email: "test2@mail.com",
    password: "anotherpassword123",
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true });

    await request(app).post("/api/auth/register").send(userData);
    await request(app).post("/api/auth/register").send(userData2);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    const loginResUser2 = await request(app).post("/api/auth/login").send({
      email: userData2.email,
      password: userData2.password,
    });

    token = loginRes.body.accessToken;
    userId = loginRes.body.user.id;

    const category = await Category.create({
      name: "Food",
      user_id: loginRes.body.user.id,
    });

    categoryId = category.id;

    const categoryUser2 = await Category.create({
      name: "Entertainment",
      user_id: loginResUser2.body.user.id,
    });

    categoryIdUser2 = categoryUser2.id;

    const transactionUser2 = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${loginResUser2.body.accessToken}`)
      .send({
        amount: 50,
        type: "expense",
        categoryId: categoryIdUser2,
        description: "Test transaction user 2",
        date: new Date(),
      });

    transactionIdUser2 = transactionUser2.body.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/transactions", () => {
    it("should create a transaction", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
          description: "Test transaction",
          date: new Date(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
    });

    it("should fail with invalid data", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: -100,
          type: "invalid_type",
          categoryId: "nonexistent_category_id",
        });
      expect(res.statusCode).toBe(400);
    });

    it("should fail without auth", async () => {
      const res = await request(app).post("/api/transactions").send({
        amount: 100,
        type: "expense",
        categoryId,
      });

      expect(res.statusCode).toBe(401);
    });

    it("should fail if category belongs to another user", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId: categoryIdUser2,
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/transactions", () => {
    it("should return only user transactions", async () => {
      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
        });

      const res = await request(app)
        .get("/api/transactions")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);

      expect(res.body.items.every((t: any) => t.user_id === userId)).toBe(true);
    });

    it("it should fail without auth", async () => {
      const res = await request(app).get("/api/transactions");
      expect(res.statusCode).toBe(401);
    });

    it("should return empty array if no transactions", async () => {
      const res = await request(app)
        .get("/api/transactions")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBe(0);
    });

    it("should support pagination", async () => {
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post("/api/transactions")
          .set("Authorization", `Bearer ${token}`)
          .send({
            amount: 100 + i,
            type: "expense",
            categoryId,
          });
      }

      const res = await request(app)
        .get("/api/transactions?page=2&limit=5")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBe(5);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(5);
      expect(res.body.total).toBe(15);
    });

    it("should fail with invalid pagination params", async () => {
      const res = await request(app)
        .get("/api/transactions?page=-1&limit=0")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
    });

    it("should fail with invalid pagination params", async () => {
      const res = await request(app)
        .get("/api/transactions?page=-1&limit=0")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/transactions/:id", () => {
    it("should return a transaction by id", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
        });

      const res = await request(app)
        .get(`/api/transactions/${createRes.body.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it("should return 404 for non-existent transaction", async () => {
      const res = await request(app)
        .get("/api/transactions/nonexistent_id")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it("should fail without auth", async () => {
      const res = await request(app).get("/api/transactions/nonexistent_id");
      expect(res.statusCode).toBe(401);
    });

    it("should not return transaction of another user", async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionIdUser2}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("PATCH /api/transactions/:id", () => {
    it("should update transaction", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
        });

      const res = await request(app)
        .patch(`/api/transactions/${createRes.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 200,
        });

      expect(res.statusCode).toBe(200);
    });

    it("should return 404 for non-existent transaction", async () => {
      const res = await request(app)
        .patch("/api/transactions/nonexistent_id")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 200,
        });
      expect(res.statusCode).toBe(404);
    });

    it("should fail without auth", async () => {
      const res = await request(app)
        .patch("/api/transactions/nonexistent_id")
        .send({
          amount: 200,
        });
      expect(res.statusCode).toBe(401);
    });

    it("should not update transaction of another user", async () => {
      const res = await request(app)
        .patch(`/api/transactions/${transactionIdUser2}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 200,
        });
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/transactions/:id", () => {
    it("should delete transaction (soft delete)", async () => {
      const createRes = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
        });

      const id = createRes.body.id;

      const res = await request(app)
        .delete(`/api/transactions/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(204);

      const getRes = await request(app)
        .get(`/api/transactions/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.statusCode).toBe(404);
    });

    it("should return 404 for non-existent transaction", async () => {
      const res = await request(app)
        .delete("/api/transactions/nonexistent_id")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it("should fail without auth", async () => {
      const res = await request(app).delete("/api/transactions/nonexistent_id");
      expect(res.statusCode).toBe(401);
    });

    it("should not delete transaction of another user", async () => {
      const rest = await request(app)
        .delete(`/api/transactions/${transactionIdUser2}`)
        .set("Authorization", `Bearer ${token}`);
      expect(rest.statusCode).toBe(404);
    });
  });

  describe("GET /api/transactions filters", () => {
    beforeEach(async () => {
      // crear datos variados
      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "expense",
          categoryId,
          date: "2024-01-01",
        });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 200,
          type: "income",
          categoryId,
          date: "2024-02-01",
        });
    });

    it("should filter by type", async () => {
      const res = await request(app)
        .get("/api/transactions?type=expense")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items.every((t: any) => t.type === "expense")).toBe(true);
    });

    it("should filter by category", async () => {
      const res = await request(app)
        .get(`/api/transactions?categoryId=${categoryId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it("should filter by date range", async () => {
      const res = await request(app)
        .get("/api/transactions?from=2024-01-01&to=2024-01-31")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBe(1);
    });
  });

  describe("GET /api/transactions/summary", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 100,
          type: "income",
          categoryId,
        });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 50,
          type: "expense",
          categoryId,
        });
    });

    it("should return correct summary", async () => {
      const res = await request(app)
        .get("/api/transactions/summary")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.income).toBe(100);
      expect(res.body.expense).toBe(50);
      expect(res.body.balance).toBe(50);
    });
  });

  describe("GET /api/transactions/by-category", () => {
    it("should group expenses by category", async () => {
      const res = await request(app)
        .get("/api/transactions/by-category")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/transactions/by-month", () => {
    it("should group transactions by month", async () => {
      const res = await request(app)
        .get("/api/transactions/by-month")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
